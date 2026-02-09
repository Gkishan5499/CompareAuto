import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

export default function SpecForm() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const { data: spec, isLoading } = useQuery({
    queryKey: ["spec", variantId],
    queryFn: async () => (await client.get(`/api/specs/${encodeURIComponent(String(variantId || ""))}`)).data,
    enabled: !!variantId,
  });

  useEffect(() => {
    if (!spec) return;
    const payload = (spec as any)?.data || spec;
    if (!payload) return;
    reset({
      variantId: payload.variantId,
      overviewSummary: payload?.overview?.summary || payload?.summary || "",
      overviewDescription: payload?.overview?.description || payload?.description || "",
    });
  }, [spec, reset]);

  const create = useApiCreate(["specs"], "/api/specs");
  const update = useApiUpdate(["specs"], `/api/specs/${variantId}`);

  const onSubmit = async (form: any) => {
    const overview = {
      summary: form.overviewSummary || "",
      description: form.overviewDescription || "",
    };

    if (variantId) {
      await update.mutateAsync({
        variantId: form.variantId,
        "overview.summary": overview.summary,
        "overview.description": overview.description,
      });
    } else {
      await create.mutateAsync({
        variantId: form.variantId,
        overview,
      });
    }

    navigate('/specs');
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">{variantId ? 'Edit Specs' : 'Add Specs'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="spec-variant-id">Variant ID</Label>
          <input id="spec-variant-id" {...register('variantId')} placeholder="Variant ID" className="border p-2 w-full" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="spec-summary">Overview Summary</Label>
          <textarea id="spec-summary" {...register('overviewSummary')} className="w-full h-28 border p-2" placeholder="Short summary for the variant" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="spec-description">Overview Description</Label>
          <textarea id="spec-description" {...register('overviewDescription')} className="w-full h-40 border p-2" placeholder="Detailed overview description" />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button variant="outline" type="button" onClick={() => navigate('/specs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
