import Link from "next/link";
import { FiArrowRight, FiClock, FiPackage, FiShoppingBag, FiTag, FiTrendingUp, FiUsers } from "react-icons/fi";

const stats = [
  { label: "Revenue", value: "৳ 2.48L", note: "+12% from last week", icon: FiTrendingUp },
  { label: "Orders", value: "148", note: "19 pending", icon: FiShoppingBag },
  { label: "Products", value: "42", note: "8 featured", icon: FiPackage },
  { label: "Coupons", value: "12", note: "5 active now", icon: FiTag },
  { label: "Customers", value: "1,204", note: "BD checkout only", icon: FiUsers },
  { label: "Average prep", value: "3.4h", note: "Fulfillment speed", icon: FiClock },
];

const recentOrders = [
  { id: "#EL-2048", name: "Nusrat J.", item: "Barrier Glow Serum", amount: "৳ 1,450", status: "Processing" },
  { id: "#EL-2047", name: "Tareq H.", item: "Sun Veil SPF Mini", amount: "৳ 720", status: "Packed" },
  { id: "#EL-2046", name: "Maliha F.", item: "Calming Rose Mist", amount: "৳ 680", status: "Awaiting payment" },
  { id: "#EL-2045", name: "Rina K.", item: "Bright Cleanser Refill", amount: "৳ 820", status: "Packed" },
  { id: "#EL-2044", name: "Farhan R.", item: "Veil Moisturizer", amount: "৳ 1,250", status: "Processing" },
];

const offerRules = [
  "Universal store offer: 10% off weekend promo.",
  "Product offer: Veil Moisturizer Rich with free shipping.",
  "Category offer: Sunscreens bundled for summer reapply.",
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="border border-line bg-surface px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">{stat.value}</p>
                  <p className="mt-2 text-sm text-text-soft">{stat.note}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center border border-line bg-background text-accent-deep">
                  <Icon className="text-[18px]" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-text-soft">Orders</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground">Recent incoming orders</h2>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent">
            View all
            <FiArrowRight className="text-[14px]" />
          </Link>
        </div>

        <div className="space-y-3 p-5 md:hidden">
          {recentOrders.map((order) => (
            <article key={order.id} className="border border-line bg-background px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.id}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-text-soft">{order.name}</p>
                </div>
                <span className="text-sm text-foreground">{order.amount}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-text-soft">
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span>Item</span>
                  <span className="text-foreground">{order.item}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span>Status</span>
                  <span className="text-foreground">{order.status}</span>
                </div>
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
                <th className="px-5 py-4 font-normal">Item</th>
                <th className="px-5 py-4 font-normal">Amount</th>
                <th className="px-5 py-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4 font-medium text-foreground">{order.id}</td>
                  <td className="px-5 py-4 text-text-soft">{order.name}</td>
                  <td className="px-5 py-4 text-text-soft">{order.item}</td>
                  <td className="px-5 py-4 text-foreground">{order.amount}</td>
                  <td className="px-5 py-4 text-text-soft">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}