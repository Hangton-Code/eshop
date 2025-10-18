"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: number;
            autoDisplay?: boolean;
          },
          element: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslateScript() {
  useEffect(() => {
    // Define the callback function
    window.googleTranslateElementInit = function () {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout: 0, // Simple layout
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Load the Google Translate script
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <>
      {/* Hidden Google Translate element */}
      <div
        id="google_translate_element"
        style={{ display: "none" }}
        className="hidden"
      />
      {/* Hide Google Translate banner */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-te-balloon-frame {
          display: none !important;
        }
        .goog-te-gadget {
          display: none !important;
        }
      `}</style>
    </>
  );
}
