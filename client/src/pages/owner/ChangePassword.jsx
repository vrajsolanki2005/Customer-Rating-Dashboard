import { PageHeader } from "../../components/common/PageHeader";
import { ChangePasswordForm } from "../../components/forms/ChangePasswordForm";

export default function ChangePassword() {
  return (
    <div>
      <PageHeader
        title="Change password"
        subtitle="Keep your store owner account secure with a strong password."
      />
      <ChangePasswordForm />
    </div>
  );
}
