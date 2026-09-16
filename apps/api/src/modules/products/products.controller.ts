import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

  @Post()
    create(@Body() dto: CreateProductDto) {
          return this.productsService.create(dto as any);
    }

  @Patch(':id')
    updateCategory(@Param('id') id: string, @Body() body: { category: string }) {
          return this.productsService.updateCategory(id, body.category as any);
    }

  @Get()
    findAll(@Query('q') query?: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
          if (query) return this.productsService.search(query, limit ? parseInt(limit, 10) : undefined);
          return this.productsService.findAll({
                  limit: limit ? parseInt(limit, 10) : undefined,
                  offset: offset ? parseInt(offset, 10) : undefined,
          });
    }

  @Get('barcode/:barcode')
    findByBarcode(@Param('barcode') barcode: string) {
          return this.productsService.findByBarcode(barcode);
    }

  @Get(':id')
    findOne(@Param('id') id: string) {
          return this.productsService.findById(id);
    }
}
