import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { ButtonLink } from "@/components/ui/button";
import { orders } from "@/components/admin/orders-data";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <article className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Manage orders and payments
            </h2>
          </div>
          <ButtonLink href="/admin/orders/new">
            <FiPlus className="text-[14px]" />
            Add order
          </ButtonLink>
        </div>

        <div className="space-y-3 p-5 md:hidden">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-line bg-background px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-foreground">
                    #{order.id}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">
                    {order.customer}
                  </p>
                </div>
                <span className="text-sm text-foreground">{order.total}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-text-soft">
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span>Items</span>
                  <span className="text-foreground">{order.items}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span>Status</span>
                  <span className="text-foreground">{order.status}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span>Payment</span>
                  <span className="text-foreground">{order.payment}</span>
                </div>
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="inline-flex items-center gap-2 border border-line bg-surface px-3 py-2 text-xs uppercase tracking-[0.22em] text-foreground"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] uppercase tracking-[0.26em] text-text-soft">
              <tr>
                <th className="px-5 py-4 font-normal">Order</th>
                <th className="px-5 py-4 font-normal">Customer</th>
                <th className="px-5 py-4 font-normal">Items</th>
                <th className="px-5 py-4 font-normal">Total</th>
                <th className="px-5 py-4 font-normal">Status</th>
                <th className="px-5 py-4 font-normal">Payment</th>
                <th className="px-5 py-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-foreground">
                    #{order.id}
                  </td>
                  <td className="px-5 py-4 text-text-soft">{order.customer}</td>
                  <td className="px-5 py-4 text-text-soft">{order.items}</td>
                  <td className="px-5 py-4 text-foreground">{order.total}</td>
                  <td className="px-5 py-4 text-text-soft">{order.status}</td>
                  <td className="px-5 py-4 text-text-soft">{order.payment}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 border border-line bg-background px-3 py-2 text-xs uppercase tracking-[0.22em] text-foreground"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
