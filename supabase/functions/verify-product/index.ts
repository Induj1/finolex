
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  barcode?: string;
  qr_code?: string;
  scan_location?: string;
  device_fingerprint?: string;
  captcha_token?: string;
  timestamp_data?: {
    scan_initiated: number;
    captcha_completed: number;
    camera_ready: number;
    scan_completed: number;
    total_duration: number;
  };
  browser_info?: {
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
  };
  geolocation_accuracy?: number;
  camera_snapshot?: string;
  user_consents: {
    basicVerification: boolean;
    locationAccess: boolean;
    cameraSnapshot: boolean;
    deviceInfo: boolean;
    timestampLogging: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const requestData: VerifyRequest = await req.json()
    
    const { 
      barcode, 
      qr_code, 
      scan_location, 
      device_fingerprint, 
      captcha_token,
      timestamp_data,
      browser_info,
      geolocation_accuracy,
      camera_snapshot,
      user_consents
    } = requestData
    
    console.log('Received verification request:', { 
      barcode: !!barcode, 
      qr_code: !!qr_code, 
      has_captcha: !!captcha_token,
      has_consents: !!user_consents 
    })

    if (!captcha_token) {
      console.log('Missing CAPTCHA token')
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user_consents) {
      console.log('Missing user consents')
      return new Response(
        JSON.stringify({ error: 'User consent is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!barcode && !qr_code) {
      console.log('Missing barcode and QR code')
      return new Response(
        JSON.stringify({ error: 'Either barcode or qr_code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()
    
    // Extract IP address properly
    const rawIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const clientIP = rawIP.split(',')[0].trim()
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log('Processing scan request:', { 
      barcode, 
      qr_code, 
      clientIP, 
      device_fingerprint,
      has_snapshot: !!camera_snapshot,
      consents: user_consents
    })

    // Enhanced rate limiting - more strict for suspicious activity
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    
    let recentScans = 0
    try {
      const { count, error: rateLimitError } = await supabase
        .from('scan_logs')
        .select('*', { count: 'exact', head: true })
        .or(`ip_address.eq.${clientIP},device_fingerprint.eq.${device_fingerprint}`)
        .gte('created_at', oneMinuteAgo)

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError)
      } else {
        recentScans = count || 0
      }
    } catch (error) {
      console.error('Rate limiting query failed:', error)
      recentScans = 0
    }

    // Calculate anomaly score based on various factors
    let anomalyScore = 0
    let securityFlag: 'low_risk' | 'medium_risk' | 'high_risk' = 'low_risk'

    // Anomaly detection factors
    if (recentScans >= 5) {
      anomalyScore += 0.3
    }

    if (timestamp_data && timestamp_data.total_duration < 5000) {
      anomalyScore += 0.2 // Too fast scanning
    }

    if (browser_info && browser_info.user_agent.includes('bot')) {
      anomalyScore += 0.5 // Bot-like user agent
    }

    if (geolocation_accuracy && geolocation_accuracy > 1000) {
      anomalyScore += 0.1 // Low location accuracy
    }

    // Set security flag based on anomaly score
    if (anomalyScore >= 0.7) {
      securityFlag = 'high_risk'
    } else if (anomalyScore >= 0.4) {
      securityFlag = 'medium_risk'
    }

    if (recentScans >= 10) {
      // Log suspicious activity for excessive scanning
      try {
        const { error: suspiciousError } = await supabase.from('suspicious_activities').insert({
          device_fingerprint,
          ip_address: clientIP,
          activity_type: 'rate_limit_exceeded',
          details: { 
            scan_count: recentScans, 
            time_window: '1_minute',
            anomaly_score: anomalyScore,
            user_consents 
          },
          severity: 'high'
        })

        if (suspiciousError) {
          console.error('Error logging suspicious activity:', suspiciousError)
        }
      } catch (error) {
        console.error('Failed to log suspicious activity:', error)
      }

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Too many requests.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Query product database
    let query = supabase.from('products').select('*')
    
    if (barcode) {
      query = query.eq('barcode', barcode)
    } else if (qr_code) {
      query = query.eq('qr_code', qr_code)
    }

    let product = null
    let productError = null

    try {
      const result = await query.maybeSingle()
      product = result.data
      productError = result.error
    } catch (error) {
      console.error('Product query failed:', error)
      productError = error
    }

    let status: 'genuine' | 'counterfeit' | 'unverified' = 'unverified'
    let productDetails = null

    console.log('Product query result:', { product: !!product, productError })

    if (productError) {
      console.error('Product query error:', productError)
      status = 'unverified'
      securityFlag = 'medium_risk'
      anomalyScore += 0.1
    } else if (!product) {
      console.log('Product not found in database')
      status = 'unverified'
      securityFlag = 'medium_risk'
      anomalyScore += 0.2
    } else {
      console.log('Product found:', product.product_name)
      status = 'genuine'
      productDetails = {
        name: product.product_name,
        batch_no: product.batch_number,
        mfg_date: product.manufacturing_date,
        expiry: product.expiry_date
      }

      // Check location mismatch for additional security
      if (scan_location && product.distribution_locations && user_consents.locationAccess) {
        const isLocationValid = product.distribution_locations.some((loc: string) => 
          loc.toLowerCase().includes(scan_location.toLowerCase()) ||
          scan_location.toLowerCase().includes(loc.toLowerCase())
        )
        
        if (!isLocationValid) {
          securityFlag = 'high_risk'
          anomalyScore += 0.3
          
          // Log location mismatch
          try {
            const { error: locationSuspiciousError } = await supabase.from('suspicious_activities').insert({
              device_fingerprint,
              ip_address: clientIP,
              activity_type: 'location_mismatch',
              details: { 
                scan_location, 
                valid_locations: product.distribution_locations,
                product_id: product.id,
                anomaly_score: anomalyScore
              },
              severity: 'medium'
            })

            if (locationSuspiciousError) {
              console.error('Error logging location mismatch:', locationSuspiciousError)
            }
          } catch (error) {
            console.error('Failed to log location mismatch:', error)
          }
        }
      }
    }

    const responseTime = Date.now() - startTime

    // Enhanced scan logging with new fields
    const scanLogData = {
      barcode: barcode || null,
      qr_code: qr_code || null,
      scan_location,
      device_fingerprint,
      ip_address: clientIP,
      user_agent: userAgent,
      status,
      security_flag: securityFlag,
      response_time_ms: responseTime
    }

    console.log('Logging scan with data:', scanLogData)

    // Log the enhanced scan data
    try {
      const { error: logError } = await supabase.from('scan_logs').insert(scanLogData)

      if (logError) {
        console.error('Error logging scan:', logError)
      } else {
        console.log('Scan logged successfully')
      }
    } catch (error) {
      console.error('Failed to log scan:', error)
    }

    // Store camera snapshot separately if provided (in production, use Supabase Storage)
    if (camera_snapshot && user_consents.cameraSnapshot) {
      console.log('Camera snapshot received for anomaly detection')
      // In production: upload to Supabase Storage and run ML anomaly detection
    }

    const response = {
      status,
      product_details: productDetails,
      security_flag: securityFlag,
      response_time_ms: responseTime,
      anomaly_score: anomalyScore
    }

    console.log('Returning response:', { status, security_flag: securityFlag, response_time: responseTime })

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in verify-product function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
