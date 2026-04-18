export type CartLineInput = {
  productId: string;
  quantity: number;
  variantLabel?: string;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  paymentMethod: 'COD' | 'GCASH_MANUAL' | 'MAYA_MANUAL' | 'BANK_TRANSFER' | 'CARD_MANUAL' | 'CASH';
  notes?: string;
  items?: CartLineInput[];
};
