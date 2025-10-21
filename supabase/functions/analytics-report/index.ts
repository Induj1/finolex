
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const reportType = url.searchParams.get('type') || 'weekly'
    const days = reportType === 'weekly' ? 7 : reportType === 'monthly' ? 30 : 1

    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get scan statistics
    const { data: scanStats } = await supabase
      .rpc('get_scan_statistics', { date_from: dateFrom })

    // Get top counterfeit locations
    const { data: counterfeitLocations } = await supabase
      .from('scan_logs')
      .select('scan_location')
      .eq('status', 'counterfeit')
      .gte('created_at', dateFrom)
      .not('scan_location', 'is', null)

    const locationCounts = counterfeitLocations?.reduce((acc: any, log: any) => {
      acc[log.scan_location] = (acc[log.scan_location] || 0) + 1
      return acc
    }, {})

    const topCounterfeitLocations = Object.entries(locationCounts || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }))

    // Get most scanned products
    const { data: productScans } = await supabase
      .from('scan_logs')
      .select(`
        barcode,
        qr_code,
        products!inner(product_name)
      `)
      .gte('created_at', dateFrom)
      .not('barcode', 'is', null)

    const productCounts = productScans?.reduce((acc: any, scan: any) => {
      const key = scan.barcode || scan.qr_code
      if (!acc[key]) {
        acc[key] = {
          code: key,
          product_name: scan.products?.product_name || 'Unknown',
          count: 0
        }
      }
      acc[key].count += 1
      return acc
    }, {})

    const mostScannedProducts = Object.values(productCounts || {})
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)

    // Get suspicious activities
    const { data: suspiciousActivities } = await supabase
      .from('suspicious_activities')
      .select('*')
      .gte('created_at', dateFrom)
      .order('created_at', { ascending: false })
      .limit(50)

    const report = {
      period: `${days} days`,
      generated_at: new Date().toISOString(),
      scan_statistics: scanStats || {},
      top_counterfeit_locations: topCounterfeitLocations,
      most_scanned_products: mostScannedProducts,
      suspicious_activities: suspiciousActivities || [],
      summary: {
        total_scans: scanStats?.total_scans || 0,
        genuine_rate: scanStats?.genuine_rate || 0,
        counterfeit_rate: scanStats?.counterfeit_rate || 0,
        high_risk_scans: scanStats?.high_risk_scans || 0
      }
    }

    return new Response(
      JSON.stringify(report),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in analytics-report function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
