import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerLetterGallery } from "@/components/customers/letter-gallery";

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
        <CustomerLetterGallery />
      </section>
    </>
  );
}
