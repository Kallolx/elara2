import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { CopyFieldButton } from "@/components/admin/copy-field-button";
import { getOrderById } from "@/components/admin/orders-data";
import { ButtonLink } from "@/components/ui/button";

type OrderRoutePageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function AdminOrderDetailsPage({
  params,
}: OrderRoutePageProps) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  const copyBlock = `${order.customer}\n${order.phone}\n${order.address}\n${order.placedAt}\n${order.notes}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href="/admin/orders" variant="ghost" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to orders
        </ButtonLink>
        <span className="rounded-full border border-line bg-surface px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-text-soft">
          {order.status}
        </span>
      </div>

      <header className="grid gap-4 border border-line bg-surface px-5 py-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">
            Order overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            #{order.id}
          </h2>
        </div>
        <div className="lg:text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-text-soft">
            Total
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
            {order.total}
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="border border-line bg-surface px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
                Order details
              </h3>
            </div>
            <CopyFieldButton value={copyBlock} label="customer details" />
          </div>

          <div className="mt-5 divide-y divide-line border border-line bg-background">
            {[
              ["Customer Name", order.customer],
              ["Phone No", order.phone],
              ["Address", order.address],
              ["Order Placed", order.placedAt],
              ["Delivery Notes", order.notes],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={index === 0 ? "px-4 py-4" : "px-4 py-4"}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-text-soft">
                    {label}
                  </p>
                  <p className="text-sm leading-7 text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-line bg-surface px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                Payment info
              </h3>
            </div>
            <span className="rounded-full border border-line bg-background px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
              {order.paymentStatus}
            </span>
          </div>

          <div className="mt-5 border border-line bg-background">
            {[
              ["Payment Method", order.payment],
              ["TrX ID", order.transactionId ?? "-"],
              ["Subtotal", order.subtotal],
              ["Delivery Charge", order.deliveryFee],
              ["Discount", order.discount],
              ["Total", order.total],
            ].map(([label, value], index) => {
              const isTotal = label === "Total";

              return (
                <div
                  key={label}
                  className={[
                    "flex items-center justify-between gap-4 px-4",
                    index === 0 ? "pt-4 pb-3" : "py-3",
                    index !== 5 ? "border-b border-line" : "pb-4",
                  ].join(" ")}
                >
                  <span
                    className={
                      isTotal
                        ? "text-sm font-semibold text-foreground"
                        : "text-[11px] uppercase tracking-[0.24em] text-text-soft"
                    }
                  >
                    {label}
                  </span>
                  <span
                    className={
                      isTotal
                        ? "text-2xl font-semibold tracking-[-0.04em] text-foreground"
                        : "text-sm font-semibold text-foreground"
                    }
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <article className="border border-line bg-surface px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
              Items
            </h3>
          </div>
          <p className="text-sm text-text-soft">{order.items} total items</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
              <tr>
                <th className="px-4 py-4 font-normal">Product</th>
                <th className="px-4 py-4 font-normal">Code</th>
                <th className="px-4 py-4 font-normal">Category</th>
                <th className="px-4 py-4 font-normal">Size</th>
                <th className="px-4 py-4 font-normal">Qty</th>
                <th className="px-4 py-4 font-normal">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.itemList.map((item) => (
                <tr
                  key={item.code}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden border border-line bg-background">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                          #{order.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-soft">{item.code}</td>
                  <td className="px-4 py-4 text-text-soft">{item.category}</td>
                  <td className="px-4 py-4 text-text-soft">{item.size}</td>
                  <td className="px-4 py-4 text-text-soft">{item.quantity}</td>
                  <td className="px-4 py-4 text-foreground">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
