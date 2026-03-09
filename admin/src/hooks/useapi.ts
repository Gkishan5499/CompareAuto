import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import { toast } from "sonner";

// ✅ FIXED: Added <T> here so you can pass types like useApiList<Brand[]>(...)
export const useApiList = <T>(key: string[], url: string) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      // We pass <T> to client.get so 'response.data' is typed correctly
      const response = await client.get<T>(url);
      return response.data;
    },
  });
};

// Optional: I also added <T> to Create/Update for better type safety on forms
export const useApiCreate = <T = any>(key: string[], url: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => (await client.post(url, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
};

export const useApiUpdate = <T = any>(key: string[], url: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => (await client.put(url, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
};

export const useApiDelete = (key: string[], url: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => (await client.delete(`${url}/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success("Deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete");
    },
  });
};