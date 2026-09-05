import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Alert } from "../common/Alert";
import { RatingInput } from "./RatingInput";
import { RatingStars } from "./RatingStars";
import { userApi } from "../../api/userApi";
import { useToast } from "../../hooks/useToast";
import { getApiErrorMessage } from "../../utils/apiError";

export function RatingDialog({ store, onClose, onRated }) {
  const toast = useToast();
  const [rating, setRating] = useState(store?.myRating ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRating(store?.myRating ?? 0);
    setError(null);
  }, [store]);

  if (!store) return null;

  const isUpdate = store.myRating != null;

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (isUpdate) {
        await userApi.updateRating(store.id, rating);
      } else {
        await userApi.createRating(store.id, rating);
      }
      toast.success(isUpdate ? "Your rating has been updated." : "Thanks for rating this store!");
      onRated?.();
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error(getApiErrorMessage(err, "You have already rated this store."));
        onRated?.();
        return;
      }
      setError(getApiErrorMessage(err, "Could not save your rating. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(store)}
      onClose={submitting ? undefined : onClose}
      title={isUpdate ? "Modify your rating" : "Rate this store"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {isUpdate ? "Update rating" : "Submit rating"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <p className="text-sm font-medium text-slate-700">{store.name}</p>
          {isUpdate && (
            <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
              <span>Current rating:</span>
              <RatingStars value={store.myRating} size="sm" />
              <span className="font-medium text-slate-700">{store.myRating} / 5</span>
            </div>
          )}
        </div>

        <div className="flex justify-center rounded-lg border border-slate-200 bg-slate-50 py-6">
          <RatingInput value={rating} onChange={setRating} />
        </div>
      </div>
    </Modal>
  );
}
