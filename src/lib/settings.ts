import { db } from "@/lib/db";

export type PublicSettings = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  adminTitle: string;
  adminSubtitle: string;
  reportFooter: string;
};

const PUBLIC_SETTINGS_KEY = "public-admin-settings";

const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  contactName: "Jake Anilao",
  contactEmail: "partnerships@resurgence-dx.biz",
  contactPhone: "+63 938 784 1636",
  contactAddress:
    "B20 L31 Sampaguita Oval, Maligaya Park, Barangay 177, Caloocan City, Third District, NCR",
  adminTitle: "Branch/Store Resurgence Co-Owner",
  adminSubtitle: "Brand Ambassador, Basketball Coach and Influencer/Vlogger",
  reportFooter: "RESURGENCE Powered by DesignXpress",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizePublicSettings(value: unknown): PublicSettings {
  if (!isObject(value)) {
    return DEFAULT_PUBLIC_SETTINGS;
  }

  return {
    contactName: asString(value.contactName, DEFAULT_PUBLIC_SETTINGS.contactName),
    contactEmail: asString(value.contactEmail, DEFAULT_PUBLIC_SETTINGS.contactEmail),
    contactPhone: asString(value.contactPhone, DEFAULT_PUBLIC_SETTINGS.contactPhone),
    contactAddress: asString(value.contactAddress, DEFAULT_PUBLIC_SETTINGS.contactAddress),
    adminTitle: asString(value.adminTitle, DEFAULT_PUBLIC_SETTINGS.adminTitle),
    adminSubtitle: asString(value.adminSubtitle, DEFAULT_PUBLIC_SETTINGS.adminSubtitle),
    reportFooter: asString(value.reportFooter, DEFAULT_PUBLIC_SETTINGS.reportFooter),
  };
}

function parseSettingValue(record: any) {
  if (!record) return null;

  if (record.valueJson && typeof record.valueJson === "object") {
    return record.valueJson;
  }

  if (typeof record.value === "string" && record.value.trim()) {
    try {
      return JSON.parse(record.value);
    } catch {
      return record.value;
    }
  }

  return null;
}

export async function getAppSettingsMap() {
  const records = await db.setting.findMany({
    orderBy: { key: "asc" },
  });

  return new Map(
    records.map((item) => [item.key, parseSettingValue(item)] as const)
  );
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const map = await getAppSettingsMap();
  const raw = map.get(PUBLIC_SETTINGS_KEY);

  return normalizePublicSettings(raw);
}

export async function upsertAppSettings(input: Partial<PublicSettings>) {
  const next = normalizePublicSettings({
    ...DEFAULT_PUBLIC_SETTINGS,
    ...input,
  });

  await db.setting.upsert({
    where: { key: PUBLIC_SETTINGS_KEY },
    update: {
      value: JSON.stringify(next),
      valueJson: next,
    },
    create: {
      key: PUBLIC_SETTINGS_KEY,
      value: JSON.stringify(next),
      valueJson: next,
    },
  });

  return next;
}

export async function getSettingByKey(key: string) {
  const record = await db.setting.findUnique({
    where: { key },
  });

  return parseSettingValue(record);
}

export { DEFAULT_PUBLIC_SETTINGS, PUBLIC_SETTINGS_KEY };
