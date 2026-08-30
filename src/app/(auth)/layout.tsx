import Image from "next/image";
import { ChartBarIcon, ShieldCheckIcon, TruckIcon } from "@heroicons/react/24/outline";

const points = [
  {
    icon: TruckIcon,
    title: "Every job on the road",
    body: "The full delivery board, with status history and rider reassignment.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Riders, merchants and their papers",
    body: "Verification queues, licence and vehicle documents, suspensions.",
  },
  {
    icon: ChartBarIcon,
    title: "The money",
    body: "Commission splits, payouts and the pricing every fare is built from.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand half — a deep gradient rather than the app's slate ground, so
          the sign-in screen reads as a doorway and not as a page of the app. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary-950 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-500/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white p-1.5">
            <Image
              src="/logo-icon.png"
              alt=""
              width={378}
              height={253}
              className="h-full w-auto"
              priority
            />
          </span>
          <span className="text-xl font-semibold tracking-tight">QuickCarry</span>
        </div>

        <div className="relative">
          <span className="inline-flex items-center rounded-full border border-white/25 px-3 py-1 text-sm font-medium">
            Staff console
          </span>
          <h2 className="mt-6 max-w-lg text-5xl font-bold leading-tight tracking-tight">
            The whole network, one console.
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">
            Operations, settlements and platform pricing for every rider,
            customer and merchant running on QuickCarry.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {points.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card/10">
                  <Icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-base font-semibold">{title}</p>
                  <p className="mt-0.5 text-base leading-relaxed text-white/60">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-base text-white/40">Faster. Fairer. Smarter.</p>
      </aside>

      <main className="flex items-center justify-center bg-card px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
