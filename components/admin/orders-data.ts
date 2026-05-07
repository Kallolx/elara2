export type OrderItem = {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: string;
  payment: string;
  phone: string;
  address: string;
  delivery: string;
  notes: string;
  paymentStatus: string;
  deliveryFee: string;
  discount: string;
  subtotal: string;
  placedAt: string;
  transactionId?: string;
  itemList: Array<{
    code: string;
    name: string;
    category: string;
    image: string;
    size: string;
    quantity: number;
    price: string;
  }>;
};

export const orders: OrderItem[] = [
  {
    id: "EL-2048",
    customer: "Nusrat J.",
    items: 2,
    total: "৳ 2,190",
    status: "Processing",
    payment: "COD",
    phone: "+880 1XXXXXXXXX",
    address: "Dhanmondi, Dhaka",
    delivery: "Standard courier",
    notes: "Call before delivery",
    paymentStatus: "Pending",
    deliveryFee: "৳ 120",
    discount: "৳ 0",
    subtotal: "৳ 2,070",
    placedAt: "2026-05-06 10:20 AM",
    transactionId: "-",
    itemList: [
      {
        code: "EL-SRM-BG-003",
        name: "Barrier Glow Serum",
        category: "Serums",
        image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1000&q=80",
        size: "30 ml",
        quantity: 1,
        price: "৳ 1,450",
      },
      {
        code: "EL-SUN-SVM-008",
        name: "Sun Veil SPF Mini",
        category: "Sunscreens",
        image: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=1000&q=80",
        size: "50 ml",
        quantity: 1,
        price: "৳ 720",
      },
    ],
  },
  {
    id: "EL-2047",
    customer: "Tareq H.",
    items: 1,
    total: "৳ 720",
    status: "Packed",
    payment: "bKash",
    phone: "+880 1XXXXXXXXX",
    address: "Uttara, Dhaka",
    delivery: "Express courier",
    notes: "Leave at reception",
    paymentStatus: "Paid",
    deliveryFee: "৳ 100",
    discount: "৳ 0",
    subtotal: "৳ 620",
    placedAt: "2026-05-06 09:05 AM",
    transactionId: "BKASH-224178",
    itemList: [
      {
        code: "EL-CLN-BCR-007",
        name: "Bright Cleanser Refill",
        category: "Cleansers",
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=80",
        size: "60 ml",
        quantity: 1,
        price: "৳ 720",
      },
    ],
  },
  {
    id: "EL-2046",
    customer: "Maliha F.",
    items: 3,
    total: "৳ 4,330",
    status: "Awaiting payment",
    payment: "Card",
    phone: "+880 1XXXXXXXXX",
    address: "Gulshan, Dhaka",
    delivery: "Standard courier",
    notes: "Confirm address before dispatch",
    paymentStatus: "Unpaid",
    deliveryFee: "৳ 150",
    discount: "৳ 50",
    subtotal: "৳ 4,230",
    placedAt: "2026-05-05 06:50 PM",
    transactionId: "CARD-PENDING",
    itemList: [
      {
        code: "EL-MST-VMR-010",
        name: "Veil Moisturizer Rich",
        category: "Moisturizers",
        image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=80",
        size: "75 ml",
        quantity: 1,
        price: "৳ 2,139",
      },
      {
        code: "EL-EYE-BGR-011",
        name: "Bright Eye Gel Refresh",
        category: "Eye Care",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80",
        size: "30 ml",
        quantity: 1,
        price: "৳ 1,175",
      },
      {
        code: "EL-MST-CRML-012",
        name: "Calming Rose Mist Luxe",
        category: "Toners",
        image: "https://images.unsplash.com/photo-1512659335523-8448d3a4a47f?auto=format&fit=crop&w=1000&q=80",
        size: "100 ml",
        quantity: 1,
        price: "৳ 1,178",
      },
    ],
  },
  {
    id: "EL-2045",
    customer: "Rina K.",
    items: 1,
    total: "৳ 820",
    status: "Delivered",
    payment: "Nagad",
    phone: "+880 1XXXXXXXXX",
    address: "Banani, Dhaka",
    delivery: "Standard courier",
    notes: "Delivered successfully",
    paymentStatus: "Paid",
    deliveryFee: "৳ 120",
    discount: "৳ 0",
    subtotal: "৳ 700",
    placedAt: "2026-05-05 02:15 PM",
    transactionId: "NAGAD-110882",
    itemList: [
      {
        code: "EL-SUN-SV-002",
        name: "Sun Veil SPF",
        category: "Sunscreens",
        image: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&w=1000&q=80",
        size: "15 ml",
        quantity: 1,
        price: "৳ 820",
      },
    ],
  },
];

export function getOrderById(id: string) {
  return orders.find((order) => order.id === id);
}
