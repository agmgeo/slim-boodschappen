import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '../../database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async create(email: string, passwordHash: string, name?: string) {
    const [user] = await this.db.insert(users).values({ email, passwordHash, name }).returning();
    return user;
  }
}
