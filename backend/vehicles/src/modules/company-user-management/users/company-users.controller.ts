import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';

import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserDirectory } from '../../../common/enum/directory.enum';
import { UserStatus } from '../../../common/enum/user-status.enum';
import { DataNotFoundException } from '../../../common/exception/data-not-found.exception';
import { ExceptionDto } from '../../common/dto/exception.dto';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { ReadUserDto } from './dto/response/read-user.dto';
import { UsersService } from './users.service';

@ApiTags('Company and User Management - Company User')
@ApiNotFoundResponse({
  description: 'The User Api Not Found Response',
  type: ExceptionDto,
})
@ApiMethodNotAllowedResponse({
  description: 'The User Api Method Not Allowed Response',
  type: ExceptionDto,
})
@ApiInternalServerErrorResponse({
  description: 'The User Api Internal Server Error Response',
  type: ExceptionDto,
})
@Controller('company/:companyId/user')
export class CompanyUsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * A POST method defined with the @Post() decorator and a route of
   * company/:companyId/user that creates a new user associated to a company.
   * TODO: Validations on {@link CreateUserDto}.
   * TODO: Secure endpoints once login is implemented.
   * TODO: Grab user name from the access token and remove the hard coded value 'ASMITH'.
   *
   * @param createUserDto The http request object containing the user details.
   *
   * @returns The details of the new user with response object
   * {@link ReadUserDto}
   */
  @ApiCreatedResponse({
    description: 'The User Resource',
    type: ReadUserDto,
  })
  @Post()
  async create(
    @Param('companyId') companyId: number,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.userService.create(
      createUserDto,
      companyId,
      'ASMITH', //! Hardcoded value to be replaced by user name from access token
      UserDirectory.BBCEID,
    );
  }

  /**
   * A GET method defined with the @Get(':userGUID') decorator and a route of
   * company/:companyId/user/:userGUID  that retrieves a user by its GUID
   * (global unique identifier).
   * TODO: Secure endpoints once login is implemented.
   *
   * @param companyId The company Id.
   *
   * @param userGUID A temporary placeholder parameter to get the user by GUID.
   *        Will be removed once login system is implemented.
   *
   * @returns The user details with response object {@link ReadUserDto}.
   */
  @ApiOkResponse({
    description: 'The User Resource',
    type: ReadUserDto,
  })
  @Get(':userGUID')
  async find(
    @Param('companyId') companyId: number,
    @Param('userGUID') userGUID: string,
  ): Promise<ReadUserDto> {
    const companyUser = await this.userService.findOne(companyId, userGUID);
    if (!companyUser) {
      throw new DataNotFoundException();
    }
    return companyUser;
  }

  /**
   * A GET method defined with the @Get() decorator and a route of
   * company/:companyId/user that retrieves a list of users associated with
   * the company GUID (global unique identifier).
   * TODO: Secure endpoints once login is implemented.
   *
   * @param companyId The company Id.
   *
   * @returns The user list with response object {@link ReadUserDto}.
   */
  @ApiOkResponse({
    description: 'The User Resource List',
    type: ReadUserDto,
    isArray: true,
  })
  @Get()
  async findAll(@Param('companyId') companyId: number): Promise<ReadUserDto[]> {
    return await this.userService.findAllUsers(companyId);
  }

  /**
   * A PUT method defined with the @Put(':userGUID') decorator and a route of
   * company/:companyId/user/:userGUID that updates a user details by its
   * GUID.
   * TODO: Secure endpoints once login is implemented.
   * TODO: Grab user name from the access token and remove the hard coded value 'ASMITH'.
   * TODO: Grab user directory from the access token and remove the hard coded value UserDirectory.BBCEID.
   *
   * @param companyId The company Id.
   * @param userGUID A temporary placeholder parameter to get the user by Id.
   *        Will be removed once login system is implemented.
   *
   * @returns The updated user deails with response object {@link ReadUserDto}.
   */
  @ApiOkResponse({
    description: 'The User Resource',
    type: ReadUserDto,
  })
  @Put(':userGUID')
  async update(
    @Param('companyId') companyId: number,
    @Param('userGUID') userGUID: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ReadUserDto> {
    const user = await this.userService.update(
      companyId,
      userGUID,
      'ASMITH', //! Hardcoded value to be replaced by user name from access token
      UserDirectory.BBCEID, //! Hardcoded value to be replaced by user directory from access token
      updateUserDto,
    );
    if (!user) {
      throw new DataNotFoundException();
    }
    return user;
  }

  /**
   * A PUT method defined with the @Put(':userGUID/status/:statusCode')
   * decorator and a route of
   * company/:companyId/user/:userGUID/status/:statusCode that updates the
   * user status by its GUID.
   * ? This end point maybe merged with user update endpoint. TBD.
   * TODO: Secure endpoints once login is implemented.
   *
   * @param companyId The company Id.
   * @param userGUID A temporary placeholder parameter to get the user by Id.
   *        Will be removed once login system is implemented.
   * @param statusCode The status Code of the user of type {@link UserStatus}
   *
   * @returns True on successfull operation.
   */
  @ApiOkResponse({
    description: '{statusUpdated : true}',
  })
  @ApiQuery({ name: 'code', enum: UserStatus })
  @Put(':userGUID/status')
  async updateStatus(
    @Param('companyId') companyId: number,
    @Param('userGUID') userGUID: string,
    @Query('code') statusCode: UserStatus,
  ): Promise<object> {
    const updateResult = await this.userService.updateStatus(
      companyId,
      userGUID,
      statusCode,
    );
    if (updateResult.affected === 0) {
      throw new DataNotFoundException();
    }
    return { statusUpdated: true };
  }
}