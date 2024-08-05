import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetCountriesDTO {
  @IsNumberString()
  @IsOptional()
  limit: number;

  @IsNumberString()
  @IsOptional()
  page: number;

  @IsString()
  @IsOptional()
  region: string;

  @IsNumberString()
  @IsOptional()
  population: string;
}

export class RegionDTO {
  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNumberString()
  @IsOptional()
  limit: number;

  @IsNumberString()
  @IsOptional()
  page: number;
}
