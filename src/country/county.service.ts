import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { GetCountriesDTO, LanguageDTO, RegionDTO } from './country.dto';
import { OperatorEnum } from './country.interface';
import { getOrSetCache } from 'src/common/cache/redis';

@Injectable()
export class CountryService {
  //Initializing logger
  private logger = new Logger('Country-service');
  constructor() {}

  async getAllCountries(query: GetCountriesDTO) {
    const data = await getOrSetCache(`/countries${query}`, async () => {
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
    });
    return data;
  }

  // service that gets country using the 3 abbreviation letters
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
        this.logger.log('Got country by region');
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
      totalPopulation: this.fieldCalculatorHelper(data, 'population'),
      currentPage: page,
      limit: limit,
    };
  }

  async getCountryByLanguages(query: LanguageDTO) {
    let { limit, page, language } = query;
    let data = await axios({
      url: `https://restcountries.com/v3.1/lang/${language}`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((response: any) => {
        this.logger.log('Get countries by languages');
        return response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.logger.error(error);
        throw new BadRequestException(error.response.data);
      });

    const countriesNum = data.length;

    page = page && !isNaN(page) && Number(page) > 0 ? Number(page) : 1;
    limit = limit && !isNaN(limit) ? Number(limit) : 5;

    return {
      success: true,
      data: this.paginateHelper(data, page, limit),
      language: language,
      speakingCountries: countriesNum,
      currentPage: page,
      limit: limit,
    };
  }

  async getCountryStatistics() {
    let data = await axios({
      url: `https://restcountries.com/v3.1/all`,
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((response: any) => {
        this.logger.log('Got countries statistics');
        return response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.logger.error(error);
        throw new BadRequestException(error.response.data);
      });

    const total = data.length;

    const smallest = this.getMinValue(data, 'population');
    const largest = this.getMaxValue(data, 'population');

    const langArr = data.map((el) => el.languages);

    return {
      totalCountries: total,
      mostSpokenLanguage: this.getFrequentElement(langArr),
      smallestPopulation: {
        name: smallest.name?.common,
        population: smallest.population,
      },
      largestPopulation: {
        name: largest.name?.common,
        population: largest.population,
      },
    };
  }

  // verify header to be correct (security)
  verifyHeader(header: { project: string }) {
    if (header.project !== 'abc') {
      throw new UnauthorizedException('Request header is invalid');
    }
  }

  paginateHelper(array: any, pageIndex: number, pageSize: number) {
    var endIndex = Math.min((pageIndex + 1) * pageSize, array.length);
    return array.slice(Math.max(endIndex - pageSize, 0), endIndex);
  }

  //Filter helper that generally filters fields matching a particular condition
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

  //Helper that gets all particular fields in an array of objects
  getFieldHelper(array: any, fieldname: string) {
    return array.map((data) => data[fieldname]);
  }

  //Helper that calculates all particular fields in an array of objects
  fieldCalculatorHelper(array: any, fieldname: string): number {
    let sum = 0;
    array.forEach((data) => {
      sum += data[fieldname];
    });

    return sum;
  }

  getMaxValue(array: any, fieldname: string) {
    return array.reduce(
      (acc, curr) => (curr[fieldname] > acc[fieldname] ? curr : acc),
      array[0] || undefined,
    );
  }

  getMinValue(array: any, fieldname: string) {
    return array.reduce(
      (acc, curr) => (curr[fieldname] < acc[fieldname] ? curr : acc),
      array[0] || undefined,
    );
  }

  // Helper that gets most frequent field in an array of objects
  getFrequentElement(array: any): string | number {
    var a = [];
    array.forEach(function (obj: Object) {
      if (obj) {
        let valuesArr = Object.values(obj);
        valuesArr.flatMap((el) => {
          a.push(el);
        });
      }
    });

    a.sort((a, b) => a - b);
    let count = 1,
      max = 0,
      el: string | number;

    for (let i = 1; i < a.length; ++i) {
      if (a[i] === a[i - 1]) {
        count++;
      } else {
        count = 1;
      }
      if (count > max) {
        max = count;
        el = a[i];
      }
    }
    return el;
  }
}
