import Image from "next/image";

const productIllustrationSvg = `
<svg width="900" height="900" viewBox="0 0 900 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="900" fill="transparent"/>
  <ellipse cx="450" cy="650" rx="180" ry="34" fill="#6B4A2B" fill-opacity="0.14"/>
  <path d="M356 124H544V176H356V124Z" fill="#F5F3EF" stroke="#CFC5B8" stroke-width="10"/>
  <path d="M312 180C312 157.91 329.91 140 352 140H548C570.091 140 588 157.91 588 180V715C588 737.091 570.091 755 548 755H352C329.91 755 312 737.091 312 715V180Z" fill="url(#paint0_linear_1_1)" stroke="#DDD5CA" stroke-width="10"/>
  <path d="M338 210H562V651C562 669.778 546.778 685 528 685H372C353.222 685 338 669.778 338 651V210Z" fill="url(#paint1_linear_1_1)"/>
  <rect x="346" y="540" width="208" height="122" rx="34" fill="#EAE4DA"/>
  <path d="M384 94C384 78.536 396.536 66 412 66H488C503.464 66 516 78.536 516 94V140H384V94Z" fill="#D9D0C5"/>
  <path d="M450 200C450 200 430 238 392 238C354 238 326 270 326 308C326 348 355 372 401 372H499C546 372 574 347 574 310C574 270 546 238 507 238C470 238 450 200 450 200Z" fill="#6A8A55" fill-opacity="0.18"/>
  <defs>
    <linearGradient id="paint0_linear_1_1" x1="450" y1="140" x2="450" y2="755" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset="0.52" stop-color="#F6F4F0"/>
      <stop offset="1" stop-color="#E6E0D8"/>
    </linearGradient>
    <linearGradient id="paint1_linear_1_1" x1="450" y1="210" x2="450" y2="685" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#F0EBE4"/>
    </linearGradient>
  </defs>
</svg>
`;

const productIllustration = `data:image/svg+xml;utf8,${encodeURIComponent(productIllustrationSvg.trim())}`;

type FeatureItem = {
  title: string;
  text: string;
};

type FeatureAlignment = "left" | "right";

const leftFeatures: FeatureItem[] = [
  {
    title: "Soft foam cleanse",
    text: "Light lather removes daily buildup without stripping the skin barrier.",
  },
  {
    title: "Rice water clarity",
    text: "Brightening support that keeps the routine gentle and balanced.",
  },
];

const rightFeatures: FeatureItem[] = [
  {
    title: "Daily-safe formula",
    text: "Designed for morning and night use with a calm, clean finish.",
  },
  {
    title: "Compact packaging",
    text: "Easy to keep on the shelf, travel with, and style in a vanity setup.",
  },
];

function FeatureCard({
  title,
  text,
  alignment = "left",
}: FeatureItem & { alignment?: FeatureAlignment }) {
  return (
    <article className="border border-line bg-surface px-5 py-5 transition-colors hover:bg-surface-strong">
      <div className={`flex items-start gap-4 ${alignment === "right" ? "justify-end text-right" : ""}`}>
        <div className={alignment === "right" ? "ml-auto" : ""}>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-text-soft">{text}</p>
        </div>
      </div>
    </article>
  );
}

export function ProductFeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 pb-24"
    >
      <div className="overflow-hidden">
        <div className="mb-8 mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.34em] text-text-soft">
            Product features
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            A clear product story built around the hero pack shot.
          </h2>
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.95fr_1fr]">
          <div className="grid gap-4">
            {leftFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                alignment="right"
                title={feature.title}
                text={feature.text}
              />
            ))}
          </div>

          <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center">
            <div className="absolute inset-x-10 top-8 h-[70%] rounded-full bg-accent/10 blur-3xl" />
            <div className="relative w-full overflow-hidden border border-[#dcc8b6] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(243,234,220,0.95)_62%,rgba(239,229,214,0.92))] px-8 py-10 shadow-none">
              <div className="absolute inset-4 border border-white/45" />
              <Image
                src={productIllustration}
                alt="Transparent cleanser illustration"
                width={900}
                height={900}
                className="relative z-10 h-auto w-full object-contain"
                priority={false}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {rightFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                alignment="left"
                title={feature.title}
                text={feature.text}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
