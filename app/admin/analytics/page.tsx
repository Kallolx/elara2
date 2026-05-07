const metrics = [
  { label: "Sessions", value: "12.4K", note: "+18% vs last week" },
  { label: "Conversion", value: "3.9%", note: "Storefront to order" },
  { label: "AOV", value: "৳ 1,840", note: "Average order value" },
  { label: "Repeat rate", value: "27%", note: "Returning customers" },
];

const topProducts = [
  ["Bright Cleanser", "18% of orders"],
  ["Sun Veil SPF", "16% of orders"],
  ["Barrier Glow Serum", "14% of orders"],
  ["Veil Moisturizer", "13% of orders"],
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="border border-line bg-surface px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{metric.value}</p>
            <p className="mt-2 text-sm text-text-soft">{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="border border-line bg-surface px-5 py-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Traffic</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">Weekly channel mix</h2>

          <div className="mt-6 space-y-4">
            {[
              ["Instagram", "46%"],
              ["Organic search", "28%"],
              ["Direct", "18%"],
              ["Referral", "8%"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{label}</span>
                  <span className="text-text-soft">{value}</span>
                </div>
                <div className="mt-2 h-2 border border-line bg-background">
                  <div className="h-full bg-accent" style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-line bg-surface px-5 py-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Top products</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">Best-performing items</h2>

          <div className="mt-6 space-y-3">
            {topProducts.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border border-line bg-background px-4 py-4 text-sm">
                <span className="text-foreground">{label}</span>
                <span className="text-text-soft">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 border border-line bg-background px-4 py-4 text-sm leading-7 text-text-soft">
            Use this screen later for revenue trends, offer performance, repeat purchase rate, and category movement.
          </div>
        </article>
      </section>
    </div>
  );
}