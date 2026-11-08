"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { customerLetters } from "@/lib/customer-letters";

/** גלריית המכתבים. לחיצה פותחת את הקובץ המקורי בגודל קריאה, בלי לחתוך אותו. */
export function CustomerLetterGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const letter = open === null ? null : customerLetters[open];

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <ul className="mx-auto grid max-w-[1100px] list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
        {customerLetters.map((item, index) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="block w-full cursor-zoom-in overflow-hidden rounded-[18px] border border-hairline bg-white p-0 text-start"
            >
              <Image
                src={item.src}
                alt={`מכתב תודה ${index + 1}`}
                width={item.width}
                height={item.height}
                className="h-auto w-full"
                sizes="(min-width: 768px) 520px, 100vw"
              />
              <span className="block border-t border-hairline px-4 py-2.5 text-[14px] font-bold text-brand">
                לחצו לקריאה
              </span>
            </button>
          </li>
        ))}
      </ul>
      {letter && open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#040828]/80 p-3 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`מכתב תודה ${open + 1}`}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            aria-label="סגירת המכתב"
            onClick={() => setOpen(null)}
          />
          <Image
            src={letter.src}
            alt={`מכתב תודה ${open + 1}`}
            width={letter.width}
            height={letter.height}
            unoptimized
            className="relative z-10 h-auto max-h-[92vh] w-auto max-w-[96vw] bg-white object-contain"
          />
        </div>
      )}
    </>
  );
}
