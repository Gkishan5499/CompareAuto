import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";
import { useQuery } from "@tanstack/react-query";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

// 1. Define the shape of your form data
interface BrandFormValues {
  id: string;
  name: string;
  country: string;
  logo: string;
  logoFile?: FileList; // For the file input
}

export default function BrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 2. Pass the interface to useForm for type safety
  const { register, handleSubmit, reset, watch } = useForm<BrandFormValues>();

  // 3. Fetch Data (Removed onSuccess)
  const { data, isSuccess } = useQuery({
    queryKey: ["brand", id],
    queryFn: async () => {
      // Typed response
      const res = await client.get<BrandFormValues>(`/api/brands/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // 4. Use useEffect to populate form when data arrives
  useEffect(() => {
    if (isSuccess && data) {
      reset({
        id: data.id,
        name: data.name,
        country: data.country,
        logo: data.logo,
      });
    }
  }, [isSuccess, data, reset]);

  const createHook = useApiCreate(["brands"], "/api/brands");
  const updateHook = useApiUpdate(["brands"], `/api/brands/${id}`);

  // 5. Type the submit handler
  const onSubmit: SubmitHandler<BrandFormValues> = async (formData) => {
    // Handle File Upload
    let finalLogoUrl = formData.logo;

    if (formData.logoFile && formData.logoFile.length > 0) {
      const fd = new FormData();
      fd.append("file", formData.logoFile[0]);
      
      const res = await client.post<{ url: string }>("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      finalLogoUrl = res.data.url;
    }

    // Prepare payload (avoid mutating the original formData directly)
    const payload = {
      ...formData,
      logo: finalLogoUrl,
    };
    
    // Remove the FileList object before sending to API (optional, but cleaner)
    delete (payload as any).logoFile;

    if (id) {
      await updateHook.mutateAsync(payload);
    } else {
      await createHook.mutateAsync(payload);
    }

    navigate("/brands");
  };

  const logoFile = watch("logoFile");
  const currentLogo = watch("logo");

  // create preview if a file is selected
  const logoPreview = useMemo(() => {
    if (logoFile && logoFile.length > 0) return URL.createObjectURL(logoFile[0]);
    if (currentLogo) return currentLogo;
    return undefined;
  }, [logoFile, currentLogo]);

  // Cleanup blob URL when component unmounts or logoFile changes
  useEffect(() => {
    let url: string | undefined;
    if (logoFile && logoFile.length > 0) {
      url = URL.createObjectURL(logoFile[0]);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [logoFile]);

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">{id ? "Edit Brand" : "Add Brand"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-sm block mb-1">Brand ID</label>
          <Input {...register("id")} placeholder="brand id" />
        </div>
        <div>
          <label className="text-sm block mb-1">Brand Name</label>
          <Input {...register("name")} placeholder="brand name" />
        </div>
        <div>
          <label className="text-sm block mb-1">Country</label>
          <Input {...register("country")} placeholder="country" />
        </div>
        <div>
          <label className="text-sm block mb-1">Logo</label>
          {/* File inputs are tricky in React Hook Form, this is the standard way */}
          <input type="file" {...register("logoFile")} className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "/>
        </div>
        {logoPreview && (
          <div>
            <img src={logoPreview} alt="logo preview" className="h-20 w-auto rounded border mt-2" />
          </div>
        )}
        <div className="flex gap-2">
          <Button type="submit">{id ? "Save" : "Create"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/brands")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}