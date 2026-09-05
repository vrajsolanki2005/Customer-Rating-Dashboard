import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/common/Alert";
import { FullScreenLoader } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { signupSchema, PASSWORD_HINT } from "../../utils/validation";
import { getApiErrorMessage } from "../../utils/apiError";
import { roleHome } from "../../utils/auth";

export default function Signup() {
  const { register: registerAccount, isAuthenticated, initializing, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", address: "", password: "", confirmPassword: "" },
  });

  if (initializing) return <FullScreenLoader />;
  if (isAuthenticated) return <Navigate to={roleHome(user?.role)} replace />;

  const onSubmit = async (values) => {
    setFormError(null);
    const payload = { ...values };
    delete payload.confirmPassword;
    try {
      const created = await registerAccount(payload);
      if (created) {
        toast.success("Account created successfully. Welcome to StoreRate!");
        navigate(roleHome(created.role), { replace: true });
      } else {
        toast.success("Account created successfully. Please log in.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Could not create your account. Please try again."));
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Sign up as a normal user to browse and rate stores.">
      {formError && (
        <div className="mb-4">
          <Alert variant="error">{formError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Full name"
          placeholder="Enter your full name (20–60 characters)"
          autoComplete="name"
          error={errors.name?.message}
          {...registerField("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...registerField("email")}
        />
        <Textarea
          label="Address"
          name="address"
          placeholder="Street, city, state"
          hint="Up to 400 characters."
          autoComplete="street-address"
          error={errors.address?.message}
          {...registerField("address")}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          error={errors.password?.message}
          {...registerField("password")}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...registerField("confirmPassword")}
        />
        <Button type="submit" loading={isSubmitting} icon={UserPlus} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
