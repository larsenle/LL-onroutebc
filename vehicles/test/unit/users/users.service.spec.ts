/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { classes } from '@automapper/classes';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMapper } from '@automapper/core';
import { CompanyService } from '../../../src/modules/company-user-management/company/company.service';
import { DataSource, Repository } from 'typeorm';
import { AddressProfile } from '../../../src/modules/common/profiles/address.profile';
import { ContactProfile } from '../../../src/modules/common/profiles/contact.profile';
import { User } from '../../../src/modules/company-user-management/users/entities/user.entity';
import { UsersProfile } from '../../../src/modules/company-user-management/users/profiles/user.profile';
import { UsersService } from '../../../src/modules/company-user-management/users/users.service';
import {
  createQueryBuilderMock,
  dataSourceMockFactory,
} from '../../util/mocks/factory/dataSource.factory.mock';

import { PendingUsersService } from '../../../src/modules/company-user-management/pending-users/pending-users.service';

import { InternalServerErrorException } from '@nestjs/common';
import { UserStatus } from '../../../src/common/enum/user-status.enum';
import { Role } from '../../../src/common/enum/roles.enum';
import { DataNotFoundException } from '../../../src/common/exception/data-not-found.exception';
import * as constants from '../../util/mocks/data/test-data.constants';
import {
  readRedCompanyDtoMock,
  readRedCompanyMetadataDtoMock,
} from '../../util/mocks/data/company.mock';
import {
  USER_LIST,
  createRedCompanyCvClientUserDtoMock,
  redCompanyAdminUserEntityMock,
  updateRedCompanyCvClientUserDtoMock,
} from '../../util/mocks/data/user.mock';
import {
  redCompanyCvClientUserJWTMock,
  sysAdminStaffUserJWTMock,
} from '../../util/mocks/data/jwt.mock';
import { readRedCompanyPendingUserDtoMock } from '../../util/mocks/data/pending-user.mock';
import { IdirUser } from 'src/modules/company-user-management/users/entities/idir.user.entity';
import { PendingIdirUser } from 'src/modules/company-user-management/pending-idir-users/entities/pending-idir-user.entity';
import { PendingIdirUsersService } from 'src/modules/company-user-management/pending-idir-users/pending-idir-users.service';
import { pendingIdirUserEntityMock } from 'test/util/mocks/data/pending-idir-user.mock';
import { Request } from 'express';
import { IUserJWT } from '../../../src/common/interface/user-jwt.interface';

interface SelectQueryBuilderParameters {
  userGUID?: string;
  companyId?: number;
}

let repo: DeepMocked<Repository<User>>;
let repoIdirUser: DeepMocked<Repository<IdirUser>>;
let repoPendingIdirUser: DeepMocked<Repository<PendingIdirUser>>;
let pendingUsersServiceMock: DeepMocked<PendingUsersService>;
let pendingIdirUsersServiceMock: DeepMocked<PendingIdirUsersService>;
let companyServiceMock: DeepMocked<CompanyService>;

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    pendingUsersServiceMock = createMock<PendingUsersService>();
    pendingIdirUsersServiceMock = createMock<PendingIdirUsersService>();
    companyServiceMock = createMock<CompanyService>();
    repo = createMock<Repository<User>>();
    repoIdirUser = createMock<Repository<IdirUser>>();
    repoPendingIdirUser = createMock<Repository<PendingIdirUser>>();
    const dataSourceMock = dataSourceMockFactory() as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
        {
          provide: getRepositoryToken(IdirUser),
          useValue: repoIdirUser,
        },
        {
          provide: getRepositoryToken(PendingIdirUser),
          useValue: repoPendingIdirUser,
        },
        {
          provide: PendingUsersService,
          useValue: pendingUsersServiceMock,
        },
        {
          provide: PendingIdirUsersService,
          useValue: pendingIdirUsersServiceMock,
        },
        {
          provide: CompanyService,
          useValue: companyServiceMock,
        },
        {
          provide: getMapperToken(),
          useValue: createMapper({
            strategyInitializer: classes(),
          }),
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        ContactProfile,
        AddressProfile,
        UsersProfile,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('User service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User service getCompaniesForUser function', () => {
    it('should return the Associated Company List', async () => {
      companyServiceMock.findCompanyMetadataByUserGuid.mockResolvedValue([
        readRedCompanyMetadataDtoMock,
      ]);
      const retCompanies = await service.getCompaniesForUser(
        constants.RED_COMPANY_CVCLIENT_USER_GUID,
      );
      expect(typeof retCompanies).toBe('object');
      expect(retCompanies[0]).toBe(constants.RED_COMPANY_ID);
    });
  });

  describe('User service create function', () => {
    it('should create a user.', async () => {
      const retUser = await service.create(
        createRedCompanyCvClientUserDtoMock,
        constants.RED_COMPANY_ID,
        redCompanyCvClientUserJWTMock,
      );
      expect(typeof retUser).toBe('object');
      expect(retUser.userGUID).toBe(constants.RED_COMPANY_CVCLIENT_USER_GUID);
    });

    it('should catch and throw and Internal Error Exceptions user.', async () => {
      await expect(async () => {
        await service.create(null, null, redCompanyCvClientUserJWTMock);
      }).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('User service update function', () => {
    it('should update the user', async () => {
      const params: SelectQueryBuilderParameters = {
        userGUID: constants.RED_COMPANY_CVCLIENT_USER_GUID,
      };
      USER_LIST[1].userContact.phone2 = null;
      USER_LIST[1].userContact.extension2 = null;

      findUsersEntityMock(params, USER_LIST);

      const request = createMock<Request>();
      request.user = redCompanyCvClientUserJWTMock;

      const retUser = await service.update(
        constants.RED_COMPANY_CVCLIENT_USER_GUID,
        updateRedCompanyCvClientUserDtoMock,
        constants.RED_COMPANY_ID,
        request.user as IUserJWT,
      );

      expect(typeof retUser).toBe('object');
      expect(retUser.userGUID).toBe(constants.RED_COMPANY_CVCLIENT_USER_GUID);
      expect(retUser.phone2).toBeNull();
      expect(retUser.phone2Extension).toBeNull();
    });
    it('should throw DataNotFoundException', async () => {
      const params: SelectQueryBuilderParameters = {
        userGUID: '081BA455A00D4374B0CC130XXXXXXX',
      };
      findUsersEntityMock(params, USER_LIST);
      await expect(async () => {
        await service.update(
          constants.RED_COMPANY_CVCLIENT_USER_GUID,
          updateRedCompanyCvClientUserDtoMock,
          constants.RED_COMPANY_ID,
          undefined,
        );
      }).rejects.toThrow(DataNotFoundException);
    });
    afterEach(() => {
      USER_LIST[1].userContact.phone2 = constants.RED_COMPANY_CVCLIENT_PHONE_2;
      USER_LIST[1].userContact.phone2 =
        constants.RED_COMPANY_CVCLIENT_PHONE_2_EXT;
    });
  });

  describe('User service updateStatus function', () => {
    it('should update the user Status', async () => {
      repo.update.mockResolvedValue({
        affected: 1,
        raw: undefined,
        generatedMaps: undefined,
      });
      const retUpdateResult = await service.updateStatus(
        constants.BLUE_COMPANY_CVCLIENT_USER_GUID,
        UserStatus.DISABLED,
        redCompanyCvClientUserJWTMock,
      );
      expect(typeof retUpdateResult).toBe('object');
      expect(retUpdateResult.affected).toBe(1);
    });
  });

  describe('User service getRolesForUser function', () => {
    it('should get the user Roles', async () => {
      repo.query.mockResolvedValue([
        { ROLE_TYPE: Role.READ_SELF },
        { ROLE_TYPE: Role.READ_USER },
        { ROLE_TYPE: Role.WRITE_SELF },
        { ROLE_TYPE: Role.WRITE_USER },
      ]);

      const retUserRoles = await service.getRolesForUser(
        constants.RED_COMPANY_CVCLIENT_USER_GUID,
        constants.RED_COMPANY_ID,
      );

      expect(typeof retUserRoles).toBe('object');
      expect(retUserRoles[0]).toBe(Role.READ_SELF);
    });
  });

  describe('User service findORBCUser function', () => {
    it('should return the user-context when user exists', async () => {
      repo.findOne.mockResolvedValue(redCompanyAdminUserEntityMock);
      companyServiceMock.findCompanyMetadataByUserGuid.mockResolvedValue([
        readRedCompanyMetadataDtoMock,
      ]);
      const retUserContext = await service.findORBCUser(
        constants.RED_COMPANY_ADMIN_USER_GUID,
        constants.RED_COMPANY_ADMIN_USER_NAME,
        constants.RED_COMPANY_GUID,
      );
      expect(typeof retUserContext).toBe('object');
      expect(retUserContext.user.userGUID).toBe(
        constants.RED_COMPANY_ADMIN_USER_GUID,
      );
    });
    it('should return the context when user is a Pending user', async () => {
      repo.findOne.mockReturnValue(undefined);
      pendingUsersServiceMock.findPendingUsersDto.mockResolvedValue([
        readRedCompanyPendingUserDtoMock,
      ]);
      companyServiceMock.findCompanyMetadata.mockResolvedValue(
        readRedCompanyMetadataDtoMock,
      );

      companyServiceMock.findOneByCompanyGuid.mockResolvedValue(
        readRedCompanyDtoMock,
      );
      const retUserContext = await service.findORBCUser(
        constants.RED_COMPANY_PENDING_USER_GUID,
        constants.RED_COMPANY_PENDING_USER_NAME,
        constants.RED_COMPANY_GUID,
      );

      expect(typeof retUserContext).toBe('object');
      expect(retUserContext.associatedCompanies[0].companyId).toBe(
        constants.RED_COMPANY_ID,
      );
    });
  });

  //check Idir user
  describe('User service check Idir User function', () => {
    it('should create and return idir user', async () => {
      repoPendingIdirUser.findOne.mockResolvedValue(pendingIdirUserEntityMock);
      repoIdirUser.findOne.mockResolvedValue(null);
      const userExists = await service.checkIdirUser(sysAdminStaffUserJWTMock);
      expect(typeof userExists).toBe('object');
      expect(userExists.user.userName).toBe(
        constants.SYS_ADMIN_STAFF_USER_NAME,
      );
    });
  });
});
function findUsersEntityMock(
  params: SelectQueryBuilderParameters,
  userList = USER_LIST,
) {
  const filteredList = userList.filter((r) => {
    const isMatchedUserGUID = params.userGUID
      ? r.userGUID === params.userGUID
      : true;
    const isMatchedCompanyId = params.companyId
      ? r.companyUsers[0].company.companyId === params.companyId
      : true;
    return isMatchedUserGUID && isMatchedCompanyId;
  });

  jest
    .spyOn(repo, 'createQueryBuilder')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .mockImplementation(() => createQueryBuilderMock(filteredList));
}