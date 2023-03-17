import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { ReadAddressDto } from '../dto/response/read-address.dto';
import { CreateAddressDto } from '../dto/request/create-address.dto';
import { UpdateAddressDto } from '../dto/request/update-address.dto';
import { Address } from '../entities/address.entity';

@Injectable()
export class AddressProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /**
       * Mapping from Address entity to ReadAddressDto DTO, with additional
       * configuration using forMember and mapFrom methods to set the provinceId
       * property of the DTO by extracting them from the province.provinceId
       * property of the entity.
       */
      createMap(
        mapper,
        Address,
        ReadAddressDto,
        forMember(
          (d) => d.provinceId,
          mapFrom((s) => s.province.provinceId),
        ),
      );

      /**
       * Mapping from CreateAddressDto DTO to Address entity, with additional
       * configuration to set the province.provinceId property of the entity
       * from provinceId property of the DTO.
       */
      createMap(
        mapper,
        CreateAddressDto,
        Address,
        forMember(
          (d) => d.province.provinceId,
          mapFrom((s) => s.provinceId),
        ),
      );

      /**
       * Mapping from UpdateAddressDto DTO to Address entity, with additional
       * configuration to set the province.provinceId property of the entity
       * from provinceId property of the DTO..
       */
      createMap(
        mapper,
        UpdateAddressDto,
        Address,
        forMember(
          (d) => d.province.provinceId,
          mapFrom((s) => s.provinceId),
        ),
      );
    };
  }
}
