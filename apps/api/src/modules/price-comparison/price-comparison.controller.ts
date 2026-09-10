import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PriceComparisonService } from './price-comparison.service';

@UseGuards(JwtAuthGuard)
@Controller('price-comparison')
export class PriceComparisonController {
  constructor(private readonly priceComparisonService: PriceComparisonService) {}

  @Get(':shoppingListId')
  compare(@Param('shoppingListId') shoppingListId: string) {
    return this.priceComparisonService.compareListAcrossSupermarkets(shoppingListId);
  }
}
