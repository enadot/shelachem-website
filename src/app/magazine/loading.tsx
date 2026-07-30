/**
 * Skeleton למגזין. משטחים בגוני המותג, בלי אנימציית פעימה — קהל היעד גולש
 * במכשירים איטיים, ושלד מהבהב על חיבור חלש נראה כמו תקלה.
 */
export default function MagazineLoading() {
  return (
    <div aria-hidden className="px-6 py-10 md:px-[clamp(24px,6.7vw,96px)]">
      <div className="mx-auto max-w-[1240px]">
        <div className="h-3 w-40 rounded-full bg-hairline-soft" />
        <div className="mt-6 h-10 w-[min(560px,90%)] rounded-lg bg-hairline" />
        <div className="mt-3 h-4 w-[min(680px,100%)] rounded-full bg-hairline-soft" />
        <div className="mt-8 h-[280px] rounded-card bg-surface-blue md:h-[380px]" />
        <div className="mt-8 flex gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 w-24 rounded-full bg-hairline-soft" />
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-[14px] border border-hairline">
              <div className="h-[150px] bg-surface-blue" />
              <div className="flex flex-col gap-2.5 px-5 pb-5 pt-4">
                <div className="h-4 w-11/12 rounded-full bg-hairline" />
                <div className="h-3 w-9/12 rounded-full bg-hairline-soft" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        טוען כתבות…
      </span>
    </div>
  );
}
