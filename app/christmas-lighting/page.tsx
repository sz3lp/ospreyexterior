import Image from 'next/image';
import Script from 'next/script';
import type { Metadata } from 'next';

import heroRoofline from '../../assets/images/c9-christmas-lights-installed-redmond-wa-roofline-1600w.webp';
import heroEntry from '../../assets/images/holiday-light-installation-redmond-wa-garage-and-entry-1600w.webp';
import heroTechnician from '../../assets/images/holiday-light-installation-technician-rooftop-redmond-wa-1600w.webp';
import galleryGutters from '../../assets/images/c9-christmas-lights-installed-gutters-redmond-wa-1600w.webp';
import galleryGarage from '../../assets/images/c9-christmas-lights-redmond-wa-garage-roofline-1600w.webp';
import galleryFrontYard from '../../assets/images/christmas-light-installation-redmond-wa-front-yard-home-1600w.webp';
import galleryWindows from '../../assets/images/holiday-light-installation-redmond-wa-front-windows-1600w.webp';
import galleryGable from '../../assets/images/christmas-light-installation-redmond-wa-garage-gable-1600w.webp';
import galleryClips from '../../assets/images/christmas-light-installation-gutter-clips-redmond-wa-1600w.webp';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export const metadata: Metadata = {
  title: 'Christmas Lighting Installation in Redmond, WA',
  description:
    'RainWise-certified holiday lighting experts providing custom-cut C9 Christmas lights, safe installation, and end-of-season removal for homes in Redmond, WA.',
  openGraph: {
    title: 'Christmas Lighting Installation in Redmond, WA | Osprey Exterior',
    description:
      'Make your home the highlight of the neighborhood with bespoke Christmas light designs, professional installation, and maintenance from Osprey Exterior.',
    type: 'website',
  },
};

const heroImages = [
  {
    src: heroRoofline,
    alt: 'Roofline outlined with warm white C9 Christmas lights in Redmond, Washington.',
  },
  {
    src: heroEntry,
    alt: 'Holiday lights framing the garage and front entry of a Redmond, Washington home.',
  },
  {
    src: heroTechnician,
    alt: 'Holiday lighting technician securing lights on a rooftop in Redmond, Washington.',
  },
];

const galleryImages = [
  {
    src: galleryGutters,
    alt: 'Warm white C9 bulbs installed along the gutters of a Redmond, WA home.',
  },
  {
    src: galleryGarage,
    alt: 'Custom-cut Christmas lights accenting the roofline of a Redmond, WA garage.',
  },
  {
    src: galleryFrontYard,
    alt: 'Holiday lighting design highlighting the front yard and roofline of a Redmond, WA property.',
  },
  {
    src: galleryWindows,
    alt: 'Christmas lights framing front windows and entryway in Redmond, WA.',
  },
  {
    src: galleryGable,
    alt: 'C9 bulbs accentuating a garage gable in Redmond, WA.',
  },
  {
    src: galleryClips,
    alt: 'Close-up of professional grade gutter clips securing Christmas lights in Redmond, WA.',
  },
];

const faqs = [
  {
    question: 'What areas do you serve for holiday lighting?',
    answer:
      'We install Christmas lights for homeowners throughout Redmond and the greater Eastside, including Sammamish, Woodinville, Kirkland, and Bellevue.',
  },
  {
    question: 'Do you provide the lights and hardware?',
    answer:
      'Yes. We supply commercial-grade C9 LEDs, custom-cut to your roofline with professional clips, timers, and extension cords that are yours to keep for future seasons.',
  },
  {
    question: 'Can you take the lights down after the holidays?',
    answer:
      'Absolutely. End-of-season takedown is included with every installation. We label and pack the lights for easy reinstall next year.',
  },
  {
    question: 'Are you insured to work on my roof?',
    answer:
      'We are licensed, bonded, and fully insured. Our RainWise-certified technicians use harnesses, ladders, and safety gear to protect both your home and our crew.',
  },
];

const processSteps = [
  {
    title: 'Design Consultation',
    description:
      'We meet on-site or virtually to map your roofline, pick bulb colors, and plan outlet usage so your display shines bright all season long.',
  },
  {
    title: 'Custom Fabrication',
    description:
      'Each run of C9 LEDs is measured, cut, and labeled for a seamless fit that eliminates dangling cords and uneven spacing.',
  },
  {
    title: 'Professional Installation',
    description:
      'Our technicians arrive with lift-rated ladders, harnesses, and safety equipment to install your lights securely without damaging gutters or shingles.',
  },
  {
    title: 'In-Season Support',
    description:
      'If a bulb burns out or a storm loosens a strand, we return promptly to keep your home glowing.',
  },
  {
    title: 'Takedown & Storage',
    description:
      'After the holidays we remove, label, and box everything so it is ready to reinstall next year.',
  },
];

export default function ChristmasLightingLandingPage() {
  return (
    <>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}

      {FB_PIXEL_ID && (
        <>
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
            }}
          />
        </>
      )}

      <main className="christmas-page">
        <section className="hero" id="top">
          <div className="container hero__grid">
            <div className="hero__content">
              <span className="eyebrow">Redmond, Washington</span>
              <h1>Custom Christmas Light Installation</h1>
              <p>
                From first sketch to final takedown, Osprey Exterior designs, installs, and maintains
                brilliant holiday lighting displays that make your home the standout of the block.
              </p>
              <div className="cta-group">
                <a className="button button--primary" href="#contact">
                  Request a Quote
                </a>
                <a className="button button--ghost" href="tel:+14254169638">
                  Call (425) 416-9638
                </a>
              </div>
              <ul className="hero__list">
                <li>Commercial-grade C9 LED lighting</li>
                <li>Licensed, bonded, and fully insured</li>
                <li>RainWise-certified exterior specialists</li>
              </ul>
            </div>
            <div className="hero__gallery">
              {heroImages.map((image) => (
                <div className="hero__image" key={image.alt}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    placeholder="blur"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust-bar">
          <div className="container trust-bar__grid">
            <div>
              <h2>Why homeowners choose Osprey Exterior</h2>
              <p>
                We take the worry out of winter decorating with professional safety practices, premium
                materials, and responsive service throughout the holidays.
              </p>
            </div>
            <ul>
              <li>
                <strong>Custom-cut C9 LEDs</strong>
                <span>Perfectly trimmed rooflines with UV-rated bulbs and pro-grade cabling.</span>
              </li>
              <li>
                <strong>Safety-first crews</strong>
                <span>Harnesses, stabilizers, and RainWise-certified technicians on every job.</span>
              </li>
              <li>
                <strong>Season-long support</strong>
                <span>We handle mid-season bulb swaps and weather-related adjustments.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="process" id="process">
          <div className="container">
            <h2>Our turnkey holiday lighting process</h2>
            <div className="process__steps">
              {processSteps.map((step) => (
                <article key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="container services__grid">
            <div className="services__intro">
              <h2>Designs tailored to your home</h2>
              <p>
                Highlight rooflines, dormers, ridgelines, and landscapes with warm white, multi-color, or
                custom patterns. We can sync timers, protect outlets, and coordinate with existing décor.
              </p>
            </div>
            <ul className="services__list">
              <li>
                <h3>Rooflines &amp; Gutters</h3>
                <p>Clean, symmetrical runs secured with removable clips that never damage shingles.</p>
              </li>
              <li>
                <h3>Peaks, Dormers &amp; Gables</h3>
                <p>Precision-cut sections to accent architectural details from the street.</p>
              </li>
              <li>
                <h3>Landscape Lighting</h3>
                <p>Tree wraps, stake lights, and walkway illumination for a complete holiday scene.</p>
              </li>
              <li>
                <h3>Timers &amp; Smart Controls</h3>
                <p>Automatic schedules so your display turns on exactly when you want it to.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="testimonials" id="testimonials">
          <div className="container">
            <h2>Kind words from Eastside homeowners</h2>
            <div className="testimonials__grid">
              <blockquote>
                “Osprey Exterior handled everything—design, install, takedown—and the lights looked
                better than anything we’ve ever done ourselves.”
                <cite>— Chris M., Redmond</cite>
              </blockquote>
              <blockquote>
                “They were on time, friendly, and left our property spotless. We rebooked for next year on
                the spot.”
                <cite>— Alisha R., Sammamish</cite>
              </blockquote>
              <blockquote>
                “Worth every penny for the safety alone. No more climbing ladders in freezing weather.”
                <cite>— Nathan K., Woodinville</cite>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="gallery" id="gallery">
          <div className="container">
            <h2>Recent holiday light installations</h2>
            <div className="gallery__grid">
              {galleryImages.map((image) => (
                <figure key={image.alt}>
                  <div className="gallery__image">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      placeholder="blur"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <figcaption>{image.alt}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="container faq__grid">
            <div>
              <h2>Holiday lighting FAQs</h2>
              <p>
                Transparent pricing, detailed timelines, and professional installation so you can enjoy
                the season without the stress of hanging lights yourself.
              </p>
            </div>
            <dl>
              {faqs.map((item) => (
                <div key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="cta-banner">
          <div className="container">
            <h2>Let&apos;s make your home shine</h2>
            <p>
              Tell us about your vision and we&apos;ll create a lighting plan that fits your home, timeline,
              and budget.
            </p>
            <a className="button button--primary" href="#contact">
              Book a design consultation
            </a>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="container contact__grid">
            <div className="contact__intro">
              <h2>Request your Christmas lighting estimate</h2>
              <p>
                Complete the form and our team will reach out within one business day to schedule a
                consultation and provide transparent pricing.
              </p>
              <ul className="contact__details">
                <li>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+14254169638">(425) 416-9638</a>
                </li>
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:hello@ospreyexterior.com">hello@ospreyexterior.com</a>
                </li>
                <li>
                  <strong>Service Area:</strong> Redmond, Sammamish, Woodinville, Kirkland, Bellevue
                </li>
              </ul>
            </div>
            <form
              className="contact__form"
              method="post"
              action="https://hooks.zapier.com/hooks/catch/21810661/urnoxpo/"
            >
              <input type="hidden" name="service" value="Christmas Lighting" />
              <label>
                Name
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label>
                Email
                <input type="email" name="email" autoComplete="email" required />
              </label>
              <label>
                Phone
                <input type="tel" name="phone" autoComplete="tel" required />
              </label>
              <label>
                Address (City &amp; Neighborhood)
                <input type="text" name="address" autoComplete="address-level2" required />
              </label>
              <label>
                Tell us about your project
                <textarea
                  name="project_details"
                  rows={4}
                  placeholder="Roofline length, colors, trees or architectural features to highlight..."
                  required
                />
              </label>
              <button className="button button--primary" type="submit">
                Submit Request
              </button>
              <p className="contact__fine-print">
                By submitting this form you agree to receive communications about your holiday lighting
                project. We respect your time and privacy—no spam, ever.
              </p>
            </form>
          </div>
        </section>

        <footer className="footer">
          <div className="container footer__grid">
            <div>
              <strong>Osprey Exterior</strong>
              <p>RainWise-certified exterior contractor serving the Greater Seattle area.</p>
            </div>
            <div>
              <p className="footer__license">WA Contractor License: OSPREEX795JS</p>
              <a className="footer__phone" href="tel:+14254169638">
                (425) 416-9638
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
