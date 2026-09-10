import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OptimizationStrategy } from '@app/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ShoppingOptimizationService } from './shopping-optimization.service';

@UseGuards(JwtAuthGuard)
@Controller('shopping-optimization')
export class ShoppingOptimizationController {
  constructor(private readonly optimizationService: ShoppingOptimizationService) {}

  @Get(':shoppingListId')
  getRecommendation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('shoppingListId') shoppingListId: string,
    @Query('strategy') strategy: OptimizationStrategy = OptimizationStrategy.SMARTEST,
    @Query('considerPantry') considerPantry?: string,
  ) {
    return this.optimizationService.getRecommendation(
      user.userId,
      shoppingListId,
      strategy,
      considerPantry === 'true',
    );
  }

  @Get(':shoppingListId/multi-store')
  getMultiStoreAdvice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('shoppingListId') shoppingListId: string,
    @Query('considerPantry') considerPantry?: string,
  ) {
    return this.optimizationService.getMultiStoreAdvice(user.userId, shoppingListId, considerPantry === 'true');
  }
}
