import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";

export interface StateTaxConfig {
  _id: string;
  state: string;
  gstRate: number;
  rtoPercentage: number;
  insurancePercentage: number;
  registrationFee: number;
}

/**
 * Fetch all state tax configurations from backend
 */
export const useStateTaxConfigs = () => {
  return useQuery<StateTaxConfig[]>({
    queryKey: ["stateTaxConfigs"],
    queryFn: async () => {
      const response = await client.get("/state-tax-config");
      return response.data;
    },
  });
};

/**
 * Fetch tax configuration for a specific state
 */
export const useStateTaxConfig = (state: string) => {
  return useQuery<StateTaxConfig>({
    queryKey: ["stateTaxConfig", state],
    queryFn: async () => {
      const response = await client.get(`/state-tax-config/${state}`);
      return response.data;
    },
    enabled: !!state,
  });
};
