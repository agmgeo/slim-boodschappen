import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpsertPriceDto {
  @IsUUID() productId!: string;
  @IsUUID() supermarketId!: string;
  @IsOptional() @IsUUID() storeId?: string;
  @IsNumber() regularPrice!: number;
  @IsOptional() @IsUUID() activeOfferId?: string;
}
