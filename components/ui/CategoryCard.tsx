import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

export default function CategoryCard({ name, image, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center text-center overflow-hidden"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-white/50 mb-3 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-black/5">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--brand-primary)] group-hover:text-[var(--brand-secondary)] transition-colors duration-300">
        {name}
      </h3>
      <p className="text-[10px] md:text-xs mt-1 uppercase tracking-widest font-bold text-[var(--brand-secondary)] opacity-40 group-hover:opacity-100 transition-opacity duration-300">
        Shop Now
      </p>
    </Link>
  );
}
