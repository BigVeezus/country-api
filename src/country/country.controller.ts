import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CountryService } from './county.service';
import {
  SwaggerModule,
  DocumentBuilder,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GetCountriesDTO, LanguageDTO, RegionDTO } from './country.dto';
import { GetHeader } from 'src/common/decorators/headerDecorator';

@Controller('api')
export class CountryController {
  constructor(private countryService: CountryService) {}

  @Get('countries')
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'limits amount of documents retrived',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'current page',
  })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'filter by region',
  })
  @ApiQuery({
    name: 'population',
    required: false,
    description: 'fetches all population less than the value',
  })
  async getAllCountries(
    @Query() query: GetCountriesDTO,
    @GetHeader() header: any,
  ) {
    this.countryService.verifyHeader(header);
    return this.countryService.getAllCountries(query);
  }

  @ApiParam({
    name: 'id',
    required: true,
    description:
      'gets country by either 2 letter or 3 letter abbreviation, eg= NG, USA',
  })
  @Get('countries/:id')
  async getCountryByCCA3(@Param('id') id: string, @GetHeader() header: any) {
    this.countryService.verifyHeader(header);
    return this.countryService.getCountryByCCA3(id);
  }

  @Get('regions')
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'filter by region',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'limits amount of documents retrived',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'current page',
  })
  async getRegions(@Query() query: RegionDTO, @GetHeader() header: any) {
    this.countryService.verifyHeader(header);
    return this.countryService.getCountryByRegion(query);
  }

  @Get('language')
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'filter by language, eg = "spanish"',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'limits amount of documents retrived',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'current page',
  })
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
