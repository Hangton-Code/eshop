"use client";

import { useEffect } from "react";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";

export default function RecaptchaScript() {
  const siteKey = getRecaptchaSiteKey();

  useEffect(() => {
    // Only load script if site key is available and script isn't already loaded
    if (!siteKey || window.grecaptcha) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [siteKey]);

  // Don't render anything visible
  return null;
}
