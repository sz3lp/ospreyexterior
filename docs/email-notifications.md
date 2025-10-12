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

2. **Store a `notification_email` column.** In Supabase, add a `notification_email` text column to the `leads` table so the posted value is persisted with each submission.

3. **Send the email.** Create a Supabase automation (trigger function, Edge Function, or webhook) that watches for inserts on the `leads` table and sends the submission details to `notification_email`. Popular options include:
   - A `postgres` trigger that calls `http_post` via the `pg_net` extension to hit an email API such as Postmark, SendGrid, or Resend.
   - A Supabase Edge Function that formats the email and delivers it through your provider of choice.
   - A webhook integration (Zapier, Make, n8n) that sends an email when it receives the Supabase event payload.

4. **Test end-to-end.** Submit the public form, confirm the new row contains `notification_email = "luke@ospreyexterior.com"`, and verify that the automation sends the mail to Luke.

By centralizing the recipient email in the JavaScript configuration, you only need to update it in one place if the contact address ever changes.
