export type TrackingConfig = {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleAdsConversionId?: string;
  metaPixelId?: string;
  linkedinPartnerId?: string;
  microsoftClarityId?: string;
  pinterestTagId?: string;
  tiktokPixelId?: string;
};

const trimValue = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const trackingConfig: TrackingConfig = {
  googleAnalyticsId: trimValue(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID),
  googleTagManagerId: trimValue(process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID),
  googleAdsConversionId: trimValue(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID),
  metaPixelId: trimValue(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  linkedinPartnerId: trimValue(process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID),
  microsoftClarityId: trimValue(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID),
  pinterestTagId: trimValue(process.env.NEXT_PUBLIC_PINTEREST_TAG_ID),
  tiktokPixelId: trimValue(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID)
};

export const hasTracking = Object.values(trackingConfig).some(Boolean);
