import { Module } from '@nestjs/common';
import { CountryService } from './county.service';
import { CountryController } from './country.controller';

@Module({
  imports: [],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
