"use client";

import { useState, useCallback } from "react";
import {
  generateRecaptchaToken,
  isRecaptchaAvailable,
} from "@/lib/recaptcha-client";

export interface UseRecaptchaReturn {
  generateToken: (action?: string) => Promise<string>;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing reCAPTCHA v3 tokens
 */
export function useRecaptcha(): UseRecaptchaReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = useCallback(
    async (action: string = "generic"): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isRecaptchaAvailable()) {
          throw new Error(
            "reCAPTCHA is not available. Please refresh the page."
          );
        }

        const token = await generateRecaptchaToken(action);
        return token;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate reCAPTCHA token";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generateToken,
    isAvailable: isRecaptchaAvailable(),
    isLoading,
    error,
  };
}
