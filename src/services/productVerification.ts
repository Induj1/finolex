import { supabase } from "@/integrations/supabase/client";
import { ConsentData } from "@/components/PrivacyConsent";

export interface VerificationRequest {
  barcode?: string;
  qr_code?: string;
  scan_location?: string;
  device_fingerprint?: string;
  captcha_token?: string;
  timestamp_data?: TimestampData;
  browser_info?: BrowserInfo;
  geolocation_accuracy?: number;
  camera_snapshot?: string;
  user_consents: ConsentData;
}

export interface TimestampData {
  scan_initiated: number;
  captcha_completed: number;
  camera_ready: number;
  scan_completed: number;
  total_duration: number;
}

export interface BrowserInfo {
  user_agent: string;
  language: string;
  languages: string[];
  platform: string;
  screen_resolution: string;
  viewport_size: string;
  timezone: string;
  cookie_enabled: boolean;
  online_status: boolean;
  connection_type?: string;
}

export interface VerificationResponse {
  status: 'genuine' | 'counterfeit' | 'unverified';
  product_details?: {
    name: string;
    batch_no: string;
    mfg_date: string;
    expiry: string;
  };
  security_flag: 'low_risk' | 'medium_risk' | 'high_risk';
  response_time_ms: number;
  anomaly_score?: number;
}

export const verifyProduct = async (request: VerificationRequest): Promise<VerificationResponse> => {
  console.log('Sending verification request:', {
    has_barcode: !!request.barcode,
    has_qr_code: !!request.qr_code,
    has_captcha_token: !!request.captcha_token,
    has_consents: !!request.user_consents
  });

  const { data, error } = await supabase.functions.invoke('verify-product', {
    body: request
  });

  if (error) {
    console.error('Verification error:', error);
    throw new Error(error.message || 'Verification failed');
  }

  return data;
};

export const generateDeviceFingerprint = (): string => {
  // Enhanced device fingerprinting
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 10, 10);
  const canvasFingerprint = canvas.toDataURL();
  
  const fingerprint = btoa(JSON.stringify({
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.slice(-50),
    cookieEnabled: navigator.cookieEnabled,
    hardwareConcurrency: navigator.hardwareConcurrency,
    memory: (navigator as any).deviceMemory,
    connection: (navigator as any).connection?.effectiveType
  })).slice(0, 32);
  
  return fingerprint;
};

export const getBrowserInfo = (): BrowserInfo => {
  const connection = (navigator as any).connection;
  
  return {
    user_agent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages), // Convert readonly array to mutable array
    platform: navigator.platform,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookie_enabled: navigator.cookieEnabled,
    online_status: navigator.onLine,
    connection_type: connection?.effectiveType || 'unknown'
  };
};

export const getUserLocation = (): Promise<{city: string | null, accuracy?: number}> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({city: null});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Use a free reverse geocoding service
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const city = data.city || data.locality || data.principalSubdivision || 'Unknown City';
            resolve({city, accuracy});
          } else {
            console.error('Geocoding API error:', response.status);
            resolve({city: 'Unknown City', accuracy});
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          resolve({city: 'Unknown City', accuracy: position.coords.accuracy});
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve({city: null});
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
    );
  });
};

export const verifyCaptcha = async (token: string): Promise<boolean> => {
  // In a real implementation, verify the CAPTCHA token with your backend
  // For demo purposes, we'll simulate verification
  console.log('Verifying CAPTCHA token:', token);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return true for demo (in production, verify with reCAPTCHA API)
  return true;
};
