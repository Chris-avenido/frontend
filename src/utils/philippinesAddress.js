const PSGC_API_URL = 'https://psgc.gitlab.io/api';

const fetchPsgc = async (endpoint) => {
  const response = await fetch(`${PSGC_API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error('Unable to load Philippine address data.');
  }
  return response.json();
};

const sortByName = (items) => [...items].sort((a, b) => a.name.localeCompare(b.name));

export const getRegions = async () => sortByName(await fetchPsgc('/regions/'));

export const getProvincesByRegion = async (regionCode) => {
  if (!regionCode) return [];
  return sortByName(await fetchPsgc(`/regions/${regionCode}/provinces/`));
};

export const getCitiesMunicipalitiesByProvince = async (provinceCode) => {
  if (!provinceCode) return [];
  return sortByName(await fetchPsgc(`/provinces/${provinceCode}/cities-municipalities/`));
};

export const getCitiesMunicipalitiesByRegion = async (regionCode) => {
  if (!regionCode) return [];
  return sortByName(await fetchPsgc(`/regions/${regionCode}/cities-municipalities/`));
};

export const getBarangaysByCityMunicipality = async (cityOrMunicipalityCode) => {
  if (!cityOrMunicipalityCode) return [];
  return sortByName(await fetchPsgc(`/cities-municipalities/${cityOrMunicipalityCode}/barangays/`));
};
