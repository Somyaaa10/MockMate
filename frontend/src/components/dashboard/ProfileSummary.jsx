import { Card, Skeleton } from "./DashboardPrimitives";

const NOT_PROVIDED = "Not provided";

/* ------------------------------------------------------------------
   Profile Summary — 2-column detail grid matching reference screenshot 1.
   ------------------------------------------------------------------ */
export default function ProfileSummary({ user, loading = false, action }) {
  const fields = [
    { label: "Full Name", value: user?.fullName },
    { label: "Mobile", value: user?.mobile },
    { label: "Email", value: user?.email },
    { label: "Designation", value: user?.designation },
  ];

  return (
    <Card className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[18px] font-bold text-[var(--mm-text)]">
          Profile Summary
        </h3>
        {action}
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
          {fields.map((field) => {
            const isEmpty = !field.value;
            return (
              <div key={field.label} className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--mm-text-3)]">
                  {field.label}
                </p>
                <p
                  className={`mt-1.5 truncate text-[15px] font-semibold ${
                    isEmpty ? "text-[var(--mm-text-3)]" : "text-[var(--mm-text)]"
                  }`}
                >
                  {field.value || NOT_PROVIDED}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

