
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Reminder {
  id: string;
  title: string;
  description?: string;
  remind_at: string;
  created_by: string;
  contact?: {
    first_name: string;
    last_name: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Starting reminder email cron job...");

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get current time window (current minute)
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60000);

    console.log(`Looking for reminders between ${now.toISOString()} and ${oneMinuteFromNow.toISOString()}`);

    // Query reminders that need to be sent
    const { data: reminders, error: queryError } = await supabase
      .from('reminders')
      .select(`
        id,
        title,
        description,
        remind_at,
        created_by,
        contact:contacts(first_name, last_name)
      `)
      .eq('completed', false)
      .gte('remind_at', now.toISOString())
      .lt('remind_at', oneMinuteFromNow.toISOString());

    if (queryError) {
      console.error("Error querying reminders:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to query reminders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each reminder
    for (const reminder of reminders) {
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(reminder.created_by);
        
        if (userError || !userData.user?.email) {
          console.error(`Failed to get user email for user ${reminder.created_by}:`, userError);
          errorCount++;
          continue;
        }

        const userEmail = userData.user.email;

        // Prepare email content
        const contactInfo = reminder.contact 
          ? `\nContact: ${reminder.contact.first_name} ${reminder.contact.last_name}`
          : "";

        const emailContent = `
Title: ${reminder.title}

${reminder.description ? `Description: ${reminder.description}\n` : ""}${contactInfo}

Reminder Time: ${new Date(reminder.remind_at).toLocaleString()}

This is an automated reminder from your Contact Manager.
        `.trim();

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Contact Manager <reminders@resend.dev>",
          to: [userEmail],
          subject: `Reminder: ${reminder.title}`,
          text: emailContent,
        });

        console.log(`Email sent successfully for reminder ${reminder.id}:`, emailResponse);

        // Mark reminder as completed
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ completed: true })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`Failed to mark reminder ${reminder.id} as completed:`, updateError);
          errorCount++;
        } else {
          successCount++;
          console.log(`Reminder ${reminder.id} marked as completed`);
        }

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Cron job completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        message: "Reminder emails processed",
        successCount,
        errorCount,
        totalProcessed: reminders.length
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in reminder email cron job:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
