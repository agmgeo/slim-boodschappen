import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ProductMatchingService } from './product-matching.service';

@Module({
  imports: [ProductsModule],
  providers: [ProductMatchingService],
  exports: [ProductMatchingService],
})
export class ProductMatchingModule {}
