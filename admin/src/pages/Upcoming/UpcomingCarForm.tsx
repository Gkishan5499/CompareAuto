import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import client from "../../api/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Upload, X } from "lucide-react";

interface UpcomingCarFormData {
  name: string;
  brandId: string;
  brandName: string;
  slug: string;
  image: string;
  bodyType: string;
  fuelTypes: string[];
  expectedPriceMin?: number;
  expectedPriceMax?: number;
  expectedLaunch?: string;
  launchWindow?: string;
  keyFeatures: string[];
  status: string;
}

export default function UpcomingCarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UpcomingCarFormData>({
    defaultValues: {
      status: "upcoming",
      fuelTypes: [],
      keyFeatures: [],
    },
  });

  const [fuelTypesInput, setFuelTypesInput] = useState("");
  const [keyFeaturesInput, setKeyFeaturesInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const { data: car, isLoading } = useQuery({
    queryKey: ["upcoming-car", id],
    queryFn: async () => {
      const res = await client.get(`/api/upcoming-cars/${id}`);
      return res.data;
    },
    enabled: isEdit,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await client.get("/api/brands");
      return res.data;
    },
  });

  useEffect(() => {
    if (car && isEdit) {
      Object.keys(car).forEach((key) => {
        setValue(key as any, car[key]);
      });
      setFuelTypesInput(car.fuelTypes?.join(", ") || "");
      setKeyFeaturesInput(car.keyFeatures?.join("\n") || "");
      setImageUrl(car.image || "");
    }
  }, [car, isEdit, setValue]);

  const saveMutation = useMutation({
    mutationFn: async (data: UpcomingCarFormData) => {
      if (isEdit) {
        await client.put(`/api/upcoming-cars/${id}`, data);
      } else {
        await client.post("/api/upcoming-cars", data);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Upcoming car updated" : "Upcoming car created");
      queryClient.invalidateQueries({ queryKey: ["upcoming-cars"] });
      navigate("/upcoming");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to save upcoming car");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "upcoming-cars");

      const res = await client.post("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data.url;
      setImageUrl(uploadedUrl);
      setValue("image", uploadedUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = (data: UpcomingCarFormData) => {
    // Parse fuel types from comma-separated input
    data.fuelTypes = fuelTypesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Parse key features from newline-separated input
    data.keyFeatures = keyFeaturesInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    // Generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    // Find brand name from brandId
    const selectedBrand = brands.find((b: any) => b.slug === data.brandId || b.id === data.brandId);
    if (selectedBrand) {
      data.brandName = selectedBrand.name;
      data.brandId = selectedBrand.slug;
    }

    saveMutation.mutate(data);
  };

  if (isLoading && isEdit) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/upcoming")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? "Edit" : "Add"} Upcoming Car</h1>
          <p className="text-muted-foreground">Manage upcoming car details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Car Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Car Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="e.g., Thar 5-Door"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brandId">Brand *</Label>
              <select
                id="brandId"
                {...register("brandId", { required: "Brand is required" })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Brand</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandId && <p className="text-sm text-red-600">{errors.brandId.message}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register("slug")} placeholder="Auto-generated from name" />
            </div>

            {/* Body Type */}
            <div className="space-y-2">
              <Label htmlFor="bodyType">Body Type</Label>
              <Input id="bodyType" {...register("bodyType")} placeholder="e.g., SUV, Sedan" />
            </div>

            {/* Image URL */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Car Image</Label>
              
              {/* Current Image Preview */}
              {imageUrl && (
                <div className="relative inline-block">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-32 w-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setValue("image", "");
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload to Cloudinary"}
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">or paste URL below</span>
              </div>

              {/* Manual URL Input */}
              <Input
                id="image"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setValue("image", e.target.value);
                }}
                placeholder="https://... or upload above"
              />
            </div>

            {/* Fuel Types */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fuelTypes">Fuel Types (comma-separated)</Label>
              <Input
                id="fuelTypes"
                value={fuelTypesInput}
                onChange={(e) => setFuelTypesInput(e.target.value)}
                placeholder="e.g., Petrol, Diesel, EV"
              />
            </div>

            {/* Expected Price Min */}
            <div className="space-y-2">
              <Label htmlFor="expectedPriceMin">Expected Price Min (₹)</Label>
              <Input
                id="expectedPriceMin"
                type="number"
                {...register("expectedPriceMin", { valueAsNumber: true })}
                placeholder="1500000"
              />
            </div>

            {/* Expected Price Max */}
            <div className="space-y-2">
              <Label htmlFor="expectedPriceMax">Expected Price Max (₹)</Label>
              <Input
                id="expectedPriceMax"
                type="number"
                {...register("expectedPriceMax", { valueAsNumber: true })}
                placeholder="2200000"
              />
            </div>

            {/* Expected Launch Date */}
            <div className="space-y-2">
              <Label htmlFor="expectedLaunch">Expected Launch Date</Label>
              <Input id="expectedLaunch" type="date" {...register("expectedLaunch")} />
            </div>

            {/* Launch Window */}
            <div className="space-y-2">
              <Label htmlFor="launchWindow">Launch Window</Label>
              <Input
                id="launchWindow"
                {...register("launchWindow")}
                placeholder="e.g., August 2025, Q3 2025"
              />
            </div>

            {/* Key Features */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="keyFeatures">Key Features (one per line)</Label>
              <textarea
                id="keyFeatures"
                value={keyFeaturesInput}
                onChange={(e) => setKeyFeaturesInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                placeholder="5-door with terrain modes&#10;Enhanced safety features&#10;Petrol and Diesel options"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/upcoming")}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Car"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
