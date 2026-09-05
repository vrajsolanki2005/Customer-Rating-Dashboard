import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { PasswordInput } from "../ui/PasswordInput";
import { Button } from "../ui/Button";
import { Alert } from "../common/Alert";
import { authApi } from "../../api/authApi";
import { useToast } from "../../hooks/useToast";
import { getApiErrorMessage } from "../../utils/apiError";
import { changePasswordSchema, PASSWORD_HINT } from "../../utils/validation";

export function ChangePasswordForm() {
  const toast = useToast();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Your password has been updated.");
      reset();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Could not change your password. Please try again."));
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {formError && (
          <div className="mb-5">
            <Alert variant="error">{formError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <PasswordInput
            label="Current password"
            placeholder="Enter your current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordInput
            label="New password"
            placeholder="Enter your new password"
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordInput
            label="Confirm new password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <div className="flex justify-end border-t border-slate-200 pt-5">
            <Button type="submit" loading={isSubmitting} icon={KeyRound}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
