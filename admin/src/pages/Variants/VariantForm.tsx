import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";
import { useQuery } from "@tanstack/react-query";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Label } from "../../components/ui/label";

export default function VariantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const { data: variant } = useQuery({
    queryKey: ["variant", id],
    queryFn: async () => (await client.get(`/api/variants/${id}`)).data,
    enabled: !!id,
  });

  // Populate form when variant data arrives
  useEffect(() => {
    if (variant) reset(variant);
  }, [variant, reset]);

  // Image upload state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    if (variant) {
      // variant may contain `image` or `images` or `photos`
      const imgs: string[] = [];
      if (variant.images && Array.isArray(variant.images)) imgs.push(...variant.images);
      else if (variant.photos && Array.isArray(variant.photos)) imgs.push(...variant.photos);
      else if (variant.image) imgs.push(variant.image);
      setExistingImages(imgs);
    }
  }, [variant]);

  const createHook = useApiCreate(["variants"], "/api/variants");
  const updateHook = useApiUpdate(["variants"], `/api/variants/${id}`);

  const onSubmit = async (form:any) => {
    // if any file uploads required, send multipart/form-data
    try {
      // merge simple form fields
      const payload = { ...form };

      // If we have file uploads or images removed, use FormData and send directly
      if (newFiles.length > 0 || removedImages.length > 0) {
        const fd = new FormData();
        fd.append("data", JSON.stringify(payload));
        newFiles.forEach((file) => fd.append("images", file));
        fd.append("removedImages", JSON.stringify(removedImages));

        if (id) {
          await client.put(`/api/variants/${id}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await client.post(`/api/variants`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        // No files — use existing hooks
        if (id) await updateHook.mutateAsync(payload);
        else await createHook.mutateAsync(payload);
      }

      navigate("/variants");
    } catch (err) {
      console.error("Error saving variant:", err);
      // Optionally surface an error to the UI
    }
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    // append to newFiles
    setNewFiles((prev) => [...prev, ...arr]);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{id ? "Edit Variant" : "Add Variant"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="variant-id">Variant ID</Label>
          <input id="variant-id" {...register("id")} placeholder="Variant ID" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-model-id">Model ID</Label>
          <input id="variant-model-id" {...register("modelId")} placeholder="Model ID" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-name">Name</Label>
          <input id="variant-name" {...register("name")} placeholder="Name" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-price">Price</Label>
          <input id="variant-price" {...register("price")} placeholder="Price" type="number" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-fuel">Fuel Type</Label>
          <input id="variant-fuel" {...register("fuelType")} placeholder="Fuel Type" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-transmission">Transmission</Label>
          <input id="variant-transmission" {...register("transmission")} placeholder="Transmission" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-engine">Engine</Label>
          <input id="variant-engine" {...register("engine")} placeholder="Engine" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-mileage">Mileage</Label>
          <input id="variant-mileage" {...register("mileage")} placeholder="Mileage" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-seating">Seating</Label>
          <input id="variant-seating" {...register("seating")} placeholder="Seating" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="variant-colors">Colors</Label>
          <input id="variant-colors" {...register("colors")} placeholder="Colors (comma separated)" className="border p-2 w-full" />
        </div>
        {/* Image upload + preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Images</label>
          <div className="flex items-center gap-3 flex-wrap">
            {existingImages.map((url) => (
              <div key={url} className="relative w-28 h-20 border rounded overflow-hidden">
                <img src={url} alt="variant" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 text-xs">Remove</button>
              </div>
            ))}

            {newFiles.map((f, i) => (
              <div key={f.name + i} className="relative w-28 h-20 border rounded overflow-hidden">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 text-xs">Remove</button>
              </div>
            ))}

            <label className="w-28 h-20 border rounded flex items-center justify-center cursor-pointer">
              <input type="file" accept="image/*" multiple onChange={(e) => onFilesSelected(e.target.files)} className="hidden" />
              <span className="text-xs text-muted-foreground">Add</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button className="bg-gray-200 px-4 py-2 rounded" type="button" onClick={() => navigate('/variants')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
