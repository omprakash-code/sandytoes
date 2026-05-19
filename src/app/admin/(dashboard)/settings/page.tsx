export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0c7772]">
          Admin system
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Settings</h1>
      </div>
      <div className="bg-white p-5 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
        Sandy Toes booking settings will live here. For this MVP, booking rules are managed through
        blocked dates and reservation status updates.
      </div>
    </div>
  );
}
