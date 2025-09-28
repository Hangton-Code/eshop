/**
 * reCAPTCHA v3 utilities for Next.js app
 */

// Types for reCAPTCHA responses
export interface RecaptchaTokenResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

/**
 * Verify reCAPTCHA token with Google's API
 */
export async function verifyRecaptchaToken(
  token: string
): Promise<RecaptchaVerifyResponse> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    throw new Error("RECAPTCHA_SECRET_KEY is not configured");
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      {
        method: "POST",
      }
    );

    const data: RecaptchaTokenResponse = await response.json();

    return {
      success: data.success,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      "error-codes": data["error-codes"],
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    throw new Error("Failed to verify reCAPTCHA token");
  }
}

/**
 * Validate reCAPTCHA response based on score threshold
 */
export function validateRecaptchaResponse(
  response: RecaptchaVerifyResponse,
  minScore: number = 0.5
): boolean {
  if (!response.success) {
    return false;
  }

  // Check if score meets minimum threshold
  if (response.score !== undefined && response.score < minScore) {
    return false;
  }

  return true;
}

/**
 * Get reCAPTCHA site key for client-side use
 */
export function getRecaptchaSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    throw new Error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured");
  }

  return siteKey;
}
