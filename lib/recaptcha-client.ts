/**
 * Client-side reCAPTCHA v3 utilities
 */

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

/**
 * Generate reCAPTCHA token for a specific action
 */
export async function generateRecaptchaToken(
  action: string = "generic"
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error("reCAPTCHA not loaded"));
      return;
    }

    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
          { action }
        );
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Check if reCAPTCHA is available
 */
export function isRecaptchaAvailable(): boolean {
  return typeof window !== "undefined" && !!window.grecaptcha;
}
