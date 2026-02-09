import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface UserFormValues {
  username: string;
  role: string;
  password?: string;
}

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UserFormValues>({
    defaultValues: { role: "editor" },
  });

  const { data } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => (await client.get(`/api/admin-users/${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    if (!data) return;
    reset({
      username: data.username || "",
      role: data.role || "editor",
      password: "",
    });
  }, [data, reset]);

  const create = useApiCreate(["admin-users"], "/api/admin-users");
  const update = useApiUpdate(["admin-users"], `/api/admin-users/${id}`);

  const onSubmit = async (form: UserFormValues) => {
    const payload: UserFormValues = {
      username: form.username,
      role: form.role,
    };

    if (form.password && form.password.trim()) {
      payload.password = form.password;
    }

    if (id) {
      await update.mutateAsync(payload);
    } else {
      await create.mutateAsync(payload);
    }

    navigate("/users");
  };

  const roleValue = watch("role");

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">{isEdit ? "Edit User" : "Add User"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="user-username">Username</Label>
          <Input
            id="user-username"
            {...register("username", { required: "Username is required" })}
            placeholder="username"
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="user-role">Role</Label>
          <select
            id="user-role"
            {...register("role")}
            value={roleValue}
            className="w-full h-10 rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <option value="admin">admin</option>
            <option value="editor">editor</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="user-password">Password</Label>
          <Input
            id="user-password"
            type="password"
            autoComplete={isEdit ? "current-password" : "new-password"}
            {...register("password", {
              required: isEdit ? false : "Password is required",
              minLength: isEdit ? undefined : { value: 6, message: "Password must be at least 6 characters" },
            })}
            placeholder={isEdit ? "Leave blank to keep current password" : "Set a password"}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit">{isEdit ? "Save" : "Create"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/users")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
