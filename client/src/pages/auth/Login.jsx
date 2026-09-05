import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/common/Alert";
import { FullScreenLoader } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { loginSchema } from "../../utils/validation";
import { getApiErrorMessage } from "../../utils/apiError";
import { roleHome } from "../../utils/auth";
import { firstName } from "../../utils/format";

export default function Login() {
  const { login, isAuthenticated, initializing, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState(null);

  const sessionExpired = searchParams.get("reason") === "expired";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (initializing) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to={roleHome(user?.role)} replace />;

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      const loggedIn = await login(values.email, values.password);
      toast.success(`Welcome back, ${firstName(loggedIn.name)}!`);
      navigate(roleHome(loggedIn.role), { replace: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to log in. Please check your credentials."));
    }
  };

  return (
    <AuthLayout title="Sign in to your account" subtitle="Welcome back! Enter your details to continue.">
      {sessionExpired && (
        <div className="mb-4">
          <Alert variant="warning">Your session has expired. Please sign in again.</Alert>
        </div>
      )}

      {formError && (
        <div className="mb-4">
          <Alert variant="error">{formError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={isSubmitting} icon={LogIn} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
