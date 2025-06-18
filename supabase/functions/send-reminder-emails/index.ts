import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import Brevo from "npm:@getbrevo/brevo@latest";

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
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    console.log("Starting reminder email cron job...");

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const brevoApiKey = Deno.env.get("BREVO_API_KEY");

        if (!brevoApiKey) {
            console.error("BREVO_API_KEY not configured");
            return new Response(JSON.stringify({ error: "Email service not configured" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Initialize Brevo client
        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

        const now = new Date();
        const offsetMs = (5 * 60 + 30) * 60 * 1000; // 5 hours 30 minutes in ms
        const adjustedNow = new Date(now.getTime() + offsetMs);
        const oneMinuteFromNow = new Date(adjustedNow.getTime() + 60000);
        const { data: reminders, error: queryError } = await supabase
            .from("reminders")
            .select(`
        id,
        title,
        description,
        remind_at,
        created_by,
        contact:contacts(first_name, last_name)
      `)
            .eq("completed", false)
            .gte("remind_at", adjustedNow.toISOString())
            .lt("remind_at", oneMinuteFromNow.toISOString());

        if (queryError) {
            console.error("Error querying reminders:", queryError);
            return new Response(JSON.stringify({ error: "Failed to query reminders" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let successCount = 0;
        let errorCount = 0;

        for (const reminder of reminders || []) {
            try {
                const { data: userData, error: userError } = await supabase.auth.admin.getUserById(reminder.created_by);

                if (userError || !userData.user?.email) {
                    console.error(`Failed to get user email for user ${reminder.created_by}:`, userError);
                    errorCount++;
                    continue;
                }

                const userEmail = userData.user.email;

                const contactInfo = reminder.contact
                    ? `\nContact: ${reminder.contact.first_name} ${reminder.contact.last_name}`
                    : "";

                const emailContent = `
Title: ${reminder.title}

${reminder.description ? `Description: ${reminder.description}\n` : ""}${contactInfo}

Reminder Time: ${new Date(reminder.remind_at).toLocaleString()}

This is an automated reminder from your Contact Manager.
        `.trim();

                // Brevo email format
                const sendSmtpEmail = {
                    sender: { name: "Contact Manager", email: "adityagandhi98101@gmail.com" }, // You need to verify this sender on Brevo
                    to: [{ email: userEmail }],
                    subject: `Reminder: ${reminder.title}`,
                    textContent: emailContent,
                };

                await apiInstance.sendTransacEmail(sendSmtpEmail);

                const { error: updateError } = await supabase
                    .from("reminders")
                    .update({ completed: true })
                    .eq("id", reminder.id);

                if (updateError) {
                    console.error(`Failed to mark reminder ${reminder.id} as completed:`, updateError);
                    errorCount++;
                } else {
                    successCount++;
                }
            } catch (error) {
                console.error(`Error processing reminder ${reminder.id}:`, error);
                errorCount++;
            }
        }

        return new Response(
            JSON.stringify({ message: "Reminder emails processed", successCount, errorCount, totalProcessed: reminders?.length || 0 }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in reminder email cron job:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
};

serve(handler);