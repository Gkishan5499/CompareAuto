import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";

export default function ModelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm();

  const { data: model } = useQuery({
    queryKey: ["model", id],
    queryFn: async () => (await client.get(`/api/models/${id}`)).data,
    enabled: !!id,
  });

  // Ensure form fields are populated when model data arrives
  useEffect(() => {
    if (model) reset(model);
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

    delete form.imageFile;

    if (id) updateModel.mutate(form);
    else createModel.mutate(form);

    navigate("/models");
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{id ? "Edit Model" : "Add New Model"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        <input {...register("id")} placeholder="Model ID" className="border p-2 w-full" />

        <input {...register("name")} placeholder="Model Name" className="border p-2 w-full" />

        <input {...register("brandId")} placeholder="Brand ID" className="border p-2 w-full" />

        <input {...register("brandName")} placeholder="Brand Name" className="border p-2 w-full" />

        <input {...register("bodyType")} placeholder="Body Type" className="border p-2 w-full" />

        <input type="file" {...register("imageFile")} />
        {imagePreview && <img src={imagePreview} alt="image preview" className="h-24 mt-2 rounded" />}

        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
