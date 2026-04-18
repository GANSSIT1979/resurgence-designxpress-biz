import Link from 'next/link';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    price: unknown;
    compareAtPrice: unknown;
    imageUrl: string | null;
    stock: number;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-white shadow-sm">
      <div className="aspect-square overflow-hidden rounded-xl bg-zinc-900">
        <img
          src={product.imageUrl || '/branding/resurgence-logo.jpg'}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-zinc-400">{product.shortDescription || 'Official Resurgence merchandise.'}</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">₱{Number(product.price).toLocaleString()}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-zinc-500 line-through">
              ₱{Number(product.compareAtPrice).toLocaleString()}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Stock: {product.stock}</span>
          <Link
            href={`/shop/product/${product.slug}`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
