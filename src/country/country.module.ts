import { Module } from '@nestjs/common';
import { CountryService } from './county.service';
import { CountryController } from './country.controller';
import { LoggerModule } from 'src/common/logger';

@Module({
  imports: [LoggerModule],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
