import { PageHeader } from "../../components/common/PageHeader";
import { ChangePasswordForm } from "../../components/forms/ChangePasswordForm";

export default function ChangePassword() {
  return (
    <div>
      <PageHeader
        title="Change password"
        subtitle="Update your account password regularly to keep it secure."
      />
      <ChangePasswordForm />
    </div>
  );
}
