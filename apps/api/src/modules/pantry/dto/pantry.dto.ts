import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpsertPantryItemDto {
  @IsUUID() productId!: string;
  @IsInt() @Min(0) quantity!: number;
  @IsOptional() @IsInt() @Min(0) lowStockThreshold?: number;
}

export class AdjustPantryItemDto {
  @IsUUID() productId!: string;
  @IsInt() delta!: number;
}
