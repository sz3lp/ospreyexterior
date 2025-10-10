import { Metadata } from 'next';
import { LeadForm } from '@/components/forms/LeadForm';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Understand the terms and conditions for engaging Osprey Exterior for exterior remodeling and maintenance services.'
});

const TermsPage = () => (
  <>
    <section className="section">
      <div className="container-default prose prose-slate max-w-3xl">
        <h1>Terms &amp; Conditions</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        <p>
          These terms outline the expectations for clients partnering with Osprey Exterior. By submitting a project inquiry or
          signing a service agreement, you acknowledge the terms below.
        </p>
        <h2>Estimates &amp; scope</h2>
        <p>
          Estimates are valid for 30 days and may change if the scope evolves or site conditions differ from the initial
          assessment. Final scope will be documented in the project agreement.
        </p>
        <h2>Scheduling</h2>
        <p>
          Project start dates depend on permitting, material availability, and weather conditions. We communicate updates promptly
          and work with you to minimize disruptions.
        </p>
        <h2>Payments</h2>
        <p>
          Payment schedules are outlined in the service agreement and typically include a deposit, progress draws, and a final
          payment upon completion.
        </p>
        <h2>Warranty</h2>
        <p>
          Craftsmanship is backed by our workmanship warranty alongside manufacturer product warranties. Warranty coverage is
          detailed in your final project documentation.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms? Email <a href="mailto:hello@ospreyexterior.com">hello@ospreyexterior.com</a> or call
          (425) 555-0123.
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

export default TermsPage;
