export default function AdminCouponsPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center border border-line bg-surface px-5 py-10">
      <div className="max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Coupons</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Coupons are temporarily disabled
        </h2>
        <p className="mt-4 text-sm leading-7 text-text-soft">
          This section is not available right now, so there is no working UI for coupons.
        </p>
      </div>
    </div>
  );
}