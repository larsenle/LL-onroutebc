export const VEHICLE_URL =
  import.meta.env.VITE_API_VEHICLE_URL || envConfig.VITE_API_VEHICLE_URL;

export const PERMITS_API = {
  SUBMIT_TERM_OVERSIZE_PERMIT: `${VEHICLE_URL}/permit`,
};