import { Logger, Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { LoggerModule } from './common/logger';

@Module({
  imports: [CountryModule, LoggerModule],
})
export class AppModule {}
