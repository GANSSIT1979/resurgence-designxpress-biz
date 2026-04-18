export type CartLineInput = {
  productId: string;
  quantity: number;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  city: string;
  province?: string;
  postalCode?: string;
  paymentMethod: 'COD' | 'GCASH_MANUAL' | 'BANK_TRANSFER';
  notes?: string;
};
