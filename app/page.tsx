import Image from 'next/image';
import styles from './page.module.css';

import heroImage from '../assets/images/holiday-light-installation-redmond-wa-garage-and-entry-1600w.webp';
import processImage from '../assets/images/holiday-light-installation-technician-rooftop-redmond-wa-1600w.webp';
import displayImage from '../assets/images/christmas-light-installation-redmond-wa-front-yard-home-1600w.webp';

const processSteps = [
  'Book installation',
  'Choose your lighting layout',
  'Professional installation and testing',
  'Maintenance included',
  'Removal and storage after the season',
];

const serviceOptions = [
  'Roofline Only',
  'Roofline + Garage',
  'Roofline + Garage + Windows',
  'Full House Display',
];

const faqs = [
  {
    question: 'Do I need to provide the lights?',
    answer: 'No, we supply professional-grade lighting.',
  },
  {
    question: 'What happens if a bulb goes out?',
    answer: 'We handle maintenance throughout the season.',
  },
  {
    question: 'When do you remove the lights?',
    answer: 'After the holidays, at your scheduled removal time.',
  },
  {
    question: 'Are you insured?',
    answer: 'Yes.',
  },
  {
    question: 'Do you offer storage?',
    answer: 'Yes, optional storage is available.',
  },
  {
    question: 'How soon can I schedule?',
    answer: 'Booking is first-come, first-served.',
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section id="hero" className={`${styles.section} ${styles.hero}`}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroInner}>
              <h1 className={styles.headline}>
                Professional Christmas Light Installation Without the Risk or Hassle
              </h1>
              <p className={styles.subheadline}>
                Avoid ladders, avoid roof danger, and save time. We install, maintain, remove, and store your lights for a stress-free holiday season.
              </p>
              <div className={styles.ctaGroup}>
                <a className={styles.primaryCta} href="https://calendly.com/ospreyexterior/christmas-light-installation" target="_blank" rel="noreferrer">
                  Book Installation
                </a>
                <a className={styles.secondaryCta} href="tel:14255501727">
                  Call (425) 550-1727
                </a>
              </div>
              <p className={styles.reassurance}>Fully insured. Fast scheduling. Done-for-you service.</p>
            </div>
            <Image
              src={heroImage}
              alt="Professional Christmas lights installed on a Redmond, WA home including roofline and entry lighting"
              priority
              sizes="(min-width: 960px) 540px, 100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </section>

      <section id="trust" className={styles.section}>
        <div className={styles.container}>
          <p className={styles.trust}>
            Trusted local service for homeowners who want a clean, professional installation with zero risk and zero effort.
          </p>
        </div>
      </section>

      <section id="value" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Homeowners Choose Osprey Exterior</h2>
          <ul className={styles.valueList}>
            <li className={styles.valueItem}>No ladders, no risk</li>
            <li className={styles.valueItem}>Professional installation and routing</li>
            <li className={styles.valueItem}>Maintenance included during the season</li>
            <li className={styles.valueItem}>Fast removal after the holidays</li>
            <li className={styles.valueItem}>Storage options available</li>
            <li className={styles.valueItem}>Fully insured and safety-focused</li>
          </ul>
        </div>
      </section>

      <section id="process" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.processGrid}>
            {processSteps.map((step, index) => (
              <div key={step} className={styles.processStep}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="service-options" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Choose Your Display</h2>
          <div className={styles.serviceOptions}>
            {serviceOptions.map((option) => (
              <div key={option} className={styles.serviceCard}>
                {option}
              </div>
            ))}
          </div>
          <div className={styles.serviceCta}>
            <a className={styles.primaryCta} href="https://calendly.com/ospreyexterior/christmas-light-installation" target="_blank" rel="noreferrer">
              Book Installation
            </a>
          </div>
        </div>
      </section>

      <section id="safety" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Stay Safe. Stay Off the Ladder.</h2>
          <div className={styles.displaySection}>
            <div className={styles.displayCopy}>
              Holiday ladder injuries are common. Our team handles the roof work, electrical routing, clips, peaks, and heights so you don’t have to.
            </div>
            <div className={styles.displayImage}>
              <Image
                src={processImage}
                alt="Technician installing holiday lights on a residential roof in Redmond, WA"
                sizes="(min-width: 960px) 520px, 100vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="display" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Clean, Secure, Professional Installation</h2>
          <div className={styles.displaySection}>
            <div className={styles.displayImage}>
              <Image
                src={displayImage}
                alt="Front yard home with professional Christmas light installation in Redmond, WA"
                sizes="(min-width: 960px) 520px, 100vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className={styles.displayCopy}>
              Clean, secure, professional installation designed to hold up through the season.
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.ctaBanner}>
            <h2 className={`${styles.sectionTitle} ${styles.ctaHeading}`}>
              Ready for a Hassle-Free Installation?
            </h2>
            <a className={styles.primaryCta} href="https://calendly.com/ospreyexterior/christmas-light-installation" target="_blank" rel="noreferrer">
              Book Installation
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <div key={faq.question} className={styles.faqItem}>
                <div className={styles.faqQuestion}>{faq.question}</div>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="service-areas" className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Service Areas</h2>
          <p className={styles.serviceAreas}>
            Serving Redmond, Bellevue, Kirkland, Woodinville, Sammamish, Issaquah, Bothell, Medina, and Clyde Hill.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        Osprey Exterior – Professional Christmas Light Installation ·{' '}
        <a href="https://calendly.com/ospreyexterior/christmas-light-installation" target="_blank" rel="noreferrer">
          Book Installation
        </a>{' '}
        · <a href="tel:14255501727">(425) 550-1727</a>
      </footer>
    </main>
  );
}
