import { IsIn } from 'class-validator';

export class RecommendationQueryDto {
  @IsIn(['CHEAPEST', 'NEAREST', 'SMARTEST'])
  strategy!: 'CHEAPEST' | 'NEAREST' | 'SMARTEST';
}
