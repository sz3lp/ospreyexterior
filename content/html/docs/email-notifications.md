# Form submission email notifications

The site submits every lead form to Supabase using the logic in [`assets/js/main.js`](../assets/js/main.js). Each payload now includes a `notification_email` field that defaults to `luke@ospreyexterior.com`. To deliver an email notification when new rows arrive:

1. **Expose runtime credentials (optional).** If you prefer not to edit `assets/js/main.js`, you can override the defaults in any page template by adding a script before `assets/js/main.js` loads:
   ```html
   <script>
     window.SUPABASE_CONFIG = {
       url: "https://your-project.supabase.co",
       anonKey: "YOUR_SUPABASE_ANON_KEY",
       table: "leads",
       notificationEmail: "luke@ospreyexterior.com"
     };
   </script>
   ```
   This keeps credentials out of version control while retaining the email address override.

2. **Store a `notification_email` column.** In Supabase, add a `notification_email` text column to the `leads` table so the posted value is persisted with each submission. The SQL below shows the expected structure the frontend code relies on:

   ```sql
   create table if not exists public.leads (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default timezone('utc', now()),
     full_name text,
     email text,
     phone text,
     service_type text,
     city text,
     message text,
     utm_source text,
     geo text,
     notification_email text
   );

   alter table public.leads
     add column if not exists notification_email text;
   ```

   If you are adding the email notifications to an existing project, running only the `alter table` statement is sufficient.

3. **Send the email.** Create a Supabase automation (trigger function, Edge Function, or webhook) that watches for inserts on the `leads` table and sends the submission details to `notification_email`. A sample `pg_net` trigger implementation is included for reference:

   ```sql
   -- requires the pg_net extension: select extensions:install('pg_net');
   create or replace function public.notify_lead_insert()
   returns trigger
   language plpgsql
   security definer
   set search_path = public
   as $$
   begin
     perform net.http_post(
       url := 'https://api.your-email-provider.com/send',
       headers := jsonb_build_object('Content-Type', 'application/json'),
       body := jsonb_build_object(
         'to', new.notification_email,
         'subject', format('New lead from %s', coalesce(new.full_name, 'Osprey Exterior')), 
         'text', format('Service: %s\nCity: %s\nPhone: %s\nMessage: %s', new.service_type, new.city, new.phone, new.message)
       )
     );
     return new;
   end;
   $$;

   drop trigger if exists notify_lead_insert on public.leads;
   create trigger notify_lead_insert
     after insert on public.leads
     for each row execute function public.notify_lead_insert();
   ```

   Replace the `url` and payload shape with the API for your transactional email provider. Popular alternatives include:
   - A `postgres` trigger that calls `http_post` via the `pg_net` extension to hit an email API such as Postmark, SendGrid, or Resend.
   - A Supabase Edge Function that formats the email and delivers it through your provider of choice.
   - A webhook integration (Zapier, Make, n8n) that sends an email when it receives the Supabase event payload.

4. **Test end-to-end.** Submit the public form, confirm the new row contains `notification_email = "luke@ospreyexterior.com"`, and verify that the automation sends the mail to Luke.

By centralizing the recipient email in the JavaScript configuration, you only need to update it in one place if the contact address ever changes.
