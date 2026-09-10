import { Module } from '@nestjs/common';
import { SupermarketsModule } from '../supermarkets/supermarkets.module';
import { ProductsModule } from '../products/products.module';
import { FoldersModule } from '../folders/folders.module';
import { ProductMatchingModule } from '../product-matching/product-matching.module';
import { FolderImportController } from './folder-import.controller';
import { FolderImportService } from './folder-import.service';
import { FolderImportScheduler } from './folder-import.scheduler';
import { FOLDER_SCRAPER_ADAPTERS } from './adapters/folder-scraper-adapters.token';
import { buildRegisteredFolderAdapters } from './adapters/registered-adapters';

@Module({
  imports: [SupermarketsModule, ProductsModule, FoldersModule, ProductMatchingModule],
  controllers: [FolderImportController],
  providers: [
    FolderImportService,
    FolderImportScheduler,
    { provide: FOLDER_SCRAPER_ADAPTERS, useFactory: buildRegisteredFolderAdapters },
  ],
  exports: [FolderImportService],
})
export class FolderImportModule {}
