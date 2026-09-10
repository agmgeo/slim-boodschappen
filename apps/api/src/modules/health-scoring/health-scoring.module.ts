import { Module } from '@nestjs/common';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ProductsModule } from '../products/products.module';
import { HealthScoringController } from './health-scoring.controller';
import { HealthScoringService } from './health-scoring.service';

@Module({
  imports: [NutritionModule, ProductsModule],
  controllers: [HealthScoringController],
  providers: [HealthScoringService],
  exports: [HealthScoringService],
})
export class HealthScoringModule {}
