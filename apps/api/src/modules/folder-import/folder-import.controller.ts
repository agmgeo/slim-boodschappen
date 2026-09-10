import { Controller, Get, Param, Post } from '@nestjs/common';
import { FolderImportService } from './folder-import.service';

@Controller('folder-import')
export class FolderImportController {
  constructor(private readonly folderImportService: FolderImportService) {}

  /** Welke supermarkten er een adapter hebben (dus automatisch bijgewerkt kunnen worden). */
  @Get('supermarkets')
  listRegistered() {
    return this.folderImportService.listRegisteredSupermarkets();
  }

  /** Handmatig alle supermarkt-folders (opnieuw) importeren, buiten het wekelijkse schema om. */
  @Post('run')
  runAll() {
    return this.folderImportService.runAll();
  }

  /** Handmatig één supermarkt (opnieuw) importeren, bv. "Albert Heijn" of "Jumbo". */
  @Post('run/:supermarketName')
  runOne(@Param('supermarketName') supermarketName: string) {
    return this.folderImportService.runForSupermarket(supermarketName);
  }
}
