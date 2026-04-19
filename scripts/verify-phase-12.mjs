import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const results = [];

function resolvePath(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function read(relativePath) {
  return readFileSync(resolvePath(relativePath), "utf8");
}

function record(name, ok, details) {
  results.push({ name, ok, details });
}

function requireFile(relativePath, area) {
  record(`${area}: ${relativePath}`, existsSync(resolvePath(relativePath)), "Required file exists.");
}

function requireContains(relativePath, patterns, area) {
  const filePath = resolvePath(relativePath);
  if (!existsSync(filePath)) {
    record(`${area}: ${relativePath}`, false, "File is missing.");
    return;
  }

  const content = read(relativePath);
  const missing = patterns.filter((pattern) => {
    if (pattern instanceof RegExp) return !pattern.test(content);
    return !content.includes(pattern);
  });

  record(
    `${area}: ${relativePath}`,
    missing.length === 0,
    missing.length === 0 ? "Expected source markers found." : `Missing markers: ${missing.map(String).join(", ")}`,
  );
}

function requireSchemaMarker(label, marker) {
  const schema = read("prisma/schema.prisma");
  const ok = marker instanceof RegExp ? marker.test(schema) : schema.includes(marker);
  record(`Prisma: ${label}`, ok, ok ? "Schema marker found." : `Missing schema marker: ${String(marker)}`);
}

function printResults() {
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}`);
    console.log(`      ${result.details}`);
  }
}

const requiredFiles = [
  ["Public feed", [
    "src/app/page.tsx",
    "src/app/feed/page.tsx",
    "src/app/feed/loading.tsx",
    "src/app/feed/error.tsx",
    "src/components/feed/creator-commerce-feed.tsx",
    "src/lib/feed/types.ts",
    "src/lib/feed/queries.ts",
    "src/lib/feed/mutations.ts",
    "src/lib/feed/serializers.ts",
    "src/lib/feed/validation.ts",
    "src/lib/feed/authorization.ts",
    "src/lib/feed/api.ts",
  ]],
  ["Feed API", [
    "src/app/api/feed/route.ts",
    "src/app/api/feed/[postId]/route.ts",
    "src/app/api/feed/[postId]/comments/route.ts",
    "src/app/api/feed/[postId]/like/route.ts",
    "src/app/api/feed/[postId]/save/route.ts",
    "src/app/api/feed/[postId]/products/route.ts",
    "src/app/api/feed/creators/[creatorId]/follow/route.ts",
    "src/app/api/feed/promoted/route.ts",
  ]],
  ["Protected dashboards", [
    "src/app/admin/feed/page.tsx",
    "src/app/creator/dashboard/page.tsx",
    "src/app/creator/posts/page.tsx",
    "src/app/sponsor/dashboard/page.tsx",
    "src/app/sponsor/placements/page.tsx",
    "src/app/admin/products/page.tsx",
    "src/app/admin/orders/page.tsx",
    "src/app/admin/users/page.tsx",
  ]],
  ["Commerce continuity", [
    "src/app/shop/page.tsx",
    "src/app/shop/product/[slug]/page.tsx",
    "src/app/cart/page.tsx",
    "src/app/checkout/page.tsx",
    "src/app/api/checkout/route.ts",
    "src/components/shop/add-to-cart-button.tsx",
    "src/components/shop/cart-client.tsx",
    "src/components/shop/checkout-client.tsx",
    "src/lib/shop/cart-storage.ts",
  ]],
  ["Auth and registration continuity", [
    "src/app/login/page.tsx",
    "src/app/api/auth/login/route.ts",
    "src/app/api/auth/logout/route.ts",
    "src/app/api/auth/google/route.ts",
    "src/app/api/auth/mobile/request-otp/route.ts",
    "src/app/api/auth/mobile/verify-otp/route.ts",
  ]],
  ["Phase documentation", [
    "docs/FEED_UPGRADE_PHASE_1_4.md",
    "docs/FEED_UPGRADE_PHASE_5_6.md",
    "docs/FEED_UPGRADE_PHASE_7.md",
    "docs/FEED_UPGRADE_PHASE_8.md",
    "docs/FEED_UPGRADE_PHASE_9.md",
    "docs/FEED_UPGRADE_PHASE_10.md",
    "docs/FEED_UPGRADE_PHASE_11.md",
    "docs/FEED_UPGRADE_PHASE_12.md",
  ]],
];

for (const [area, files] of requiredFiles) {
  for (const file of files) requireFile(file, area);
}

const schemaModels = [
  "model CreatorProfile",
  "model ContentPost",
  "model MediaAsset",
  "model Hashtag",
  "model PostHashtag",
  "model PostLike",
  "model PostComment",
  "model PostSave",
  "model Follow",
  "model SponsoredPlacement",
  "model PostProductTag",
  "model PlatformNotification",
  "model ShopProduct",
  "model ShopOrder",
  "model Sponsor",
  "model SponsorProfile",
];

for (const model of schemaModels) {
  requireSchemaMarker(model, `${model} {`);
}

for (const role of ["SYSTEM_ADMIN", "STAFF", "SPONSOR", "PARTNER", "CREATOR", "COACH", "REFEREE", "MEMBER"]) {
  requireSchemaMarker(`UserRole.${role}`, new RegExp(`\\b${role}\\b`));
}

for (const index of [
  "@@index([status, visibility, publishedAt])",
  "@@index([creatorProfileId, status, publishedAt])",
  "@@unique([postId, userId])",
  "@@unique([followerUserId, creatorProfileId])",
  "@@index([status, startsAt, endsAt])",
  "@@index([isOfficialMerch, isActive, sortOrder])",
]) {
  requireSchemaMarker(`feed/shop index ${index}`, index);
}

const sourceChecks = [
  ["Homepage feed mount", "src/app/page.tsx", ["CreatorCommerceFeed", "getPublicFeed"]],
  ["Standalone feed mount", "src/app/feed/page.tsx", ["CreatorCommerceFeed", "getPublicFeed"]],
  ["Feed UI hardening", "src/components/feed/creator-commerce-feed.tsx", [
    "MEDIA_PREFETCH_DISTANCE",
    "FeedMediaPlaceholder",
    "FeedSkeletonStack",
    "loadAbortRef",
    "aria-busy",
    "addProductToCart",
    "CART_UPDATED_EVENT",
  ]],
  ["Shared cart product detail button", "src/components/shop/add-to-cart-button.tsx", ["addProductToCart"]],
  ["Shared cart page storage", "src/components/shop/cart-client.tsx", ["readCart", "writeCart", "CART_UPDATED_EVENT"]],
  ["Shared checkout cart storage", "src/components/shop/checkout-client.tsx", ["readCart", "clearCart"]],
  ["Feed create authorization", "src/app/api/feed/route.ts", ["getPublicFeed", "requireFeedActor", "canCreateFeedPost"]],
  ["Feed update authorization", "src/app/api/feed/[postId]/route.ts", ["requireFeedActor", "canManageFeedPost", "PATCH", "DELETE"]],
  ["Feed product tag authorization", "src/app/api/feed/[postId]/products/route.ts", ["requireFeedActor", "canManageFeedPost", "replacePostProducts"]],
  ["Feed like authorization", "src/app/api/feed/[postId]/like/route.ts", ["requireFeedActor", "togglePostLike"]],
  ["Feed save authorization", "src/app/api/feed/[postId]/save/route.ts", ["requireFeedActor", "togglePostSave"]],
  ["Feed comment authorization", "src/app/api/feed/[postId]/comments/route.ts", ["requireFeedActor", "createPostComment"]],
  ["Feed follow authorization", "src/app/api/feed/creators/[creatorId]/follow/route.ts", ["requireFeedActor", "toggleCreatorFollow"]],
  ["Promoted feed reads", "src/app/api/feed/promoted/route.ts", ["getPromotedPlacements"]],
  ["Creator post manager", "src/app/creator/posts/page.tsx", ["CreatorPostManager", "getCreatorPosts", "getProductOptions"]],
  ["Sponsor placement manager", "src/app/sponsor/placements/page.tsx", ["SponsorPlacementManager", "listSponsorPlacements", "getPlacementOptions"]],
  ["Admin feed moderation", "src/app/admin/feed/page.tsx", ["FeedModerationManager", "getAdminFeedModerationData"]],
  ["Feed route loading UI", "src/app/feed/loading.tsx", ["FeedLoading", "feed-route-state"]],
  ["Feed route recovery UI", "src/app/feed/error.tsx", ["FeedError", "Try Again"]],
];

for (const [area, file, patterns] of sourceChecks) {
  requireContains(file, patterns, area);
}

printResults();

const failures = results.filter((result) => !result.ok);
if (failures.length > 0) {
  console.error(`Phase 12 verification failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Phase 12 verification passed with ${results.length} checks.`);
}
