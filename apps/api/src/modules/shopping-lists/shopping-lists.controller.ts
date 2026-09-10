import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ShoppingListsService } from './shopping-lists.service';
import { AddShoppingListItemDto, CreateShoppingListDto } from './dto/shopping-list.dto';

@UseGuards(JwtAuthGuard)
@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateShoppingListDto) {
    return this.shoppingListsService.create(user.userId, dto.name);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.shoppingListsService.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shoppingListsService.findById(id);
  }

  @Get(':id/items')
  getItems(@Param('id') id: string) {
    return this.shoppingListsService.getItems(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddShoppingListItemDto) {
    return this.shoppingListsService.addItem(id, dto.rawText, dto.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.shoppingListsService.removeItem(itemId);
  }
}
