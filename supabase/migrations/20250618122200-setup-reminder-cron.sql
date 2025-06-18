
-- Schedule the reminder email cron job to run every minute
SELECT cron.schedule(
  'send-reminder-emails',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://srtapnjbpongjmfzijjo.supabase.co/functions/v1/send-reminder-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydGFwbmpicG9uZ2ptZnppampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjQ3ODAsImV4cCI6MjA2NTc0MDc4MH0.CbctoR5wYhowHDdl7V6Ie1NtCABJC6zmmdopZI4pdO0"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
