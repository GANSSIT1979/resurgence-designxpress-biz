type AdminProductTableProps = {
  products: Array<{
    id: string;
    name: string;
    price: unknown;
    stock: number;
    isActive: boolean;
  }>;
};

export default function AdminProductTable({ products }: AdminProductTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-100 text-left">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">₱{Number(product.price).toLocaleString()}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3">{product.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
