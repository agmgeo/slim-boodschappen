import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { favorites } from '../../database/schema';

@Injectable()
export class FavoritesService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async add(userId: string, productId: string) {
    const [row] = await this.db
      .insert(favorites)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning();
    return row;
  }

  async remove(userId: string, productId: string) {
    await this.db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
  }

  async findForUser(userId: string) {
    return this.db.select().from(favorites).where(eq(favorites.userId, userId));
  }
}
