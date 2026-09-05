import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Alert } from "../../components/common/Alert";
import { useToast } from "../../hooks/useToast";
import { adminApi } from "../../api/adminApi";
import { createStoreSchema } from "../../utils/validation";
import { getApiErrorMessage } from "../../utils/apiError";

export default function CreateStore() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState(null);

  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState(null);
  const [ownersReloadTick, setOwnersReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setOwnersLoading(true);
    setOwnersError(null);
    adminApi
      .getUsers({ role: "STORE_OWNER", limit: 100, sortBy: "name", order: "asc" })
      .then((result) => {
        if (!cancelled) setOwners(result.items);
      })
      .catch((error) => {
        if (!cancelled) setOwnersError(error);
      })
      .finally(() => {
        if (!cancelled) setOwnersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ownersReloadTick]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createStoreSchema),
    defaultValues: { name: "", email: "", address: "", ownerId: "" },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await adminApi.createStore({ ...values, ownerId: Number(values.ownerId) });
      toast.success("Store created successfully.");
      navigate("/admin/stores");
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Could not create the store. Please try again."));
    }
  };

  const ownerOptions = owners.map((owner) => ({
    value: String(owner.id),
    label: `${owner.name}${owner.email ? ` — ${owner.email}` : ""}`,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Create store"
        subtitle="Add a new store and assign an existing store owner."
        actions={
          <ButtonLink to="/admin/stores" variant="secondary" icon={ArrowLeft}>
            Back to stores
          </ButtonLink>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {formError && (
          <div className="mb-5">
            <Alert variant="error">{formError}</Alert>
          </div>
        )}

        {ownersError && (
          <div className="mb-5">
            <Alert variant="error">
              Could not load store owners.{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => setOwnersReloadTick((t) => t + 1)}
              >
                Retry
              </button>
            </Alert>
          </div>
        )}

        {!ownersError && !ownersLoading && owners.length === 0 && (
          <div className="mb-5">
            <Alert variant="warning">
              No store owners exist yet. Create a user with the Store Owner role first.
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Store name"
            placeholder="Enter store name (20–60 characters)"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="store@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Textarea
            label="Address"
            name="address"
            placeholder="Street, city, state"
            hint="Up to 400 characters."
            error={errors.address?.message}
            {...register("address")}
          />
          <Select
            label="Store owner"
            name="ownerId"
            placeholder={ownersLoading ? "Loading store owners…" : "Select a store owner"}
            options={ownerOptions}
            disabled={ownersLoading || owners.length === 0}
            error={errors.ownerId?.message}
            hint={ownersLoading ? "Fetching existing store owners…" : undefined}
            {...register("ownerId")}
          />

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/stores")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              icon={PlusCircle}
              disabled={ownersLoading || owners.length === 0}
            >
              Create store
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
