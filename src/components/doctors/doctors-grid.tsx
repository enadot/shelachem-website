"use client";

import { useState } from "react";
import type { Doctor, DoctorSpecialty } from "@/lib/content/types";
import { doctorSpecialtyLabels } from "@/lib/content/local/doctors";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
          <Button
            key={f.key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSpec(f.key)}
            aria-pressed={spec === f.key}
            className={cn(
              spec === f.key &&
                "border-brand bg-brand font-bold text-white hover:bg-brand hover:text-white",
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {visible.map((d) => (
          <Card key={d.id} className="flex flex-col gap-3 rounded-[14px] p-5">
            <PersonAvatar name={d.name} image={d.image} size={72} className="!rounded-[14px]" />
            <div>
              <div className="text-[17px] font-black text-ink">{d.name}</div>
              <div className="text-sm font-bold text-brand">
                {doctorSpecialtyLabels[d.specialty]}
              </div>
            </div>
            <p className="m-0 text-[14px] leading-normal text-ink-muted">{d.bio}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
