const otpTtlMinutes = 10;

export function getOtpTtlMinutes() {
  return otpTtlMinutes;
}

export function getOtpExpiry() {
  return new Date(Date.now() + otpTtlMinutes * 60 * 1000);
}

export async function deliverMobileOtp(phoneNumber: string, code: string) {
  const webhookUrl = process.env.SMS_WEBHOOK_URL?.trim();
  const deliveryMode = process.env.OTP_DELIVERY_MODE?.trim().toLowerCase() || (webhookUrl ? 'webhook' : 'demo');

  if (deliveryMode === 'webhook' && webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SMS_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.SMS_WEBHOOK_SECRET}` } : {}),
      },
      body: JSON.stringify({
        to: phoneNumber,
        code,
        message: `Your Resurgence verification code is ${code}. It expires in ${otpTtlMinutes} minutes.`,
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to send OTP through the configured SMS provider.');
    }

    return { mode: 'webhook' as const };
  }

  return { mode: 'demo' as const, code };
}
