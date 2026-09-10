import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { folders } from '../../database/schema';

export interface CreateFolderInput {
  supermarketId: string;
  validFrom: Date;
  validUntil: Date;
}

@Injectable()
export class FoldersService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(input: CreateFolderInput) {
    const [row] = await this.db.insert(folders).values(input).returning();
    return row;
  }

  async findAll() {
    return this.db.select().from(folders);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(folders).where(eq(folders.id, id)).limit(1);
    if (!row) throw new NotFoundException(`Folder ${id} niet gevonden.`);
    return row;
  }
}
