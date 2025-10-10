import { Metadata } from 'next';
import { LeadForm } from '@/components/forms/LeadForm';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Learn how Osprey Exterior collects and protects your information when you engage with our exterior services.'
});

const PrivacyPage = () => (
  <>
    <section className="section">
      <div className="container-default prose prose-slate max-w-3xl">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        <p>
          Osprey Exterior respects your privacy. We collect the information you provide through our contact forms to respond to
          your service inquiries, schedule consultations, and deliver project updates.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li>Contact details such as your name, email address, phone number, and service city.</li>
          <li>Project information that you share to help us scope your exterior needs.</li>
        </ul>
        <h2>How we use your information</h2>
        <p>
          We use the data solely to communicate with you about Osprey Exterior services and to improve our offerings. We do not
          sell your information to third parties.
        </p>
        <h2>Your choices</h2>
        <p>
          You can request updates or deletion of your information at any time by emailing{' '}
          <a href="mailto:hello@ospreyexterior.com">hello@ospreyexterior.com</a>.
        </p>
        <h2>Contact us</h2>
        <p>
          If you have questions about this policy, reach out to us at (425) 555-0123 or{' '}
          <a href="mailto:hello@ospreyexterior.com">hello@ospreyexterior.com</a>.
        </p>
      </div>
    </section>
    <section className="section bg-slate-50/80">
      <div className="container-default">
        <LeadForm />
      </div>
    </section>
  </>
);

export default PrivacyPage;
