"use client";

import { useState } from "react";
import { FiArrowLeft, FiPlus, FiSave, FiX } from "react-icons/fi";
import { ButtonLink } from "@/components/ui/button";

const paymentMethods = ["COD", "bKash", "Nagad", "Card", "Bank transfer"];
const orderStatuses = ["Processing", "Packed", "Shipped", "Delivered", "Cancelled"];

type OrderItemRow = {
  productName: string;
  size: string;
  quantity: string;
  price: string;
};

export default function AdminOrderCreatePage() {
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([
    { productName: "", size: "", quantity: "", price: "" },
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <ButtonLink href="/admin/orders" variant="outline" size="sm">
          <FiArrowLeft className="text-[14px]" />
          Back to orders
        </ButtonLink>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">Add order</h2>
        <div className="w-[140px]" />
      </header>

      <form className="space-y-6">
        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Order information</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {[
              "Order code",
              "Customer name",
              "Phone number",
              "Delivery address",
            ].map((placeholder) => (
              <label key={placeholder} className="block text-sm">
                <input
                  placeholder={placeholder}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
              </label>
            ))}

            <label className="block text-sm">
              <select defaultValue="" className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none">
                <option value="" disabled>
                  Payment method
                </option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <select defaultValue="" className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none">
                <option value="" disabled>
                  Order status
                </option>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Order items</h3>
          <div className="mt-5 space-y-3">
            {orderItems.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 border border-line bg-background px-4 py-4 lg:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto]"
              >
                <input
                  value={item.productName}
                  onChange={(event) =>
                    setOrderItems((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, productName: event.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Product name"
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
                <input
                  value={item.size}
                  onChange={(event) =>
                    setOrderItems((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, size: event.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Size"
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
                <input
                  value={item.quantity}
                  onChange={(event) =>
                    setOrderItems((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, quantity: event.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Qty"
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
                <input
                  value={item.price}
                  onChange={(event) =>
                    setOrderItems((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, price: event.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Price"
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setOrderItems((current) =>
                        current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : current,
                      )
                    }
                    aria-label="Remove item"
                    title="Remove item"
                    className="inline-flex h-11 w-11 items-center justify-center border border-line bg-surface text-text-soft transition-colors hover:border-accent hover:text-foreground"
                  >
                    <FiX className="text-[14px]" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setOrderItems((current) => [
                    ...current,
                    { productName: "", size: "", quantity: "", price: "" },
                  ])
                }
                className="inline-flex items-center gap-2 border border-line bg-background px-4 py-3 text-xs uppercase tracking-[0.22em] text-foreground"
              >
                <FiPlus className="text-[14px]" />
                Add item
              </button>
            </div>
          </div>
        </section>

        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Payment info</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {[
              "Subtotal",
              "Delivery fee",
              "Discount",
              "Payment reference",
            ].map((placeholder) => (
              <label key={placeholder} className="block text-sm">
                <input
                  placeholder={placeholder}
                  className="w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="border border-line bg-surface px-5 py-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-foreground">Notes</h3>
          <textarea
            placeholder="Additional delivery or payment notes"
            rows={4}
            className="mt-5 w-full border border-line bg-background px-4 py-3 text-foreground outline-none"
          />
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border border-line bg-surface px-5 py-4">
          <ButtonLink href="/admin/orders" variant="outline" size="sm">
            Cancel
          </ButtonLink>
          <button type="button" className="inline-flex items-center gap-2 border border-accent bg-accent px-4 py-3 text-xs uppercase tracking-[0.22em] text-white">
            <FiSave className="text-[14px]" />
            Save order
          </button>
        </div>
      </form>
    </div>
  );
}
