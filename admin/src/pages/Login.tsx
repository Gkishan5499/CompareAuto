import { useForm } from "react-hook-form";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await login(data.username, data.password);
      navigate("/");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow w-80" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-3">Admin Login</h2>
        <input {...register("username")} placeholder="username" className="border p-2 w-full mb-2" />
        <input {...register("password")} type="password" placeholder="password" className="border p-2 w-full mb-4" />
        <button className="bg-blue-600 text-white py-2 w-full rounded">Login</button>
      </form>
    </div>
  );
}
