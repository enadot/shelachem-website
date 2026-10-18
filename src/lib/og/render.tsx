import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { site } from "@/lib/config";
import { visualWords } from "@/lib/og/bidi";

/**
 * תמונות השיתוף (Open Graph) של האתר — 1200×630, בשפה של ההירו: רויאל, זהב
 * ופונטי המותג. כל `opengraph-image.tsx` בעמודים קורא לאחת משתי הפונקציות כאן.
 *
 * הפונטים הם המרה ל-TTF של קבצי ה-woff2 שב-public/fonts (Satori לא קורא woff2).
 */

export const ogSize = { width: 1200, height: 630 };
/**
 * JPEG ולא PNG: עם צילום וגרדיאנט ה-PNG שוקל 0.5–0.75MB, ווואטסאפ (ערוץ השיתוף
 * המרכזי) מדלג על תצוגה מקדימה של תמונות כבדות. ב-JPEG זה כ-100KB.
 */
export const ogContentType = "image/jpeg";

/** ImageResponse מייצר רק PNG — ממירים ל-JPEG לפני ההגשה. */
async function toJpeg(res: ImageResponse) {
  const png = Buffer.from(await res.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": ogContentType } });
}

const ROYAL = "radial-gradient(ellipse 90% 110% at 75% 45%, #1d3fd6 0%, #1228a8 50%, #0a1570 100%)";
const GOLD = "linear-gradient(100deg, #b98a31, #f2d282 55%, #c99a3c)";
const SKY = "linear-gradient(90deg, #1e9be0, #7fd8f0 60%, #1e9be0)";

let fontsPromise: Promise<ConstructorParameters<typeof ImageResponse>[1]> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all(
    [
      ["RaananPro", "RaananPro-Light.ttf", 300],
      ["RaananPro", "RaananPro-Black.ttf", 900],
      ["SimplerPro", "SimplerPro-Regular.ttf", 400],
      ["SimplerPro", "SimplerPro-Bold.ttf", 700],
    ].map(async ([name, file, weight]) => ({
      name: name as string,
      data: await readFile(join(process.cwd(), "src/assets/og-fonts", file as string)),
      weight: weight as 300 | 400 | 700 | 900,
      style: "normal" as const,
    })),
  ).then((fonts) => ({ ...ogSize, fonts }));
  return fontsPromise;
}

/** איך לחתוך צילום רוחבי לפאנל אנכי. "attention" = sharp בוחר את האזור הבולט. */
type PhotoPosition = "centre" | "left" | "right" | "attention";

const dataUrl = (mime: string, buf: Buffer) => `data:${mime};base64,${buf.toString("base64")}`;

async function publicImage(path: string) {
  return readFile(join(process.cwd(), "public", path));
}

/**
 * תמונה (מקומית מ-public או נכס Directus) → JPEG/PNG בגודל הנדרש כ-data URL.
 * Satori לא קורא WebP/AVIF, אז הכול עובר דרך sharp. כשל → null והעיצוב
 * נופל חזרה לגרסה בלי תמונה (תמונת שיתוף בלי צילום עדיפה על build שבור).
 */
export async function loadPhoto(
  src: string | null | undefined,
  width: number,
  height: number,
  position: PhotoPosition = "centre",
) {
  if (!src) return null;
  try {
    const input = src.startsWith("/")
      ? await publicImage(src)
      : Buffer.from(
          await (
            await fetch(`${src}${src.includes("?") ? "&" : "?"}width=${width * 2}&format=jpg`, {
              signal: AbortSignal.timeout(8000),
            })
          ).arrayBuffer(),
        );
    const out = await sharp(input)
      .resize(width * 2, height * 2, { fit: "cover", position })
      .jpeg({ quality: 78 })
      .toBuffer();
    return dataUrl("image/jpeg", out);
  } catch (err) {
    console.warn("[og] photo failed, rendering without it:", src, err);
    return null;
  }
}

let staticAssets: Promise<{ logo: string; swirl: string }> | null = null;
function loadStaticAssets() {
  staticAssets ??= Promise.all([
    publicImage("/images/logo-white.svg"),
    publicImage("/images/swirl-white.png"),
  ]).then(([logo, swirl]) => ({
    logo: dataUrl("image/svg+xml", logo),
    swirl: dataUrl("image/png", swirl),
  }));
  return staticAssets;
}

/** טקסט עברי שגולש נכון בין שורות — ראו `bidi.ts`. */
function RtlText({
  text,
  style,
  wordGap = 0.26,
}: {
  text: string;
  style: React.CSSProperties;
  wordGap?: number;
}) {
  const fontSize = Number(style.fontSize ?? 32);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        columnGap: fontSize * wordGap,
        ...style,
      }}
    >
      {visualWords(text).map((w, i) => (
        <span key={i}>{w}</span>
      ))}
    </div>
  );
}

function Brush({ background, width, height = 10 }: { background: string; width: number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
        background,
        borderRadius: height / 2,
        transform: "skewX(-20deg) rotate(-0.6deg)",
      }}
    />
  );
}

function GoldBadge({ text, fontSize = 24 }: { text: string; fontSize?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        padding: `${fontSize * 0.3}px ${fontSize * 0.95}px ${fontSize * 0.26}px`,
        background: GOLD,
        color: "#0f1114",
        borderRadius: 4,
        transform: "skewX(-8deg)",
      }}
    >
      <RtlText
        text={text}
        style={{
          fontFamily: "RaananPro",
          fontWeight: 900,
          fontSize,
          flexWrap: "nowrap",
          transform: "skewX(8deg)",
        }}
      />
    </div>
  );
}

export interface OgPageProps {
  /** תווית קטנה מעל הכותרת — שם המדור ("מגזין", "ביטוח לאומי"…). */
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  /** צילום לצד הטקסט (נתיב מקומי או נכס Directus). */
  photo?: string | null;
  /** חיתוך הצילום — ברירת מחדל מרכז, שמתאים לרוב צילומי האתר. */
  photoPosition?: PhotoPosition;
}

const PHOTO_W = 430;

/** תבנית לעמודים פנימיים: כותרת העמוד על רקע רויאל, ולצידה הצילום של העמוד אם יש. */
export async function renderOgImage({ eyebrow, title, subtitle, photo, photoPosition }: OgPageProps) {
  const [options, { logo, swirl }, photoUrl] = await Promise.all([
    loadFonts(),
    loadStaticAssets(),
    loadPhoto(photo, PHOTO_W, ogSize.height, photoPosition),
  ]);
  const titleSize = title.length > 60 ? 50 : title.length > 34 ? 60 : 74;
  const sub = subtitle && subtitle.length > 150 ? `${subtitle.slice(0, 147).replace(/\s+\S*$/, "")}…` : subtitle;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row-reverse",
          background: ROYAL,
          color: "white",
          fontFamily: "SimplerPro",
        }}
      >
        {/* תוכן — צד ימין */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "52px 64px 48px",
            position: "relative",
          }}
        >
          {!photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={swirl}
              width={520}
              height={520}
              style={{ position: "absolute", left: -90, top: 70, opacity: 0.12 }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={logo} width={190} height={79} />
            <div style={{ display: "flex", fontSize: 22, color: "#c9cdd4" }}>
              {site.domain.replace(/^https?:\/\//, "")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22 }}>
            {eyebrow && <GoldBadge text={eyebrow} fontSize={24} />}
            <RtlText
              text={title}
              style={{
                fontFamily: "RaananPro",
                fontWeight: 900,
                fontSize: titleSize,
                lineHeight: 1.08,
                justifyContent: "flex-start",
              }}
            />
            {sub && (
              <RtlText
                text={sub}
                style={{ fontSize: 26, lineHeight: 1.4, color: "#d6dcf5", maxWidth: 900 }}
              />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <RtlText
              text="בדיקת זכאות חינם · שכר טרחה רק בהצלחה"
              style={{ fontSize: 25, fontWeight: 700, color: "#f2d282" }}
            />
            <Brush background={SKY} width={320} height={8} />
          </div>
        </div>

        {photoUrl && (
          <div style={{ display: "flex", position: "relative", width: PHOTO_W, height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              src={photoUrl}
              width={PHOTO_W}
              height={ogSize.height}
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(10,21,112,0) 55%, rgba(10,21,112,0.85) 100%)",
              }}
            />
          </div>
        )}
      </div>
    ),
    options,
  );
  return toJpeg(image);
}

/** תמונת השיתוף של דף הבית — גרסה מוקטנת של ההירו: "שלכם" ענק, המוסדות והצוות. */
export async function renderHomeOgImage() {
  const [options, { logo, swirl }, team] = await Promise.all([
    loadFonts(),
    loadStaticAssets(),
    publicImage("/images/hero-gavel-team.webp").then((buf) =>
      sharp(buf).resize(1200).png({ compressionLevel: 9 }).toBuffer(),
    ),
  ]);
  const institutions = [
    { label: "ביטוח לאומי", brush: SKY },
    { label: "מס הכנסה", brush: SKY },
    { label: "חברות ביטוח", brush: SKY },
  ];

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: ROYAL,
          color: "white",
          fontFamily: "SimplerPro",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={swirl}
          width={620}
          height={620}
          style={{ position: "absolute", left: 40, top: 10, opacity: 0.14 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={dataUrl("image/png", team)}
          width={660}
          height={440}
          style={{ position: "absolute", left: -10, bottom: 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo} width={170} height={70} style={{ position: "absolute", left: 48, top: 40 }} />

        <div
          style={{
            position: "absolute",
            right: 64,
            top: 54,
            width: 560,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <GoldBadge text={`מאז ${site.foundedYear} · ${site.stats.clients} לקוחות`} fontSize={24} />
          <RtlText
            text="המקצוענים שמנצחים את הבירוקרטיה בדרך לזכויות"
            style={{
              marginTop: 26,
              fontFamily: "RaananPro",
              fontWeight: 300,
              fontSize: 44,
              lineHeight: 1.1,
            }}
          />
          <RtlText
            text="שלכם"
            style={{
              fontFamily: "RaananPro",
              fontWeight: 900,
              fontSize: 190,
              lineHeight: 0.86,
              letterSpacing: -6,
              marginTop: 4,
            }}
          />
          <div style={{ display: "flex", flexDirection: "row-reverse", gap: 22, marginTop: 30 }}>
            {institutions.map((inst) => (
              <div
                key={inst.label}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9 }}
              >
                <RtlText text={inst.label} style={{ fontSize: 27, fontWeight: 700 }} />
                <Brush background={inst.brush} width={160} />
              </div>
            ))}
          </div>
          <RtlText
            text="בדיקת זכאות חינם · שכר טרחה רק בהצלחה"
            style={{ marginTop: 34, fontSize: 25, fontWeight: 700, color: "#f2d282" }}
          />
        </div>
      </div>
    ),
    options,
  );
  return toJpeg(image);
}
