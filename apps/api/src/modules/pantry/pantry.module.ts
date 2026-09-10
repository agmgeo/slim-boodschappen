import { Module } from '@nestjs/common';
import { ShoppingListsModule } from '../shopping-lists/shopping-lists.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';

@Module({
  imports: [ShoppingListsModule],
  controllers: [PantryController],
  providers: [PantryService],
  exports: [PantryService],
})
export class PantryModule {}
