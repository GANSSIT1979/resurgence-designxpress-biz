import Link from 'next/link';
import CartSummary from '@/components/shop/CartSummary';
import { getCart } from '@/lib/shop/cart';
import { getCurrentUser } from '@/lib/shop/session';

export default async function CartPage() {
  const user = await getCurrentUser();
  const cart = user ? await getCart(user.id) : { items: [], subtotal: 0, shippingFee: 0, total: 0 };

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">Your Cart</h1>
        <div className="grid gap-8 lg:grid-cols-[1.7fr,0.9fr]">
          <div className="space-y-4">
            {cart.items.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
                <p className="text-zinc-400">Your cart is empty.</p>
                <Link href="/shop" className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold">Continue Shopping</Link>
              </div>
            ) : cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <img src={item.product.imageUrl || '/branding/resurgence-logo.jpg'} alt={item.product.name} className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.product.name}</h2>
                  <p className="text-sm text-zinc-400">Qty: {item.quantity}</p>
                  <p className="mt-1 font-semibold">₱{(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <CartSummary subtotal={cart.subtotal} shippingFee={cart.shippingFee} total={cart.total} />
            <Link href="/checkout" className="block rounded-xl bg-red-600 px-5 py-3 text-center font-semibold hover:bg-red-500">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
