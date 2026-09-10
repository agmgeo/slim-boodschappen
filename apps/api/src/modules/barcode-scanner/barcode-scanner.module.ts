import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ScanHistoryModule } from '../scan-history/scan-history.module';
import { BarcodeScannerController } from './barcode-scanner.controller';
import { BarcodeScannerService } from './barcode-scanner.service';

@Module({
  imports: [ProductsModule, ScanHistoryModule],
  controllers: [BarcodeScannerController],
  providers: [BarcodeScannerService],
})
export class BarcodeScannerModule {}
