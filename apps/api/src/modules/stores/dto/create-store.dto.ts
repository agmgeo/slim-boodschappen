import { IsLatitude, IsLongitude, IsString, IsUUID } from 'class-validator';

export class CreateStoreDto {
  @IsUUID() supermarketId!: string;
  @IsString() name!: string;
  @IsString() address!: string;
  @IsLatitude() latitude!: number;
  @IsLongitude() longitude!: number;
}
