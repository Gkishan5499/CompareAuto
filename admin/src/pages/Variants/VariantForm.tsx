import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";
import { useQuery } from "@tanstack/react-query";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";

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

  const createHook = useApiCreate(["variants"], "/api/variants");
  const updateHook = useApiUpdate(["variants"], `/api/variants/${id}`);

  const onSubmit = async (form:any) => {
    // if any file uploads required, handle here
    delete form.imageFile;

    if (id) await updateHook.mutateAsync(form);
    else await createHook.mutateAsync(form);

    navigate("/variants");
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{id ? "Edit Variant" : "Add Variant"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register("id")} placeholder="Variant ID" className="border p-2 w-full" />
        <input {...register("modelId")} placeholder="Model ID" className="border p-2 w-full" />
        <input {...register("name")} placeholder="Name" className="border p-2 w-full" />
        <input {...register("price")} placeholder="Price" type="number" className="border p-2 w-full" />
        <input {...register("fuelType")} placeholder="Fuel Type" className="border p-2 w-full" />
        <input {...register("transmission")} placeholder="Transmission" className="border p-2 w-full" />
        <input {...register("engine")} placeholder="Engine" className="border p-2 w-full" />
        <input {...register("mileage")} placeholder="Mileage" className="border p-2 w-full" />
        <input {...register("seating")} placeholder="Seating" className="border p-2 w-full" />
        <input {...register("colors")} placeholder="Colors (comma separated)" className="border p-2 w-full" />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button className="bg-gray-200 px-4 py-2 rounded" type="button" onClick={() => navigate('/variants')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
