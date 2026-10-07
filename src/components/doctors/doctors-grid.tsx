"use client";

import { useState } from "react";
import type { Doctor, DoctorSpecialty } from "@/lib/content/types";
import { doctorSpecialtyLabels } from "@/lib/content/local/doctors";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { quietTab } from "@/lib/quiet-tab";

const filters: { key: DoctorSpecialty | "all"; label: string }[] = [
  { key: "all", label: "כל התחומים" },
  ...(Object.entries(doctorSpecialtyLabels) as [DoctorSpecialty, string][]).map(
    ([key, label]) => ({ key, label }),
  ),
];

/**
 * גריד הרופאים — טאבים שקטים לסינון, ומתחתם עמודות עם קו שיער מעל כל רופא
 * (בלי כרטיסים).
 */
export function DoctorsGrid({ doctors }: { doctors: Doctor[] }) {
  const [spec, setSpec] = useState<DoctorSpecialty | "all">("all");
  const visible = doctors.filter((d) => spec === "all" || d.specialty === spec);

  return (
    <div>
      <div
        className="-mx-1 mb-10 flex flex-wrap gap-1 border-b border-hairline pb-4"
        role="group"
        aria-label="סינון לפי התמחות"
      >
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setSpec(f.key)}
            aria-pressed={spec === f.key}
            className={quietTab(spec === f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="m-0 grid list-none gap-x-8 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((d) => (
          <li key={d.id} className="flex flex-col gap-4 border-t border-ink pt-5">
            <PersonAvatar name={d.name} image={d.image} size={64} className="!rounded-xl" />
            <div>
              <div className="font-display text-xl font-black leading-tight text-ink">{d.name}</div>
              <div className="mt-1 text-sm font-bold text-brand">
                {doctorSpecialtyLabels[d.specialty]}
              </div>
            </div>
            <p className="m-0 text-[15px] leading-relaxed text-ink-muted">{d.bio}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
