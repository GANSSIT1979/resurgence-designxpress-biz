import type { Metadata } from 'next';
import { appSettingDefaults, type PublicSettings } from '@/lib/settings';

type SiteMetadataSettings = Pick<PublicSettings, 'brandName' | 'companyName' | 'siteUrl'>;

const DEFAULT_DESCRIPTION =
  'Resurgence Powered by DesignXpress connects sponsors, creators, merch drops, and community basketball events through one premium activation platform in the Philippines.';
const DEFAULT_PREVIEW_IMAGE = '/branding/resurgence-shop-mockup.png';
const DEFAULT_PREVIEW_IMAGE_WIDTH = 2048;
const DEFAULT_PREVIEW_IMAGE_HEIGHT = 1365;

function resolveMetadataBase(siteUrl: string) {
  const fallbackSiteUrl = appSettingDefaults.siteUrl;
  const normalizedSiteUrl = siteUrl.trim() || fallbackSiteUrl;

  try {
    return new URL(normalizedSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

function buildMetadataImage(url: string, alt: string) {
  return {
    url,
    width: DEFAULT_PREVIEW_IMAGE_WIDTH,
    height: DEFAULT_PREVIEW_IMAGE_HEIGHT,
    alt,
  };
}

function getMetadataParts(settings: SiteMetadataSettings) {
  const siteName = settings.brandName.trim() || appSettingDefaults.brandName;
  const publisher = settings.companyName.trim() || appSettingDefaults.companyName;
  const metadataBase = resolveMetadataBase(settings.siteUrl);
  const previewImageUrl = new URL(DEFAULT_PREVIEW_IMAGE, metadataBase).toString();
  const previewImageAlt = `${siteName} social preview`;

  return {
    description: DEFAULT_DESCRIPTION,
    metadataBase,
    previewImage: buildMetadataImage(previewImageUrl, previewImageAlt),
    previewImageUrl,
    publisher,
    siteName,
  };
}

export function buildSiteMetadata(settings: SiteMetadataSettings): Metadata {
  const { description, metadataBase, previewImage, previewImageUrl, publisher, siteName } =
    getMetadataParts(settings);

  return {
    metadataBase,
    applicationName: siteName,
    title: siteName,
    description,
    authors: [{ name: publisher }],
    creator: publisher,
    publisher,
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
      shortcut: '/favicon.ico',
      apple: [{ url: '/icon.png' }],
    },
    openGraph: {
      type: 'website',
      locale: 'en_PH',
      siteName,
      title: siteName,
      description,
      images: [previewImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [previewImageUrl],
    },
  };
}

export function buildHomeMetadata(settings: SiteMetadataSettings): Metadata {
  const { description, metadataBase, previewImage, previewImageUrl, publisher, siteName } =
    getMetadataParts(settings);
  const canonicalUrl = metadataBase.toString();

  return {
    metadataBase,
    applicationName: siteName,
    title: siteName,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    authors: [{ name: publisher }],
    creator: publisher,
    publisher,
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
      shortcut: '/favicon.ico',
      apple: [{ url: '/icon.png' }],
    },
    openGraph: {
      type: 'website',
      locale: 'en_PH',
      url: canonicalUrl,
      siteName,
      title: siteName,
      description,
      images: [previewImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [previewImageUrl],
    },
  };
}
