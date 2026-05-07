export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Product {
  slug?: any;
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  briefDescription: string;
  description: string;
  ingredients?: string;
  routine?: string[];
  sizes?: { name: string; price: number }[];
  sku: string;
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  relatedProducts?: string[];
  reviews?: Review[];
  faq?: FAQ[];
  offers?: string[];
}

export const products: Product[] = [
  {
    id: "EL-CLN-VC-150",
    name: "Velvet Cloud Cleanser",
    brand: "Elara",
    category: "Cleansers",
    subcategory: "Foam Cleansers",
    price: 32,
    originalPrice: 40,
    offers: ["20% OFF", "Free Shipping"],
    rating: 4.8,
    reviewsCount: 124,
    image: "/products/cleanser.png",
    images: [
      "/products/cleanser.png",
      "/products/moisturizer.png",
      "/products/night_serum.png",
      "/categories/serums.png",
    ],
    briefDescription:
      "A gentle, pH-balanced foam cleanser that lifts impurities.",
    description:
      "Experience the ultimate cleanse with our Velvet Cloud Cleanser. This luxuriously soft foam effortlessly melts away makeup, sunscreen, and daily pollutants without stripping your skin of its natural moisture. Formulated with a skin-identical pH, it respects the delicate acid mantle, leaving your complexion feeling fresh, balanced, and perfectly prepped for the rest of your routine.",
    ingredients:
      "Aqua (Water), Glycerin, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Ceramide NP, Sodium Hyaluronate, Camellia Sinensis (Green Tea) Leaf Extract, Panthenol, Citric Acid, Phenoxyethanol, Ethylhexylglycerin.",
    routine: [
      "1. Dispense 1-2 pumps of the foam into wet hands.",
      "2. Gently massage onto a damp face in circular motions for 60 seconds.",
      "3. Rinse thoroughly with lukewarm water.",
      "4. Pat dry and immediately follow with your favorite toner and serum.",
    ],
    sizes: [
      { name: "50ml", price: 24 },
      { name: "150ml (Standard)", price: 32 },
      { name: "300ml (Value Size)", price: 45 },
    ],
    sku: "EL-CLN-VC-150",
    tags: ["Cleanser", "Foam", "Gentle", "Hydrating", "Daily Use"],
    isNew: true,
    relatedProducts: [
      "EL-CLN-DS-100",
      "EL-MST-CI-50",
      "EL-SRM-LV-30",
      "EL-MST-DG-50",
    ],
    reviews: [
      {
        id: "r1",
        user: "Sarah M.",
        rating: 5,
        date: "2026-04-15",
        comment:
          "Absolutely love this! It's so gentle but cleans effectively. My skin doesn't feel tight afterward.",
      },
      {
        id: "r2",
        user: "Jessica K.",
        rating: 4,
        date: "2026-04-10",
        comment:
          "Great cleanser, lovely texture. The scent is very subtle, which I appreciate.",
      },
      {
        id: "r3",
        user: "Emily R.",
        rating: 5,
        date: "2026-03-28",
        comment:
          "Holy grail status. It takes off all my light makeup and leaves me glowing.",
      },
    ],
    faq: [
      {
        question: "Is this suitable for sensitive skin?",
        answer:
          "Yes! It is pH-balanced and formulated without harsh sulfates, making it ideal for sensitive skin.",
      },
      {
        question: "Can it remove waterproof makeup?",
        answer:
          "While it removes light, everyday makeup, we recommend using an oil cleanser first for heavy or waterproof makeup.",
      },
      {
        question: "What is the age recommendation for this product?",
        answer:
          "Our Velvet Cloud Cleanser is gentle enough for all ages, but we typically recommend it for ages 12 and up as part of a basic skincare routine.",
      },
      {
        question: "Does it contain any artificial fragrances?",
        answer:
          "No, this product is 100% fragrance-free to minimize the risk of irritation for those with reactive skin.",
      },
      {
        question: "Can I use this with my electric cleansing brush?",
        answer:
          "Absolutely! The cloud-like foam texture provides excellent slip for cleansing devices.",
      },
    ],
  },
  {
    id: "EL-CLN-DS-100",
    name: "Deep Sea Oil Cleanser",
    brand: "Elara",
    category: "Cleansers",
    subcategory: "Oil Cleansers",
    price: 38,
    originalPrice: 45,
    offers: ["15% OFF", "Best Seller"],
    rating: 4.9,
    reviewsCount: 89,
    image: "/products/cleanser.png",
    images: [
      "/products/cleanser.png",
      "/products/moisturizer.png",
      "/products/night_serum.png",
      "/categories/serums.png",
    ],
    briefDescription: "Rich botanical oils that melt away waterproof makeup.",
    description:
      "Our Deep Sea Oil Cleanser is a luxurious first step in your double cleansing routine. Infused with nutrient-rich marine extracts and botanical oils, it effortlessly dissolves stubborn waterproof makeup, sunscreen, and excess sebum while maintaining skin hydration. Upon contact with water, it emulsifies into a milky texture that rinses clean, leaving your skin soft, smooth, and residue-free.",
    ingredients:
      "Caprylic/Capric Triglyceride, Olea Europaea (Olive) Fruit Oil, Squalane, Helianthus Annuus (Sunflower) Seed Oil, Laminaria Digitata Extract, Tocopherol, Polyglyceryl-4 Oleate.",
    routine: [
      "1. Apply 2-3 pumps onto dry hands.",
      "2. Massage gently onto dry face.",
      "3. Add water to emulsify into a milky texture.",
      "4. Rinse thoroughly and follow with foam cleanser.",
    ],
    sizes: [
      { name: "100ml", price: 38 },
      { name: "200ml", price: 55 },
    ],
    sku: "EL-CLN-DS-100",
    tags: ["Oil Cleanser", "Makeup Remover", "Double Cleanse"],
    isBestSeller: true,
    relatedProducts: [
      "EL-CLN-VC-150",
      "EL-MST-CI-50",
      "EL-SRM-LV-30",
      "EL-SUN-IS-50",
    ],
    reviews: [
      {
        id: "r1",
        user: "Aisha R.",
        rating: 5,
        date: "2026-04-20",
        comment: "Removes everything in seconds. Love the silky feel.",
      },
      {
        id: "r2",
        user: "Nadia S.",
        rating: 5,
        date: "2026-04-11",
        comment: "Best oil cleanser I’ve used so far.",
      },
    ],
    faq: [
      {
        question: "Is this safe for acne-prone skin?",
        answer: "Yes, it is non-comedogenic and suitable for acne-prone skin.",
      },
      {
        question: "Do I need a second cleanser?",
        answer: "For best results, follow with a foam or gel cleanser.",
      },
    ],
  },

  {
    id: "EL-MST-CI-50",
    name: "Ceramide Infusion Cream",
    brand: "Elara",
    category: "Moisturizers",
    subcategory: "Night Creams",
    price: 54,
    originalPrice: 65,
    offers: ["Bundle Offer Available"],
    rating: 4.7,
    reviewsCount: 210,
    image: "/products/moisturizer.png",
    images: [
      "/products/moisturizer.png",
      "/products/cleanser.png",
      "/products/night_serum.png",
    ],
    briefDescription:
      "A heavy-duty restorative cream packed with triple ceramides.",
    description:
      "Designed to deeply nourish and repair, the Ceramide Infusion Cream strengthens your skin barrier overnight. Powered by triple ceramides and fatty acids, it restores moisture balance, reduces sensitivity, and improves elasticity for healthier-looking skin by morning.",
    ingredients:
      "Aqua, Ceramide NP, Ceramide AP, Ceramide EOP, Cholesterol, Fatty Acids, Glycerin, Shea Butter, Panthenol.",
    routine: [
      "1. Apply a small amount after serum.",
      "2. Gently massage into skin.",
      "3. Use as the last step in your nighttime routine.",
    ],
    sizes: [
      { name: "50ml", price: 54 },
      { name: "100ml", price: 72 },
    ],
    sku: "EL-MST-CI-50",
    tags: ["Moisturizer", "Ceramides", "Barrier Repair"],
    relatedProducts: ["EL-SRM-LV-30", "EL-SRM-OR-30"],
    reviews: [
      {
        id: "r1",
        user: "Maya T.",
        rating: 5,
        date: "2026-04-18",
        comment: "Saved my dry skin!",
      },
    ],
    faq: [
      {
        question: "Is this suitable for oily skin?",
        answer: "Better suited for dry to normal skin types.",
      },
    ],
  },

  {
    id: "EL-MST-DG-50",
    name: "Dewy Glow Water Cream",
    brand: "Elara",
    category: "Moisturizers",
    subcategory: "Day Creams",
    price: 48,
    originalPrice: 55,
    offers: ["New Arrival"],
    rating: 4.6,
    reviewsCount: 156,
    image: "/products/moisturizer.png",
    images: ["/products/moisturizer.png", "/products/cleanser.png"],
    briefDescription: "Weightless gel-cream that bursts into hydration.",
    description:
      "This ultra-light gel-cream delivers instant hydration without heaviness. Perfect for hot and humid climates, it absorbs quickly, leaving a dewy, fresh finish ideal for daily wear under sunscreen or makeup.",
    ingredients:
      "Water, Glycerin, Hyaluronic Acid, Niacinamide, Aloe Vera Extract.",
    routine: [
      "1. Apply after cleansing and toning.",
      "2. Use in the morning routine.",
      "3. Follow with sunscreen.",
    ],
    sizes: [
      { name: "50ml", price: 48 },
      { name: "100ml", price: 65 },
    ],
    sku: "EL-MST-DG-50",
    tags: ["Gel Cream", "Hydration", "Oily Skin"],
    isNew: true,
    relatedProducts: ["EL-SUN-IS-50"],
    reviews: [
      {
        id: "r1",
        user: "Rina K.",
        rating: 4,
        date: "2026-04-12",
        comment: "Super lightweight, perfect for summer.",
      },
    ],
    faq: [
      {
        question: "Can I use this at night?",
        answer: "Yes, but it's designed mainly for daytime use.",
      },
    ],
  },

  {
    id: "EL-SRM-LV-30",
    name: "Luminous Vitamin C Serum",
    brand: "Elara",
    category: "Serums",
    subcategory: "Vitamin C",
    price: 65,
    originalPrice: 75,
    offers: ["Best Seller"],
    rating: 4.9,
    reviewsCount: 342,
    image: "/products/night_serum.png",
    images: ["/products/night_serum.png", "/products/moisturizer.png"],
    briefDescription: "Stable 15% Vitamin C for brightening.",
    description:
      "This powerful antioxidant serum visibly brightens skin, reduces dark spots, and protects against environmental damage. Its stable formula ensures maximum effectiveness without irritation.",
    ingredients: "Ascorbic Acid 15%, Vitamin E, Ferulic Acid, Glycerin.",
    routine: [
      "1. Apply 2-3 drops in the morning.",
      "2. Follow with moisturizer.",
      "3. Always apply sunscreen.",
    ],
    sizes: [
      { name: "30ml", price: 65 },
      { name: "50ml", price: 82 },
    ],
    sku: "EL-SRM-LV-30",
    tags: ["Vitamin C", "Brightening"],
    isBestSeller: true,
    relatedProducts: ["EL-SUN-IS-50"],
    reviews: [
      {
        id: "r1",
        user: "Sara J.",
        rating: 5,
        date: "2026-04-08",
        comment: "My skin is glowing!",
      },
    ],
    faq: [
      {
        question: "Can beginners use this?",
        answer: "Yes, start with alternate days.",
      },
    ],
  },

  {
    id: "EL-SRM-OR-30",
    name: "Overnight Retinol Reset",
    brand: "Elara",
    category: "Serums",
    subcategory: "Retinol",
    price: 72,
    originalPrice: 85,
    offers: ["Dermatologist Recommended"],
    rating: 4.8,
    reviewsCount: 198,
    image: "/products/night_serum.png",
    images: ["/products/night_serum.png"],
    briefDescription: "Encapsulated retinol night treatment.",
    description:
      "A gentle yet effective retinol serum that improves skin texture, reduces fine lines, and promotes cell turnover while minimizing irritation.",
    ingredients: "Retinol, Squalane, Niacinamide, Peptides.",
    routine: [
      "1. Use at night only.",
      "2. Start 2-3 times a week.",
      "3. Follow with moisturizer.",
    ],
    sizes: [
      { name: "30ml", price: 65 },
      { name: "50ml", price: 82 },
    ],
    sku: "EL-SRM-OR-30",
    tags: ["Retinol", "Anti-aging"],
    relatedProducts: ["EL-MST-CI-50"],
    reviews: [
      {
        id: "r1",
        user: "Nusrat A.",
        rating: 5,
        date: "2026-04-02",
        comment: "Smooth skin within weeks.",
      },
    ],
    faq: [
      {
        question: "Can I use this daily?",
        answer: "Gradually build tolerance before daily use.",
      },
    ],
  },

  {
    id: "EL-SUN-IS-50",
    name: "Invisible Shield SPF 50",
    brand: "Elara",
    category: "Sunscreen",
    subcategory: "Mineral Sunscreen",
    price: 34,
    originalPrice: 40,
    offers: ["Daily Essential"],
    rating: 4.5,
    reviewsCount: 420,
    image: "/products/night_serum.png",
    images: ["/products/night_serum.png"],
    briefDescription: "Broad-spectrum mineral sunscreen.",
    description:
      "Protect your skin with this lightweight SPF 50 sunscreen that blends seamlessly without leaving a white cast.",
    ingredients: "Zinc Oxide, Titanium Dioxide, Glycerin.",
    routine: [
      "1. Apply generously as last step of skincare.",
      "2. Reapply every 2 hours.",
    ],
    sizes: [
      { name: "50ml", price: 48 },
      { name: "100ml", price: 65 },
    ],
    sku: "EL-SUN-IS-50",
    tags: ["SPF", "Sun Protection"],
    relatedProducts: ["EL-MST-DG-50", "EL-SRM-LV-30"],
    reviews: [
      {
        id: "r1",
        user: "Tanvir H.",
        rating: 4,
        date: "2026-03-30",
        comment: "No white cast, very good.",
      },
    ],
    faq: [
      {
        question: "Is it suitable for dark skin?",
        answer: "Yes, it leaves no white cast.",
      },
    ],
  },

  {
    id: "EL-TRT-HE-15",
    name: "Hydrating Eye Treatment",
    brand: "Elara",
    category: "Treatments",
    subcategory: "Brightening",
    price: 42,
    originalPrice: 50,
    offers: ["Limited Offer"],
    rating: 4.4,
    reviewsCount: 76,
    image: "/products/eye_cream.png",
    images: ["/products/eye_cream.png"],
    briefDescription: "Hydrates and reduces puffiness.",
    description:
      "A lightweight eye cream that deeply hydrates and visibly reduces puffiness and dark circles.",
    ingredients: "Hyaluronic Acid, Caffeine, Peptides.",
    routine: [
      "1. Apply a small amount under eyes.",
      "2. Gently tap with ring finger.",
      "3. Use morning and night.",
    ],
    sizes: [
      { name: "15ml", price: 42 },
      { name: "30ml", price: 60 },
    ],
    sku: "EL-TRT-HE-15",
    tags: ["Eye Cream", "Hydration"],
    relatedProducts: ["EL-SRM-LV-30"],
    reviews: [
      {
        id: "r1",
        user: "Lima S.",
        rating: 4,
        date: "2026-04-05",
        comment: "Feels refreshing!",
      },
    ],
    faq: [
      {
        question: "Can I use with makeup?",
        answer: "Yes, it absorbs quickly.",
      },
    ],
  },
];
