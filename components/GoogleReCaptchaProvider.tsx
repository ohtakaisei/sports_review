'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface GoogleReCaptchaProviderProps {
  children: React.ReactNode;
}

export default function GoogleReCaptchaProviderWrapper({ children }: GoogleReCaptchaProviderProps) {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    console.warn('reCAPTCHA site key is not configured');
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

