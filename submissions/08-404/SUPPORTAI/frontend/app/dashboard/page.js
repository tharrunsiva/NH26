import DashboardClient from "../../components/DashboardClient";

export const metadata = {
  title: "Agent Dashboard | SupportAI"
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lagoon">
            Operations
          </p>
          <h1
            className="mt-3 text-4xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Live complaint command center
          </h1>
        </div>
        <DashboardClient />
      </div>
    </main>
  );
}
