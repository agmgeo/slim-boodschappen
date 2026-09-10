import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { storeLocations } from '../../database/schema';

export interface CreateStoreInput {
  supermarketId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class StoresService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(input: CreateStoreInput) {
    const [row] = await this.db.insert(storeLocations).values(input).returning();
    return row;
  }

  async findAll() {
    return this.db.select().from(storeLocations);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(storeLocations).where(eq(storeLocations.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Filiaal ${id} niet gevonden.`);
    return row;
  }

  async findBySupermarket(supermarketId: string) {
    return this.db.select().from(storeLocations).where(eq(storeLocations.supermarketId, supermarketId));
  }
}
