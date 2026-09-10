import { IsArray, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpsertNutritionDto {
  @IsUUID() productId!: string;
  @IsNumber() energyKcal!: number;
  @IsNumber() fat!: number;
  @IsNumber() saturatedFat!: number;
  @IsNumber() carbohydrates!: number;
  @IsNumber() sugars!: number;
  @IsNumber() fiber!: number;
  @IsNumber() protein!: number;
  @IsNumber() salt!: number;
  @IsOptional() @IsArray() additives?: string[];
  @IsOptional() @IsArray() allergens?: string[];
}
