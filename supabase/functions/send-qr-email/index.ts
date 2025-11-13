import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, url } = await req.json();

    if (!email || !url) {
      return new Response(
        JSON.stringify({ error: "Email and URL are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: For now, this is a placeholder. To fully implement:
    // 1. Add RESEND_API_KEY to Supabase secrets
    // 2. Uncomment and configure the Resend integration below
    // 3. Generate the QR code as base64 and embed in email
    
    console.log(`Email capture: ${email} for URL: ${url}`);
    
    // EXAMPLE RESEND INTEGRATION (uncomment when RESEND_API_KEY is added):
    /*
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Quick QR <noreply@yourdomain.com>",
        to: [email],
        subject: "Your QR Code from Quick QR",
        html: `
          <h2>Your QR Code is Ready!</h2>
          <p>Here's the QR code you requested for: <strong>${url}</strong></p>
          <p>Sign up at Quick QR to unlock more features like:</p>
          <ul>
            <li>Dynamic QR codes with editable URLs</li>
            <li>Scan analytics</li>
            <li>Custom designs</li>
            <li>And more!</li>
          </ul>
          <p><a href="https://yourdomain.com/signup">Sign Up Now</a></p>
        `,
      }),
    });

    if (!emailRes.ok) {
      throw new Error("Failed to send email via Resend");
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email functionality will be enabled once RESEND_API_KEY is configured" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-qr-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
