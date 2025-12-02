import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import appConfig from './app.config';
import type { ConfigType } from '@nestjs/config';

@Controller('home')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
