import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SupermarketsService } from './supermarkets.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';

@Controller('supermarkets')
export class SupermarketsController {
  constructor(private readonly supermarketsService: SupermarketsService) {}

  @Post()
  create(@Body() dto: CreateSupermarketDto) {
    return this.supermarketsService.create(dto.name, dto.logoUrl);
  }

  @Get()
  findAll() {
    return this.supermarketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supermarketsService.findById(id);
  }
}
