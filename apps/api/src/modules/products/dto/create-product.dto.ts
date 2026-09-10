import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

const CATEGORIES = [
  'DAIRY', 'BAKERY', 'MEAT', 'FISH', 'VEGETABLES', 'FRUIT', 'DRINKS',
  'SNACKS', 'FROZEN', 'PANTRY', 'HOUSEHOLD', 'PERSONAL_CARE', 'OTHER',
];

export class CreateProductDto {
  @IsString() nameNl!: string;
  @IsString() nameEn!: string;
  @IsIn(CATEGORIES) category!: string;
  @IsOptional() @IsString() brand?: string;
  @IsString() unit!: string;
  @IsOptional() @IsNumber() unitSize?: number;
  @IsOptional() @IsString() unitOfMeasure?: string;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsString() imageUrl?: string;
}
