import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { GetCountriesDTO, RegionDTO } from './country.dto';
import { OperatorEnum } from './country.interface';

@Injectable()
export class CountryService {
  private logger = new Logger('Country-service');
  constructor() {}

  async getAllCountries(query: GetCountriesDTO) {
    let { limit, page, region, population } = query;
    let data = await axios({
      url: region
        ? `https://restcountries.com/v3.1/region/${region}`
        : `https://restcountries.com/v3.1/all`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((response: any) => {
        this.logger.log('Got all countries');
        return response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.logger.error(error);
        throw new BadRequestException(error.response.data);
      });

    page = page && !isNaN(page) && Number(page) > 0 ? Number(page) : 1;
    limit = limit && !isNaN(limit) ? Number(limit) : 5;

    data = population
      ? this.filterHelper(data, 'population', OperatorEnum.LESSER, population)
      : data;

    return {
      success: true,
      data: this.paginateHelper(data, page, limit),
      currentPage: page,
      limit: limit,
    };
  }

  async getCountryByCCA3(id: string) {
    const data = await axios({
      url: `https://restcountries.com/v3.1/alpha/${id}`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((response: any) => {
        this.logger.log('Got country by CCA');
        return response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.logger.error(error);
        throw new BadRequestException(error.response.data);
      });

    const subregion = data[0]?.subregion;

    let neighbourCountries = await axios({
      url: `https://restcountries.com/v3.1/subregion/${subregion}?fields=name,capital`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((response: any) => {
        return response.data;
      })
      .catch((error: any) => {
        this.logger.error('sub region not found');
      });

    //find 3 neigbouring countries
    neighbourCountries = this.paginateHelper(neighbourCountries, 0, 3);
    data[0].neighbourCountries = neighbourCountries;

    return {
      success: true,
      data,
    };
  }

  async getCountryByRegion(query: RegionDTO) {
    let { region, limit, page } = query;
    let data = await axios({
      url: `https://restcountries.com/v3.1/region/${region}`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((response: any) => {
        this.logger.log('Got country by Region');
        return response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.logger.error(error);
        throw new BadRequestException(error.response.data);
      });

    page = page && !isNaN(page) && Number(page) > 0 ? Number(page) : 1;
    limit = limit && !isNaN(limit) ? Number(limit) : 5;

    return {
      success: true,
      data: this.paginateHelper(data, page, limit),
      region,
      totalPopulation: 20000,
      currentPage: page,
      limit: limit,
    };
  }

  paginateHelper(array: any, pageIndex: number, pageSize: number) {
    var endIndex = Math.min((pageIndex + 1) * pageSize, array.length);
    return array.slice(Math.max(endIndex - pageSize, 0), endIndex);
  }

  filterHelper(
    array: any,
    fieldname: string,
    operator: OperatorEnum,
    value: string | number,
  ) {
    if (operator == OperatorEnum.GREATER) {
      return array.filter((el: any) => el[fieldname] > value);
    } else if (operator == OperatorEnum.LESSER) {
      return array.filter((el: any) => el[fieldname] < value);
    } else {
      return array.filter((el: any) => el[fieldname] == value);
    }
  }

  // fieldCalculatorHelper
}
