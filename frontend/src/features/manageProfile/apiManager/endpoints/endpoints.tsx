export const MANAGE_PROFILE_URL =
  import.meta.env.VITE_API_MANAGE_PROFILE_URL ||
  envConfig.VITE_API_MANAGE_PROFILE_URL;

export const MANAGE_PROFILE_API = {
  COMPANY_INFO: `${MANAGE_PROFILE_URL}/profile/company`,
};