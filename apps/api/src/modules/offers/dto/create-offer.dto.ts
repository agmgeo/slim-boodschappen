import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';

const OFFER_TYPES = [
  'PERCENTAGE_DISCOUNT', 'FIXED_PRICE_FOR_N', 'BUY_X_GET_Y_FREE',
  'SECOND_HALF_PRICE', 'VOLUME_DISCOUNT', 'BUNDLE',
];

export class CreateOfferDto {
  @IsUUID() productId!: string;
  @IsUUID() supermarketId!: string;
  @IsOptional() @IsUUID() storeId?: string;
  @IsOptional() @IsUUID() folderId?: string;
  @IsIn(OFFER_TYPES) type!: string;
  @IsOptional() @IsNumber() requiredQuantity?: number;
  @IsOptional() @IsNumber() freeQuantity?: number;
  @IsOptional() @IsNumber() fixedPrice?: number;
  @IsOptional() @IsNumber() percentageOff?: number;
  @IsOptional() @IsArray() bundleProductIds?: string[];
  @IsDateString() validFrom!: string;
  @IsDateString() validUntil!: string;
}
