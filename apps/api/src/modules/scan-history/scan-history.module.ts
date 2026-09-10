import { Module } from '@nestjs/common';
import { ScanHistoryService } from './scan-history.service';

@Module({
  providers: [ScanHistoryService],
  exports: [ScanHistoryService],
})
export class ScanHistoryModule {}
