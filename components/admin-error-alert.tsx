export function AdminErrorAlert({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
      {message}
    </div>
  );
}
