import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PantryService } from './pantry.service';
import { AdjustPantryItemDto, UpsertPantryItemDto } from './dto/pantry.dto';

@UseGuards(JwtAuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Get()
  getPantry(@CurrentUser() user: AuthenticatedUser) {
    return this.pantryService.getPantryForUser(user.userId);
  }

  @Get('low-stock')
  getLowStock(@CurrentUser() user: AuthenticatedUser) {
    return this.pantryService.getLowStockForUser(user.userId);
  }

  @Post()
  upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertPantryItemDto) {
    return this.pantryService.upsertItem(user.userId, dto.productId, dto.quantity, dto.lowStockThreshold);
  }

  @Post('adjust')
  adjust(@CurrentUser() user: AuthenticatedUser, @Body() dto: AdjustPantryItemDto) {
    return this.pantryService.adjustQuantity(user.userId, dto.productId, dto.delta);
  }

  @Post('low-stock/add-to-list/:shoppingListId')
  addLowStockToList(@CurrentUser() user: AuthenticatedUser, @Param('shoppingListId') shoppingListId: string) {
    return this.pantryService.addLowStockToShoppingList(user.userId, shoppingListId);
  }

  @Delete(':itemId')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('itemId') itemId: string) {
    return this.pantryService.removeItem(user.userId, itemId);
  }
}
