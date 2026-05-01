export type ProductPriceTier = {
  minQty: number;
  price: number;
};

export type ProductCatalogItem = {
  code: string;
  name: string;
  category: string;
  sizes: string[];
  pricing: ProductPriceTier[];
};

export type InvoiceItemInput = {
  productCode: string;
  qty: number;
  name?: string;
};

export type InvoiceItem = {
  productCode: string;
  name: string;
  category: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type InvoiceCalculationInput = {
  items: InvoiceItemInput[];
  discount?: number;
  shipping?: number;
};

export type InvoiceCalculation = {
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  paymentOptions: typeof PAYMENT_OPTIONS;
};

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    code: '0001',
    name: 'Basketball Jersey Set',
    category: 'Basketball',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    pricing: [
      { minQty: 12, price: 900 },
      { minQty: 25, price: 850 },
      { minQty: 50, price: 750 },
      { minQty: 100, price: 650 },
    ],
  },
  {
    code: '0002',
    name: 'Basketball Upper Jersey',
    category: 'Basketball',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    pricing: [
      { minQty: 12, price: 450 },
      { minQty: 25, price: 400 },
      { minQty: 50, price: 350 },
      { minQty: 100, price: 300 },
    ],
  },
  {
    code: '0010',
    name: 'Volleyball T-Shirt Set',
    category: 'Volleyball',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    pricing: [
      { minQty: 12, price: 850 },
      { minQty: 25, price: 800 },
      { minQty: 50, price: 750 },
      { minQty: 100, price: 700 },
    ],
  },
];

export const PAYMENT_OPTIONS = {
  allowPartial: true,
  allowTips: false,
  methods: ['Cash', 'GCash', 'Maya', 'Bank Transfer', 'PayPal'],
} as const;

export const INVOICE_CURRENCY = 'PHP';
