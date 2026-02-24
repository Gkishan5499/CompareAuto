import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import CloudinaryUpload from "../../components/CloudinaryUpload";
import { Label } from "../../components/ui/label";

export default function ModelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm();
  const [gallery, setGallery] = useState<string[]>([]);

  const { data: model } = useQuery({
    queryKey: ["model", id],
    queryFn: async () => (await client.get(`/api/models/${id}`)).data,
    enabled: !!id,
  });

  // Ensure form fields are populated when model data arrives
  useEffect(() => {
    if (model) {
      reset(model);
      setGallery(model.gallery || []);
    }
  }, [model, reset]);
  


  const createModel = useApiCreate(["models"], "/api/models");
  const updateModel = useApiUpdate(["models"], `/api/models/${id}`);

  const imageFile = watch("imageFile");
  const imagePreview = useMemo(() => {
    if (imageFile && imageFile.length > 0) return URL.createObjectURL(imageFile[0]);
    if (model?.image) return model.image;
    return undefined;
  }, [imageFile, model]);

  useEffect(() => {
    let url: string | undefined;
    if (imageFile && imageFile.length > 0) url = URL.createObjectURL(imageFile[0]);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const onSubmit = async (form: any) => {
    // handle image upload
    if (form.imageFile?.[0]) {
      const fd = new FormData();
      fd.append("file", form.imageFile[0]);

      const uploadRes = await client.post("/api/uploads", fd);
      form.image = uploadRes.data.url;
    }

    // attach gallery from Cloudinary uploads
    form.gallery = gallery;
    if (!form.image && gallery.length > 0) {
      form.image = gallery[0];
    }

    delete form.imageFile;

    if (id) updateModel.mutate(form);
    else createModel.mutate(form);

    navigate("/models");
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{id ? "Edit Model" : "Add New Model"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        <div className="space-y-1">
          <Label htmlFor="model-id">Model ID</Label>
          <input id="model-id" {...register("id")} placeholder="Model ID" className="border p-2 w-full" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="model-name">Model Name</Label>
          <input id="model-name" {...register("name")} placeholder="Model Name" className="border p-2 w-full" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="model-brand-id">Brand ID</Label>
          <input id="model-brand-id" {...register("brandId")} placeholder="Brand ID" className="border p-2 w-full" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="model-brand-name">Brand Name</Label>
          <input id="model-brand-name" {...register("brandName")} placeholder="Brand Name" className="border p-2 w-full" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="model-body-type">Body Type</Label>
          <input id="model-body-type" {...register("bodyType")} placeholder="Body Type" className="border p-2 w-full" />
        </div>

        {/* Gallery Upload */}
        <div className="border rounded p-3">
          <CloudinaryUpload value={gallery} onChange={setGallery} maxFiles={30} />
          <p className="text-xs text-gray-500 mt-2">
            Upload up to 30 images. First image becomes the hero image on the site. <br/>
            You can reorder images by dragging or using the move buttons on hover.
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="model-image">Hero Image</Label>
          <input id="model-image" type="file" {...register("imageFile")} />
        </div>
        {imagePreview && <img src={imagePreview} alt="image preview" className="h-24 mt-2 rounded" />}

        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
