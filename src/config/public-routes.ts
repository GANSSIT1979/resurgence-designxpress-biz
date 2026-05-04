const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.resurgence-dx.biz';

export const publicRoutes = {
  home: appUrl,
  feed: `${appUrl}/feed`,
  creators: `${appUrl}/creators`,
  sponsors: `${appUrl}/sponsors`,
  contact: `${appUrl}/contact`,
  login: process.env.NEXT_PUBLIC_LOGIN_URL || 'https://login.resurgence-dx.biz',
  events: process.env.NEXT_PUBLIC_EVENTS_URL || 'https://events.resurgence-dx.biz',
  shop: process.env.NEXT_PUBLIC_SHOP_URL || 'https://shop.resurgence-dx.biz',
  support: process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://support.resurgence-dx.biz',
  partnership:
    process.env.NEXT_PUBLIC_PARTNERSHIP_URL ||
    'https://partnership.resurgence-dx.biz',
} as const;
