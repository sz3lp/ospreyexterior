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

# Shared head/header/footer - intent pages are one level deeper
HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="geo.region" content="US-WA" />
  <meta name="geo.placename" content="Bellevue" />
  <meta name="geo.position" content="47.6101;-122.2015" />
  <meta name="ICBM" content="47.6101, -122.2015" />
  <title>{title} | Osprey Exterior</title>
  <meta name="description" content="{description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{assets}assets/css/styles.css">
  <link rel="canonical" href="https://ospreyexterior.com{canonical}">
  <link rel="manifest" href="/manifest.json">
  <link rel="alternate" type="application/rss+xml" title="Osprey Exterior Insights" href="/rss.xml">
  <link rel="alternate" type="application/feed+json" title="Osprey Exterior Insights" href="/feed.json">
  <meta property="og:locale" content="en_US">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Osprey Exterior">
  <meta property="og:title" content="{title} | Osprey Exterior">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="https://ospreyexterior.com{canonical}">
  <meta property="og:image" content="https://ospreyexterior.com{og_image_path}">
  <meta property="og:image:alt" content="{og_image_alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ospreyexterior">
  <meta name="twitter:title" content="{title} | Osprey Exterior">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="https://ospreyexterior.com{og_image_path}">
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11395982028"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','AW-11395982028');gtag('config','G-P1VX9FY873');</script>
  <script>
  !function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','841512635074584');fbq('track','PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=841512635074584&ev=PageView&noscript=1"/></noscript>
  <script type="application/ld+json">{faq_schema}</script>
  <script src="https://t.contentsquare.net/uxa/a349e14090bcc.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="/">
        <img src="{assets}assets/images/Osprey-Exterior-Logo3-01-BLUE.png" alt="Osprey Exterior logo">
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
        <a href="/problems/gutters/">Gutter Problems</a>
        <a href="/contact.html" class="btn btn-primary" data-track="nav_cta" data-label="Get a Bid">Get a Bid</a>
      </nav>
    </div>
  </header>
  <main>'''

FOOTER = '''
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <a class="logo is-inverse" href="/">
          <img src="{assets}assets/images/Osprey-Exterior-Logo3-03-WHITE.png" alt="Osprey Exterior logo">
          <span class="sr-only">Osprey Exterior home</span>
        </a>
        <div class="brand-badges footer-badges">
          <img src="{assets}assets/images/Osprey-Exterior-Icon-03-white.png" alt="Osprey Exterior emblem">
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
        <p><a href="/problems/gutters/">Gutter problems hub</a></p>
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
    hero_path = f"{assets}assets/images/{page['hero']}"
    og_image_path = f"/assets/images/{page['hero']}"

    proof_html = ""
    if page.get("proof"):
        proof_html = '<div class="photo-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin:2rem 0;">'
        for img in page["proof"][:4]:
            proof_html += f'<figure><img src="{assets}assets/images/{img}" alt="Gutter repair or cleaning result" loading="lazy" style="width:100%;border-radius:12px;"></figure>'
        proof_html += "</div>"

    causes_html = "".join(f"<li>{c}</li>" for c in page["causes"])

    content = f'''
    <nav aria-label="Breadcrumb" style="margin:1rem 0;">
      <ol itemscope itemtype="https://schema.org/BreadcrumbList" style="list-style:none;padding:0;margin:0;display:flex;gap:0.5rem;font-size:0.9rem;">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="/"><span itemprop="name">Home</span></a></li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="/problems/gutters/"><span itemprop="name">Gutter Problems</span></a></li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span itemprop="name">{page["title"]}</span></li>
      </ol>
    </nav>
    <section class="hero" style="min-height:50vh;background-image:linear-gradient(120deg,rgba(16,32,41,0.9),rgba(76,141,125,0.75)),url('{hero_path}');">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="highlight">Gutter problems</span>
          <h1>{page["title"]}</h1>
          <p>Pacific Northwest rain, tree canopy, and freeze-thaw cycles stress gutter systems. If you are seeing this issue, you are not alone—and it is fixable.</p>
          <div class="hero-ctas">
            <a class="btn btn-primary" href="/contact.html" data-track="problem_cta">Get inspection</a>
            <a class="btn btn-outline" href="/gutters.html">Gutter services</a>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <article style="max-width:800px;">
          <h2>Immediate problem framing</h2>
          <p>{page["description"]} Eastside homeowners from Redmond to Kirkland deal with similar issues. Local climate—wet falls, freeze-thaw winters, heavy tree canopy—makes gutter maintenance non-negotiable.</p>

          <h2>4–6 common causes</h2>
          <ul class="numbered-list">
            {causes_html}
          </ul>

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

          <div class="card" style="margin:2rem 0;padding:1.5rem;background:var(--color-surface-alt);border-radius:16px;">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
              <img src="{assets}assets/images/Osprey-Exterior-Badge-Authority-Trust-Icon-Ice-Blue.png" alt="Osprey Exterior licensed and bonded" style="height:48px;width:auto;">
              <h3 style="margin:0;">Get a professional assessment</h3>
            </div>
            <p>Schedule an inspection, seasonal cleaning, or repair estimate. We document everything for insurance and resale.</p>
            <div class="hero-ctas" style="margin-top:1rem;">
              <a class="btn btn-primary" href="/contact.html">Request inspection</a>
              <a class="btn btn-outline" href="tel:+14255501727">(425) 550-1727</a>
            </div>
          </div>

          <section class="faq" style="margin-top:3rem;">
            <h2>Frequently asked questions</h2>
            <dl>
              {"".join(f'<dt>{q}</dt><dd>{a}</dd>' for q, a in faqs)}
            </dl>
          </section>
        </article>
      </div>
    </section>'''

    head = HEAD.format(
        title=page["title"],
        description=page["description"],
        assets=assets,
        canonical=canonical,
        og_image_path=og_image_path,
        og_image_alt=f"Gutter problem: {page['title']}",
        faq_schema=schema,
    )
    foot = FOOTER.format(assets=assets)
    return head + content + foot

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
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11395982028"></script>
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
