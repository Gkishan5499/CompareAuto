import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";
import { useQuery } from "@tanstack/react-query";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";

export default function DealerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const { data: dealer } = useQuery({
    queryKey: ["dealer", id],
    queryFn: async () => (await client.get(`/api/dealers/${id}`)).data,
    enabled: !!id,
    onSuccess: (d) => d && reset(d),
  });

  const create = useApiCreate(["dealers"], "/api/dealers");
  const update = useApiUpdate(["dealers"], `/api/dealers/${id}`);

  const onSubmit = async (form:any) => {
    if (id) await update.mutateAsync(form);
    else await create.mutateAsync(form);
    navigate('/dealers');
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit Dealer' : 'Add Dealer'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('id')} placeholder="Dealer ID" className="border p-2 w-full" />
        <input {...register('name')} placeholder="Name" className="border p-2 w-full" />
        <input {...register('address.line1')} placeholder="Address (line 1)" className="border p-2 w-full" />
        <input {...register('phones.0')} placeholder="Phone" className="border p-2 w-full" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
