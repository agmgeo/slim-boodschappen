import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BarcodeScannerService } from './barcode-scanner.service';

@UseGuards(JwtAuthGuard)
@Controller('barcode-scanner')
export class BarcodeScannerController {
  constructor(private readonly barcodeScannerService: BarcodeScannerService) {}

  @Get(':barcode')
  lookup(@CurrentUser() user: AuthenticatedUser, @Param('barcode') barcode: string) {
    return this.barcodeScannerService.lookup(user.userId, barcode);
  }
}
