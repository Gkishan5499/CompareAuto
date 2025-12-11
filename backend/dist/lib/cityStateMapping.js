"use strict";
/**
 * Centralized City-to-State Mapping
 * Used by both frontend and backend to ensure consistency
 * All 30 Indian states covered; 25+ major cities mapped
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_STATES = exports.getAllCities = exports.getStateFromCity = exports.CITY_TO_STATE = void 0;
exports.CITY_TO_STATE = {
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
const getStateFromCity = (city) => {
    if (!city)
        return "Delhi NCR";
    return exports.CITY_TO_STATE[city] || city;
};
exports.getStateFromCity = getStateFromCity;
/** Get all unique cities mapped */
const getAllCities = () => {
    return Object.keys(exports.CITY_TO_STATE).sort();
};
exports.getAllCities = getAllCities;
/** All states in India (30 states + Union Territories) */
exports.ALL_STATES = [
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
