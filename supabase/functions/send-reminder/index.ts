
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  taskId: string;
  email: string;
  taskTitle: string;
  dueDate: string;
  dueTime?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, email, taskTitle, dueDate, dueTime } = await req.json() as ReminderRequest;

    // Create a Supabase client for accessing the database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // For now, let's simulate sending an email by storing a notification
    const { data, error } = await supabaseClient
      .from("notifications")
      .insert({
        user_id: null, // We'll replace this with the actual user_id in the front end
        title: "Task Reminder",
        message: `Reminder: Your task "${taskTitle}" is due on ${dueDate}${dueTime ? ` at ${dueTime}` : ""}.`,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Created reminder notification for task ${taskId}`);

    return new Response(
      JSON.stringify({
        message: "Reminder notification created successfully",
        data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing reminder:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
