export function isCanceledError(error) {
  return (
    error?.code === "ERR_CANCELED" ||
    error?.code === "CanceledError" ||
    error?.name === "CanceledError" ||
    Boolean(error?.__CANCEL__)
  );
}

function messageFromList(list) {
  return list
    .map((item) => (typeof item === "string" ? item : item?.msg || item?.message))
    .filter(Boolean)
    .join(", ");
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (isCanceledError(error)) return "Request canceled.";

  if (!error?.response) {
    return "Cannot reach the server. Make sure the backend is running and your connection is working.";
  }

  const { status, data } = error.response;
  let message = data?.message ?? data?.error ?? null;

  if (Array.isArray(message)) message = messageFromList(message);

  if (data?.errors) {
    const list = Array.isArray(data.errors) ? data.errors : Object.values(data.errors);
    const joined = messageFromList(list);
    message = [message, joined].filter(Boolean).join(" ") || message;
  }

  if (message && typeof message === "string" && message.trim()) return message;

  switch (status) {
    case 400:
      return "Invalid request. Please check the values you entered.";
    case 401:
      return "Your session is invalid or has expired. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This record already exists or conflicts with existing data.";
    case 422:
      return "The submitted data failed validation. Please review the form.";
    case 500:
      return "Something went wrong on the server. Please try again later.";
    default:
      return fallback;
  }
}
