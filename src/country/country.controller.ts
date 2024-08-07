import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CountryService } from './county.service';
import { GetCountriesDTO, LanguageDTO, RegionDTO } from './country.dto';
import { GetHeader } from 'src/common/decorators/headerDecorator';

@Controller('api')
export class CountryController {
  constructor(private countryService: CountryService) {}

  @Get('countries')
  async getAllCountries(
    @Query() query: GetCountriesDTO,
    @GetHeader() header: any,
  ) {
    this.countryService.verifyHeader(header);
    return this.countryService.getAllCountries(query);
  }

  @Get('countries/:id')
  async getCountryByCCA3(@Param('id') id: string, @GetHeader() header: any) {
    this.countryService.verifyHeader(header);
    return this.countryService.getCountryByCCA3(id);
  }

  @Get('regions')
  async getRegions(@Query() query: RegionDTO, @GetHeader() header: any) {
    this.countryService.verifyHeader(header);
    return this.countryService.getCountryByRegion(query);
  }

  @Get('language')
  async getCountriesByLanguages(
    @Query() query: LanguageDTO,
    @GetHeader() header: any,
  ) {
    this.countryService.verifyHeader(header);
    return this.countryService.getCountryByLanguages(query);
  }

  @Get('statistics')
  async getCountriesStatistics(@GetHeader() header: any) {
    this.countryService.verifyHeader(header);
    return this.countryService.getCountryStatistics();
  }
}
