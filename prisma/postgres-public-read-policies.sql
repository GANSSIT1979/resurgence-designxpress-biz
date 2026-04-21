-- Public read policies for tables whose full rows are safe to expose through
-- Supabase's Data API. Keep sensitive or mixed-use tables locked down unless
-- they are exposed through a curated view or RPC instead.

DROP POLICY IF EXISTS "public read active sponsors" ON public."Sponsor";
CREATE POLICY "public read active sponsors"
ON public."Sponsor"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read active partners" ON public."Partner";
CREATE POLICY "public read active partners"
ON public."Partner"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read page content" ON public."PageContent";
CREATE POLICY "public read page content"
ON public."PageContent"
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "public read public app settings" ON public."AppSetting";
CREATE POLICY "public read public app settings"
ON public."AppSetting"
FOR SELECT
USING (
  "key" IN (
    'brandName',
    'companyName',
    'siteUrl',
    'contactName',
    'contactRole',
    'contactEmail',
    'contactPhone',
    'supportEmail',
    'supportPhone',
    'businessHours',
    'location',
    'currency',
    'paymentMethods',
    'shippingArea',
    'contactAddress'
  )
);

DROP POLICY IF EXISTS "public read active sponsor packages" ON public."SponsorPackageTemplate";
CREATE POLICY "public read active sponsor packages"
ON public."SponsorPackageTemplate"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read active sponsor inventory" ON public."SponsorInventoryCategory";
CREATE POLICY "public read active sponsor inventory"
ON public."SponsorInventoryCategory"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read active product services" ON public."ProductService";
CREATE POLICY "public read active product services"
ON public."ProductService"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read active shop categories" ON public."ShopCategory";
CREATE POLICY "public read active shop categories"
ON public."ShopCategory"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read active shop products" ON public."ShopProduct";
CREATE POLICY "public read active shop products"
ON public."ShopProduct"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read active media events" ON public."MediaEvent";
CREATE POLICY "public read active media events"
ON public."MediaEvent"
FOR SELECT
USING ("isActive" = true);

DROP POLICY IF EXISTS "public read gallery media for active events" ON public."GalleryMedia";
CREATE POLICY "public read gallery media for active events"
ON public."GalleryMedia"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public."MediaEvent" AS event
    WHERE event.id = "mediaEventId"
      AND event."isActive" = true
  )
);
