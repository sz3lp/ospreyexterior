import Image from 'next/image';

import heroImage from '../../assets/images/christmas-light-installation-redmond-wa-front-yard-home-2400w.webp';
import technicianImage from '../../assets/images/holiday-light-installation-technician-rooftop-redmond-wa-1600w.webp';
import gutterImage from '../../assets/images/c9-christmas-lights-installed-gutters-redmond-wa-1600w.webp';
import rooflineImage from '../../assets/images/c9-christmas-lights-installed-redmond-wa-roofline-1600w.webp';
import garageImage from '../../assets/images/holiday-light-installation-redmond-wa-garage-and-entry-1600w.webp';
import clipImage from '../../assets/images/christmas-light-installation-gutter-clips-redmond-wa-1200w.webp';

const galleryImages = [
  {
    src: rooflineImage,
    alt: 'Roofline trimmed with warm white C9 Christmas lights in Redmond, Washington.',
  },
  {
    src: gutterImage,
    alt: 'Close-up of holiday lights installed along gutters with precise spacing.',
  },
  {
    src: garageImage,
    alt: 'Garage and entryway outlined with professional holiday lighting in Redmond, Washington.',
  },
  {
    src: clipImage,
    alt: 'Technician attaching custom holiday light clips to a gutter system.',
  },
];

export default function ChristmasLightingPage() {
  return (
    <main className="page" id="main-content">
      <section className="hero">
        <div className="hero__image">
          <Image
            src={heroImage}
            alt="Holiday lighting on a home in Redmond, Washington."
            fill
            priority
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          />
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Holiday Lighting Installation</p>
          <h1>Custom Christmas Lights for Redmond &amp; the Eastside</h1>
          <p className="hero__description">
            Turn your home into the warmest glow on the block with premium C9 lighting, tailored designs, and full-service
            installation handled by our RainWise-certified exterior experts.
          </p>
          <div className="hero__cta">
            <a className="button button--primary" href="#quote-form">
              Get a Free Design Quote
            </a>
            <a className="button button--ghost" href="tel:+14254070892">
              Call (425) 407-0892
            </a>
          </div>
          <ul className="hero__trust">
            <li>RainWise-certified exterior contractor</li>
            <li>Fully insured &amp; safety trained crews</li>
            <li>LED, RGB, and custom color palettes</li>
          </ul>
        </div>
      </section>

      <section className="section section--two-column">
        <div className="section__content">
          <h2>Why Homeowners Choose Osprey Exterior for Holiday Lighting</h2>
          <p>
            We translate your ideas into a show-stopping display with durable, commercial-grade components that are custom cut for
            every roofline, gutter, and gable. From the first design mockup to take-down and storage, our team handles each step.
          </p>
          <div className="feature-grid">
            <article className="feature">
              <h3>Design &amp; Renderings</h3>
              <p>
                Visualize your home with a curated lighting plan, complete with color pairings, accent trees, and architectural
                highlights before installation day.
              </p>
            </article>
            <article className="feature">
              <h3>Pro Installation</h3>
              <p>
                Safety-focused technicians use ladder tie-offs, walk-plank systems, and weather-rated clips to protect both your
                home and our crew.
              </p>
            </article>
            <article className="feature">
              <h3>In-Season Support</h3>
              <p>
                If a bulb goes out, we are on call for quick replacements and adjustments—keeping your display shining all season
                long.
              </p>
            </article>
            <article className="feature">
              <h3>January Takedown &amp; Storage</h3>
              <p>
                We label and pack every strand so the next season is as simple as selecting your preferred install date.
              </p>
            </article>
          </div>
        </div>
        <div className="section__media">
          <div className="media-card">
            <Image
              src={technicianImage}
              alt="Osprey Exterior technician securing holiday lighting on a rooftop."
              fill
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        </div>
      </section>

      <section className="section section--accent">
        <div className="section__content section__content--center">
          <h2>Our Holiday Lighting Process</h2>
          <ol className="process-list">
            <li>
              <span className="process-list__step">1.</span>
              <div>
                <h3>Site Visit &amp; Design Consultation</h3>
                <p>
                  We walk the property, measure rooflines, and note electrical access before presenting a custom lighting plan with
                  a transparent quote.
                </p>
              </div>
            </li>
            <li>
              <span className="process-list__step">2.</span>
              <div>
                <h3>Professional Installation</h3>
                <p>
                  Our crew arrives with cut-to-length strands, timers, and specialty clips to create crisp lines and clean
                  transitions around your home.
                </p>
              </div>
            </li>
            <li>
              <span className="process-list__step">3.</span>
              <div>
                <h3>Season-Long Maintenance</h3>
                <p>
                  We proactively check in after major storms and handle service calls within 48 hours to keep your display glowing.
                </p>
              </div>
            </li>
            <li>
              <span className="process-list__step">4.</span>
              <div>
                <h3>Post-Holiday Takedown</h3>
                <p>
                  In January, we label, pack, and store your lights so they are ready for the next celebration—no tangled bins to
                  deal with.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--gallery">
        <div className="section__content">
          <h2>Recent Redmond &amp; Sammamish Installs</h2>
          <p>
            Every project is designed to highlight the architecture of the home, from roof peaks and dormers to entryways and
            landscaping. Explore a few of our recent displays below.
          </p>
        </div>
        <div className="gallery-grid">
          {galleryImages.map((image) => (
            <figure className="gallery-grid__item" key={image.alt}>
              <div className="gallery-grid__media">
                <Image src={image.src} alt={image.alt} fill placeholder="blur" sizes="(max-width: 768px) 100vw, 400px" />
              </div>
              <figcaption>{image.alt}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section section--testimonial">
        <div className="section__content section__content--narrow">
          <blockquote>
            “Osprey Exterior mapped every roofline and tree in our front yard, handled the electrical planning, and delivered a
            magazine-worthy display. The crew even swapped a dim bulb the same night we called.”
          </blockquote>
          <p className="testimonial__attribution">— Taylor M., Redmond Ridge</p>
        </div>
      </section>

      <section className="section section--form" id="quote-form">
        <div className="section__content section__content--form">
          <h2>Request Your Christmas Lighting Quote</h2>
          <p>
            Share a few details and our project manager will reach out within one business day to schedule your on-site design
            consultation.
          </p>
          <form className="form" action="https://hooks.zapier.com/hooks/catch/21810661/urnoxpo/" method="post">
            <input type="hidden" name="source_page" value="Christmas Lighting Landing Page" />
            <label className="form__field">
              <span>Full Name</span>
              <input type="text" name="name" autoComplete="name" required />
            </label>
            <label className="form__field">
              <span>Email</span>
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label className="form__field">
              <span>Phone</span>
              <input type="tel" name="phone" autoComplete="tel" required />
            </label>
            <label className="form__field">
              <span>Service Area</span>
              <input type="text" name="service_area" placeholder="Neighborhood or city" />
            </label>
            <label className="form__field form__field--textarea">
              <span>Project Details</span>
              <textarea name="project_details" rows={4} placeholder="Tell us about the look you’re envisioning." />
            </label>
            <button className="button button--primary" type="submit">
              Send My Request
            </button>
            <p className="form__disclaimer">
              We will never share your information. By submitting, you agree to receive updates related to your project.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
