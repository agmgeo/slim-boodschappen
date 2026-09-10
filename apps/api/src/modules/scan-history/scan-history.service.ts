import { Inject, Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { Database, DATABASE_CONNECTION } from '../../database/database.module';
import { scanHistory } from '../../database/schema';

export interface LogScanInput {
  userId: string;
  productId?: string;
  barcode?: string;
  source: (typeof scanHistory.$inferInsert)['source'];
}

@Injectable()
export class ScanHistoryService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async log(input: LogScanInput) {
    const [row] = await this.db.insert(scanHistory).values(input).returning();
    return row;
  }

  async findForUser(userId: string) {
    return this.db.select().from(scanHistory).where(eq(scanHistory.userId, userId)).orderBy(desc(scanHistory.scannedAt));
  }
}
