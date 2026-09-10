import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { userSettings } from '../../database/schema';

export interface UpdateSettingsInput {
  locale?: 'NL' | 'EN';
  homeLatitude?: number;
  homeLongitude?: number;
  preferredTravelMode?: 'WALK' | 'BIKE' | 'CAR' | 'PUBLIC_TRANSPORT';
  maxExtraStores?: number;
  costPerKm?: number;
}

@Injectable()
export class SettingsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async getForUser(userId: string) {
    const [existing] = await this.db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    if (existing) return existing;
    // Default-instellingen aanmaken bij eerste gebruik
    const [created] = await this.db.insert(userSettings).values({ userId }).returning();
    return created;
  }

  async update(userId: string, input: UpdateSettingsInput) {
    await this.getForUser(userId); // zorgt dat er een rij bestaat
    const [updated] = await this.db
      .update(userSettings)
      .set(input)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updated;
  }
}
