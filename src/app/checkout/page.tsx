import { CheckoutClient } from '@/components/shop/checkout-client';
import { getPublicSettings } from '@/lib/settings';
import { getShopPaymentInstructions } from '@/lib/shop-payment';

export default async function CheckoutPage() {
  const settings = await getPublicSettings();
  const paymentInstructions = getShopPaymentInstructions(settings);

  return (
    <main className="section">
      <div className="container">
        <CheckoutClient paymentInstructions={paymentInstructions} />
      </div>
    </main>
  );
}
