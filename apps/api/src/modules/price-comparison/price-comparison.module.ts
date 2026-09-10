import { Module } from '@nestjs/common';
import { ShoppingListsModule } from '../shopping-lists/shopping-lists.module';
import { SupermarketsModule } from '../supermarkets/supermarkets.module';
import { PricesModule } from '../prices/prices.module';
import { OffersModule } from '../offers/offers.module';
import { ProductsModule } from '../products/products.module';
import { PriceComparisonController } from './price-comparison.controller';
import { PriceComparisonService } from './price-comparison.service';

@Module({
  imports: [ShoppingListsModule, SupermarketsModule, PricesModule, OffersModule, ProductsModule],
  controllers: [PriceComparisonController],
  providers: [PriceComparisonService],
  exports: [PriceComparisonService],
})
export class PriceComparisonModule {}
