import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, ilike, inArray, or } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { productAliases, products } from '../../database/schema';
import { CACHE_INSTANCE } from '../../common/cache/cache.module';
import { TtlCache } from '../../common/cache/ttl-cache';

export interface CreateProductInput {
  nameNl: string;
  nameEn: string;
  category: (typeof products.$inferInsert)['category'];
  brand?: string;
  unit: string;
  unitSize?: number;
  unitOfMeasure?: string;
  barcode?: string;
  imageUrl?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

const CATALOG_CACHE_KEY = 'products:all-with-aliases';
const CATALOG_CACHE_TTL_MS = 30_000;

@Injectable()
  export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    @Inject(CACHE_INSTANCE) private readonly cache: TtlCache,
    ) {}

async create(input: CreateProductInput) {
  const [product] = await this.db.insert(products).values(input).returning();
  this.cache.invalidate(CATALOG_CACHE_KEY);
  return product;
}

async findAll(options: PaginationOptions = {}) {
  const limit = Math.min(options.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const offset = options.offset ?? 0;
  return this.db.select().from(products).limit(limit).offset(offset);
}

async findById(id: string) {
  const [product] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) throw new NotFoundException(`Product ${id} niet gevonden.`);
  return product;
}

async findByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return this.db.select().from(products).where(inArray(products.id, ids));
}

async findByBarcode(barcode: string) {
  const [product] = await this.db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  return product ?? null;
}

async search(query: string, limit = 20) {
  return this.db
  .select()
  .from(products)
  .where(or(ilike(products.nameNl, `%${query}%`), ilike(products.nameEn, `%${query}%`)))
  .limit(Math.min(limit, MAX_PAGE_SIZE));
}

async addAlias(productId: string, alias: string, locale: 'NL' | 'EN' = 'NL') {
  const [row] = await this.db.insert(productAliases).values({ productId, alias, locale }).returning();
  this.cache.invalidate(CATALOG_CACHE_KEY);
  return row;
}

async getAllWithAliases() {
  return this.cache.getOrCompute<{ product: typeof products.$inferSelect; aliases: string[] }[]>(
    CATALOG_CACHE_KEY,
    CATALOG_CACHE_TTL_MS,
    async () => {
      const allProducts = await this.db.select().from(products);
      const allAliases = await this.db.select().from(productAliases);
      const aliasesByProduct = new Map<string, string[]>();
      for (const alias of allAliases) {
        const list = aliasesByProduct.get(alias.productId) ?? [];
        list.push(alias.alias);
        aliasesByProduct.set(alias.productId, list);
      }
      return allProducts.map((product) => ({
        product,
        aliases: aliasesByProduct.get(product.id) ?? [],
      }));
    },
    );
}

async findByCategory(category: (typeof products.$inferInsert)['category']) {
  return this.db.select().from(products).where(eq(products.category, category));
}

async updateCategory(id: string, category: (typeof products.$inferInsert)['category']) {
  const [updated] = await this.db.update(products).set({ category }).where(eq(products.id, id)).returning();
  if (!updated) throw new NotFoundException(`Product ${id} niet gevonden.`);
  this.cache.invalidate(CATALOG_CACHE_KEY);
  return updated;
}
}
