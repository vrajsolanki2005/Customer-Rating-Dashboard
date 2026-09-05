import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../hooks/useToast";
import { adminApi } from "../../api/adminApi";
import { createUserSchema, PASSWORD_HINT } from "../../utils/validation";
import { getApiErrorMessage } from "../../utils/apiError";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "STORE_OWNER", label: "Store Owner" },
];

export default function CreateUser() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", address: "", role: "USER" },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await adminApi.createUser(values);
      toast.success("User created successfully.");
      navigate("/admin/users");
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Could not create the user. Please try again."));
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Create user"
        subtitle="Add a new admin, normal user or store owner."
        actions={
          <ButtonLink to="/admin/users" variant="secondary" icon={ArrowLeft}>
            Back to users
          </ButtonLink>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {formError && (
          <div className="mb-5">
            <Alert variant="error">{formError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Full name"
            placeholder="Enter full name (20–60 characters)"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="user@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Set a password"
            hint={PASSWORD_HINT}
            error={errors.password?.message}
            {...register("password")}
          />
          <Textarea
            label="Address"
            name="address"
            placeholder="Street, city, state"
            hint="Up to 400 characters."
            error={errors.address?.message}
            {...register("address")}
          />
          <Select label="Role" name="role" options={ROLE_OPTIONS} error={errors.role?.message} {...register("role")} />

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/users")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} icon={UserPlus}>
              Create user
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
