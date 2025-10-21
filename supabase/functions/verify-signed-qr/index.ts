
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

    const { 
      qrData, 
      signature, 
      deviceId, 
      location, 
      userAgent,
      ipAddress 
    } = await req.json()

    console.log('Received QR verification request for ID:', qrData.id)

    // Get public key from database
    const { data: keyData, error: keyError } = await supabase
      .from('rsa_keys')
      .select('public_key')
      .eq('key_name', 'primary_signing_key')
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      console.error('Public key not found:', keyError)
      throw new Error('Public key not found - signature verification cannot proceed')
    }

    console.log('Public key retrieved from database')

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder()
    const dataToVerify = JSON.stringify(qrData)
    const data = encoder.encode(dataToVerify)
    
    console.log('Data to verify length:', data.length)
    
    // Import public key
    const publicKeyPem = keyData.public_key
    const keyDataClean = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\r?\n/g, '')
      .replace(/\s/g, '')
    
    const binaryKey = Uint8Array.from(atob(keyDataClean), c => c.charCodeAt(0))
    
    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    )

    console.log('Public key imported successfully')

    // Convert signature from base64
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))

    // Verify signature
    const isSignatureValid = await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      cryptoKey,
      signatureBytes,
      data
    )

    console.log('Signature verification result:', isSignatureValid)

    if (!isSignatureValid) {
      console.log('Invalid signature detected')
      
      // Log invalid signature attempt
      await supabase.from('qr_scan_attempts').insert({
        qr_id: qrData.id,
        scan_location: location,
        device_id: deviceId,
        ip_address: ipAddress,
        user_agent: userAgent,
        verification_status: 'signature_invalid'
      })

      return new Response(
        JSON.stringify({ 
          status: 'signature_invalid',
          message: 'Invalid or tampered QR code signature'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('Signature verified successfully')

    // Signature is valid, now check if QR was already scanned
    const { data: existingScans, error: scanError } = await supabase
      .from('qr_scan_tracking')
      .select('*')
      .eq('qr_id', qrData.id)
      .single()

    let verificationStatus = 'first_use'
    let responseData: any = { status: 'first_use' }

    if (existingScans && !scanError) {
      // QR already scanned - this is a reuse
      verificationStatus = 'reused'
      responseData = {
        status: 'reused',
        firstScanTime: existingScans.first_scan_time,
        firstScanLocation: existingScans.first_scan_location,
        scanCount: existingScans.scan_count + 1,
        message: `This QR was first scanned at ${existingScans.first_scan_location || 'unknown location'} on ${new Date(existingScans.first_scan_time).toLocaleString()}`
      }

      // Update scan tracking
      await supabase
        .from('qr_scan_tracking')
        .update({
          scan_count: existingScans.scan_count + 1,
          last_scan_time: new Date().toISOString(),
          last_scan_location: location,
          last_scan_device_id: deviceId,
          last_scan_ip: ipAddress
        })
        .eq('qr_id', qrData.id)

    } else {
      // First time scan
      console.log('First time scan detected')
      
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('barcode', qrData.id)
        .or(`qr_code.eq.${qrData.id}`)
        .single()

      await supabase.from('qr_scan_tracking').insert({
        qr_id: qrData.id,
        product_id: product?.id,
        first_scan_location: location,
        first_scan_device_id: deviceId,
        first_scan_ip: ipAddress,
        last_scan_location: location,
        last_scan_device_id: deviceId,
        last_scan_ip: ipAddress
      })
    }

    // Log this scan attempt
    await supabase.from('qr_scan_attempts').insert({
      qr_id: qrData.id,
      scan_location: location,
      device_id: deviceId,
      ip_address: ipAddress,
      user_agent: userAgent,
      verification_status: verificationStatus
    })

    console.log('Verification completed successfully:', verificationStatus)

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Error verifying QR:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: 'Verification failed: ' + error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
