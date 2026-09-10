import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { ScanHistoryService } from '../scan-history/scan-history.service';

@Injectable()
export class BarcodeScannerService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly scanHistoryService: ScanHistoryService,
  ) {}

  /**
   * Zoekt een product op basis van gescande barcode en legt de scan vast in
   * de geschiedenis. De daadwerkelijke camera-scan gebeurt in de frontend
   * (browser/mobile barcode-API); deze service verwerkt alleen het resultaat.
   */
  async lookup(userId: string, barcode: string) {
    const product = await this.productsService.findByBarcode(barcode);
    await this.scanHistoryService.log({
      userId,
      productId: product?.id,
      barcode,
      source: 'BARCODE',
    });
    return product;
  }
}
