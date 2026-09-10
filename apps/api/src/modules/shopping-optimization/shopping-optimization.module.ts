import { Module } from '@nestjs/common';
import { PriceComparisonModule } from '../price-comparison/price-comparison.module';
import { StoresModule } from '../stores/stores.module';
import { SettingsModule } from '../settings/settings.module';
import { PantryModule } from '../pantry/pantry.module';
import { ShoppingOptimizationController } from './shopping-optimization.controller';
import { ShoppingOptimizationService } from './shopping-optimization.service';

@Module({
  imports: [PriceComparisonModule, StoresModule, SettingsModule, PantryModule],
  controllers: [ShoppingOptimizationController],
  providers: [ShoppingOptimizationService],
  exports: [ShoppingOptimizationService],
})
export class ShoppingOptimizationModule {}
