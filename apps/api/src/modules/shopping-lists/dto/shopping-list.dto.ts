import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateShoppingListDto {
  @IsString() name!: string;
}

export class AddShoppingListItemDto {
  @IsString() rawText!: string;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
}
