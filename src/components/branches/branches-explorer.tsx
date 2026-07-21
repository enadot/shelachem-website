"use client";

import { useState } from "react";
import Image from "next/image";
import type { Branch } from "@/lib/config";
import { cn } from "@/lib/utils";

/** מפת ישראל עם סיכות מונפשות + כרטיסי סניפים מסונכרנים (designs/branches.html). */
export function BranchesExplorer({ branches }: { branches: readonly Branch[] }) {
  const [active, setActive] = useState<string>(branches[0]?.id ?? "");

  return (
    <div className="grid items-start gap-8 md:grid-cols-[380px_1fr] md:gap-12">
      {/* map */}
      <div className="relative mx-auto w-full max-w-[380px] rounded-card border border-hairline bg-surface-blue p-6">
        <Image src="/images/israel-map.svg" alt="מפת ישראל" width={330} height={560} className="h-auto w-full" />
        {branches.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setActive(b.id)}
            aria-label={`סניף ${b.city}`}
            style={{ top: b.marker.top, right: b.marker.right }}
            className="absolute flex -translate-y-1/2 translate-x-1/2 items-center gap-1.5 cursor-pointer border-none bg-transparent p-0"
          >
            <span className="relative flex h-4 w-4">
              <span
                className={cn(
                  "animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-60",
                  active === b.id ? "bg-accent" : "bg-brand",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-4 w-4 rounded-full border-2 border-white",
                  active === b.id ? "bg-accent" : "bg-brand",
                )}
              />
            </span>
            <span
              className={cn(
                "pill px-2.5 py-1 text-[13px] font-bold shadow-sm",
                active === b.id ? "bg-accent text-white" : "bg-white text-ink",
              )}
            >
              {b.city}
            </span>
          </button>
        ))}
      </div>

      {/* branch cards */}
      <div className="flex flex-col gap-5">
        {branches.map((b) => (
          <div
            key={b.id}
            onMouseEnter={() => setActive(b.id)}
            className={cn(
              "rounded-card border bg-white p-6 transition-colors md:p-7",
              active === b.id ? "border-brand shadow-[0_14px_32px_rgba(0,55,112,0.10)]" : "border-hairline",
            )}
          >
            <div className="mb-1 font-display text-[24px] font-bold text-ink">{b.city}</div>
            <div className="mb-3 text-base text-ink-secondary">{b.address}</div>
            <a href={b.phoneHref} className="tnum mb-4 inline-block text-lg font-bold text-brand no-underline">
              {b.phone}
            </a>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-[15px] font-bold text-ink">איך מגיעים</div>
                <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm leading-normal text-ink-muted">
                  {b.arrival.map((a) => (
                    <li key={a} className="flex gap-1.5">
                      <span className="text-brand" aria-hidden>·</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1.5 text-[15px] font-bold text-ink">נגישות</div>
                <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm leading-normal text-ink-muted">
                  {b.accessibility.map((a) => (
                    <li key={a} className="flex gap-1.5">
                      <span className="text-brand" aria-hidden>·</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={b.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pill inline-flex items-center gap-2 border border-hairline bg-white px-4 py-2.5 text-[15px] font-bold text-ink no-underline transition-colors hover:border-brand"
              >
                <Image src="/images/google-maps-icon.svg" alt="" width={18} height={18} aria-hidden />
                נווטו ב-Google Maps
              </a>
              <a
                href={b.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pill inline-flex items-center gap-2 border border-hairline bg-white px-4 py-2.5 text-[15px] font-bold text-ink no-underline transition-colors hover:border-brand"
              >
                <Image src="/images/waze-icon-colored.svg" alt="" width={18} height={18} aria-hidden />
                נווטו ב-Waze
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
