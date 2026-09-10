import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { supermarkets } from '../../database/schema';

@Injectable()
export class SupermarketsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(name: string, logoUrl?: string) {
    const [row] = await this.db.insert(supermarkets).values({ name, logoUrl }).returning();
    return row;
  }

  async findAll() {
    return this.db.select().from(supermarkets);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(supermarkets).where(eq(supermarkets.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Supermarkt ${id} niet gevonden.`);
    return row;
  }
}
