import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DataNotFoundException } from '../../../common/exception/data-not-found.exception';
import { ExceptionDto } from '../../common/dto/exception.dto';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { UpdateCompanyDto } from './dto/request/update-company.dto';
import { ReadCompanyDto } from './dto/response/read-company.dto';
import { ReadCompanyUserDto } from './dto/response/read-company-user.dto';
import {
  CompanyDirectory,
  UserDirectory,
} from '../../../common/enum/directory.enum';

@ApiTags('Company and User Management - Company')
@ApiNotFoundResponse({
  description: 'The Company Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The Company Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The Company Api Internal Server Error Response',
  type: ExceptionDto,
})
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * A POST method defined with the @Post() decorator and a route of /company
   * that creates a new company and its admin user.
   * TODO: Validations on {@link CreateCompanyDto}.
   * TODO: Secure endpoints once login is implemented.
   * TODO: Grab user name from the access token and remove the hard coded value 'ASMITH'.
   *
   * @param createCompanyDto The http request object containing the company and
   * admin user details.
   *
   * @returns The details of the new company and its associated admin user with
   * response object {@link ReadCompanyUserDto}
   */
  @ApiCreatedResponse({
    description: 'The Company-User Resource',
    type: ReadCompanyUserDto,
  })
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companyService.create(
      createCompanyDto,
      CompanyDirectory.BBCEID,
      'ASMITH', //! Hardcoded value to be replaced by user name from access token
      UserDirectory.BBCEID,
    );
  }

  /**
   * A GET method defined with the @Get(':companyGUID') decorator and a route of
   * /company/:companyGUID that retrieves a company by its GUID (global unique
   * identifier).
   * TODO: Secure endpoints once login is implemented.
   *
   * @param companyGUID A temporary placeholder parameter to get the company by
   *        its GUID. Will be removed once login system is implemented.
   *
   * @returns The company details with response object {@link ReadCompanyDto}.
   */
  @ApiOkResponse({
    description: 'The Company Resource',
    type: ReadCompanyDto,
  })
  @Get(':companyGUID')
  async get(
    @Param('companyGUID') companyGUID: string,
  ): Promise<ReadCompanyDto> {
    const company = await this.companyService.findOne(companyGUID);
    if (!company) {
      throw new DataNotFoundException();
    }
    return company;
  }

  /**
   * A PUT method defined with the @Put(':companyGUID') decorator and a route of
   * /company/:companyGUID that updates a company by its GUID.
   * TODO: Validations on {@link UpdateCompanyDto}.
   * TODO: Secure endpoints once login is implemented.
   *
   * @param companyGUID A temporary placeholder parameter to get the company by
   *        its GUID. Will be removed once login system is implemented.
   *
   * @returns The updated company deails with response object {@link ReadCompanyDto}.
   */
  @ApiOkResponse({
    description: 'The Company  Resource',
    type: ReadCompanyDto,
  })
  @Put(':companyGUID')
  async update(
    @Param('companyGUID') companyGUID: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<ReadCompanyDto> {
    const powerUnitType = await this.companyService.update(
      companyGUID,
      updateCompanyDto,
      CompanyDirectory.BBCEID,
    );
    if (!powerUnitType) {
      throw new DataNotFoundException();
    }
    return powerUnitType;
  }
}