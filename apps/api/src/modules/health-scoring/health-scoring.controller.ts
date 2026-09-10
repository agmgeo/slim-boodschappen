import { Controller, Get, Param, Post } from '@nestjs/common';
import { HealthScoringService } from './health-scoring.service';

@Controller('health-scoring')
export class HealthScoringController {
  constructor(private readonly healthScoringService: HealthScoringService) {}

  @Post(':productId/compute')
  compute(@Param('productId') productId: string) {
    return this.healthScoringService.computeAndStore(productId);
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.healthScoringService.findForProduct(productId);
  }

  @Get(':productId/alternatives')
  findAlternatives(@Param('productId') productId: string) {
    return this.healthScoringService.findHealthierAlternatives(productId);
  }
}
