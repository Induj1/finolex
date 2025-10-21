
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { productId, batchNumber } = await req.json()

    console.log('Generating signed QR for product:', productId)

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Product not found')
    }

    // Create QR data payload
    const qrData = {
      id: product.barcode || product.qr_code,
      productId: product.id,
      batch: batchNumber || product.batch_number,
      name: product.product_name,
      ts: Math.floor(Date.now() / 1000), // Unix timestamp
      exp: product.expiry_date
    }

    console.log('QR data created:', qrData)

    // Get RSA private key from secrets
    const privateKeyPem = Deno.env.get('RSA_PRIVATE_KEY')
    if (!privateKeyPem) {
      throw new Error('RSA private key not configured')
    }

    console.log('Private key found, proceeding with signing')

    // Sign the QR data using Web Crypto API
    const encoder = new TextEncoder()
    const dataToSign = JSON.stringify(qrData)
    const data = encoder.encode(dataToSign)
    
    console.log('Data to sign length:', data.length)
    
    // Clean and import private key
    const keyData = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\r?\n/g, '')
      .replace(/\s/g, '')
    
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    console.log('Private key imported successfully')

    // Sign the data
    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      cryptoKey,
      data
    )

    console.log('Data signed successfully')

    // Convert signature to base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

    // Create final QR payload
    const qrPayload = {
      data: qrData,
      sig: signatureBase64
    }

    // Store the corresponding public key in the database if it doesn't exist
    // Extract public key from private key for storage
    const publicKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      true,
      ['sign']
    )

    const exportedPublicKey = await crypto.subtle.exportKey('spki', publicKey)
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)))
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`

    // Check if public key exists in database
    const { data: existingKey } = await supabase
      .from('rsa_keys')
      .select('id')
      .eq('key_name', 'primary_signing_key')
      .eq('is_active', true)
      .single()

    if (!existingKey) {
      console.log('Storing public key in database')
      await supabase.from('rsa_keys').insert({
        key_name: 'primary_signing_key',
        public_key: publicKeyPem,
        private_key_hash: btoa(privateKeyPem.substring(0, 100)), // Store hash of first 100 chars for reference
        is_active: true
      })
    }

    // Update product with signed QR data
    const { error: updateError } = await supabase
      .from('products')
      .update({
        signed_qr_data: qrData,
        qr_signature: signatureBase64,
        qr_generated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (updateError) {
      console.error('Error updating product:', updateError)
    }

    console.log('QR generation completed successfully')

    return new Response(
      JSON.stringify({
        qrPayload: JSON.stringify(qrPayload),
        qrData,
        signature: signatureBase64
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error generating signed QR:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
