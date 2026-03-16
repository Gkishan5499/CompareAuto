import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import {
  ACCESS_OPTIONS,
  ALL_PERMISSIONS,
  DEFAULT_EDITOR_PERMISSIONS,
  type PermissionKey,
} from "../../lib/permissions";

interface UserFormValues {
  username: string;
  email: string;
  role: string;
  permissions: PermissionKey[];
  password?: string;
}

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UserFormValues>({
    defaultValues: { role: "editor", permissions: DEFAULT_EDITOR_PERMISSIONS },
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
      email: data.email || "",
      role: data.role || "editor",
      permissions: (Array.isArray(data.permissions) && data.permissions.length > 0)
        ? data.permissions
        : (data.role === "admin" ? ALL_PERMISSIONS : DEFAULT_EDITOR_PERMISSIONS),
      password: "",
    });
  }, [data, reset]);

  const create = useApiCreate(["admin-users"], "/api/admin-users");
  const update = useApiUpdate(["admin-users"], `/api/admin-users/${id}`);

  const onSubmit = async (form: UserFormValues) => {
    const payload: UserFormValues = {
      username: form.username,
      email: form.email.trim().toLowerCase(),
      role: form.role,
      permissions: form.role === "admin" ? ALL_PERMISSIONS : (form.permissions || []),
    };

    if (payload.role !== "admin" && payload.permissions.length === 0) {
      toast.error("Select at least one access permission");
      return;
    }

    if (form.password && form.password.trim()) {
      payload.password = form.password;
    }

    try {
      if (id) {
        await update.mutateAsync(payload);
        toast.success("User updated successfully");
      } else {
        const created = await create.mutateAsync(payload);
        if (created?.emailNotificationSent) {
          toast.success("User created and confirmation email sent");
        } else {
          toast.warning("User created, but confirmation email was not sent");
        }
      }

      navigate("/users");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save user");
    }
  };

  const roleValue = watch("role");
  const selectedPermissions = watch("permissions") || [];

  useEffect(() => {
    const hasSamePermissions = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      return a.every((item) => b.includes(item));
    };

    if (roleValue === "admin") {
      if (!hasSamePermissions(selectedPermissions, ALL_PERMISSIONS)) {
        setValue("permissions", ALL_PERMISSIONS, { shouldValidate: true });
      }
      return;
    }

    if (!selectedPermissions || selectedPermissions.length === 0) {
      setValue("permissions", DEFAULT_EDITOR_PERMISSIONS, { shouldValidate: true });
    }
  }, [roleValue, selectedPermissions, setValue]);

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
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="user-role">Role</Label>
          <select
            id="user-role"
            {...register("role", { required: "Role is required" })}
            value={roleValue}
            className="w-full h-10 rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <option value="admin">admin</option>
            <option value="editor">editor</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Access Permissions</Label>
          {roleValue === "admin" ? (
            <p className="text-sm text-gray-600">Admin role gets full access automatically.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border p-3">
              {ACCESS_OPTIONS.filter((item) => item.key !== "users").map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    value={item.key}
                    className="h-4 w-4"
                    {...register("permissions", {
                      validate: (value) => {
                        if (watch("role") === "admin") return true;
                        return (value && value.length > 0) || "Select at least one access permission";
                      },
                    })}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}
          {errors.permissions && (
            <p className="text-sm text-red-600">{errors.permissions.message as string}</p>
          )}
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
