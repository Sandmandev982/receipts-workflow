
// Follow this setup guide to integrate the Deno runtime and Supabase functions
// https://docs.supabase.com/guides/functions/quickstart

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the request body
    const { email, subject, message, taskId, actionUrl } = await req.json();

    // Validate required parameters
    if (!email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // In a production environment, you would integrate with an email service
    // like SendGrid, Mailgun, AWS SES, etc.
    // For this demo, we'll just log the email and return success
    console.log(`Email notification to: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    if (taskId) {
      console.log(`Related Task ID: ${taskId}`);
    }
    
    if (actionUrl) {
      console.log(`Action URL: ${actionUrl}`);
    }

    // Return a success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email notification processed successfully",
        details: {
          recipient: email,
          subject: subject,
          sentAt: new Date().toISOString()
        }
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
