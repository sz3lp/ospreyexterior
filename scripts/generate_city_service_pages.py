import html
import json
import re
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "pages"

HEADER_HTML = dedent(
    """
      <header class=\"site-header\">
        <div class=\"header-inner\">
          <a class=\"logo\" href=\"/\">
            <img src=\"/assets/images/Osprey-Exterior-Logo3-01-BLUE.png\" alt=\"Osprey Exterior logo\">
            <span class=\"sr-only\">Osprey Exterior home</span>
          </a>
          <nav class=\"primary-nav\">
            <a href=\"tel:+14255501727\" class=\"btn btn-primary\" data-track=\"city_service_header_call\">Call (425) 550-1727</a>
          </nav>
        </div>
      </header>
    """
).strip()

FOOTER_HTML = dedent(
    """
      <footer class=\"site-footer\">
        <div class=\"container\">
          <div class=\"footer-grid\">
            <div>
              <a class=\"logo\" href=\"/\">
                <img src=\"/assets/images/Osprey-Exterior-Logo3-01-WHITE.png\" alt=\"Osprey Exterior logo\">
              </a>
              <p>Experts in seamless gutter installation, gutter guards, and exterior water management for the Puget Sound region.</p>
            </div>
            <div>
              <h3>Contact</h3>
              <ul>
                <li><a href=\"tel:+14255501727\">(425) 550-1727</a></li>
                <li><a href=\"mailto:inquiries@ospreyexterior.com\">inquiries@ospreyexterior.com</a></li>
                <li>Seattle, WA 98004</li>
              </ul>
            </div>
            <div>
              <h3>Services</h3>
              <ul>
                <li><a href=\"/gutters.html\">Gutter installations</a></li>
                <li><a href=\"/compliance.html\">Drainage Compliance</a></li>
                <li><a href=\"/service-areas/bellevue.html\">Bellevue service area</a></li>
              </ul>
            </div>
            <div class=\"footer-resources\">
              <h3>Resources</h3>
              <ul>
                <li><a href=\"/blog.html\">Read our maintenance guides</a></li>
                <li><a href=\"/contact.html\">Schedule a consultation</a></li>
                <li><a href=\"/portfolio.html\">View project portfolio</a></li>
              </ul>
            </div>
          </div>
          <p class=\"footer-bottom\">© <span id=\"year\">2024</span> Osprey Exterior. All rights reserved.</p>
        </div>
      </footer>
    """
).strip()

LOCAL_BUSINESS_SCHEMA = {
    "@type": "LocalBusiness",
    "@id": "https://ospreyexterior.com/#localbusiness",
    "name": "Osprey Exterior",
    "image": "https://ospreyexterior.com/assets/images/gutter-full-of-leaves-after.webp",
    "url": "https://ospreyexterior.com/",
    "telephone": "+14255501727",
    "email": "inquiries@ospreyexterior.com",
    "priceRange": "$$",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "10400 NE 4th St",
        "addressLocality": "Bellevue",
        "addressRegion": "WA",
        "postalCode": "98004",
        "addressCountry": "US",
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 47.6101,
        "longitude": -122.2015,
    },
    "areaServed": [
        {"@type": "City", "name": "Bellevue"},
        {"@type": "City", "name": "Redmond"},
        {"@type": "City", "name": "Kirkland"},
        {"@type": "City", "name": "Issaquah"},
    ],
}

GA_SNIPPET = dedent(
    """
      <!-- Google tag (gtag.js) -->
      <script async src=\"https://www.googletagmanager.com/gtag/js?id=AW-11395982028\"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-11395982028');
        gtag('config', 'G-P1VX9FY873');
      </script>
    """
).strip()

META_PIXEL = dedent(
    """
      <!-- Meta Pixel Code -->
      <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '841512635074584');
      fbq('track', 'PageView');
      </script>
      <noscript><img height=\"1\" width=\"1\" style=\"display:none\"
      src=\"https://www.facebook.com/tr?id=841512635074584&ev=PageView&noscript=1\"
      /></noscript>
      <!-- End Meta Pixel Code -->
    """
).strip()

FONTS = dedent(
    """
      <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
      <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
      <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap\" rel=\"stylesheet\">
      <link rel=\"stylesheet\" href=\"/assets/css/styles.css\">
      <link rel=\"manifest\" href=\"/manifest.json\">
      <link rel=\"alternate\" type=\"application/rss+xml\" title=\"Osprey Exterior Insights\" href=\"/rss.xml\">
      <link rel=\"alternate\" type=\"application/feed+json\" title=\"Osprey Exterior Insights\" href=\"/feed.json\">
      <link rel=\"icon\" type=\"image/png\" href=\"/assets/images/favicon.png\" media=\"(prefers-color-scheme: light)\">
      <link rel=\"icon\" type=\"image/png\" href=\"/assets/images/Osprey-Exterior-Icon-03-white.png\" media=\"(prefers-color-scheme: dark)\">
    """
).strip()

SERVICE_CONFIGS = {}


def _base_head(city_slug: str, city_name: str, service_slug: str, service_name: str, title: str, description: str) -> str:
    canonical = f"https://ospreyexterior.com/pages/{city_slug}/{service_slug}/"
    og_image = "https://ospreyexterior.com/assets/images/gutter-full-of-leaves-after.webp"
    ld_json = {
        "@context": "https://schema.org",
        "@graph": [
            LOCAL_BUSINESS_SCHEMA,
            {
                "@type": "Service",
                "@id": f"{canonical}#service",
                "serviceType": service_name,
                "name": f"{service_name} {city_name}",
                "provider": {"@id": "https://ospreyexterior.com/#localbusiness"},
                "areaServed": [{"@type": "City", "name": city_name}],
                "description": description,
                "image": og_image,
            },
        ],
    }
    head = f"""
    <head>
      <meta charset=\"utf-8\">
      <meta http-equiv=\"x-ua-compatible\" content=\"ie=edge\">
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
      <title>{html.escape(title)}</title>
      <meta name=\"description\" content=\"{html.escape(description)}\">
      {FONTS}
      <link rel=\"canonical\" href=\"{canonical}\">
      <meta property=\"og:locale\" content=\"en_US\">
      <meta property=\"og:type\" content=\"website\">
      <meta property=\"og:site_name\" content=\"Osprey Exterior\">
      <meta property=\"og:title\" content=\"{html.escape(title)}\">
      <meta property=\"og:description\" content=\"{html.escape(description)}\">
      <meta property=\"og:url\" content=\"{canonical}\">
      <meta property=\"og:image\" content=\"{og_image}\">
      <meta property=\"og:image:alt\" content=\"Freshly serviced gutters in {html.escape(city_name)}\">
      <meta property=\"og:image:width\" content=\"1600\">
      <meta property=\"og:image:height\" content=\"1067\">
      <meta name=\"twitter:card\" content=\"summary_large_image\">
      <meta name=\"twitter:site\" content=\"@ospreyexterior\">
      <meta name=\"twitter:creator\" content=\"@ospreyexterior\">
      <meta name=\"twitter:title\" content=\"{html.escape(title)}\">
      <meta name=\"twitter:description\" content=\"{html.escape(description)}\">
      <meta name=\"twitter:image\" content=\"{og_image}\">
      {GA_SNIPPET}
      {META_PIXEL}
      <script type=\"application/ld+json\">{json.dumps(ld_json, separators=(",", ":"))}</script>
    </head>
    """
    return dedent(head)


def _form_block(service_slug: str, service_name: str, city_name: str, track_prefix: str) -> str:
    city_html = html.escape(city_name)
    slug_dash = service_slug.replace("-", "_")
    return dedent(
        f"""
        <form class=\"form-card\" id=\"quote\" data-supabase data-event=\"generate_lead\">
          <h2>Request {service_name.lower()} details</h2>
          <p>Share your project scope in {city_html}. We confirm pricing, scheduling, and next steps within one business day.</p>
          <div class=\"form-grid\">
            <div>
              <label for=\"{slug_dash}-name\">Name</label>
              <input id=\"{slug_dash}-name\" name=\"name\" required>
            </div>
            <div>
              <label for=\"{slug_dash}-phone\">Phone</label>
              <input id=\"{slug_dash}-phone\" name=\"phone\" type=\"tel\" required>
            </div>
            <div>
              <label for=\"{slug_dash}-email\">Email</label>
              <input id=\"{slug_dash}-email\" name=\"email\" type=\"email\" required>
            </div>
            <div class=\"form-full\">
              <label for=\"{slug_dash}-details\">Project details</label>
              <textarea id=\"{slug_dash}-details\" name=\"details\" rows=\"4\" placeholder=\"Share roof type, stories, access notes, and ideal timing\"></textarea>
            </div>
          </div>
          <input type=\"hidden\" name=\"service_type\" value=\"{service_name}\">
          <input type=\"hidden\" name=\"geo\" value=\"{city_html}\">
          <button type=\"submit\" class=\"btn btn-primary\" data-track=\"{track_prefix}_form_submit\" data-service-type=\"{service_name}\">Submit</button>
          <p class=\"form-note\">You’ll land on our <a href=\"/thank-you.html\">thank-you page</a>. We never share your information.</p>
        </form>
        """
    ).strip()


def _base_body_top(hero_html: str) -> str:
    return dedent(
        f"""
        <body>
        {HEADER_HTML}
        <main>
        {hero_html}
        """
    ).strip()


def _base_body_bottom(service_slug: str, service_name: str, city_name: str) -> str:
    safe_service = service_name.lower()
    city_html = html.escape(city_name)
    return dedent(
        f"""
        </main>
        {FOOTER_HTML}
        <a class=\"btn btn-primary sticky-cta\" href=\"#quote\" data-track=\"{service_slug}_sticky_cta\" aria-label=\"Request {safe_service} in {city_html}\" data-service-type=\"{service_name}\">Request {service_name.lower()}</a>
        </body>
        </html>
        """
    ).strip() + "\n"


def _hero_block(service_slug: str, service_name: str, city_name: str, intro: str, highlights: list[str]) -> str:
    city_html = html.escape(city_name)
    list_items = "\n".join(f"            <li>{item}</li>" for item in highlights)
    return dedent(
        f"""
        <section class=\"hero\" style=\"background-image: linear-gradient(120deg, rgba(16,32,41,0.92), rgba(26,76,96,0.8)), url('/assets/images/new-downspout-installation.webp');\">
          <div class=\"hero-inner\">
            <div class=\"hero-copy\">
              <p class=\"eyebrow\">Top-Rated Local Service</p>
              <h1>Professional {service_name} in {city_html}</h1>
              <p>{intro}</p>
              <ul class=\"checklist\">
{list_items}
              </ul>
              <div class=\"hero-ctas\">
                <a class=\"btn btn-primary\" href=\"#quote\" data-track=\"{service_slug}_book_top\" data-service-type=\"{service_name}\">Book {service_name.lower()}</a>
                <a class=\"btn btn-outline\" href=\"tel:+14255501727\" data-track=\"{service_slug}_call_top\">Call (425) 550-1727</a>
              </div>
            </div>
            <div class=\"hero-form\">
              {_form_block(service_slug, service_name, city_name, service_slug)}
            </div>
          </div>
        </section>
        """
    ).strip()


def _wrap_page(head: str, body_top: str, sections: list[str], body_bottom: str) -> str:
    return "\n".join(["<!DOCTYPE html>", "<html lang=\"en\">", head, body_top, *sections, body_bottom])


def _city_target_phrase(service_slug: str, city_name: str) -> str:
    phrase = f"{service_slug.replace('-', ' ')} {city_name}".lower()
    return phrase


# Section generators --------------------------------------------------------

def _gutter_cleaning_sections(city_name: str) -> list[str]:
    city_html = html.escape(city_name)
    target_phrase = _city_target_phrase("gutter cleaning", city_name)
    before_after = dedent(
        f"""
        <section class=\"section\" id=\"before-after\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Documented results</span>
              <h2>Before &amp; after gutter cleaning in {city_html}</h2>
              <p>See how <strong>{target_phrase}</strong> visits look when our crew handles the ladders, vacuums, and photo reporting.</p>
            </div>
            <div class=\"gallery\">
              <figure>
                <img src=\"/assets/images/gutter-full-of-leaves-before.webp\" alt=\"Clogged gutter before cleaning in {city_html}\">
                <figcaption>Needles overflowing the trough before service.</figcaption>
              </figure>
              <figure>
                <img src=\"/assets/images/gunk-growing-in-gutter-after.webp\" alt=\"Clean gutter channel after maintenance in {city_html}\">
                <figcaption>Clear channels and flowing downspouts after our visit.</figcaption>
              </figure>
              <figure>
                <img src=\"/assets/images/pulling-a-weed-from-gutter-downspout.webp\" alt=\"Technician clearing a downspout filter in {city_html}\">
                <figcaption>Rope-and-harness access protects steep rooflines.</figcaption>
              </figure>
            </div>
          </div>
        </section>
        """
    ).strip()

    debris_prevention = dedent(
        f"""
        <section class=\"section section-light\" id=\"debris-prevention\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Stay ahead of the mess</span>
              <h2>Debris prevention tailored to {city_html}</h2>
              <p>We track local tree patterns and rainfall so your service plan keeps gutters clear before the next storm cycle.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>Needle-heavy lots</h3>
                <p>Quarterly cleanings paired with mesh guard maintenance stop fir needles from composting inside your gutters.</p>
              </article>
              <article class=\"card\">
                <h3>Storm readiness</h3>
                <p>We flush downspouts and confirm tight seams so atmospheric river events don’t flood fascia or basements.</p>
              </article>
              <article class=\"card\">
                <h3>Homeowner checklist</h3>
                <p>Receive a seasonal reminder email with ladder-free tasks like clearing drains and checking for overflow streaks.</p>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    cta = dedent(
        f"""
        <section class=\"feature-band\" id=\"cta\">
          <div class=\"container\">
            <h2>Book your next gutter cleaning</h2>
            <p>Reserve a crew before the next rainfall alert. We send route ETAs, photo proof, and maintenance notes for your records.</p>
            <div class=\"hero-ctas\">
              <a class=\"btn btn-primary\" href=\"#quote\" data-track=\"gutter-cleaning_cta_book\">Get on the schedule</a>
              <a class=\"btn btn-outline\" href=\"/before-after.html\" data-track=\"gutter-cleaning_cta_gallery\">Browse more results</a>
            </div>
          </div>
        </section>
        """
    ).strip()

    return [before_after, debris_prevention, cta]


def _gutter_installation_sections(city_name: str) -> list[str]:
    city_html = html.escape(city_name)
    product_types = dedent(
        f"""
        <section class=\"section\" id=\"product-types\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Systems that last</span>
              <h2>Seamless gutter profiles designed for {city_html}</h2>
              <p>We fabricate K-style, half-round, and box gutters onsite so every corner matches your roof pitch and trim.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>K-style aluminum</h3>
                <p>Most popular option with baked-on enamel finish. Custom lengths minimize seams and eliminate mid-run leaks.</p>
              </article>
              <article class=\"card\">
                <h3>Steel box gutters</h3>
                <p>Ideal for modern homes and heavy roof volumes. Factory-primed and sealed with high-build elastomeric coatings.</p>
              </article>
              <article class=\"card\">
                <h3>Half-round accents</h3>
                <p>Premium half-round systems with round downspouts that complement Tudor, craftsman, and custom builds.</p>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    colors = dedent(
        f"""
        <section class=\"section section-light\" id=\"color-options\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Match your palette</span>
              <h2>Color options curated for {city_html} neighborhoods</h2>
              <p>We maintain a 30-color coil inventory that mirrors HOA palettes across {city_html}, from heritage browns to modern charcoal.</p>
            </div>
            <div class=\"swatch-grid\" role=\"list\">
              <div class=\"swatch\" role=\"listitem\"><span class=\"swatch-chip swatch-chip--charcoal\"></span><p>Charcoal matte</p></div>
              <div class=\"swatch\" role=\"listitem\"><span class=\"swatch-chip swatch-chip--bronze\"></span><p>Dark bronze</p></div>
              <div class=\"swatch\" role=\"listitem\"><span class=\"swatch-chip swatch-chip--white\"></span><p>Designer white</p></div>
              <div class=\"swatch\" role=\"listitem\"><span class=\"swatch-chip swatch-chip--forest\"></span><p>Evergreen</p></div>
            </div>
          </div>
        </section>
        """
    ).strip()

    warranty = dedent(
        """
        <section class=\"section\" id=\"warranty\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Peace of mind</span>
              <h2>Installation warranty coverage</h2>
              <p>Every seamless gutter system includes workmanship and material protection so you can count on years of reliable drainage.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>10-year workmanship</h3>
                <p>We warrant miters, outlets, and hanger spacing against leaks or separation for a full decade.</p>
              </article>
              <article class=\"card\">
                <h3>Material guarantees</h3>
                <p>Aluminum coil carries a 20-year finish warranty against chalking, chipping, or peeling.</p>
              </article>
              <article class=\"card\">
                <h3>Performance checks</h3>
                <p>Annual tune-ups keep warranties active and include fastener tightening plus seam resealing where required.</p>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    financing = dedent(
        f"""
        <section class=\"feature-band\" id=\"financing\">
          <div class=\"container\">
            <h2>Flexible Financing & Drainage Solutions</h2>
            <p>We help integrate your seamless gutter installation with existing or new stormwater management systems, along with flexible monthly payments starting under $75.</p>
            <div class=\"hero-ctas\">
              <a class=\"btn btn-primary\" href=\"#quote\" data-track=\"gutter-installation_financing_apply\">Review financing options</a>
              <a class=\"btn btn-outline\" href=\"/compliance.html\" data-track=\"gutter-installation_financing_drainage\">See Drainage Compliance Options</a>
            </div>
          </div>
        </section>
        """
    ).strip()
    
    return [product_types, colors, warranty, financing]


def _gutter_repair_sections(city_name: str) -> list[str]:
    city_html = html.escape(city_name)
    problems = dedent(
        f"""
        <section class=\"section\" id=\"common-problems\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Stop the leaks</span>
              <h2>Common gutter repair calls in {city_html}</h2>
              <p>From sagging runs to leaking miters, we resolve the issues that show up most after Pacific Northwest storms.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>Overflowing corners</h3>
                <p>We reseal miters, add outlets, and resize downspouts so water clears faster during peak rainfall.</p>
              </article>
              <article class=\"card\">
                <h3>Detached gutters</h3>
                <p>Rehang sections with hidden hangers and fascia fasteners rated for wet-season loads.</p>
              </article>
              <article class=\"card\">
                <h3>Leaking seams</h3>
                <p>Clean, dry, and seal seams with high-build polyurethane to eliminate drips over entryways.</p>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    checklist = dedent(
        """
        <section class=\"section section-light\" id=\"diagnostic-checklist\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Inspection steps</span>
              <h2>Diagnostic checklist</h2>
              <p>Our repair technicians document each stage so you see exactly what was corrected and why.</p>
            </div>
            <ol class=\"numbered-list\">
              <li>Walk the roofline to photograph damage and map overflow patterns.</li>
              <li>Level and fasten runs to restore proper slope toward outlets.</li>
              <li>Seal seams, splash guards, and penetrations with industrial-grade sealants.</li>
              <li>Flush each downspout and confirm drainage away from the foundation.</li>
              <li>Deliver a photo report with maintenance recommendations.</li>
            </ol>
          </div>
        </section>
        """
    ).strip()

    form_cta = dedent(
        f"""
        <section class=\"feature-band\" id=\"repair-cta\">
          <div class=\"container\">
            <h2>Schedule gutter repair</h2>
            <p>Submit photos or a quick summary. We prioritize active leaks in {city_html} within 24 hours.</p>
            <div class=\"hero-ctas\">
              <a class=\"btn btn-primary\" href=\"#quote\" data-track=\"gutter-repair_cta_book\">Request repair visit</a>
              <a class=\"btn btn-outline\" href=\"/portfolio.html#projects\" data-track=\"gutter-repair_cta_portfolio\">See repair highlights</a>
            </div>
          </div>
        </section>
        """
    ).strip()

    return [problems, checklist, form_cta]


def _gutter_guard_sections(city_name: str) -> list[str]:
    city_html = html.escape(city_name)
    pros_cons = dedent(
        """
        <section class=\"section\" id=\"pros-cons\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Make the right call</span>
              <h2>Pros and cons of gutter guards</h2>
              <p>Understand the tradeoffs between guard styles so your upgrade balances maintenance and budget.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>Pros</h3>
                <ul>
                  <li>Reduce manual cleanings by up to 75%.</li>
                  <li>Keep needles out of downspouts and underground drains.</li>
                  <li>Protect fascia boards from overflow staining.</li>
                </ul>
              </article>
              <article class=\"card\">
                <h3>Cons</h3>
                <ul>
                  <li>Require annual rinsing to remove pollen and moss dust.</li>
                  <li>Improper install can void roof warranties.</li>
                  <li>Budget guards may collapse under snow loads.</li>
                </ul>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    comparison = dedent(
        f"""
        <section class=\"section section-light\" id=\"system-comparison\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Choose your system</span>
              <h2>Gutter guard comparison for {city_html}</h2>
              <p>We field-test guards under cedar, maple, and fir trees so you know what performs in real {city_html} weather.</p>
            </div>
            <div class=\"table-wrapper\">
              <table>
                <thead>
                  <tr><th>System</th><th>Best for</th><th>Maintenance</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  <tr><td>Micro-mesh stainless</td><td>Heavy needle drop</td><td>Rinse each spring</td><td>Stops seeds and roof grit from entering gutters.</td></tr>
                  <tr><td>Aluminum perforated</td><td>Mixed tree canopy</td><td>Brush debris yearly</td><td>Handles large leaves while allowing high flow rates.</td></tr>
                  <tr><td>Reverse-curve</td><td>Leaf-heavy lots</td><td>Inspect after storms</td><td>Requires precise pitch and fascia clearance.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        """
    ).strip()

    roi = dedent(
        f"""
        <section class=\"feature-band\" id=\"roi\">
          <div class=\"container\">
            <h2>ROI for gutter guard installation</h2>
            <p>Compare the cost of seasonal cleanings to a guard system and see how quickly the upgrade pays for itself in {city_html}.</p>
            <ul class=\"checklist\">
              <li>Average guard install recoups cost in 2.5 years versus quarterly cleanings.</li>
              <li>Eliminate emergency overflow calls that lead to drywall repairs.</li>
              <li>Boost curb appeal with low-profile edge treatments.</li>
            </ul>
            <div class=\"hero-ctas\">
              <a class=\"btn btn-primary\" href=\"#quote\" data-track=\"gutter-guard-installation_cta_quote\">Start guard estimate</a>
              <a class=\"btn btn-outline\" href=\"/blog/gutter-filter-comparison.html\" data-track=\"gutter-guard-installation_cta_learn\">Review guard comparisons</a>
            </div>
          </div>
        </section>
        """
    ).strip()

    return [pros_cons, comparison, roi]


def _roof_cleaning_sections(city_name: str) -> list[str]:
    city_html = html.escape(city_name)
    moss = dedent(
        f"""
        <section class=\"section\" id=\"moss-removal\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Preserve your roof</span>
              <h2>Moss removal for {city_html} homes</h2>
              <p>We treat and gently agitate moss colonies before they undermine shingles or tile.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>Soft-wash chemistry</h3>
                <p>Eco-friendly detergents neutralize moss without damaging landscaping or RainWise systems.</p>
              </article>
              <article class=\"card\">
                <h3>Manual detail work</h3>
                <p>Brush and rinse techniques protect granules while clearing ridge caps and valleys.</p>
              </article>
              <article class=\"card\">
                <h3>Preventive treatments</h3>
                <p>Zinc and copper strips slow regrowth and extend the time between maintenance visits.</p>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    pressure_safety = dedent(
        """
        <section class=\"section section-light\" id=\"pressure-safety\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Protect your roofline</span>
              <h2>Pressure and safety standards</h2>
              <p>Our technicians follow manufacturer guidelines to clean roofs without voiding warranties.</p>
            </div>
            <div class=\"card-grid\">
              <article class=\"card\">
                <h3>Measured pressure</h3>
                <p>We calibrate soft-wash pumps below 100 PSI to protect shingles and membranes.</p>
              </article>
              <article class=\"card\">
                <h3>Safety tie-offs</h3>
                <p>Certified rope access crew anchors to ridge points and installs temporary lifelines.</p>
              </article>
              <article class=\"card\">
                <h3>Ground protection</h3>
                <p>Tarps and gutter guards protect landscaping while we rinse debris and detergents.</p>
              </article>
            </div>
          </div>
        </section>
        """
    ).strip()

    gallery = dedent(
        f"""
        <section class=\"section\" id=\"roof-gallery\">
          <div class=\"container\">
            <div class=\"section-header\">
              <span>Visual proof</span>
              <h2>Roof cleaning transformations in {city_html}</h2>
              <p>Seasonal maintenance keeps your curb appeal high and extends roof life.</p>
            </div>
            <div class=\"gallery\">
              <figure>
                <img src=\"/assets/images/roof-debris-cleaning-redmond-wa-home-1200w.webp\" alt=\"Roof debris removal underway in {city_html}\">
                <figcaption>Heavy moss and debris loosened with gentle agitation.</figcaption>
              </figure>
              <figure>
                <img src=\"/assets/images/roof-and-gutter-cleaning-service-redmond-wa-1200w.webp\" alt=\"Roof rinsed after cleaning in {city_html}\">
                <figcaption>Clean shingles with intact granules after soft wash.</figcaption>
              </figure>
              <figure>
                <img src=\"/assets/images/roof-cleaning-technician-on-roof-redmond-wa-1200w.webp\" alt=\"Technician performing roof cleaning in {city_html}\">
                <figcaption>Fall protection and gentle rinsing safeguard the structure.</figcaption>
              </figure>
            </div>
          </div>
        </section>
        """
    ).strip()

    return [moss, pressure_safety, gallery]


SERVICE_CONFIGS = {
    "gutter-cleaning": {
        "service_name": "Gutter Cleaning",
        "sections": _gutter_cleaning_sections,
        "description": lambda city: f"Full-service gutter cleaning in {city} with debris removal, downspout flushing, and before-and-after documentation.",
        "intro": lambda city: f"Looking for gutter cleaning in {city}? Our crew hand-scoops debris, vacuums needles, and pressure flushes every downspout before sending a documented report to your inbox.",
        "highlights": [
            "Before-and-after photos for every visit",
            "Downspout flush and flow verification",
            "Seasonal maintenance reminders tailored to your tree canopy",
        ],
    },
    "gutter-installation": {
        "service_name": "Seamless Gutter Installation",
        "sections": _gutter_installation_sections,
        "description": lambda city: f"Custom seamless gutter installation in {city} with onsite fabrication, color-matched finishes, and sturdy gutter covers.",
        "intro": lambda city: f"We design seamless gutter systems for {city} homes and commercial builds, fabricating each run onsite for a perfect fit and immediate performance.",
        "highlights": [
            "Onsite fabrication for exact lengths",
            "Heavy-duty hangers and hidden fasteners",
            "RainWise and drainage integration",
        ],
    },
    "gutter-repair": {
        "service_name": "Gutter Repair",
        "sections": _gutter_repair_sections,
        "description": lambda city: f"Targeted gutter repairs in {city} that stop leaks, rehang sagging runs, and restore drainage before the next storm.",
        "intro": lambda city: f"Active leak in {city}? We diagnose the source, document damage, and complete repairs that keep water moving away from your foundation.",
        "highlights": [
            "Emergency slots for active leaks",
            "Photo documentation before and after",
            "Sealants rated for Pacific Northwest weather",
        ],
    },
    "gutter-guard-installation": {
        "service_name": "Gutter Guard Installation",
        "sections": _gutter_guard_sections,
        "description": lambda city: f"Gutter guard installation in {city} with tested systems that block debris, cut maintenance, and protect your investment.",
        "intro": lambda city: f"Upgrade to gutter guards built for {city} tree cover. We compare systems, install them to manufacturer specs, and document maintenance routines.",
        "highlights": [
            "Micro-mesh, perforated, and reverse-curve options",
            "Annual maintenance plans available",
            "Drainage-friendly installation techniques",
        ],
    },
    "roof-cleaning": {
        "service_name": "Roof Cleaning",
        "sections": _roof_cleaning_sections,
        "description": lambda city: f"Seasonal roof cleaning in {city} focusing on moss removal, gentle washing, and safety-first techniques.",
        "intro": lambda city: f"Seasonal roof cleaning keeps {city} homes protected. We remove moss, rinse debris toward gutters, and leave the roof ready for heavy weather.",
        "highlights": [
            "Soft-wash treatments that protect shingles",
            "Certified rope access technicians",
            "Linked gutter and downspout cleanup",
        ],
    },
}


def extract_city_name(index_path: Path) -> str | None:
    text = index_path.read_text(encoding="utf-8")
    match = re.search(r"<h1>Gutter Cleaning (.*?)</h1>", text)
    if not match:
        return None
    return html.unescape(match.group(1)).strip()


def generate_city_service_page(city_slug: str, city_name: str, service_slug: str, config: dict) -> None:
    service_name: str = config["service_name"]
    description = config["description"](city_name)
    intro = config["intro"](city_name)
    highlights = config["highlights"]
    sections_fn = config["sections"]

    # GSC Report Recommendation: Update Title Tag/Description for better CTR (High Imp, Low CTR section)
    optimized_title = f"{service_name} {city_name} | Fast Quotes & Expert Service"
    optimized_description = (
        f"Stop water damage. Get top-rated, full-service {service_name.lower()} in {city_name}. "
        "Certified installation, full cleanups, and free estimates. Book today."
    )

    head = _base_head(
        city_slug,
        city_name,
        service_slug,
        service_name,
        optimized_title,
        optimized_description,
    )
    hero = _hero_block(service_slug, service_name, city_name, intro, highlights)
    body_top = _base_body_top(hero)
    sections = sections_fn(city_name)
    body_bottom = _base_body_bottom(service_slug, service_name, city_name)

    html_output = _wrap_page(head, body_top, sections, body_bottom)

    target_dir = PAGES_DIR / city_slug / service_slug
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "index.html").write_text(html_output, encoding="utf-8")


def main() -> None:
    for city_dir in sorted(PAGES_DIR.iterdir()):
        if not city_dir.is_dir():
            continue
        index_path = city_dir / "index.html"
        if not index_path.exists():
            continue
        city_name = extract_city_name(index_path)
        if not city_name:
            continue
        for service_slug, config in SERVICE_CONFIGS.items():
            generate_city_service_page(city_dir.name, city_name, service_slug, config)


if __name__ == "__main__":
    main()
