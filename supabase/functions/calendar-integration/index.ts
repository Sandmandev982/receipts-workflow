
// Follow this setup guide to integrate the Deno runtime and Supabase functions
// https://docs.supabase.com/guides/functions/quickstart

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { google } from "https://esm.sh/googleapis@123.0.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

// OAuth 2.0 configuration for Google Calendar API
const oAuth2Client = new google.auth.OAuth2(
  Deno.env.get("GOOGLE_CLIENT_ID"),
  Deno.env.get("GOOGLE_CLIENT_SECRET"),
  Deno.env.get("GOOGLE_REDIRECT_URI")
);

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 401 
        }
      );
    }

    // Parse request URL to get the endpoint
    const url = new URL(req.url);
    const endpoint = url.pathname.split("/").pop();

    // Handle different endpoints
    switch (endpoint) {
      case "auth-url":
        return handleGetAuthUrl(req);
      case "callback":
        return handleCallback(req, supabaseClient, user.id);
      case "sync-tasks":
        return handleSyncTasks(req, supabaseClient, user.id);
      case "disconnect":
        return handleDisconnect(req, supabaseClient, user.id);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 400 
          }
        );
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});

// Generate Google OAuth URL
async function handleGetAuthUrl(req: Request) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force re-consent to get refresh token
  });

  return new Response(
    JSON.stringify({ url: authUrl }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Handle OAuth callback and store tokens
async function handleCallback(req: Request, supabaseClient: any, userId: string) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response(
      JSON.stringify({ error: "Missing authorization code" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      }
    );
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    
    // Store tokens in Supabase
    const { error } = await supabaseClient
      .from('calendar_integrations')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Redirect to the calendar page with success parameter
    return new Response(
      null,
      { 
        headers: { 
          ...corsHeaders, 
          "Location": "/calendar?connection=success" 
        }, 
        status: 302 
      }
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to authenticate with Google" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
}

// Sync tasks with Google Calendar
async function handleSyncTasks(req: Request, supabaseClient: any, userId: string) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 405 
      }
    );
  }

  try {
    // Get the user's Google Calendar tokens
    const { data: integration, error: integrationError } = await supabaseClient
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Google Calendar not connected" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Set credentials for the OAuth client
    oAuth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    // Get task data from request
    const { taskIds } = await req.json();

    if (!taskIds || !Array.isArray(taskIds)) {
      return new Response(
        JSON.stringify({ error: "Invalid task data" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Get tasks from database
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .in('id', taskIds);

    if (tasksError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Create Google Calendar events for each task
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const results = [];

    for (const task of tasks) {
      // Skip tasks without due dates
      if (!task.due_date) continue;

      // Calculate event duration - default to 1 hour if not specified
      const startTime = new Date(task.due_date);
      if (task.due_time) {
        const [hours, minutes] = task.due_time.split(':').map(Number);
        startTime.setHours(hours, minutes);
      }
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      // Create calendar event
      try {
        const event = {
          summary: task.title,
          description: task.description || '',
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'UTC', // Ideally, use user's timezone
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'UTC', // Ideally, use user's timezone
          },
          reminders: {
            useDefault: true,
          },
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });

        // Store calendar event ID in task
        await supabaseClient
          .from('tasks')
          .update({
            calendar_event_id: response.data.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', task.id);

        results.push({
          taskId: task.id,
          eventId: response.data.id,
          success: true,
        });
      } catch (error) {
        console.error(`Error creating event for task ${task.id}:`, error);
        results.push({
          taskId: task.id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync tasks error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
}

// Disconnect Google Calendar
async function handleDisconnect(req: Request, supabaseClient: any, userId: string) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 405 
      }
    );
  }

  try {
    // Delete the integration record
    const { error } = await supabaseClient
      .from('calendar_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google');

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Disconnect error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
}
