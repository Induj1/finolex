
import { supabase } from "@/integrations/supabase/client";
import { ConsentData } from "@/components/PrivacyConsent";

export interface SignedQrPayload {
  data: {
    id: string;
    productId: string;
    batch: string;
    name: string;
    ts: number;
    exp: string;
  };
  sig: string;
}

export interface QrVerificationResult {
  status: 'first_use' | 'reused' | 'signature_invalid' | 'invalid' | 'error';
  message?: string;
  firstScanTime?: string;
  firstScanLocation?: string;
  scanCount?: number;
  productDetails?: {
    id: string;
    name: string;
    batch: string;
    expiry: string;
  };
}

export const verifySignedQr = async (
  qrPayload: SignedQrPayload,
  deviceId: string,
  location?: string,
  userAgent?: string,
  consents?: ConsentData
): Promise<QrVerificationResult> => {
  try {
    console.log('Starting signed QR verification for ID:', qrPayload.data.id);
    
    // Get user's IP address (simulated for demo)
    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => null);

    console.log('Calling verify-signed-qr edge function...');
    
    const { data, error } = await supabase.functions.invoke('verify-signed-qr', {
      body: {
        qrData: qrPayload.data,
        signature: qrPayload.sig,
        deviceId,
        location: consents?.locationAccess ? location : null,
        userAgent: consents?.deviceInfo ? userAgent : null,
        ipAddress: consents?.locationAccess ? ipAddress : null
      }
    });

    if (error) {
      console.error('QR verification error:', error);
      return {
        status: 'error',
        message: 'Failed to verify QR code: ' + error.message
      };
    }

    console.log('Verification response:', data);

    // Add product details to response
    if (data.status === 'first_use' || data.status === 'reused') {
      data.productDetails = {
        id: qrPayload.data.id,
        name: qrPayload.data.name,
        batch: qrPayload.data.batch,
        expiry: qrPayload.data.exp
      };
    }

    return data;
  } catch (error) {
    console.error('Error in QR verification:', error);
    return {
      status: 'error',
      message: 'Verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};

export const parseQrCode = (qrString: string): SignedQrPayload | null => {
  try {
    console.log('Parsing QR code string length:', qrString.length);
    const parsed = JSON.parse(qrString);
    
    // Validate required fields
    if (!parsed.data || !parsed.sig) {
      console.log('Missing data or sig fields');
      return null;
    }

    if (!parsed.data.id || !parsed.data.ts) {
      console.log('Missing required data fields');
      return null;
    }

    console.log('Successfully parsed signed QR payload');
    return parsed as SignedQrPayload;
  } catch (error) {
    console.log('Failed to parse as JSON, not a signed QR:', error);
    return null;
  }
};

export const generateMockSignedQr = async (): Promise<string> => {
  try {
    console.log('Generating real signed QR for demo');
    
    // First, ensure we have a demo product in the database
    const demoProduct = {
      id: 'demo-product-uuid',
      product_name: 'Finolex PVC Pipe 4 inch',
      barcode: 'FIN123456789',
      batch_number: 'B2024-001',
      expiry_date: '2026-01-15',
      manufacturing_date: '2024-01-15'
    };

    // Check if demo product exists, if not create it
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('barcode', demoProduct.barcode)
      .single();

    if (!existingProduct) {
      console.log('Creating demo product in database');
      await supabase.from('products').insert(demoProduct);
    }

    // Generate signed QR using the edge function
    console.log('Calling generate-signed-qr edge function');
    const { data, error } = await supabase.functions.invoke('generate-signed-qr', {
      body: {
        productId: existingProduct?.id || demoProduct.id,
        batchNumber: demoProduct.batch_number
      }
    });

    if (error) {
      console.error('Error generating signed QR:', error);
      throw new Error('Failed to generate signed QR: ' + error.message);
    }

    console.log('Real signed QR generated successfully');
    return data.qrPayload;

  } catch (error) {
    console.error('Error in generateMockSignedQr:', error);
    
    // Fallback to a basic structure if edge function fails
    const fallbackQrPayload: SignedQrPayload = {
      data: {
        id: "FIN123456789",
        productId: "demo-product-uuid",
        batch: "B2024-001",
        name: "Finolex PVC Pipe 4 inch",
        ts: Math.floor(Date.now() / 1000),
        exp: "2026-01-15"
      },
      sig: "fallback-signature-for-testing-only"
    };

    return JSON.stringify(fallbackQrPayload);
  }
};
