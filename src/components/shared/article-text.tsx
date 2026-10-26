import { splitLinks } from "@/lib/content/article-text";

/** טקסט של פסקה/תבליט בכתבה, עם כתובות https:// כקישורים לחיצים. */
export function LinkedText({ text }: { text: string }) {
  return (
    <>
      {splitLinks(text).map((part, i) =>
        part.type === "link" ? (
          <a
            key={i}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="break-all text-brand underline underline-offset-2"
          >
            {part.href.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </>
  );
}
