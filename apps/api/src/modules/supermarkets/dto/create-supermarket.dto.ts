import { IsOptional, IsString } from 'class-validator';

export class CreateSupermarketDto {
  @IsString() name!: string;
  @IsOptional() @IsString() logoUrl?: string;
}
