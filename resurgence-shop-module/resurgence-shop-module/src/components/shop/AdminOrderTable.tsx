type AdminOrderTableProps = {
  orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: unknown;
    orderStatus: string;
    paymentMethod: string;
  }>;
};

export default function AdminOrderTable({ orders }: AdminOrderTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-100 text-left">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="px-4 py-3">{order.orderNumber}</td>
              <td className="px-4 py-3">{order.customerName}</td>
              <td className="px-4 py-3">₱{Number(order.totalAmount).toLocaleString()}</td>
              <td className="px-4 py-3">{order.orderStatus}</td>
              <td className="px-4 py-3">{order.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
