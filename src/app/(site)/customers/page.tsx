import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";
import { customerLetters } from "@/lib/customer-letters";

export const metadata = pageMetadata({
  title: "לקוחות מרוצים",
  path: "/customers",
  description: "מכתבי תודה מלקוחות, כפי שפורסמו באתר שלכם.",
});

/** עותק של הגלריה הציבורית מ-shelachem.com/#Rec. בלי מכתבים שלא צורפו. */
export default function CustomersPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "בית", href: "/" },
          { label: "לקוחות מרוצים" },
        ]}
        title="לקוחות"
        strong="מרוצים"
        intro="המכתבים האלה פורסמו באתר הקודם, בעמוד הבית, תחת «לקוחות מרוצים». הם מוצגים כאן כמו שהם."
      />
      <section className="px-6 py-12 md:px-[clamp(24px,6.7vw,96px)] md:py-16">
        <ul className="mx-auto grid max-w-[1240px] list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {customerLetters.map((letter, index) => (
            <li key={letter.src} className="overflow-hidden rounded-[18px] border border-hairline bg-white">
              <a href={letter.src} className="block">
                <Image
                  src={letter.src}
                  alt={`מכתב תודה ${index + 1} מתוך הגלריה שפורסמה באתר שלכם`}
                  width={letter.width}
                  height={letter.height}
                  className="h-auto w-full"
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
