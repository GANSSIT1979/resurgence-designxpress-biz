export type ShareLinkTarget = {
  id?: string | null;
  slug?: string | null;
  href?: string | null;
  label?: string | null;
};

export type ShareableFeedItem = {
  id: string;
  title?: string | null;
  caption?: string | null;
  canonicalUrl?: string | null;
  creator?: ShareLinkTarget | null;
  product?: ShareLinkTarget | null;
};

export type ShareSheetContext = {
  origin?: string | null;
  feedBasePath?: string;
  creatorBasePath?: string;
  productBasePath?: string;
};

export type BuiltSharePayload = {
  title: string;
  text: string;
  url: string;
  creatorUrl?: string | null;
  productUrl?: string | null;
};

export type ShareTrackAction =
  | 'native-share'
  | 'copy-link'
  | 'open-creator'
  | 'open-product'
  | 'external-share';

export type TrackShareBody = {
  action: ShareTrackAction;
  destination?: string | null;
};

export type TrackShareResponse = {
  shareCount?: number;
};
