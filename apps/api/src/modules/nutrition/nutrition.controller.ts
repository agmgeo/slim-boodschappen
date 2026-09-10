import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { UpsertNutritionDto } from './dto/upsert-nutrition.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post()
  upsert(@Body() dto: UpsertNutritionDto) {
    return this.nutritionService.upsert(dto);
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.nutritionService.findForProduct(productId);
  }
}
