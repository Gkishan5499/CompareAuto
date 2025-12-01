import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Button } from "../../components/ui/button";

export default function SpecForm() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm();

  const { data: spec, isLoading } = useQuery({
    queryKey: ["spec", variantId],
    queryFn: async () => (await client.get(`/api/specs/${variantId}`)).data,
    enabled: !!variantId,
    onSuccess: (d) => d && reset({ variantId: d.variantId, json: JSON.stringify(d, null, 2) }),
  });

  const create = useApiCreate(["specs"], "/api/specs");
  const update = useApiUpdate(["specs"], `/api/specs/${variantId}`);

  const onSubmit = async (form: any) => {
    let payload: any;
    try {
      payload = JSON.parse(form.json);
    } catch (err) {
      alert("Invalid JSON payload");
      return;
    }

    payload.variantId = form.variantId;

    if (variantId) {
      await update.mutateAsync(payload);
    } else {
      await create.mutateAsync(payload);
    }
    navigate('/specs');
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">{variantId ? 'Edit Specs' : 'Add Specs'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('variantId')} placeholder="Variant ID" className="border p-2 w-full" />
        <textarea {...register('json')} className="w-full h-64 border p-2" placeholder='Paste JSON object for specs here' />
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button variant="outline" type="button" onClick={() => navigate('/specs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
