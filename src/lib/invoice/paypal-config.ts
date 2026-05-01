export type PayPalInvoiceItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  currency?: string;
  total?: number;
};

export type PayPalInvoiceExtras = {
  discount?: number;
  shipping?: number;
  otherAmount?: number;
  tax?: number;
};

export const PAYPAL_INVOICE_CONFIG = {
  invoiceType: 'paypal_invoice',
  currency: 'PHP',
  customer: {
    required: true,
    fields: {
      email: {
        label: 'Customer name or email',
        type: 'email',
        required: true,
      },
    },
  },
  items: {
    pricingMode: 'quantity',
    fields: {
      name: {
        label: 'Item name',
        required: true,
      },
      quantity: {
        label: 'Qty',
        type: 'number',
        default: 1,
        required: true,
      },
      unitPrice: {
        label: 'Price per unit',
        type: 'money',
        required: true,
      },
    },
  },
  invoiceSummary: {
    subtotal: true,
    discount: {
      enabled: true,
      type: ['fixed', 'percentage'],
    },
    shipping: {
      enabled: true,
      type: 'fixed',
    },
    otherAmount: {
      enabled: true,
      type: 'fixed',
    },
    tax: {
      enabled: true,
      label: 'Tax',
    },
  },
  paymentOptions: {
    allowPartialPayment: true,
    minimumDueEnabled: true,
    allowTip: false,
    supportedMethods: ['PayPal', 'PayPal Credit', 'Visa', 'Mastercard', 'American Express', 'Discover'],
  },
  moreOptions: {
    notesToRecipient: {
      enabled: true,
      label: 'Notes to your customer',
    },
    termsAndConditions: {
      enabled: true,
      label: 'Terms and conditions',
    },
    referenceNumber: {
      enabled: true,
      label: 'Reference number',
    },
    memoToSelf: {
      enabled: true,
      label: 'Memo to self',
    },
    attachments: {
      enabled: true,
      allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
      maxFiles: 5,
    },
  },
  actions: {
    preview: true,
    send: true,
    saveDraft: true,
  },
} as const;

export const SAMPLE_PAYPAL_INVOICE_ITEM: PayPalInvoiceItem = {
  name: 'Basketball Jersey Set',
  quantity: 12,
  unitPrice: 900,
  currency: 'PHP',
  total: 10800,
};

export function calculatePayPalInvoice(items: PayPalInvoiceItem[], extras: PayPalInvoiceExtras = {}) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = extras.discount || 0;
  const shipping = extras.shipping || 0;
  const otherAmount = extras.otherAmount || 0;
  const tax = extras.tax || 0;

  return {
    subtotal,
    discount,
    shipping,
    otherAmount,
    tax,
    total: subtotal - discount + shipping + otherAmount + tax,
  };
}
