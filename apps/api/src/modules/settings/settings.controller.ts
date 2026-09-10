import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SettingsService, UpdateSettingsInput } from './settings.service';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.getForUser(user.userId);
  }

  @Patch()
  update(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateSettingsInput) {
    return this.settingsService.update(user.userId, body);
  }
}
