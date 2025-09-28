# reCAPTCHA v3 Setup Guide

This guide explains how reCAPTCHA v3 has been integrated into the EShop application to protect against spam and abuse.

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Register a new site with the following settings:
   - **Label**: EShop (or your preferred name)
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**: Add your domain(s) (e.g., `localhost` for development, `yourdomain.com` for production)
3. Copy the **Site Key** and **Secret Key**

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### 3. Implementation Details

#### Client-Side Integration

- **Script Loading**: The reCAPTCHA script is automatically loaded via the `RecaptchaScript` component in the root layout
- **Token Generation**: Use the `useRecaptcha` hook to generate tokens for specific actions
- **Actions**: Different actions are used for different purposes:
  - `chat_submit`: For chat message submissions
  - `file_upload`: For file uploads
  - `generic`: For general form submissions

#### Server-Side Integration

- **Token Verification**: Server-side verification is implemented in key API routes:
  - `/api/chat` - Chat submissions
  - `/api/files/upload` - File uploads
  - `/api/orders` - Order retrieval
- **Score Threshold**: Default minimum score is 0.5 (you can adjust this in the verification functions)

#### Usage Examples

**In Components:**

```tsx
import { useRecaptcha } from "@/hooks/use-recaptcha";

function MyForm() {
  const { generateToken, isAvailable } = useRecaptcha();

  const handleSubmit = async () => {
    if (isAvailable) {
      const token = await generateToken("form_submit");
      // Include token in your form submission
    }
  };
}
```

**In API Routes:**

```ts
import {
  verifyRecaptchaToken,
  validateRecaptchaResponse,
} from "@/lib/recaptcha";

export async function POST(req: Request) {
  const { recaptchaToken } = await req.json();

  if (recaptchaToken) {
    const response = await verifyRecaptchaToken(recaptchaToken);
    if (!validateRecaptchaResponse(response, 0.5)) {
      return Response.json({ error: "Verification failed" }, { status: 403 });
    }
  }

  // Continue with your logic
}
```

### 4. Customization Options

#### Adjust Score Threshold

Modify the score threshold in verification functions:

```ts
// More strict (default 0.7)
if (!validateRecaptchaResponse(response, 0.7)) {
  // Block request
}

// More lenient (0.3)
if (!validateRecaptchaResponse(response, 0.3)) {
  // Block request
}
```

#### Add More Actions

Add new action types in the `useRecaptcha` hook:

```ts
const token = await generateToken("new_action_type");
```

### 5. Security Considerations

- reCAPTCHA v3 provides a score-based system rather than challenging users
- The score ranges from 0.0 (likely bot) to 1.0 (likely human)
- Monitor your reCAPTCHA console for traffic patterns and adjust thresholds as needed
- Consider implementing rate limiting as an additional layer of protection

### 6. Implementation Approach

**Server Actions vs API Routes**: The chat deletion functionality uses a server action (`actions/chat.ts`) instead of an API route. Server actions provide:

- **Better Type Safety**: Full TypeScript support with automatic type inference
- **Automatic Request Deduplication**: Prevents duplicate submissions
- **Seamless React Integration**: Can be called directly from React components without fetch
- **Built-in Security**: Automatic CSRF protection and authentication handling
- **Progressive Enhancement**: Works with JavaScript disabled

This approach is more modern and recommended for Next.js applications compared to traditional API routes.

### 7. Testing

1. **Development**: Test with `localhost` domain registration
2. **Production**: Ensure your production domain is registered in reCAPTCHA console
3. **Verification**: Check browser developer tools to see if tokens are being generated
4. **Server Action Testing**: Verify that server actions properly validate tokens and handle authentication

### 8. Badge Visibility

The reCAPTCHA badge has been hidden using CSS for a cleaner interface. However, per Google's terms of service, we've added a visible attribution on the home page that links to Google's Privacy Policy and Terms of Service. This maintains compliance while providing a cleaner user experience.

### 9. Troubleshooting

**Common Issues:**

- **Script not loading**: Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
- **Token verification failing**: Verify `RECAPTCHA_SECRET_KEY` is correct
- **Domain not registered**: Add your domain to reCAPTCHA console
- **CORS issues**: Ensure proper domain configuration

**Debug Mode:**
Enable debug logging by checking the reCAPTCHA console and monitoring API responses.

## Files Modified/Created

- `lib/recaptcha.ts` - Server-side utilities
- `lib/recaptcha-client.ts` - Client-side utilities
- `hooks/use-recaptcha.tsx` - React hook for token management
- `components/recaptcha-script.tsx` - Script loader component
- `components/recaptcha-attribution.tsx` - Attribution component
- `app/layout.tsx` - Root layout integration (script only)
- `app/(customer)/page.tsx` - Home page integration
- `app/globals.css` - CSS to hide reCAPTCHA badge
- `components/chat-form.tsx` - Chat form integration
- `app/api/chat/route.ts` - Chat API protection
- `app/api/files/upload/route.ts` - File upload protection
- `app/api/orders/route.ts` - Orders API protection
- `actions/chat.ts` - Server action for bulk chat deletion
- `components/nav-user.tsx` - Added settings button and dialog
- `components/settings-dialog.tsx` - Settings dialog with data control
- `lib/db/queries.ts` - Added bulk chat deletion function
- `sample.env` - Environment variables documentation
