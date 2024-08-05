import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CountryService } from './county.service';
import { GetCountriesDTO, RegionDTO } from './country.dto';

@Controller('api')
export class CountryController {
  constructor(private countryService: CountryService) {}

  @Get('countries')
  async getAllCountries(@Query() query: GetCountriesDTO) {
    return this.countryService.getAllCountries(query);
  }

  @Get('countries/:id')
  async getCountryByCCA3(@Param('id') id: string) {
    return this.countryService.getCountryByCCA3(id);
  }

  @Get('regions')
  async getRegions(@Query() query: RegionDTO) {
    return this.countryService.getCountryByRegion(query);
  }
}
