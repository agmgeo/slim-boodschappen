import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create({
      ...dto,
      type: dto.type as any,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
    });
  }

  @Get()
  findAll(@Query('supermarketId') supermarketId?: string) {
    return supermarketId ? this.offersService.findActiveForSupermarket(supermarketId) : this.offersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findById(id);
  }
}
