import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PricesService } from './prices.service';
import { UpsertPriceDto } from './dto/upsert-price.dto';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
  upsert(@Body() dto: UpsertPriceDto) {
    return this.pricesService.upsert(dto);
  }

  @Get('product/:productId')
  findForProduct(@Param('productId') productId: string) {
    return this.pricesService.findForProduct(productId);
  }
}
