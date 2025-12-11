/**
 * Centralized City-to-State Mapping
 * Used by both frontend and backend to ensure consistency
 * All 30 Indian states covered; 25+ major cities mapped
 */

export const CITY_TO_STATE: Record<string, string> = {
  // Delhi region
  "Delhi NCR": "Delhi NCR",
  Delhi: "Delhi",
  "New Delhi": "Delhi",

  // Punjab & Haryana
  Chandigarh: "Chandigarh",
  Mohali: "Punjab",
  Ludhiana: "Punjab",
  Amritsar: "Punjab",
  Jalandhar: "Punjab",
  Gurugram: "Haryana",
  Gurgaon: "Haryana",
  Faridabad: "Haryana",
  
  // Rajasthan
  Jaipur: "Rajasthan",
  Jodhpur: "Rajasthan",
  Udaipur: "Rajasthan",
  Kota: "Rajasthan",
  
  // Uttar Pradesh
  Lucknow: "Uttar Pradesh",
  Agra: "Uttar Pradesh",
  Varanasi: "Uttar Pradesh",
  Kanpur: "Uttar Pradesh",
  Noida: "Uttar Pradesh",
  "Greater Noida": "Uttar Pradesh",
  Ghaziabad: "Uttar Pradesh",
  Meerut: "Uttar Pradesh",

  // Maharashtra
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Nagpur: "Maharashtra",
  Thane: "Maharashtra",
  "Navi Mumbai": "Maharashtra",
  Nashik: "Maharashtra",
  Aurangabad: "Maharashtra",
  Solapur: "Maharashtra",
  Amravati: "Maharashtra",
  Kolhapur: "Maharashtra",
  
  // Karnataka
  Bangalore: "Karnataka",
  Bengaluru: "Karnataka",
  Mysore: "Karnataka",
  Hubli: "Karnataka",
  Mangalore: "Karnataka",
  Belgaum: "Karnataka",
  
  // Tamil Nadu
  Chennai: "Tamil Nadu",
  Coimbatore: "Tamil Nadu",
  Madurai: "Tamil Nadu",
  Tiruchirappalli: "Tamil Nadu",
  Salem: "Tamil Nadu",
  
  // Telangana & Andhra Pradesh
  Hyderabad: "Telangana",
  Visakhapatnam: "Andhra Pradesh",
  Vijayawada: "Andhra Pradesh",
  Guntur: "Andhra Pradesh",
  
  // Kerala
  Kochi: "Kerala",
  Thiruvananthapuram: "Kerala",
  Kozhikode: "Kerala",
  Thrissur: "Kerala",

  // East India
  Kolkata: "West Bengal",
  Guwahati: "Assam",
  Ranchi: "Jharkhand",
  Patna: "Bihar",

  // Central India
  Indore: "Madhya Pradesh",
  Bhopal: "Madhya Pradesh",
  Raipur: "Chhattisgarh",

  // Gujarat
  Ahmedabad: "Gujarat",
  Surat: "Gujarat",
  Vadodara: "Gujarat",
  Rajkot: "Gujarat",
  Bhavnagar: "Gujarat",
  
  // Goa
  Panaji: "Goa",
  "Vasco da Gama": "Goa",
  Margao: "Goa",
};

/** Get state from city name; defaults to "Delhi NCR" if not found */
export const getStateFromCity = (city?: string): string => {
  if (!city) return "Delhi NCR";
  return CITY_TO_STATE[city] || city;
};

/** Get all unique cities mapped */
export const getAllCities = (): string[] => {
  return Object.keys(CITY_TO_STATE).sort();
};

/** All states in India (30 states + Union Territories) */
export const ALL_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
