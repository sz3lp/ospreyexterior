#!/usr/bin/env python3
"""
Generate the /problems/gutters/ Problem-Intent Cluster.
Pillar + 25 intent-driven pages. No edits to legacy pages.
"""
import os
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PROBLEMS_DIR = BASE / "problems" / "gutters"
# Root-relative for canonical URLs; relative for local paths
ASSETS_ROOT = "https://ospreyexterior.com/assets"

# Landing-page head for intent pages (same form setup as gutter-cleaning.html)
HEAD_LANDING = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="geo.region" content="US-WA" />
  <meta name="geo.placename" content="Bellevue" />
  <title>{title} | Osprey Exterior</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="https://ospreyexterior.com{canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/landing.css">
  <meta property="og:locale" content="en_US">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Osprey Exterior">
  <meta property="og:title" content="{title} | Osprey Exterior">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="https://ospreyexterior.com{canonical}">
  <meta property="og:image" content="https://ospreyexterior.com{og_image_path}">
  <meta property="og:image:alt" content="{og_image_alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title} | Osprey Exterior">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://ospreyexterior.com{og_image_path}">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P1VX9FY873"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'AW-11395982028');
    gtag('config', 'G-P1VX9FY873');
    function gtag_report_conversion(url) {{
      var callback = function() {{ if (typeof url !== 'undefined') {{ window.location = url; }} }};
      gtag('event', 'conversion', {{ 'send_to': 'AW-11395982028/rBIyCJrlvbQaEMzFg7oq', 'value': 1.0, 'currency': 'USD', 'event_callback': callback }});
      return false;
    }}
  </script>
  <script type="text/javascript" id="hs-script-loader" async defer src="https://js-na2.hs-scripts.com/244291121.js"></script>
  <script type="application/ld+json">{faq_schema}</script>
</head>
<body>'''

# 25 intent pages: slug, title, description, cluster, hero, proof images, causes, faqs
PAGES = [
    # OVERFLOW / DRAINAGE
    {"slug": "why-are-my-gutters-overflowing-redmond-wa", "title": "Why Are My Gutters Overflowing in Redmond WA", "cluster": "overflow",
     "description": "Redmond gutters overflow from clogs, pitch issues, and undersized systems. Learn causes, diagnosis, and professional fixes from Osprey Exterior.",
     "hero": "gutter-filled-with-water-downspout-filter-clogged.webp", "proof": ["gutter-full-of-leaves-before.webp", "gutter-full-of-leaves-after.webp", "gutter-cleaning-and-hanger-replacement-before.webp", "gutter-cleaning-and-hanger-replacement-after.webp"],
     "causes": ["Clogged troughs from fir needles and maple seeds", "Improper pitch creating low spots", "Undersized 5K gutters on large roof planes", "Fascia rot loosening hangers", "Underground drain backup at downspout", "Ice expansion damage from freeze-thaw cycles"],
     "local": "Redmond's tree density—especially Education Hill and Overlake—means fir needles and maple seeds fill gutters faster than most Eastside neighborhoods. Twice-yearly cleaning keeps overflow at bay."},
    {"slug": "why-are-my-gutters-overflowing-in-heavy-rain", "title": "Why Are My Gutters Overflowing in Heavy Rain", "cluster": "overflow",
     "description": "Heavy rain overwhelms gutters when clogs, pitch, or capacity fail. Diagnose and fix overflow before foundation and siding damage.",
     "hero": "gutter-filled-with-water-downspout-filter-clogged.webp", "proof": ["gutter-full-of-leaves-before.webp", "gutter-full-of-leaves-after.webp", "close-up-of-downspout-elbow.webp"],
     "causes": ["Debris blocking flow at downspout openings", "Improper pitch creating standing water", "Undersized system for roof square footage", "Fascia rot causing sag", "Underground drain backup", "Ice dams restricting flow"],
     "local": "Puget Sound atmospheric rivers dump 2+ inches in hours. Seattle's freeze-thaw cycle and Kirkland's lake humidity add stress. Systems sized for October storms perform year-round."},
    {"slug": "why-are-my-gutters-not-draining", "title": "Why Are My Gutters Not Draining", "cluster": "overflow",
     "description": "Gutters that won't drain point to clogs, pitch problems, or downspout blockages. Step-by-step diagnosis and professional fixes.",
     "hero": "close-up-of-downspout-elbow.webp", "proof": ["close-up-of-downspout-strap.webp", "gutter-full-of-leaves-before.webp", "gutter-full-of-leaves-after.webp"],
     "causes": ["Clog at downspout opening or elbow", "Incorrect pitch toward low spots", "Undersized downspouts", "Fascia rot affecting slope", "Underground drain collapse", "Debris cap at gutter guard"],
     "local": "Bellevue and Issaquah homes with heavy tree canopy see downspout elbows clog first. A ladder test and downspout flow check reveal the restriction point."},
    {"slug": "why-are-my-gutters-dripping-from-underneath", "title": "Why Are My Gutters Dripping From Underneath", "cluster": "overflow",
     "description": "Water dripping from under gutters usually means seam or corner joint failure. Learn diagnosis and resealing solutions.",
     "hero": "gutter-resealing-seattle-after.webp", "proof": ["gutter-resealing-seattle-before.webp", "gutter-resealing-seattle-after.webp", "gutter-inside-corner-before.webp", "gutter-inside-corner-after.webp", "cleaned-and-sealed-half-round-gutters.webp"],
     "causes": ["Seam failure at miter joints", "Corner joint separation", "Loose or missing sealant", "Fascia rot behind gutter", "Ice expansion cracking seams", "Age and UV degradation"],
     "local": "Seattle's wet winters and summer dry spells stress gutter seams. Half-round copper and aluminum both need periodic resealing on older installs."},
    {"slug": "why-are-my-gutters-pulling-away-from-the-house", "title": "Why Are My Gutters Pulling Away From the House", "cluster": "overflow",
     "description": "Gutters pulling away signal failing hangers, fascia rot, or ice damage. Professional reattachment and hanger replacement restore stability.",
     "hero": "gutter-falling-off-before.webp", "proof": ["gutter-falling-off-before.webp", "gutter-falling-off-after.webp", "gutter-cleaning-and-hanger-replacement-before.webp", "gutter-cleaning-and-hanger-replacement-after.webp"],
     "causes": ["Rusted or failed hangers", "Fascia rot behind attachment points", "Ice weight pulling brackets", "Undersized hanger spacing", "Screw corrosion", "Wind load on oversized runs"],
     "local": "Kirkland and Redmond lake-effect moisture accelerates hanger rust. Structural hangers and fascia repair often go together."},
    {"slug": "why-are-my-gutters-sagging", "title": "Why Are My Gutters Sagging", "cluster": "overflow",
     "description": "Sagging gutters come from poor pitch, failed hangers, or debris weight. Fix slope and hardware before overflow damages fascia.",
     "hero": "gutter-falling-off-before.webp", "proof": ["gutter-falling-off-before.webp", "gutter-falling-off-after.webp", "readjusting-gutter-height-osprey-exterior.webp"],
     "causes": ["Improper pitch creating low spots", "Failed or spaced hangers", "Debris weight bending trough", "Fascia rot", "Ice accumulation", "Oversized run without mid-span support"],
     "local": "Eastside homes with long rooflines need hangers every 24–36 inches. Pitch adjustments keep channels flowing during back-to-back storms."},
    {"slug": "why-are-my-gutters-spilling-over-the-edges", "title": "Why Are My Gutters Spilling Over the Edges", "cluster": "overflow",
     "description": "Gutters spilling over edges mean clogs, undersizing, or pitch failure. Diagnose and fix before staining and foundation damage.",
     "hero": "extremely-dirty-gutter-exterior-causes-permanent-staining.webp", "proof": ["gutter-full-of-leaves-before.webp", "gutter-full-of-leaves-after.webp", "dirty-gutter-everett-before.webp", "dirty-gutter-everett-after.webp"],
     "causes": ["Clogged troughs", "Improper pitch", "Undersized 5K on large roofs", "Fascia rot affecting slope", "Downspout backup", "Gutter guard acting as dam"],
     "local": "Everett and North King County see heavy needle drop. Clearing and mesh guards reduce spillover and permanent siding stains."},
    # LEAKING / SEAM FAILURE
    {"slug": "why-are-my-gutters-leaking", "title": "Why Are My Gutters Leaking", "cluster": "leaking",
     "description": "Gutter leaks stem from seams, corners, rust, or joints. Identify the source and get professional sealing or replacement.",
     "hero": "gutter-resealing-seattle-after.webp", "proof": ["gutter-resealing-seattle-before.webp", "gutter-resealing-seattle-after.webp", "cleaned-and-sealed-half-round-gutters.webp"],
     "causes": ["Seam failure at miters", "Corner joint separation", "Rust-through on steel", "Loose sealant at joints", "Fascia rot behind gutter", "Ice expansion damage"],
     "local": "Seattle and Bellevue half-round systems need periodic resealing. Copper holds up longer; aluminum benefits from touch-ups every 5–7 years."},
    {"slug": "why-are-my-gutters-leaking-at-the-seams", "title": "Why Are My Gutters Leaking at the Seams", "cluster": "leaking",
     "description": "Seam leaks mean miter failure, sealant breakdown, or expansion damage. Professional resealing or section replacement fixes it.",
     "hero": "gutter-resealing-seattle-after.webp", "proof": ["gutter-resealing-seattle-before.webp", "gutter-resealing-seattle-after.webp", "extremely-dirty-gutter-exterior-causes-permanent-staining.webp"],
     "causes": ["Miter joint separation", "UV and age degrading sealant", "Ice expansion cracking seams", "Thermal cycling", "Improper original install", "Debris trapping moisture"],
     "local": "Pacific Northwest freeze-thaw cycles stress seams. Resealing with quality sealant extends life; section replacement may be needed on older runs."},
    {"slug": "why-are-my-gutters-leaking-at-the-corners", "title": "Why Are My Gutters Leaking at the Corners", "cluster": "leaking",
     "description": "Corner leaks come from open joints, failed sealant, or poor miter fit. Seal or replace corners before siding and fascia damage.",
     "hero": "gutter-inside-corner-after.webp", "proof": ["gutter-inside-corner-before.webp", "gutter-inside-corner-after.webp", "close-up-of-downspout-elbow.webp"],
     "causes": ["Open corner miter joint", "Sealant failure", "Valley water overwhelming corner", "Poor original miter fit", "Ice damage", "Movement from hanger failure"],
     "local": "Roof valleys concentrate flow at inside corners. New miters, sealant, and diverters redirect heavy runoff back into conveyance."},
    {"slug": "why-are-my-gutters-rusting-through", "title": "Why Are My Gutters Rusting Through", "cluster": "leaking",
     "description": "Rust-through on steel gutters leads to leaks and failure. Replace with stainless hardware or upgrade to aluminum or copper.",
     "hero": "rusted-screw-replacement-after.webp", "proof": ["rusted-screw-replacement-before.webp", "rusted-screw-replacement-after.webp", "extremely-dirty-gutter-exterior-causes-permanent-staining.webp"],
     "causes": ["Galvanized steel age", "Scratched coating exposing metal", "Debris holding moisture", "Screw and fastener corrosion", "Acidic runoff from cedar", "Lack of maintenance"],
     "local": "Kirkland's lake humidity and Redmond's tree canopy accelerate rust. Stainless hardware and touch-up sealant extend life; full replacement may be cost-effective."},
    {"slug": "why-are-my-gutters-dripping-at-the-joints", "title": "Why Are My Gutters Dripping at the Joints", "cluster": "leaking",
     "description": "Joint dripping indicates sealant failure or miter separation. Reseal or replace sections before structural damage.",
     "hero": "gutter-inside-corner-after.webp", "proof": ["gutter-inside-corner-before.webp", "gutter-inside-corner-after.webp", "gutter-resealing-seattle-before.webp", "gutter-resealing-seattle-after.webp", "cleaned-and-sealed-half-round-gutters.webp"],
     "causes": ["Sealant breakdown at joints", "Miter separation", "Thermal expansion", "Ice damage", "Debris trapping water", "Original install gaps"],
     "local": "Seattle's wet-dry cycles stress joint sealant. Clean, dry, and reseal with gutter-specific sealant for lasting results."},
    # ICE / FREEZE
    {"slug": "why-are-my-gutters-full-of-ice", "title": "Why Are My Gutters Full of Ice", "cluster": "ice",
     "description": "Ice-filled gutters block drainage and cause ice dams. Learn prevention, gutter guards, and when to call a professional.",
     "hero": "complex-gutter-guard-installation-example.webp", "proof": ["downspout-extension-with-gutter-guard.webp"],
     "causes": ["Clogged gutters holding meltwater", "Poor attic ventilation", "Insufficient insulation", "Gutter guard trapping ice", "Downspout freeze", "North-facing slopes"],
     "local": "Seattle and Eastside freeze-thaw cycles fill gutters with ice. Clean channels and gutter guards reduce ice buildup; roof-level fixes address dams."},
    {"slug": "why-are-my-gutters-frozen-solid", "title": "Why Are My Gutters Frozen Solid", "cluster": "ice",
     "description": "Frozen gutters block all drainage. Prevent with cleaning, guards, and downspout extensions. Know when to wait vs. intervene.",
     "hero": "downspout-extension-with-gutter-guard.webp", "proof": ["close-up-of-downspout-strap.webp"],
     "causes": ["Standing water from clogs", "Downspout freeze", "Poor pitch holding water", "Gutter guard trapping melt", "Extended cold snap", "North-facing exposure"],
     "local": "Kirkland and Redmond see extended freezes. Fall cleaning and downspout extensions reduce standing water that freezes solid."},
    {"slug": "why-are-my-gutters-icing-up", "title": "Why Are My Gutters Icing Up", "cluster": "ice",
     "description": "Gutters icing up signal drainage blockage or attic heat loss. Fix both for winter-ready performance.",
     "hero": "complex-gutter-guard-installation-example.webp", "proof": ["new-downspout-installation.webp"],
     "causes": ["Clogged troughs holding water", "Poor pitch", "Attic heat melting snow into gutters", "Downspout freeze", "Gutter guard design", "Insufficient roof ventilation"],
     "local": "Bellevue and Issaquah hills see varied microclimates. Clean channels and proper ventilation reduce icing."},
    {"slug": "why-are-my-gutters-causing-ice-dams", "title": "Why Are My Gutters Causing Ice Dams", "cluster": "ice",
     "description": "Ice dams form when roof melt refreezes in gutters. Address attic insulation, ventilation, and gutter flow together.",
     "hero": "roof-cleaning-technician-on-roof-redmond-wa-1200w.webp", "proof": ["roof-and-gutter-cleaning-service-redmond-wa-1200w.webp"],
     "causes": ["Attic heat melting snow", "Poor ventilation", "Clogged gutters holding water", "Insufficient insulation", "Complex roof geometry", "North-facing eaves"],
     "local": "Eastside winter storms create ideal ice dam conditions. Roof and gutter cleaning plus attic upgrades address the full picture."},
    {"slug": "how-to-fix-frozen-gutters-in-seattle", "title": "How to Fix Frozen Gutters in Seattle", "cluster": "ice",
     "description": "Frozen gutters in Seattle need safe thawing and prevention. Fall cleaning, guards, and pitch corrections reduce freeze risk.",
     "hero": "readjusting-gutter-height-osprey-exterior.webp", "proof": ["gutter-falling-off-before.webp", "gutter-falling-off-after.webp", "gutter-cleaning-and-hanger-replacement-before.webp", "gutter-cleaning-and-hanger-replacement-after.webp"],
     "causes": ["Clogs holding standing water", "Poor pitch", "Downspout blockage", "Missing extensions", "Hanger failure", "Gutter guard trapping water"],
     "local": "Seattle's freeze-thaw cycle demands fall prep. Clean channels, extend downspouts, and correct pitch before first frost."},
    # BLOCKAGE / DEBRIS
    {"slug": "why-are-my-gutters-clogging-so-fast", "title": "Why Are My Gutters Clogging So Fast", "cluster": "blockage",
     "description": "Fast-clogging gutters point to tree coverage, guard failure, or pitch. Solutions include cleaning frequency and guard upgrades.",
     "hero": "pulling-a-weed-from-gutter-downspout.webp", "proof": ["gutter-full-of-leaves-before.webp", "gutter-full-of-leaves-after.webp"],
     "causes": ["Heavy tree canopy overhead", "Gutter guard acting as dam", "Improper pitch holding debris", "Undersized downspouts", "Maple seeds and fir needles", "Moss and organic growth"],
     "local": "Redmond and Issaquah fir and maple coverage means twice-yearly cleaning. Micro-mesh guards outperform basic screens."},
    {"slug": "why-are-my-gutters-full-of-pine-needles", "title": "Why Are My Gutters Full of Pine Needles", "cluster": "blockage",
     "description": "Pine and fir needles overwhelm basic gutter guards. WA regional solutions: cleaning schedule and premium micro-mesh.",
     "hero": "gutter-full-of-leaves-before.webp", "proof": ["complex-gutter-guard-installation-example.webp"],
     "causes": ["Douglas fir and cedar overhead", "Basic screens letting needles through", "Pitch holding debris", "Lack of cleaning", "Guard mesh too coarse", "Valley concentration"],
     "local": "Pacific Northwest fir needles are a regional SEO advantage. Fine stainless micro-mesh and seasonal cleaning keep channels clear."},
    {"slug": "why-are-my-downspouts-not-draining", "title": "Why Are My Downspouts Not Draining", "cluster": "blockage",
     "description": "Downspouts that won't drain have clogs at the opening, elbow, or underground. Diagnose and clear for free flow.",
     "hero": "close-up-of-downspout-elbow.webp", "proof": ["new-downspout-installation.webp"],
     "causes": ["Clog at gutter outlet", "Elbow blockage", "Underground drain collapse", "Debris cap", "Ice in pipe", "Crushed or disconnected extension"],
     "local": "Bellevue and Kirkland homes with mature trees see elbow clogs first. Flush test and snake reveal the blockage."},
    {"slug": "why-do-my-gutters-smell", "title": "Why Do My Gutters Smell", "cluster": "blockage",
     "description": "Smelly gutters mean organic buildup, stagnant water, or decay. Cleaning and biocide treatment restore fresh flow.",
     "hero": "pulling-a-weed-from-gutter-downspout.webp", "proof": ["gunk-growing-in-gutter-before.webp", "gunk-growing-in-gutter-after.webp"],
     "causes": ["Organic debris decomposition", "Stagnant water in low spots", "Moss and algae growth", "Dead pests or nesting", "Sewer gas backup (rare)", "Lack of flow"],
     "local": "Puget Sound humidity grows moss and algae fast. Flush, treat with biocide, and ensure pitch keeps water moving."},
    # NOISE / WATER BEHAVIOR
    {"slug": "why-are-my-gutters-making-noise", "title": "Why Are My Gutters Making Noise", "cluster": "noise",
     "description": "Gutter noise comes from loose hardware, thermal expansion, or water flow. Tighten and reinforce for quiet performance.",
     "hero": "close-up-of-downspout-strap.webp", "proof": ["gutter-hardware-replacement-lynnwood-before.webp", "gutter-hardware-replacement-lynnwood-after.webp"],
     "causes": ["Loose hangers or straps", "Thermal expansion creaking", "Water hitting metal", "Debris rolling in trough", "Wind movement", "Screw corrosion"],
     "local": "Lynnwood and North King County wind loads stress hardware. Reinforced hangers and stainless straps reduce noise."},
    {"slug": "why-are-my-gutters-banging-in-the-wind", "title": "Why Are My Gutters Banging in the Wind", "cluster": "noise",
     "description": "Banging gutters mean loose hardware or failed hangers. Reattachment and reinforcement stop the noise and prevent detachment.",
     "hero": "gutter-hardware-replacement-lynnwood-before.webp", "proof": ["gutter-hardware-replacement-lynnwood-after.webp", "gutter-falling-off-before.webp", "gutter-falling-off-after.webp"],
     "causes": ["Loose or missing hangers", "Wind load on long runs", "Rusted screws", "Fascia rot", "Insufficient hanger spacing", "Oversized unsupported sections"],
     "local": "Eastside wind tunnels and lake breezes test gutter attachment. Structural hangers every 24–36 inches hold firm."},
    {"slug": "why-do-my-gutters-gurgle-when-it-rains", "title": "Why Do My Gutters Gurgle When It Rains", "cluster": "noise",
     "description": "Gurgling gutters mean water backup from clogs or restriction. Clear blockages for quiet, free flow.",
     "hero": "gutter-filled-with-water-downspout-filter-clogged.webp", "proof": ["close-up-of-downspout-elbow.webp"],
     "causes": ["Clog at downspout opening", "Restricted elbow", "Undersized downspout", "Air trapped in flow", "Gutter guard restriction", "Standing water in low spot"],
     "local": "Heavy rain amplifies gurgling. A downspout flow test and ladder inspection find the restriction."},
    {"slug": "why-is-water-running-behind-my-gutters", "title": "Why Is Water Running Behind My Gutters", "cluster": "noise",
     "description": "Water behind gutters means pitch failure, missing drip edge, fascia issues, or ice dam backup. Fix pitch, drip edge, and attachment for proper drainage.",
     "hero": "readjusting-gutter-height-osprey-exterior.webp", "proof": ["gutter-falling-off-before.webp", "gutter-falling-off-after.webp", "gutter-cleaning-and-hanger-replacement-before.webp", "gutter-cleaning-and-hanger-replacement-after.webp"],
     "causes": ["Improper pitch toward fascia", "Gutter sitting too high", "No drip edge flashing", "Fascia rot behind gutter", "Ice dam backup", "Seam leak behind trough", "Hanger failure allowing tilt"],
     "local": "This converts very well—homeowners see stains and panic. Pitch correction and reattachment route water into the trough."},
]

def faq_schema(faqs):
    main_entity = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main_entity
    }, indent=2)

def default_faqs(page):
    base = [
        (f"What causes {page['title'].lower().replace('why are my ', '').replace('why do my ', '').replace('how to ', '')}?",
         f"Common causes include: {'; '.join(page['causes'][:3])}. A professional inspection identifies the specific issue."),
        ("How do I diagnose the problem?",
         "During or after rain, check for overflow, downspout flow, and visual clues like stains or sagging. A ladder test and downspout flow test reveal blockages or pitch issues."),
        ("When does it become structural?",
         "If you see siding damage, foundation saturation, mold, or roof deck rot, address it immediately. Early fixes cost far less than remediation."),
        ("What professional fixes are available?",
         "Osprey Exterior offers gutter cleaning, re-pitching, seam sealing, section replacement, downspout flush, and full system upgrades. We serve Seattle, Bellevue, Redmond, Kirkland, and Issaquah."),
        ("How do I get an estimate?",
         "Call (425) 550-1727 or use our contact form. We provide fast bids and can often schedule within 48 hours for urgent overflow or leak issues."),
    ]
    return base[:5]

def render_intent_page(page, assets):
    canonical = f"/problems/gutters/{page['slug']}/"
    faqs = default_faqs(page)
    schema = faq_schema(faqs)
    hero_path = f"/assets/images/{page['hero']}"
    og_image_path = f"/assets/images/{page['hero']}"
    page_name = f"{page['title']} | Osprey Exterior"

    proof_html = ""
    if page.get("proof"):
        imgs = page["proof"][:4]
        if len(imgs) >= 2:
            proof_html = f'''<div class="before-after-grid">
            <figure class="before-after-item">
              <div class="before-after-pair">
                <div><img src="/assets/images/{imgs[0]}" alt="Before repair" loading="lazy"><div class="label label-before">Before</div></div>
                <div><img src="/assets/images/{imgs[1]}" alt="After repair" loading="lazy"><div class="label label-after">After</div></div>
              </div>
              <figcaption>Gutter repair result</figcaption>
            </figure>'''
            if len(imgs) >= 4:
                proof_html += f'''
            <figure class="before-after-item">
              <div class="before-after-pair">
                <div><img src="/assets/images/{imgs[2]}" alt="Before" loading="lazy"><div class="label label-before">Before</div></div>
                <div><img src="/assets/images/{imgs[3]}" alt="After" loading="lazy"><div class="label label-after">After</div></div>
              </div>
              <figcaption>Professional fix</figcaption>
            </figure>'''
            proof_html += "</div>"
        else:
            proof_html = '<div class="photo-grid">'
            for img in imgs:
                proof_html += f'<img src="/assets/images/{img}" alt="Gutter repair" loading="lazy">'
            proof_html += "</div>"

    causes_html = "".join(f"<li>{c}</li>" for c in page["causes"])
    faq_html = "".join(f'<dt>{q}</dt><dd>{a}</dd>' for q, a in faqs)

    content = f'''
  <div class="topbar">
    <a href="/" class="topbar-logo"><img src="/assets/images/Osprey-Exterior-Logo3-03-WHITE.png" alt="Osprey Exterior"></a>
    <div class="topbar-right">
      <span class="topbar-license">WA License #OSPREE763QD</span>
      <span class="topbar-phone"><a href="tel:4255501727">(425) 550-1727</a></span>
    </div>
  </div>

  <section class="hero" style="background-image: linear-gradient(120deg, rgba(26, 35, 50, 0.92), rgba(45, 106, 79, 0.75)), url('{hero_path}');">
    <div class="hero-inner">
      <div class="hero-badge">Gutter Problems</div>
      <h1>{page["title"]}</h1>
      <p>Pacific Northwest rain, tree canopy, and freeze-thaw cycles stress gutter systems. If you are seeing this issue, you are not alone—and it is fixable.</p>
      <div class="hero-ctas">
        <a href="tel:4255501727" class="btn-call" onclick="gtag('event','conversion',{{'send_to':'AW-11395982028/rBIyCJrlvbQaEMzFg7oq'}});"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call (425) 550-1727</a>
        <a href="#quote" class="btn-quote">Get a Free Quote</a>
      </div>
    </div>
  </section>

  <div class="trust-strip">
    <div class="trust-item"><svg class="trust-icon" viewBox="0 0 24 24"><path d="M12 2L3 7v6c0 5.25 3.75 10.14 9 11.25C17.25 23.14 21 18.25 21 13V7l-9-5zm-1 15l-4-4 1.41-1.41L11 14.17l5.59-5.59L18 10l-7 7z"/></svg>Licensed & Insured</div>
    <div class="trust-item"><svg class="trust-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>Locally Owned</div>
    <div class="trust-item"><svg class="trust-icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>5-Star Rated</div>
    <div class="trust-item"><svg class="trust-icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>Fast Scheduling</div>
  </div>

  <section class="guide-content">
    <h2>Common causes</h2>
    <p>{page["description"]} Eastside homeowners from Redmond to Kirkland deal with similar issues.</p>
    <ul>{causes_html}</ul>

    <h2>How to diagnose it</h2>
    <p><strong>Visual cues:</strong> Look for overflow during rain, dark streaks on fascia, sagging sections, or standing water in troughs.</p>
    <p><strong>Ladder test:</strong> Safely inspect from a ladder. Check for debris at downspout openings and in elbows.</p>
    <p><strong>Downspout flow test:</strong> Run a hose into the gutter and watch downspout discharge. Slow or no flow means a blockage.</p>

    <h2>When it becomes structural</h2>
    <p>Unaddressed gutter failure leads to siding damage, foundation saturation, mold risk, and roof deck rot. Early intervention costs a fraction of remediation.</p>

    <h2>Professional fix options</h2>
    <p>Osprey Exterior provides: gutter cleaning, re-pitching, seam sealing, section replacement, downspout flush, and full system upgrades. We serve Seattle, Bellevue, Redmond, Kirkland, and Issaquah with fast bids and escrow billing.</p>

    <h2>Local context</h2>
    <p>{page["local"]}</p>

    {proof_html}

    <section class="guide-faq">
      <h2>Frequently asked questions</h2>
      <dl>{faq_html}</dl>
    </section>
  </section>

  <section class="process">
    <div class="process-inner">
      <div class="section-label">How It Works</div>
      <h2>Get Your Gutters Fixed in 3 Steps</h2>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Request a Quote</h3>
          <p>Tell us about your gutter issue and we will give you a clear, honest price.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>We Inspect & Fix</h3>
          <p>Our crew arrives on schedule, inspects the problem, and performs the repair.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Walk Away Protected</h3>
          <p>We document the work and your gutters are ready for the next storm.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="form-section" id="quote">
    <div class="section-label">Free Quote</div>
    <h2>Get Your Quote in Minutes</h2>
    <p>Fill out the form below and we will get back to you same day.</p>

    <div class="quote-form" id="quoteForm">
      <div class="form-row form-row--half">
        <div class="form-group">
          <label for="fname">First Name *</label>
          <input type="text" id="fname" name="fname" required placeholder="Your first name">
        </div>
        <div class="form-group">
          <label for="lname">Last Name</label>
          <input type="text" id="lname" name="lname" placeholder="Your last name">
        </div>
      </div>
      <div class="form-row form-row--half">
        <div class="form-group">
          <label for="phone">Phone *</label>
          <input type="tel" id="phone" name="phone" required placeholder="(425) 555-1234">
        </div>
        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" name="email" required placeholder="you@email.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="address">Property Address *</label>
          <input type="text" id="address" name="address" required placeholder="123 Main St, Redmond, WA">
        </div>
      </div>
      <div class="form-row form-row--half">
        <div class="form-group">
          <label for="stories">Home Stories</label>
          <select id="stories" name="stories">
            <option value="">Select...</option>
            <option value="1">1 Story</option>
            <option value="2">2 Stories</option>
            <option value="3">3+ Stories</option>
          </select>
        </div>
        <div class="form-group">
          <label for="sqft">Approx. Sq Ft</label>
          <select id="sqft" name="sqft">
            <option value="">Select...</option>
            <option value="under-1500">Under 1,500</option>
            <option value="1500-2500">1,500 – 2,500</option>
            <option value="2500-4000">2,500 – 4,000</option>
            <option value="over-4000">Over 4,000</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="notes">Anything else we should know?</label>
          <textarea id="notes" name="notes" placeholder="Describe your gutter issue, last time cleaned, etc."></textarea>
        </div>
      </div>
      <button type="button" class="btn-submit" onclick="handleSubmit()">Get My Free Quote</button>
      <p class="form-note">No spam. No obligation. We typically respond within 2 hours.</p>
    </div>

    <div class="form-success" id="formSuccess">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--osprey-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
      <h3>Quote Request Sent!</h3>
      <p>We will get back to you within 2 hours. Need it faster? Call us at <a href="tel:4255501727" style="color: var(--osprey-green); font-weight: 600;">(425) 550-1727</a></p>
    </div>
  </section>

  <section class="service-area">
    <h2>Serving King & Snohomish County</h2>
    <p>Redmond, Bellevue, Kirkland, Bothell, Woodinville, Kenmore, Sammamish, Issaquah, Lynnwood, Everett, Edmonds, Mountlake Terrace, Mill Creek, Snohomish, Lake Stevens, and surrounding areas.</p>
  </section>

  <section class="final-cta">
    <h2>Ready to Fix Your Gutters?</h2>
    <p>Call now for a free, no-pressure quote.</p>
    <a href="tel:4255501727" class="btn-call" onclick="gtag('event','conversion',{{'send_to':'AW-11395982028/rBIyCJrlvbQaEMzFg7oq'}});"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call (425) 550-1727</a>
  </section>

  <footer class="landing-footer">
    <p>&copy; 2025 Osprey Exterior LLC &nbsp;·&nbsp; WA License #OSPREE763QD &nbsp;·&nbsp; <a href="/gutter-cleaning">Gutter Cleaning</a> &nbsp;·&nbsp; <a href="/gutters.html">Gutter Services</a> &nbsp;·&nbsp; <a href="/problems/gutters/">Gutter Problems</a> &nbsp;·&nbsp; <a href="/contact.html">Contact</a> &nbsp;·&nbsp; <a href="tel:4255501727">(425) 550-1727</a></p>
  </footer>

  <div class="sticky-cta">
    <a href="tel:4255501727" onclick="gtag('event','conversion',{{'send_to':'AW-11395982028/rBIyCJrlvbQaEMzFg7oq'}});"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call Now — (425) 550-1727</a>
  </div>

  <script>
    async function handleSubmit() {{
      const form = document.getElementById('quoteForm');
      const submitBtn = form.querySelector('.btn-submit');
      const fname = document.getElementById('fname').value.trim();
      const lname = document.getElementById('lname').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const address = document.getElementById('address').value.trim();
      const stories = document.getElementById('stories').value;
      const sqft = document.getElementById('sqft').value;
      const notes = document.getElementById('notes').value.trim();

      if (!fname || !phone || !address || !email) {{
        alert('Please fill in your name, email, phone number, and address.');
        return;
      }}

      const messageParts = [{json.dumps(page["title"] + " - quote request")}];
      if (stories) messageParts.push(stories + ' story');
      if (sqft) messageParts.push(sqft + ' sq ft');
      if (notes) messageParts.push(notes);
      const message = messageParts.join(' · ');

      const fullName = [fname, lname].filter(Boolean).join(' ');
      const fields = [
        {{ name: 'full_name', value: fullName }},
        {{ name: 'firstname', value: fname }},
        {{ name: 'lastname', value: lname }},
        {{ name: 'phone', value: phone }},
        {{ name: 'address', value: address }},
        {{ name: 'message', value: message }},
        {{ name: 'email', value: email }}
      ];

      const hutk = document.cookie.split('; ').find(row => row.startsWith('hubspotutk='));
      const context = {{
        pageUri: window.location.href,
        pageName: {json.dumps(page_name)}
      }};
      if (hutk) context.hutk = hutk.split('=')[1];

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {{
        const res = await fetch('/api/hubspot-form', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{ fields, context }})
        }});

        const data = await res.json().catch(() => ({{}}));
        if (!res.ok) {{
          const errMsg = data.errors?.[0]?.message || data.message || 'Submission failed';
          throw new Error(errMsg);
        }}

        form.style.display = 'none';
        document.getElementById('formSuccess').classList.add('active');

        if (typeof gtag_report_conversion === 'function') {{
          gtag_report_conversion();
        }}
      }} catch (err) {{
        console.error('HubSpot submit error:', err);
        alert(err.message || 'Something went wrong. Please call us at (425) 550-1727.');
      }} finally {{
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Free Quote';
      }}
    }}
  </script>
</body>
</html>'''

    head = HEAD_LANDING.format(
        title=page["title"],
        description=page["description"],
        canonical=canonical,
        og_image_path=og_image_path,
        og_image_alt=f"Gutter problem: {page['title']}",
        faq_schema=schema,
    )
    return head + content

def main():
    PROBLEMS_DIR.mkdir(parents=True, exist_ok=True)
    assets_pillar = "../../"
    assets_intent = "../../../"

    # 1. Pillar page
    pillar_html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="geo.region" content="US-WA" />
  <title>Gutter Problems | Overflow, Leaks, Ice &amp; Noise | Osprey Exterior</title>
  <meta name="description" content="Diagnose and fix gutter overflow, leaking seams, ice dams, clogs, and noise. 25 intent-driven guides for Seattle, Bellevue, Redmond, Kirkland, and Issaquah.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../assets/css/styles.css">
  <link rel="canonical" href="https://ospreyexterior.com/problems/gutters/">
  <link rel="manifest" href="/manifest.json">
  <meta property="og:locale" content="en_US">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Osprey Exterior">
  <meta property="og:title" content="Gutter Problems | Overflow, Leaks, Ice &amp; Noise | Osprey Exterior">
  <meta property="og:description" content="Diagnose and fix gutter overflow, leaking seams, ice dams, clogs, and noise. 25 intent-driven guides for Seattle and the Eastside.">
  <meta property="og:url" content="https://ospreyexterior.com/problems/gutters/">
  <meta property="og:image" content="https://ospreyexterior.com/assets/images/readjusting-gutter-height-osprey-exterior.webp">
  <meta name="twitter:card" content="summary_large_image">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P1VX9FY873"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-11395982028');gtag('config','G-P1VX9FY873');</script>
  <script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','841512635074584');fbq('track','PageView');
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Gutter Problems Hub",
    "description": "Intent-driven guides for gutter overflow, leaking, ice dams, clogs, and noise across Seattle and the Eastside.",
    "url": "https://ospreyexterior.com/problems/gutters/",
    "publisher": {"@type": "Organization", "name": "Osprey Exterior", "url": "https://ospreyexterior.com/"}
  }
  </script>
  <script src="https://t.contentsquare.net/uxa/a349e14090bcc.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="/">
        <img src="../../assets/images/Osprey-Exterior-Logo3-01-BLUE.png" alt="Osprey Exterior logo">
        <span class="sr-only">Osprey Exterior home</span>
      </a>
      <nav class="primary-nav">
        <a href="/">Home</a>
        <a href="/real-estate">For Agents</a>
        <a href="/rainwise.html">RainWise &amp; Drainage</a>
        <div class="nav-dropdown">
          <button class="nav-link" type="button" aria-haspopup="true" aria-expanded="false">Exterior Services</button>
          <div class="nav-dropdown-menu">
            <a href="/services.html">Roofing</a>
            <a href="/gutters.html">Gutters</a>
            <a href="/services.html">Washing</a>
            <a href="/holiday-lighting.html">Lighting</a>
          </div>
        </div>
        <a href="/portfolio.html">Portfolio</a>
        <a href="/contact.html" class="btn btn-primary" data-track="nav_cta" data-label="Get a Bid">Get a Bid</a>
      </nav>
    </div>
  </header>
  <main>
    <section class="hero" style="min-height:60vh;background-image:linear-gradient(120deg,rgba(16,32,41,0.9),rgba(76,141,125,0.75)),url('../../assets/images/readjusting-gutter-height-osprey-exterior.webp');">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="highlight">Problem-intent cluster</span>
          <h1>Gutter problems: diagnose and fix</h1>
          <p>Overflow, leaking seams, ice dams, clogs, noise—each has causes, diagnosis steps, and professional fixes. Browse 25 intent-driven guides built for Seattle, Bellevue, Redmond, Kirkland, and Issaquah.</p>
          <div class="hero-ctas">
            <a class="btn btn-primary" href="/contact.html" data-track="problems_cta">Get inspection</a>
            <a class="btn btn-outline" href="/gutters.html">Gutter services</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span>Proof strip</span>
          <h2>Before-and-after curb appeal wins</h2>
          <p>Documented gutter repairs and cleaning from our field crews across the Eastside.</p>
        </div>
        <div class="before-after-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;">
          <figure>
            <div class="before-after-pair">
              <div><img src="../../assets/images/gutter-falling-off-before.webp" alt="Detached gutter before repair" loading="lazy"><span>Before</span></div>
              <div><img src="../../assets/images/gutter-falling-off-after.webp" alt="Reattached gutter after repair" loading="lazy"><span>After</span></div>
            </div>
            <figcaption>Hanging gutter stabilization</figcaption>
          </figure>
          <figure>
            <div class="before-after-pair">
              <div><img src="../../assets/images/gutter-full-of-leaves-before.webp" alt="Clogged gutter before cleaning" loading="lazy"><span>Before</span></div>
              <div><img src="../../assets/images/gutter-full-of-leaves-after.webp" alt="Clean gutter after cleaning" loading="lazy"><span>After</span></div>
            </div>
            <figcaption>Leaf-clogged run cleaned</figcaption>
          </figure>
          <figure>
            <div class="before-after-pair">
              <div><img src="../../assets/images/gutter-inside-corner-before.webp" alt="Open corner joint before seal" loading="lazy"><span>Before</span></div>
              <div><img src="../../assets/images/gutter-inside-corner-after.webp" alt="Sealed corner after repair" loading="lazy"><span>After</span></div>
            </div>
            <figcaption>Inside corner rebuild</figcaption>
          </figure>
          <figure>
            <div class="before-after-pair">
              <div><img src="../../assets/images/gutter-resealing-seattle-before.webp" alt="Leaking seam before reseal" loading="lazy"><span>Before</span></div>
              <div><img src="../../assets/images/gutter-resealing-seattle-after.webp" alt="Sealed seam after repair" loading="lazy"><span>After</span></div>
            </div>
            <figcaption>Seam resealing</figcaption>
          </figure>
        </div>
      </div>
    </section>
    <section class="section section-light">
      <div class="container">
        <div class="section-header">
          <span>Browse by problem</span>
          <h2>25 intent-driven guides</h2>
          <p>Click through to causes, diagnosis, and professional fixes. Each page links to our gutter services and contact.</p>
        </div>
        <div class="card-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));">
          <article class="card">
            <h3>Overflow &amp; drainage</h3>
            <ul class="link-list">
''' + "\n".join(f'              <li><a href="/problems/gutters/{p["slug"]}/">{p["title"].replace(" | Osprey Exterior","")}</a></li>' for p in PAGES if p["cluster"] == "overflow") + '''
            </ul>
          </article>
          <article class="card">
            <h3>Leaking &amp; seams</h3>
            <ul class="link-list">
''' + "\n".join(f'              <li><a href="/problems/gutters/{p["slug"]}/">{p["title"].replace(" | Osprey Exterior","")}</a></li>' for p in PAGES if p["cluster"] == "leaking") + '''
            </ul>
          </article>
          <article class="card">
            <h3>Ice &amp; freeze</h3>
            <ul class="link-list">
''' + "\n".join(f'              <li><a href="/problems/gutters/{p["slug"]}/">{p["title"].replace(" | Osprey Exterior","")}</a></li>' for p in PAGES if p["cluster"] == "ice") + '''
            </ul>
          </article>
          <article class="card">
            <h3>Blockage &amp; debris</h3>
            <ul class="link-list">
''' + "\n".join(f'              <li><a href="/problems/gutters/{p["slug"]}/">{p["title"].replace(" | Osprey Exterior","")}</a></li>' for p in PAGES if p["cluster"] == "blockage") + '''
            </ul>
          </article>
          <article class="card">
            <h3>Noise &amp; water behavior</h3>
            <ul class="link-list">
''' + "\n".join(f'              <li><a href="/problems/gutters/{p["slug"]}/">{p["title"].replace(" | Osprey Exterior","")}</a></li>' for p in PAGES if p["cluster"] == "noise") + '''
            </ul>
          </article>
        </div>
      </div>
    </section>
    <section class="section" id="cta">
      <div class="container">
        <div class="section-header">
          <span>Next step</span>
          <h2>Get a professional assessment</h2>
          <p>Schedule an inspection, seasonal cleaning, or repair estimate. Fast bids and escrow billing available.</p>
        </div>
        <div class="hero-ctas">
          <a class="btn btn-primary" href="/contact.html">Request inspection</a>
          <a class="btn btn-outline" href="/gutters.html">Gutter services</a>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <a class="logo is-inverse" href="/">
          <img src="../../assets/images/Osprey-Exterior-Logo3-03-WHITE.png" alt="Osprey Exterior logo">
          <span class="sr-only">Osprey Exterior home</span>
        </a>
        <div class="brand-badges footer-badges">
          <img src="../../assets/images/Osprey-Exterior-Icon-03-white.png" alt="Osprey Exterior emblem">
        </div>
        <p>Exterior contractor delivering gutters, cisterns, drainage, and compliance installs across Puget Sound.</p>
        <ul class="service-area-list">
          <li><a href="/service-areas/seattle.html">Seattle</a></li>
          <li><a href="/service-areas/bellevue.html">Bellevue</a></li>
          <li><a href="/service-areas/kirkland.html">Kirkland</a></li>
          <li><a href="/service-areas/redmond.html">Redmond</a></li>
          <li><a href="/service-areas/issaquah.html">Issaquah</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-family:var(--font-heading);">Contact</h4>
        <p>Phone: <a href="tel:+14255501727">(425) 550-1727</a></p>
        <p>Email: <a href="mailto:inquiries@ospreyexterior.com">inquiries@ospreyexterior.com</a></p>
        <p>License: OSPREE*763QD · Fully Bonded &amp; Insured.</p>
      </div>
      <div>
        <h4 style="font-family:var(--font-heading);">Resources</h4>
        <p><a href="/gutters.html">Gutter services</a></p>
        <p><a href="/contact.html">Get a bid</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <div>&copy; <span data-year></span> Osprey Exterior. All rights reserved.</div>
      <div class="footer-links">
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
  </footer>
  <script src="/assets/js/tracking.js" defer></script>
  <script src="/assets/js/main.js" defer></script>
</body>
</html>'''

    (PROBLEMS_DIR / "index.html").write_text(pillar_html, encoding="utf-8")
    print(f"Wrote {PROBLEMS_DIR / 'index.html'}")

    # 2. Intent pages
    for page in PAGES:
        slug = page["slug"]
        out_dir = PROBLEMS_DIR / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        html = render_intent_page(page, assets_intent)
        (out_dir / "index.html").write_text(html, encoding="utf-8")
        print(f"Wrote {out_dir / 'index.html'}")

    print(f"\nDone. {len(PAGES) + 1} pages generated.")

if __name__ == "__main__":
    main()
