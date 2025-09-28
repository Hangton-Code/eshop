export default function RecaptchaAttribution() {
  return (
    <div className="text-xs text-muted-foreground text-center py-2">
      This site is protected by reCAPTCHA and the Google{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Privacy Policy
      </a>{" "}
      and{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Terms of Service
      </a>{" "}
      apply.
    </div>
  );
}
