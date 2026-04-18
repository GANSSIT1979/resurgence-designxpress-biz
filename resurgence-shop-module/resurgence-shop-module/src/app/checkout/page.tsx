export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="text-4xl font-bold">Checkout</h1>
        <form action="/api/checkout" method="post" className="mt-8 grid gap-4 md:grid-cols-2">
          <input name="customerName" placeholder="Full name" className="rounded-xl border border-zinc-700 bg-black px-4 py-3" required />
          <input name="customerEmail" type="email" placeholder="Email" className="rounded-xl border border-zinc-700 bg-black px-4 py-3" required />
          <input name="customerPhone" placeholder="Phone number" className="rounded-xl border border-zinc-700 bg-black px-4 py-3" required />
          <input name="city" placeholder="City" className="rounded-xl border border-zinc-700 bg-black px-4 py-3" required />
          <input name="province" placeholder="Province" className="rounded-xl border border-zinc-700 bg-black px-4 py-3" />
          <input name="postalCode" placeholder="Postal code" className="rounded-xl border border-zinc-700 bg-black px-4 py-3" />
          <textarea name="addressLine1" placeholder="Full address" className="md:col-span-2 rounded-xl border border-zinc-700 bg-black px-4 py-3" required />
          <select name="paymentMethod" className="md:col-span-2 rounded-xl border border-zinc-700 bg-black px-4 py-3" defaultValue="COD">
            <option value="COD">Cash on Delivery</option>
            <option value="GCASH_MANUAL">GCash (Manual)</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
          <textarea name="notes" placeholder="Order notes" className="md:col-span-2 rounded-xl border border-zinc-700 bg-black px-4 py-3" />
          <button className="md:col-span-2 rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-500">Place Order</button>
        </form>
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300">
          <p>GCash Number: {process.env.GCASH_NUMBER || '09171234567'}</p>
          <p>Bank: {process.env.BANK_NAME || 'Sample Bank'}</p>
          <p>Account Name: {process.env.BANK_ACCOUNT_NAME || 'Resurgence PH'}</p>
          <p>Account Number: {process.env.BANK_ACCOUNT_NUMBER || '1234-5678-9012'}</p>
        </div>
      </div>
    </main>
  );
}
