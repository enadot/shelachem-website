"use client";

import { useState } from "react";
import type { Doctor, DoctorSpecialty } from "@/lib/content/types";
import { doctorSpecialtyLabels } from "@/lib/content/local/doctors";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { cn } from "@/lib/utils";

const filters: { key: DoctorSpecialty | "all"; label: string }[] = [
  { key: "all", label: "כל התחומים" },
  ...(Object.entries(doctorSpecialtyLabels) as [DoctorSpecialty, string][]).map(
    ([key, label]) => ({ key, label }),
  ),
];

/** גריד הרופאים עם צ'יפים לסינון לפי התמחות (designs/doctors.html). */
export function DoctorsGrid({ doctors }: { doctors: Doctor[] }) {
  const [spec, setSpec] = useState<DoctorSpecialty | "all">("all");
  const visible = doctors.filter((d) => spec === "all" || d.specialty === spec);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2.5" role="group" aria-label="סינון לפי התמחות">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setSpec(f.key)}
            aria-pressed={spec === f.key}
            className={cn(
              "pill focus-brand min-h-11 cursor-pointer border px-5 py-2 text-[15.5px] transition-colors",
              spec === f.key
                ? "border-brand bg-brand font-bold text-white"
                : "border-[#d5dbe6] bg-white text-ink-secondary hover:border-brand hover:text-brand",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {visible.map((d) => (
          <div
            key={d.id}
            className="flex flex-col gap-3 rounded-[14px] border border-hairline bg-white p-5"
          >
            <PersonAvatar name={d.name} image={d.image} size={72} className="!rounded-[14px]" />
            <div>
              <div className="text-[17px] font-black text-ink">{d.name}</div>
              <div className="text-sm font-bold text-brand">
                {doctorSpecialtyLabels[d.specialty]}
              </div>
            </div>
            <p className="m-0 text-[14px] leading-normal text-ink-muted">{d.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
