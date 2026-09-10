import { IsDateString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsUUID() supermarketId!: string;
  @IsDateString() validFrom!: string;
  @IsDateString() validUntil!: string;
}
