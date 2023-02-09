import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { ReadPowerUnitDto } from '../dto/response/read-power-unit.dto';
import { PowerUnit } from '../entities/power-unit.entity';
import { CreatePowerUnitDto } from '../dto/request/create-power-unit.dto';
import { UpdatePowerUnitDto } from '../dto/request/update-power-unit.dto';

@Injectable()
export class PowerUnitsProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        PowerUnit,
        ReadPowerUnitDto,
        forMember(
          (d) => d.provinceId,
          mapFrom((s) => s.province.provinceId),
        ),
        forMember(
          (d) => d.powerUnitTypeCode,
          mapFrom((s) => s.powerUnitType.typeCode),
        ),
      );
      createMap(
        mapper,
        CreatePowerUnitDto,
        PowerUnit,
        forMember(
          (d) => d.province.provinceId,
          mapFrom((s) => s.provinceId),
        ),
        forMember(
          (d) => d.powerUnitType.typeCode,
          mapFrom((s) => s.powerUnitTypeCode),
        ),
      );
      createMap(
        mapper,
        UpdatePowerUnitDto,
        PowerUnit,
        forMember(
          (d) => d.province.provinceId,
          mapFrom((s) => s.provinceId),
        ),
        forMember(
          (d) => d.powerUnitType.typeCode,
          mapFrom((s) => s.powerUnitTypeCode),
        ),
      );
    };
  }
}