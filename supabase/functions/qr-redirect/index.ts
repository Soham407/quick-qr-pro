import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRCode {
  id: string;
  destination_url: string;
  status: string;
  type: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.pathname.split('/').pop();

    if (!shortCode) {
      return new Response('Invalid QR code', { status: 400 });
    }

    console.log(`Redirect requested for short code: ${shortCode}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find QR code by short_url
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, destination_url, status, type')
      .eq('short_url', shortCode)
      .single();

    if (qrError || !qrCode) {
      console.error('QR code not found:', qrError);
      return new Response('QR code not found', { status: 404 });
    }

    // Check if QR code is active
    if (qrCode.status !== 'active') {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code Expired</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
              }
              .container {
                text-align: center;
                padding: 2rem;
                max-width: 500px;
              }
              h1 { color: #1e293b; margin-bottom: 1rem; }
              p { color: #64748b; line-height: 1.6; }
              .status { 
                display: inline-block;
                padding: 0.5rem 1rem;
                background: #fee2e2;
                color: #991b1b;
                border-radius: 0.5rem;
                margin-top: 1rem;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ QR Code Expired</h1>
              <p>This QR code is no longer active. The owner needs to renew their subscription to reactivate it.</p>
              <span class="status">Status: ${qrCode.status}</span>
            </div>
          </body>
        </html>
      `;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
        status: 410,
      });
    }

    // Track analytics (async, non-blocking)
    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);
    
    // Get geolocation from CF headers (Cloudflare provides this)
    const cfCountry = req.headers.get('cf-ipcountry') || 'Unknown';
    const cfCity = req.headers.get('cf-ipcity') || 'Unknown';

    // Insert analytics (fire and forget)
    supabase
      .from('qr_analytics')
      .insert({
        qr_code_id: qrCode.id,
        country: cfCountry,
        city: cfCity,
        device_type: deviceType,
      })
      .then(({ error }) => {
        if (error) console.error('Analytics insert error:', error);
      });

    console.log(`Redirecting to: ${qrCode.destination_url}`);

    // Redirect to destination
    return Response.redirect(qrCode.destination_url, 302);

  } catch (error) {
    console.error('Redirect error:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}
