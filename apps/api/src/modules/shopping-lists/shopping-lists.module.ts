import { Module } from '@nestjs/common';
import { ProductMatchingModule } from '../product-matching/product-matching.module';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListsService } from './shopping-lists.service';

@Module({
  imports: [ProductMatchingModule],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}
