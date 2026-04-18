export function serializePartnerCampaign(item: any) {
  return {
    ...item,
    description: item.description ?? null,
    startDate: item.startDate ? item.startDate.toISOString() : null,
    endDate: item.endDate ? item.endDate.toISOString() : null,
    contributionValue: item.contributionValue ?? null,
    assetLink: item.assetLink ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializePartnerReferral(item: any) {
  return {
    ...item,
    phone: item.phone ?? null,
    notes: item.notes ?? null,
    estimatedValue: item.estimatedValue ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializePartnerAgreement(item: any) {
  return {
    ...item,
    startDate: item.startDate ? item.startDate.toISOString() : null,
    endDate: item.endDate ? item.endDate.toISOString() : null,
    documentUrl: item.documentUrl ?? null,
    notes: item.notes ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function buildPartnerCampaignPayload(parsed: any, partnerProfileId: string) {
  return {
    partnerProfileId,
    title: parsed.title,
    campaignType: parsed.campaignType,
    status: parsed.status,
    description: parsed.description || null,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    contributionValue: parsed.contributionValue === '' || parsed.contributionValue == null ? null : Number(parsed.contributionValue),
    assetLink: parsed.assetLink || null,
  };
}

export async function buildPartnerReferralPayload(parsed: any, partnerProfileId: string) {
  return {
    partnerProfileId,
    companyName: parsed.companyName,
    contactName: parsed.contactName,
    email: parsed.email,
    phone: parsed.phone || null,
    status: parsed.status,
    notes: parsed.notes || null,
    estimatedValue: parsed.estimatedValue === '' || parsed.estimatedValue == null ? null : Number(parsed.estimatedValue),
  };
}

export async function buildPartnerAgreementPayload(parsed: any, partnerProfileId: string) {
  return {
    partnerProfileId,
    title: parsed.title,
    agreementType: parsed.agreementType,
    status: parsed.status,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    documentUrl: parsed.documentUrl || null,
    notes: parsed.notes || null,
  };
}
