export enum PermitType {
  SINGLE_TRIP_OVERSIZE = 'STOS',
  TERM_OVERSIZE = 'TROS',
  EXTRA_PROVINCIAL_TEMPORARY_OPERATING = 'EPTOP',
  HIGHWAY_CROSSING = 'HC',
  LONG_COMBINATION_VEHICLE = 'LCV',
  MOTIVE_FUEL_USER = 'MFP',
  QUARTERLY_NON_REG_INS_BUS = 'NRQBS',
  NON_RESIDENT_QUARTERLY_CONDITIONAL_LICENSE = 'NRQCL',
  QUARTERLY_NON_RESIDENT_REG_INS_COMM_VEHICLE = 'NRQCV',
  NON_RESIDENT_QUARTERLY_FARM_TRACTOR = 'NRQFT',
  QUARTERLY_NON_RESIDENT_REG_INS_FARM_VEHICLE = 'NRQFV',
  NON_RESIDENT_QUARTERLY_X_PLATED = 'NRQXP',
  SINGLE_TRIP_NON_RESIDENT_REGISTRATION_INSURANCE_BUSES = 'NRSBS',
  NON_RESIDENT_SINGLE_TRIP_CONDITIONAL_LICENSE = 'NRSCL',
  SINGLE_TRIP_NON_RESIDENT_REG_INS_COMMERCIAL_VEHICLE = 'NRSCV',
  NON_RESIDENT_FARM_TRACTOR_SINGLE_TRIP = 'NRSFT',
  SINGLE_TRIP_NON_RESIDENT_REG_INS_FARM_VEHICLE = 'NRSFV',
  NON_RESIDENT_SINGLE_TRIP_X_PLATED_VEHICLE = 'NRSXP',
  RIG_MOVE = 'RIG',
  SINGLE_TRIP_OVERWEIGHT = 'STOW',
  SINGLE_TRIP_OVERWEIGHT_OVERSIZE = 'STWS',
  TERM_AXLE_OVERWEIGHT = 'TRAX',
  TERM_OVERWEIGHT = 'TROW',
  NON_RESIDENT_QUARTERLY_ICBC_BASIC_INSURANCE_FR = 'QRFR',
  NON_RESIDENT_SINGLE_TRIP_ICBC_BASIC_INSURANCE_FR = 'STFR',
}

export enum ExtendedPermitType {
  ALL = 'ALL',
}

export const PermitTypeReport = {
  ...PermitType,
  ...ExtendedPermitType,
};

export type PermitTypeReport =
  (typeof PermitTypeReport)[keyof typeof PermitTypeReport];
