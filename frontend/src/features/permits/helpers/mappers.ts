import { Dayjs } from "dayjs";

import { Permit } from "../types/permit";
import { applyWhenNotNullable } from "../../../common/helpers/util";
import {
  PowerUnit,
  Trailer,
  VehicleType,
  VehicleTypes,
  VehicleTypesAsString,
} from "../../manageVehicles/types/managevehicles";

import { 
  Application, 
  ApplicationRequestData, 
  ApplicationResponse,
} from "../types/application";

import { 
  DATE_FORMATS, 
  dayjsToLocalStr, 
  dayjsToUtcStr, 
  now, 
  toLocalDayjs, 
  utcToLocalDayjs,
} from "../../../common/helpers/formatDate";

/**
 * This helper function is used to get the vehicle object that matches the vin prop
 * If there are multiple vehicles with the same vin, then return the first vehicle
 * @param vehicles list of vehicles
 * @param vin string used as a key to find the existing vehicle
 * @returns a PowerUnit or Trailer object, or undefined
 */
export const mapVinToVehicleObject = (
  vehicles: VehicleTypes[] | undefined,
  vin: string
): PowerUnit | Trailer | undefined => {
  if (!vehicles) return undefined;

  const existingVehicles = vehicles.filter((item) => {
    return item.vin === vin;
  });

  if (!existingVehicles) return undefined;

  return existingVehicles[0];
};

/**
 * Maps the typeCode (Example: GRADERS) to the TrailerType or PowerUnitType object, then return that object
 * @param typeCode
 * @param vehicleType
 * @param powerUnitTypes
 * @param trailerTypes
 * @returns A Vehicle Sub type object
 */
export const mapTypeCodeToObject = (
  typeCode: string,
  vehicleType: string,
  powerUnitTypes: VehicleType[] | undefined,
  trailerTypes: VehicleType[] | undefined
) => {
  let typeObject = undefined;

  if (powerUnitTypes && vehicleType === "powerUnit") {
    typeObject = powerUnitTypes.find((v) => {
      return v.typeCode == typeCode;
    });
  } else if (trailerTypes && vehicleType === "trailer") {
    typeObject = trailerTypes.find((v) => {
      return v.typeCode == typeCode;
    });
  }

  return typeObject;
};

/**
 * Maps/transforms an ApplicationResponse (with string for dates) to an Application object (Dayjs object for dates)
 * @param response ApplicationResponse object received as response data from backend
 * @returns converted Application object that can be used by form fields and the front-end app
 */
export const mapApplicationResponseToApplication = (response: ApplicationResponse): Application => {
  return {
    ...response,
    createdDateTime: applyWhenNotNullable(
      (datetimeStr: string): Dayjs => utcToLocalDayjs(datetimeStr),
      response.createdDateTime,
    ),
    updatedDateTime: applyWhenNotNullable(
      (datetimeStr: string): Dayjs => utcToLocalDayjs(datetimeStr),
      response.updatedDateTime,
    ),
    permitData: {
      ...response.permitData,
      startDate: applyWhenNotNullable(
        (datetimeStr: string): Dayjs => toLocalDayjs(datetimeStr),
        response.permitData.startDate,
        now()
      ),
      expiryDate: applyWhenNotNullable(
        (datetimeStr: string): Dayjs => toLocalDayjs(datetimeStr),
        response.permitData.expiryDate,
        now()
      ),
    }
  };
};

/**
 * Maps/transforms Application form data into ApplicationRequestData so it can be used as payload for backend requests
 * @param data Application form data
 * @returns ApplicationRequestData object that's used for payload to request to backend
 */
export const mapApplicationToApplicationRequestData = (data: Application): ApplicationRequestData => {
  return {
    ...data,
    createdDateTime: applyWhenNotNullable(
      dayjsToUtcStr,
      data.createdDateTime,
    ),
    updatedDateTime: applyWhenNotNullable(
      dayjsToUtcStr,
      data.updatedDateTime,
    ),
    permitData: {
      ...data.permitData,
      startDate: dayjsToLocalStr(data.permitData.startDate, DATE_FORMATS.DATEONLY),
      expiryDate: dayjsToLocalStr(data.permitData.expiryDate, DATE_FORMATS.DATEONLY),
    }
  };
};

/**
 * Gets display text for vehicle type.
 * @param vehicleType Vehicle type (powerUnit or trailer)
 * @returns display text for the vehicle type
 */
export const vehicleTypeDisplayText = (vehicleType: VehicleTypesAsString) => {
  if (vehicleType === "trailer") {
    return "Trailer";
  }
  return "Power Unit";
};

/**
 * Get a cloned permit.
 * @param permit Permit to clone
 * @returns Cloned permit with same fields and nested fields as old permit, but different reference
 */
export const clonePermit = (permit: Permit): Permit => {
  return {
    ...permit,
    permitData: {
      ...permit.permitData,
      contactDetails: permit.permitData.contactDetails ? {
        ...permit.permitData.contactDetails,
      } : undefined,
      vehicleDetails: permit.permitData.vehicleDetails ? {
        ...permit.permitData.vehicleDetails,
      } : undefined,
      commodities: [...permit.permitData.commodities],
      mailingAddress: {
        ...permit.permitData.mailingAddress,
      },
    },
  };
};

/**
 * Transform a Permit object into an Application object.
 * @param permit Permit object to transform
 * @returns Transformed Application object
 */
export const transformPermitToApplication = (permit: Permit) => {
  return {
    ...permit,
    permitId: `${permit.permitId}`,
    previousRevision: applyWhenNotNullable(
      (prevRev) => `${prevRev}`,
      permit.previousRevision
    ),
    createdDateTime: applyWhenNotNullable(
      (datetimeStr: string): Dayjs => utcToLocalDayjs(datetimeStr),
      permit.createdDateTime,
    ),
    updatedDateTime: applyWhenNotNullable(
      (datetimeStr: string): Dayjs => utcToLocalDayjs(datetimeStr),
      permit.updatedDateTime,
    ),
    permitData: {
      ...permit.permitData,
      startDate: applyWhenNotNullable(
        (datetimeStr: string): Dayjs => toLocalDayjs(datetimeStr),
        permit.permitData.startDate,
        now()
      ),
      expiryDate: applyWhenNotNullable(
        (datetimeStr: string): Dayjs => toLocalDayjs(datetimeStr),
        permit.permitData.expiryDate,
        now()
      ),
    }
  };
};

/**
 * Transform an Application object into a Permit object. Some permit fields may not be required.
 * @param application Application object to transform
 * @returns Transformed Permit object
 */
export const transformApplicationToPermit = (
  application: Application
): Omit<
  Permit, 
  "originalPermitId" | 
  "applicationNumber" |
  "permitNumber" | 
  "permitApplicationOrigin" |
  "permitApprovalSource" |
  "revision"
> & Pick<
  Application,
  "originalPermitId" | 
  "applicationNumber" |
  "permitNumber" | 
  "permitApplicationOrigin" |
  "permitApprovalSource" |
  "revision"
> => {
  return {
    ...application,
    permitId: applyWhenNotNullable(
      id => +id,
      application.permitId,
    ),
    previousRevision: applyWhenNotNullable(
      prevRev => +prevRev,
      application.previousRevision,
    ),
    createdDateTime: applyWhenNotNullable(
      dayjsToUtcStr,
      application.createdDateTime,
    ),
    updatedDateTime: applyWhenNotNullable(
      dayjsToUtcStr,
      application.updatedDateTime,
    ),
    permitData: {
      ...application.permitData,
      startDate: dayjsToLocalStr(application.permitData.startDate, DATE_FORMATS.DATEONLY),
      expiryDate: dayjsToLocalStr(application.permitData.expiryDate, DATE_FORMATS.DATEONLY),
    }
  };
};
