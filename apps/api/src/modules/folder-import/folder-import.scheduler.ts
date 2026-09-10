import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FolderImportService } from './folder-import.service';

@Injectable()
export class FolderImportScheduler {
  private readonly logger = new Logger(FolderImportScheduler.name);

  constructor(private readonly folderImportService: FolderImportService) {}

  // Elke maandag om 06:00 — de meeste NL-supermarktfolders verversen rond het
  // weekend/begin van de week. Zo blijven de aanbiedingen zichzelf actueel
  // houden zonder handmatig ingrijpen.
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyImport() {
    this.logger.log('Wekelijkse folder-import gestart...');
    const results = await this.folderImportService.runAll();
    for (const result of results) {
      if (result.error) {
        this.logger.error(`${result.supermarketName}: mislukt — ${result.error}`);
      } else {
        this.logger.log(`${result.supermarketName}: ${result.offersImported} aanbiedingen bijgewerkt.`);
      }
    }
  }
}
