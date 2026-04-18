type CartSummaryProps = {
  subtotal: number;
  shippingFee: number;
  total: number;
};

export default function CartSummary({ subtotal, shippingFee, total }: CartSummaryProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white">
      <h2 className="text-xl font-semibold">Order Summary</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>₱{shippingFee.toLocaleString()}</span></div>
        <div className="flex justify-between border-t border-zinc-800 pt-3 text-base font-semibold"><span>Total</span><span>₱{total.toLocaleString()}</span></div>
      </div>
    </div>
  );
}
