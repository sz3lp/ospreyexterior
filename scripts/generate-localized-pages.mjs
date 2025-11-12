import fs from 'fs';
import path from 'path';

const company = {
  name: 'Osprey Exterior',
  url: 'https://ospreyexterior.com/',
  phone: '+14255501727',
  email: 'inquiries@ospreyexterior.com',
  priceRange: '$$',
  street: '10400 NE 4th St',
  locality: 'Bellevue',
  region: 'WA',
  postalCode: '98004',
  country: 'US',
  latitude: 47.6101,
  longitude: -122.2015,
};

const focusLibrary = {
  roofCleaning: {
    heroEyebrow: 'Trusted Roof Cleaning',
    serviceLabel: 'roof cleaning and moss control',
    serviceType: 'Roof Cleaning',
    localChallenge: 'towering evergreens drip needles year-round, and Lake Washington moisture encourages moss colonies that chew through shingles',
    inspection: 'a ladder-to-ridge safety inspection that documents shingle composition, flashing, vents, and skylights before any tools touch your roof',
    method: 'crew members apply soft-wash detergents, agitation pads, and fall-protection tie-offs so every section is clear without voiding manufacturer warranties',
    materials: 'We deploy biodegradable detergents followed by zinc and copper mineral treatments that stop regrowth for twelve to eighteen months.',
    crew: 'Every technician is licensed, insured, and OSHA-trained for steep-slope work, and we stage ground protection to keep landscaping undisturbed.',
    documentation: 'Clients receive photo documentation, moss regrowth monitoring notes, and maintenance recommendations uploaded to their portal the same day.',
    maintenance: 'Annual and semi-annual service plans bundle gutter cleaning and skylight inspections so homeowners never miss a critical maintenance window.',
    closing: 'Booking is simple—submit the estimate form and our project advisor will call within an hour to confirm scope, access, and preferred scheduling.',
    bulletPoints: [
      'Soft-wash roof cleaning that extends shingle life',
      'Biodegradable moss control tailored to Pacific Northwest weather',
      'Documented safety checklist and photo proof for every visit',
    ],
    faq: (locationName) => [
      {
        question: `How often should I plan roof cleaning in ${locationName}?`,
        answer: `Most homes in ${locationName} benefit from annual roof cleaning because our marine climate feeds moss faster than inland communities. If your roof sits beneath dense firs or cedars, we recommend a spring and fall visit to prevent saturation and clogged gutters.`,
      },
      {
        question: 'Will soft washing damage composite shingles?',
        answer: 'No. We avoid pressure washing entirely and rely on low-pressure pumps, specialized detergents, and manual agitation so granules stay intact and warranties remain valid.',
      },
      {
        question: 'Do you clean gutters during the same appointment?',
        answer: 'Yes. Gutter clearing and downspout flushing are included so runoff moves freely and the moss treatment can dry evenly across the roof plane.',
      },
    ],
  },
  gutterCleaning: {
    heroEyebrow: 'Preventative Gutter Service',
    serviceLabel: 'gutter cleaning and downspout flushing',
    serviceType: 'Gutter Cleaning',
    localChallenge: 'storm drains overflow quickly on sloped lots, and wind-driven debris packs gutters with needles and seed pods',
    inspection: 'a full perimeter walkthrough that checks hanger spacing, fascia condition, and ground drainage before removing debris',
    method: 'technicians hand-scoop debris, vacuum remaining silt, and flush each downspout with pressurized water while monitoring flow at curbside drains',
    materials: 'We use on-site containment tarps, gutter scoops, and eco-friendly cleaners to prevent staining walkways or siding.',
    crew: 'Crews arrive in uniform with ladder stabilizers, stand-offs, and gutter tools sized for both K-style and box gutters common in Eastside homes.',
    documentation: 'You receive before-and-after photos, flow-test videos, and a punch list noting any leaks, standing water, or seam separations discovered.',
    maintenance: 'Membership plans include quarterly reminders, discounted add-on services, and emergency call-outs when storms roll through the Puget Sound.',
    closing: 'Our scheduling coordinator confirms your service window, access instructions, and any special requests so you return to a spotless property.',
    bulletPoints: [
      'Debris removal with ladder stabilizers and fall protection',
      'Downspout flushing verified at every discharge point',
      'Detailed report outlining repairs before the next storm',
    ],
    faq: (locationName) => [
      {
        question: `How many gutter cleanings does a ${locationName} home need each year?`,
        answer: `Most properties in ${locationName} schedule service twice yearly—in late spring after pollen drop and again in late fall after leaf fall. Homes bordering dense greenbelts may need a mid-winter visit as well.`,
      },
      {
        question: 'Can you service three-story homes safely?',
        answer: 'Yes. Our crews carry lift-compatible equipment, tie-offs, and stabilizers that keep technicians secured even on steep slopes or tall modern builds.',
      },
      {
        question: 'Do you haul away gutter debris?',
        answer: 'All debris is bagged and removed from the site unless you prefer we compost it on property. We leave driveways, decks, and patios rinsed clean.',
      },
    ],
  },
  gutterRepair: {
    heroEyebrow: 'Leak-Free Gutters',
    serviceLabel: 'gutter repair and seam restoration',
    serviceType: 'Gutter Repair',
    localChallenge: 'freeze-thaw cycles and heavy downpours pull gutters from fascia boards and open seams at corners',
    inspection: 'a diagnostic assessment that measures slope, checks miters, and tests fascia integrity so we know exactly where water is escaping',
    method: 'repairs include refastening hangers, resealing joints with high-grade gutter sealant, and reshaping crushed sections to re-establish flow',
    materials: 'We stock color-matched screws, brackets, and sealants rated for wet climates so your system looks seamless after the fix.',
    crew: 'Our specialists travel with brake machines, riveters, and replacement components, allowing most repairs to wrap up during the initial visit.',
    documentation: 'Expect a repair summary with annotated photos, slope readings, and recommendations for preventive upgrades when needed.',
    maintenance: 'Preventive plans combine repairs with seasonal cleanings and guard evaluations to keep water moving away from foundations.',
    closing: 'Submit an estimate request and we will triage urgent leaks the the same day, minimizing interior damage and landscape erosion.',
    bulletPoints: [
      'Precision leak diagnostics for corners and seams',
      'Reinforced hangers sized for Northwest snow loads',
      'Transparent reporting with next-step recommendations',
    ],
    faq: () => [
      {
        question: 'Can you repair gutters during heavy rain?',
        answer: 'We can perform emergency stabilizations in wet weather, but permanent sealing requires a dry window for optimal adhesion. We monitor the forecast and schedule accordingly.',
      },
      {
        question: 'Do you replace damaged downspouts?',
        answer: 'Yes. We carry matching downspout sections and can reconfigure drainage to keep water away from driveways, patios, and sensitive landscaping.',
      },
      {
        question: 'What if the fascia is rotten?',
        answer: 'If we encounter rotten fascia, we stabilize the gutter run and coordinate carpentry repairs so the system can be rehung securely.',
      },
    ],
  },
  gutterInstallation: {
    heroEyebrow: 'Custom Seamless Systems',
    serviceLabel: 'seamless gutter installation',
    serviceType: 'Seamless Gutter Installation',
    localChallenge: 'steep roof pitches and dramatic rainfall require precision drainage layouts that move thousands of gallons per storm',
    inspection: 'our consultants map roof planes, drip-line locations, and ground drainage patterns to design a system sized for your architecture',
    method: 'we fabricate seamless gutters on-site, install oversized downspouts, and integrate splash blocks or drain lines to protect foundations',
    materials: 'All systems use thick-gauge aluminum or steel, hidden hangers, and premium coatings to resist corrosion in salty air.',
    crew: 'Installation teams include fabricators, installers, and finish specialists who align miters perfectly and leave siding spotless.',
    documentation: 'You receive CAD-style layout diagrams, slope calculations, and maintenance guidance tailored to your property.',
    maintenance: 'We pair new installs with guard options, cleaning schedules, and warranty check-ins so performance stays peak.',
    closing: 'Request an estimate and we will deliver a detailed proposal within two business days, complete with financing and RainWise compatibility notes.',
    bulletPoints: [
      'On-site seamless fabrication for custom lengths',
      'Oversized downspouts for heavy Bellevue-area rainfall',
      'Warranty-backed installation with follow-up inspection',
    ],
    faq: (locationName) => [
      {
        question: `What gutter size do ${locationName} homes need?`,
        answer: 'Most projects use five- or six-inch K-style gutters, but modern builds with wide roof planes often benefit from box gutters or larger downspouts for better flow.',
      },
      {
        question: 'How long does installation take?',
        answer: 'A typical single-family home is completed in one day. Larger estates or homes with complex rooflines may take two to three days to ensure perfect alignment.',
      },
      {
        question: 'Can you integrate rainwater harvesting?',
        answer: 'Absolutely. We design systems with diverters and clean-out ports so cisterns and rain barrels fill efficiently while staying code compliant.',
      },
    ],
  },
  softWash: {
    heroEyebrow: 'Gentle Exterior Washing',
    serviceLabel: 'low-pressure soft washing',
    serviceType: 'Exterior Soft Washing',
    localChallenge: 'shaded lots collect algae on siding, decks, and fences, dulling curb appeal across the neighborhood',
    inspection: 'technicians inspect siding materials, paint condition, and landscaping to tailor detergents and protect delicate surfaces',
    method: 'we apply foaming detergents at low pressure, agitate problem zones, and rinse with calibrated nozzles to lift grime without forcing water behind siding',
    materials: 'Our cleaning solutions are plant-safe and neutralized before we rinse, keeping gardens and outdoor living spaces healthy.',
    crew: 'Teams include exterior cleaning specialists trained in wood, stucco, and composite care as well as ladder safety for multistory homes.',
    documentation: 'Expect a service report with sheen comparisons, recommended touch-up areas, and maintenance intervals for each surface.',
    maintenance: 'Seasonal memberships rotate between siding, walkways, and outdoor living spaces so your property always looks market-ready.',
    closing: 'Complete the estimate request and we will build a soft-wash plan that respects HOA guidelines and your schedule.',
    bulletPoints: [
      'Plant-safe detergents mixed for your siding type',
      'Low-pressure rinsing that prevents water intrusion',
      'Surface-by-surface maintenance plans for year-round curb appeal',
    ],
    faq: (locationName) => [
      {
        question: `Is soft washing safe for painted fences in ${locationName}?`,
        answer: 'Yes. We dial in detergent strength for wood, vinyl, or composite fences and rinse gently to protect finishes while removing algae.',
      },
      {
        question: 'Will detergents harm landscaping?',
        answer: 'We pre-wet plants, use biodegradable solutions, and rinse thoroughly so shrubs, lawns, and garden beds stay healthy.',
      },
      {
        question: 'How long do results last?',
        answer: 'Most exterior surfaces stay bright for twelve to eighteen months. Homes with heavy shade may benefit from annual touch-ups.',
      },
    ],
  },
  roofInspection: {
    heroEyebrow: 'Proactive Roof Checks',
    serviceLabel: 'comprehensive roof inspections',
    serviceType: 'Roof Inspection',
    localChallenge: 'steep terrain and wildlife activity make undetected roof issues costly for hillside homes',
    inspection: 'our inspectors document every slope, flashing penetration, attic ventilation point, and drainage detail with thermal imaging and moisture meters',
    method: 'we climb safely with harnesses, capture drone imagery, and prepare a prioritized report so repairs can be scheduled before damage spreads',
    materials: 'Each inspection includes thermal scans, moisture readings, and fastener torque checks to highlight underlying risks.',
    crew: 'Certified roof inspectors and former installers collaborate to interpret data and recommend the right fix, not just a blanket replacement.',
    documentation: 'Deliverables include a photo-rich PDF, maintenance schedule, and action plan that you can share with insurers or HOA boards.',
    maintenance: 'We set reminders for annual checkups and re-inspections after major storms to keep warranties valid.',
    closing: 'Send an estimate request and we will reserve a two-hour inspection window with results delivered within 24 hours.',
    bulletPoints: [
      'Drone and on-roof inspection with moisture mapping',
      'Actionable repair plan prioritized by risk',
      'Warranty documentation ready for insurers and HOAs',
    ],
    faq: (locationName) => [
      {
        question: `What is included in a roof inspection for ${locationName} homeowners?`,
        answer: 'We examine shingles, flashing, vents, gutters, attic ventilation, and insulation levels. Thermal imaging and moisture readings identify hidden leaks before they surface.',
      },
      {
        question: 'How soon will I receive the report?',
        answer: 'Reports arrive within 24 hours and include photos, videos, and prioritized recommendations with repair estimates if desired.',
      },
      {
        question: 'Do you coordinate repairs after the inspection?',
        answer: 'Yes. We can schedule in-house repair crews or work with your preferred roofer, ensuring punch-list items are completed quickly.',
      },
    ],
  },
  roofMaintenance: {
    heroEyebrow: 'Roof Maintenance Plans',
    serviceLabel: 'seasonal roof maintenance',
    serviceType: 'Roof Maintenance',
    localChallenge: 'high-rise winds and urban construction dust accelerate roof wear in core business districts',
    inspection: 'maintenance visits start with a rooftop checklist covering membranes, seams, fasteners, and rooftop equipment clearances',
    method: 'teams clean debris, tighten fasteners, reseal penetrations, and verify drainage components so roofs stay warranty-compliant',
    materials: 'We stock manufacturer-approved sealants, reinforcement fabrics, and safety gear for both low-slope and pitched roofs.',
    crew: 'Commercial-trained technicians coordinate with building engineers and security staff to minimize tenant disruption.',
    documentation: 'Each visit produces a maintenance log, deficiency list, and budget forecast for upcoming capital projects.',
    maintenance: 'Programs include quarterly, semi-annual, or annual visits with emergency response built into service-level agreements.',
    closing: 'Request a maintenance proposal and we will align scope with your asset management plan and budget calendar.',
    bulletPoints: [
      'Proactive upkeep that keeps warranties intact',
      'Detailed reports for capital planning and compliance',
      'On-call emergency response baked into the agreement',
    ],
    faq: () => [
      {
        question: 'How does roof maintenance differ from cleaning?',
        answer: 'Maintenance combines cleaning with component inspections, minor repairs, and documentation to keep manufacturer warranties valid.',
      },
      {
        question: 'Can you service mixed-use buildings?',
        answer: 'Yes. We coordinate with property managers to access rooftops, schedule around tenants, and protect rooftop mechanical systems.',
      },
      {
        question: 'Do you provide emergency coverage?',
        answer: 'Maintenance clients receive priority emergency response with crews mobilized day or night for leak mitigation.',
      },
    ],
  },
  roofLeakRepair: {
    heroEyebrow: 'Rapid Leak Response',
    serviceLabel: 'roof leak detection and repair',
    serviceType: 'Roof Leak Repair',
    localChallenge: 'winter windstorms drive rain under shingles, causing surprise interior leaks and drywall damage',
    inspection: 'we trace leaks from attic to ridge, checking flashing, fasteners, skylights, and penetrations to pinpoint the source',
    method: 'crews replace damaged shingles, reseal flashing, and install diverters or ice-and-water shields where chronic leaks appear',
    materials: 'Only manufacturer-approved shingles, membranes, and sealants are used so the repair blends seamlessly.',
    crew: 'Emergency teams carry tarps, drying equipment, and replacement materials to stop damage fast.',
    documentation: 'We document moisture levels, interior impacts, and repair steps so you can share proof with insurers.',
    maintenance: 'Follow-up inspections ensure the leak stays sealed and related components remain watertight.',
    closing: 'Submit the estimate form for same-day leak triage and scheduling priority before the next storm cell arrives.',
    bulletPoints: [
      'Leak tracing from attic to rooftop',
      'Manufacturer-matched materials for lasting repairs',
      'Insurance-ready documentation provided immediately',
    ],
    faq: (locationName) => [
      {
        question: `Do you offer temporary leak covers in ${locationName}?`,
        answer: 'Yes. We can install emergency tarps and moisture control while permanent repairs are scheduled.',
      },
      {
        question: 'What if the leak is around a skylight?',
        answer: 'We reseal skylight curbs, replace flashing kits, or recommend new units if the frame is compromised.',
      },
      {
        question: 'Can you work with my insurance adjuster?',
        answer: 'Absolutely. We document damage, provide repair scopes, and meet adjusters on-site to streamline the claim.',
      },
    ],
  },
  gutterGuard: {
    heroEyebrow: 'Maintenance-Light Gutters',
    serviceLabel: 'gutter guard installation',
    serviceType: 'Gutter Guard Installation',
    localChallenge: 'fir and cedar needles overwhelm gutters, leading to ice dams and overflowing downspouts',
    inspection: 'we inspect current gutters, roof pitch, and local tree species to recommend the right guard system',
    method: 'guards are custom-fit, secured with stainless fasteners, and water-tested to ensure compatibility with your gutter style',
    materials: 'We offer micro-mesh, perforated aluminum, and hybrid systems that resist clogging without voiding roof warranties.',
    crew: 'Installers clean gutters first, then mount guards with precision so panels stay flush and secure.',
    documentation: 'You receive maintenance guidance, warranty information, and footage showing water flow with the new guards in place.',
    maintenance: 'Guard checkups are included in service plans to brush off debris and keep airflow moving.',
    closing: 'Request an estimate to compare guard options and we will outline pricing, maintenance, and expected debris reduction.',
    bulletPoints: [
      'Micro-mesh and perforated guard options sized to your roof',
      'Installed by licensed technicians after a full gutter cleaning',
      'Tested for heavy Northwest rainfall and RainWise compliance',
    ],
    faq: () => [
      {
        question: 'Do gutter guards eliminate cleanings?',
        answer: 'They drastically reduce debris buildup, but we still recommend an annual inspection to remove small particles and ensure downspouts stay clear.',
      },
      {
        question: 'Will guards void my roof warranty?',
        answer: 'No. We use fasteners and installation methods approved by major shingle manufacturers and follow edge clearance guidelines.',
      },
      {
        question: 'Which guard style works best for fir needles?',
        answer: 'Fine stainless micro-mesh performs best against needles while still allowing heavy rainfall to drain freely.',
      },
    ],
  },
  roofReplacement: {
    heroEyebrow: 'Strategic Roof Replacement',
    serviceLabel: 'roof replacement and project management',
    serviceType: 'Roof Replacement',
    localChallenge: 'aging roofs and moisture intrusion demand careful timing to protect interiors and property value',
    inspection: 'we perform a tear-off assessment, ventilation review, and structural check before presenting replacement options',
    method: 'our crews remove old materials, upgrade underlayment, and install new roofing with precise flashing and ridge ventilation',
    materials: 'We source impact-resistant shingles, standing seam metal, and designer profiles backed by long-term warranties.',
    crew: 'Project managers oversee daily cleanup, magnetic nail sweeps, and site safety so homeowners stay informed.',
    documentation: 'Expect a milestone schedule, warranty registrations, and maintenance roadmap once the roof is complete.',
    maintenance: 'Post-install inspections and tune-ups keep the new roof performing for decades.',
    closing: 'Use the estimate form to schedule a design consultation, samples review, and detailed investment outline.',
    bulletPoints: [
      'Full tear-off with upgraded waterproofing',
      'Premium shingle and metal options with long warranties',
      'Dedicated project manager with daily updates',
    ],
    faq: () => [
      {
        question: 'How long does a roof replacement take?',
        answer: 'Most single-family homes wrap in three to five days depending on complexity and weather. Larger estates or intricate roofs may take longer to ensure craftsmanship.',
      },
      {
        question: 'Can you help with HOA approvals?',
        answer: 'Yes. We prepare color samples, material specs, and documentation required by most local HOA boards.',
      },
      {
        question: 'Do you offer financing?',
        answer: 'We partner with financing providers so homeowners can spread the investment over comfortable terms.',
      },
    ],
  },
  metalRoofCleaning: {
    heroEyebrow: 'Expert Metal Roof Care',
    serviceLabel: 'metal roof cleaning',
    serviceType: 'Metal Roof Cleaning',
    localChallenge: 'salt air and pine pollen dull luxury metal roofs around lakefront estates',
    inspection: 'we inspect panel seams, fasteners, and coatings before cleaning to ensure everything stays watertight',
    method: 'crews use non-abrasive brushes and neutral detergents to remove buildup without scratching premium finishes',
    materials: 'Protective coatings and deionized rinse water keep panels streak-free and extend coating life.',
    crew: 'Technicians are rope-access trained and use padded walk pads to protect standing seams.',
    documentation: 'We deliver a sheen restoration report, coating condition notes, and recommendations for future maintenance.',
    maintenance: 'Service plans include quarterly rinses and annual detail cleanings for estates with heavy tree cover.',
    closing: 'Request an estimate for a bespoke maintenance plan built for your metal roof investment.',
    bulletPoints: [
      'Neutral detergents matched to luxury metal finishes',
      'Rope-access crews that protect panels and seams',
      'Detailed sheen and coating condition documentation',
    ],
    faq: (locationName) => [
      {
        question: `Do you walk on the metal roof during cleaning in ${locationName}?`,
        answer: 'Only when necessary. We use walk pads and rope access to avoid panel distortion while ensuring every inch is detailed.',
      },
      {
        question: 'Can you remove rust streaks?',
        answer: 'Yes. We apply specialty cleaners and protective coatings to eliminate rust stains and prevent them from returning.',
      },
      {
        question: 'How often should a metal roof be cleaned?',
        answer: 'Most luxury metal roofs need a detailing every twelve months, with quick rinses in between to remove pollen and salt.',
      },
    ],
  },
  roofRepair: {
    heroEyebrow: 'Precision Roof Repairs',
    serviceLabel: 'targeted roof repair',
    serviceType: 'Roof Repair',
    localChallenge: 'freeze-thaw cycles and windstorms loosen shingles, flashing, and ridge vents',
    inspection: 'repair teams evaluate every affected slope, underlayment, and flashing component before finalizing scope',
    method: 'we replace damaged materials, reseal penetration points, and reinforce vulnerable transitions to restore waterproofing',
    materials: 'Matching shingles, membranes, and sealants maintain curb appeal and manufacturer coverage.',
    crew: 'Roof repair specialists bring stocked trailers so most fixes happen in one visit.',
    documentation: 'You receive a repair summary, photos, and warranty details for completed work.',
    maintenance: 'Follow-up inspections confirm everything remains watertight and identify future maintenance needs.',
    closing: 'Reach out through the estimate form and we will prioritize your repair before the next storm.',
    bulletPoints: [
      'Full-scope diagnostics before any repair work',
      'Manufacturer-approved materials for lasting fixes',
      'Detailed reporting for peace of mind',
    ],
    faq: (locationName) => [
      {
        question: `Can you match my existing shingle color in ${locationName}?`,
        answer: 'Yes. We source manufacturer-matched shingles or provide the closest available option when originals are discontinued.',
      },
      {
        question: 'Do you repair flashing issues?',
        answer: 'Absolutely. We reseal and replace flashing around chimneys, skylights, and vents to prevent future leaks.',
      },
      {
        question: 'Is there a warranty on repairs?',
        answer: 'We provide workmanship warranties and will return if issues reappear within the covered period.',
      },
    ],
  },
  sidingRepair: {
    heroEyebrow: 'Siding Damage Solutions',
    serviceLabel: 'siding repair and moisture remediation',
    serviceType: 'Siding Repair',
    localChallenge: 'wind-driven rain and irrigation overspray let moisture creep behind siding panels',
    inspection: 'we probe siding, sheathing, and framing with moisture meters to map hidden damage before opening walls',
    method: 'technicians remove compromised panels, dry the wall cavity, and rebuild with flashing upgrades before installing new siding',
    materials: 'We match fiber cement, cedar, or engineered wood profiles and prime everything for lasting performance.',
    crew: 'Carpenters and finishers coordinate to blend repairs with existing architecture and paint schemes.',
    documentation: 'Homeowners receive moisture readings, repair notes, and paint touch-up recommendations.',
    maintenance: 'Ongoing checkups monitor caulking, paint, and drainage to keep siding tight against Pacific Northwest storms.',
    closing: 'Contact us for a repair plan that stops moisture in its tracks and protects your investment.',
    bulletPoints: [
      'Moisture mapping and targeted tear-outs',
      'Profile-matched siding replacements',
      'Preventive flashing and sealant upgrades',
    ],
    faq: (locationName) => [
      {
        question: `How do I know if my siding needs repair in ${locationName}?`,
        answer: 'Look for bubbling paint, warped boards, or soft spots. Our moisture readings confirm the extent before we open the wall.',
      },
      {
        question: 'Can you match the existing paint color?',
        answer: 'Yes. We prime new siding and apply color-matched paint so the repair blends seamlessly.',
      },
      {
        question: 'Do you address underlying moisture sources?',
        answer: 'We repair flashing, redirect irrigation, and adjust drainage so the same issue does not return.',
      },
    ],
  },
  pressureWashing: {
    heroEyebrow: 'Refresh Every Surface',
    serviceLabel: 'precision pressure washing',
    serviceType: 'Exterior Pressure Washing',
    localChallenge: 'road grit and pollen coat driveways and hardscapes throughout the year',
    inspection: 'we evaluate surface types, joints, and existing sealers to set the correct pressure and detergents',
    method: 'technicians pre-treat stains, pressure wash with rotary surface cleaners, and rinse edges to prevent stripes',
    materials: 'Eco-friendly degreasers and rust removers tackle tough stains without harming landscaping.',
    crew: 'Our team protects garage doors, siding, and landscaping with shields and controlled runoff management.',
    documentation: 'You receive a surface condition report, before-and-after gallery, and recommendations for sealing or maintenance.',
    maintenance: 'Seasonal plans rotate between driveways, patios, and walkways to keep traction and curb appeal high.',
    closing: 'Share your surfaces and timeline in the estimate form and we will tailor a washing schedule to your property.',
    bulletPoints: [
      'Rotary cleaners for even, streak-free washing',
      'Degreasers and rust removers safe for landscaping',
      'Runoff controls that protect storm drains',
    ],
    faq: () => [
      {
        question: 'Will pressure washing damage my concrete?',
        answer: 'We calibrate pressure and nozzle selection to match your surface, preventing etching while removing stains and buildup.',
      },
      {
        question: 'Do you clean decks and railings?',
        answer: 'Yes. We switch to low-pressure soft washing on wood or composite decks to preserve coatings and fasteners.',
      },
      {
        question: 'How long will surfaces stay clean?',
        answer: 'Most hardscapes stay bright for twelve months. We can apply sealers that extend cleanliness and resist staining.',
      },
    ],
  },
  sidingWash: {
    heroEyebrow: 'Siding Brightening Crew',
    serviceLabel: 'siding washing and detailing',
    serviceType: 'Siding Cleaning',
    localChallenge: 'windblown dust and pollen collect on vertical surfaces, leaving streaks and mildew patches',
    inspection: 'we inspect siding joins, caulking, and paint condition so the wash plan protects finishes while removing grime',
    method: 'technicians apply low-pressure detergents, brush problem areas, and rinse gently to revive color without lifting paint',
    materials: 'Plant-safe detergents and wax additives leave a protective sheen that delays future buildup.',
    crew: 'Detailers work in teams to cover upper stories safely and keep windows spotless.',
    documentation: 'You receive a sheen comparison gallery, maintenance checklist, and product recommendations for touch-ups between visits.',
    maintenance: 'Annual washing keeps siding warranties intact and helps spot sealant failures early.',
    closing: 'Request an estimate for a siding detail that restores color and keeps your exterior resilient.',
    bulletPoints: [
      'Low-pressure siding cleaning with spot brushing',
      'Protective additives that slow future grime',
      'Detail-oriented crews that guard windows and trim',
    ],
    faq: () => [
      {
        question: 'Will siding washing strip my paint?',
        answer: 'No. We dial in pressure and detergents to clean without disturbing bonded paint or stain.',
      },
      {
        question: 'Do you clean soffits and trim too?',
        answer: 'Yes. We include soffits, trim, and entryways so the whole façade looks consistent.',
      },
      {
        question: 'How often should siding be washed?',
        answer: 'Most homes benefit from an annual wash, with shaded or waterfront properties sometimes requiring a mid-year touch-up.',
      },
    ],
  },
};

const baseFocusSequence = ['roofCleaning', 'gutterCleaning', 'gutterRepair', 'gutterInstallation', 'softWash'];

const ensureFocus = (focusKey) => {
  if (!focusLibrary[focusKey]) {
    throw new Error(`Missing focus definition for ${focusKey}`);
  }
  return focusLibrary[focusKey];
};

const neighborhoods = [
  {
    slug: 'beaux-arts-village',
    name: 'Beaux Arts Village',
    keywordToken: 'beaux arts',
    geo: { lat: 47.587, lng: -122.205 },
    landmark: 'Lake Washington shoreline near SE 29th Street',
    focusOrder: ['roofCleaning', 'gutterCleaning', 'gutterRepair', 'gutterInstallation', 'softWash'],
    primary: {
      focus: 'roofCleaning',
      keyword: 'roof cleaning beaux arts',
      title: 'Preserve Your Beaux Arts Roof: The Ultimate Local Cleaning Routine',
    },
  },
  {
    slug: 'bel-red',
    name: 'Bel-Red',
    keywordToken: 'bel red',
    geo: { lat: 47.624, lng: -122.143 },
    landmark: 'Spring District redevelopment and Bel-Red Road businesses',
    focusOrder: ['gutterRepair', 'gutterCleaning', 'roofCleaning', 'gutterInstallation', 'roofMaintenance'],
    primary: {
      focus: 'gutterRepair',
      keyword: 'gutter repair bellevue bel red',
      title: 'How Bel-Red Homeowners Prevent Costly Gutter Failures',
    },
  },
  {
    slug: 'bellevue',
    name: 'Bellevue',
    keywordToken: 'bellevue',
    geo: { lat: 47.610, lng: -122.201 },
    landmark: 'Downtown Bellevue skyline and Meydenbauer Bay',
    focusOrder: ['roofCleaning', 'gutterCleaning', 'gutterRepair', 'gutterInstallation', 'gutterGuard'],
    primary: {
      focus: 'roofCleaning',
      keyword: 'roof moss removal bellevue',
      title: 'Moss-Free Roofs in Bellevue: Proven Treatments That Work',
    },
  },
  {
    slug: 'bridle-trails',
    name: 'Bridle Trails',
    keywordToken: 'bridle trails',
    geo: { lat: 47.640, lng: -122.173 },
    landmark: 'Bridle Trails State Park equestrian corridors',
    focusOrder: ['softWash', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'roofInspection'],
    primary: {
      focus: 'softWash',
      keyword: 'exterior soft wash bridle trails',
      title: 'Bridle Trails Home Care: Why Soft Washing Beats Pressure',
    },
  },
  {
    slug: 'clyde-hill',
    name: 'Clyde Hill',
    keywordToken: 'clyde hill',
    geo: { lat: 47.631, lng: -122.217 },
    landmark: 'Olympic Mountain vistas from Clyde Hill',
    focusOrder: ['roofLeakRepair', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'roofReplacement'],
    primary: {
      focus: 'roofLeakRepair',
      keyword: 'roof leak repair clyde hill',
      title: 'Roof Leaks in Clyde Hill: Fast Fixes Before Winter Hits',
    },
  },
  {
    slug: 'coal-creek',
    name: 'Coal Creek',
    keywordToken: 'coal creek',
    geo: { lat: 47.538, lng: -122.167 },
    landmark: 'Coal Creek Parkway greenbelt',
    focusOrder: ['gutterCleaning', 'gutterRepair', 'gutterInstallation', 'roofCleaning', 'gutterGuard'],
    primary: {
      focus: 'gutterCleaning',
      keyword: 'gutter cleaning coal creek',
      title: 'Avoid Basement Flooding: Coal Creek Gutter Checklist 2025',
    },
  },
  {
    slug: 'cougar-mountain',
    name: 'Cougar Mountain',
    keywordToken: 'cougar mountain',
    geo: { lat: 47.534, lng: -122.110 },
    landmark: 'Cougar Mountain regional trailheads',
    focusOrder: ['roofInspection', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'roofLeakRepair'],
    primary: {
      focus: 'roofInspection',
      keyword: 'roof inspection cougar mountain',
      title: 'Cougar Mountain Roof Inspections: Catch Problems Early',
    },
  },
  {
    slug: 'crossroads',
    name: 'Crossroads',
    keywordToken: 'crossroads bellevue',
    geo: { lat: 47.620, lng: -122.144 },
    landmark: 'Crossroads Park and community center',
    focusOrder: ['sidingRepair', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'pressureWashing'],
    primary: {
      focus: 'sidingRepair',
      keyword: 'siding repair crossroads bellevue',
      title: 'Crossroads Siding Repair: Stop Moisture Before It Spreads',
    },
  },
  {
    slug: 'downtown-bellevue',
    name: 'Downtown Bellevue',
    keywordToken: 'downtown bellevue',
    geo: { lat: 47.614, lng: -122.193 },
    landmark: 'Bellevue Downtown Park and skyline towers',
    focusOrder: ['roofMaintenance', 'roofCleaning', 'gutterCleaning', 'roofLeakRepair', 'gutterGuard'],
    primary: {
      focus: 'roofMaintenance',
      keyword: 'roof maintenance downtown bellevue',
      title: 'Downtown Bellevue Roof Upkeep: How to Save Thousands',
    },
  },
  {
    slug: 'eastgate',
    name: 'Eastgate',
    keywordToken: 'eastgate',
    geo: { lat: 47.575, lng: -122.150 },
    landmark: 'Eastgate Way hillside homes',
    focusOrder: ['pressureWashing', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'softWash'],
    primary: {
      focus: 'pressureWashing',
      keyword: 'exterior pressure washing eastgate',
      title: 'Eastgate Pressure Washing: Refresh Your Home’s First Impression',
    },
  },
  {
    slug: 'factoria',
    name: 'Factoria',
    keywordToken: 'factoria',
    geo: { lat: 47.575, lng: -122.168 },
    landmark: 'Factoria Mall and Richards Creek corridor',
    focusOrder: ['gutterGuard', 'gutterCleaning', 'gutterRepair', 'roofCleaning', 'pressureWashing'],
    primary: {
      focus: 'gutterGuard',
      keyword: 'gutter guard install factoria',
      title: 'Factoria Gutters Reinvented: Best Guards for Rain-Heavy Homes',
    },
  },
  {
    slug: 'hazelwood',
    name: 'Hazelwood',
    keywordToken: 'hazelwood',
    geo: { lat: 47.547, lng: -122.167 },
    landmark: 'Hazelwood greenspace overlooking Lake Washington',
    focusOrder: ['roofReplacement', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'roofInspection'],
    primary: {
      focus: 'roofReplacement',
      keyword: 'roof replacement hazelwood',
      title: 'Hazelwood Roof Replacement Costs and Best Timing',
    },
  },
  {
    slug: 'hunts-point',
    name: 'Hunts Point',
    keywordToken: 'hunts point',
    geo: { lat: 47.640, lng: -122.232 },
    landmark: 'Hunts Point waterfront estates',
    focusOrder: ['metalRoofCleaning', 'roofCleaning', 'gutterCleaning', 'gutterGuard', 'roofLeakRepair'],
    primary: {
      focus: 'metalRoofCleaning',
      keyword: 'metal roof cleaning hunts point',
      title: 'Luxury Roof Care in Hunts Point: Metal Roof Essentials',
    },
  },
  {
    slug: 'issaquah',
    name: 'Issaquah',
    keywordToken: 'issaquah',
    geo: { lat: 47.530, lng: -122.032 },
    landmark: 'Issaquah Highlands and Front Street shops',
    focusOrder: ['gutterCleaning', 'roofCleaning', 'gutterRepair', 'gutterInstallation', 'roofInspection'],
    primary: {
      focus: 'gutterCleaning',
      keyword: 'gutter cleaning issaquah',
      title: 'Issaquah Gutters: Seasonal Cleaning Schedule That Works',
    },
  },
  {
    slug: 'kirkland',
    name: 'Kirkland',
    keywordToken: 'kirkland',
    geo: { lat: 47.676, lng: -122.205 },
    landmark: 'Kirkland waterfront and Google campus',
    focusOrder: ['roofRepair', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'pressureWashing'],
    primary: {
      focus: 'roofRepair',
      keyword: 'roof repair kirkland',
      title: 'Kirkland Roof Repair Guide: Top Issues in 2025',
    },
  },
  {
    slug: 'lake-hills',
    name: 'Lake Hills',
    keywordToken: 'lake hills',
    geo: { lat: 47.603, lng: -122.132 },
    landmark: 'Lake Hills Greenbelt and Larsen Lake trails',
    focusOrder: ['gutterInstallation', 'gutterCleaning', 'gutterRepair', 'roofCleaning', 'gutterGuard'],
    primary: {
      focus: 'gutterInstallation',
      keyword: 'gutter installation lake hills',
      title: 'Lake Hills Gutter Install: What Local Homes Really Need',
    },
  },
  {
    slug: 'lakemont',
    name: 'Lakemont',
    keywordToken: 'lakemont',
    geo: { lat: 47.557, lng: -122.114 },
    landmark: 'Cougar Ridge and Lakemont Boulevard viewpoints',
    focusOrder: ['roofCleaning', 'gutterCleaning', 'gutterRepair', 'roofInspection', 'pressureWashing'],
    primary: {
      focus: 'roofCleaning',
      keyword: 'roof moss removal lakemont',
      title: 'Lakemont Roof Moss Guide: Keep Your Shingles Alive Longer',
    },
  },
  {
    slug: 'mercer-island',
    name: 'Mercer Island',
    keywordToken: 'mercer island',
    geo: { lat: 47.570, lng: -122.224 },
    landmark: 'Mercer Island Town Center and Luther Burbank Park',
    focusOrder: ['roofCleaning', 'gutterCleaning', 'gutterRepair', 'gutterGuard', 'roofLeakRepair'],
    primary: {
      focus: 'roofCleaning',
      keyword: 'roof cleaning mercer island',
      title: 'Mercer Island Roof Cleaning Without Damage or Downtime',
    },
  },
  {
    slug: 'newcastle',
    name: 'Newcastle',
    keywordToken: 'newcastle',
    geo: { lat: 47.539, lng: -122.170 },
    landmark: 'Newcastle Golf Club and Coal Creek trails',
    focusOrder: ['sidingWash', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'pressureWashing'],
    primary: {
      focus: 'sidingWash',
      keyword: 'siding wash newcastle',
      title: 'Newcastle Exterior Care: Gentle Wash That Protects Value',
    },
  },
  {
    slug: 'redmond',
    name: 'Redmond',
    keywordToken: 'redmond',
    geo: { lat: 47.673, lng: -122.121 },
    landmark: 'Downtown Redmond and Marymoor Park',
    focusOrder: ['roofRepair', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'gutterGuard'],
    primary: {
      focus: 'roofRepair',
      keyword: 'roof repair redmond',
      title: 'Redmond Roof Repairs That Last All Season',
    },
  },
  {
    slug: 'renton',
    name: 'Renton',
    keywordToken: 'renton',
    geo: { lat: 47.482, lng: -122.217 },
    landmark: 'Renton Landing and Cedar River waterfront',
    focusOrder: ['roofReplacement', 'roofCleaning', 'gutterCleaning', 'gutterRepair', 'roofLeakRepair'],
    primary: {
      focus: 'roofReplacement',
      keyword: 'roof replacement renton',
      title: 'Renton Roof Replacement Cost and Contractor Checklist',
    },
  },
  {
    slug: 'sammamish',
    name: 'Sammamish',
    keywordToken: 'sammamish',
    geo: { lat: 47.616, lng: -122.035 },
    landmark: 'Sammamish Plateau and Beaver Lake Park',
    focusOrder: ['gutterRepair', 'gutterCleaning', 'roofCleaning', 'gutterInstallation', 'pressureWashing'],
    primary: {
      focus: 'gutterRepair',
      keyword: 'gutter repair sammamish',
      title: 'Sammamish Gutter Repairs Done Right: Avoid Overflow Damage',
    },
  },
];
const focusDefaults = {
  roofCleaning: {
    keyword: (location) => `roof cleaning ${location.keywordToken}`,
    title: (location) => `${location.name} Roof Cleaning Checklist for Year-Round Protection`,
  },
  gutterCleaning: {
    keyword: (location) => `gutter cleaning ${location.keywordToken}`,
    title: (location) => `${location.name} Gutter Cleaning Plan for Peak Storm Season`,
  },
  gutterRepair: {
    keyword: (location) => `gutter repair ${location.keywordToken}`,
    title: (location) => `${location.name} Gutter Repairs That Stop Overflow Damage`,
  },
  gutterInstallation: {
    keyword: (location) => `gutter installation ${location.keywordToken}`,
    title: (location) => `${location.name} Seamless Gutter Install Upgrades`,
  },
  softWash: {
    keyword: (location) => `soft wash ${location.keywordToken}`,
    title: (location) => `${location.name} Soft Washing Keeps Curb Appeal Fresh`,
  },
  roofInspection: {
    keyword: (location) => `roof inspection ${location.keywordToken}`,
    title: (location) => `${location.name} Roof Inspection Roadmap for Early Detection`,
  },
  roofMaintenance: {
    keyword: (location) => `roof maintenance ${location.keywordToken}`,
    title: (location) => `${location.name} Roof Maintenance Program That Pays Off`,
  },
  roofLeakRepair: {
    keyword: (location) => `roof leak repair ${location.keywordToken}`,
    title: (location) => `${location.name} Leak Repairs Completed Before the Next Storm`,
  },
  gutterGuard: {
    keyword: (location) => `gutter guard installation ${location.keywordToken}`,
    title: (location) => `${location.name} Gutter Guards that Block Fir Needles`,
  },
  roofReplacement: {
    keyword: (location) => `roof replacement ${location.keywordToken}`,
    title: (location) => `${location.name} Roof Replacement Guide for Smart Timing`,
  },
  metalRoofCleaning: {
    keyword: (location) => `metal roof cleaning ${location.keywordToken}`,
    title: (location) => `${location.name} Metal Roof Cleaning for Luxury Homes`,
  },
  roofRepair: {
    keyword: (location) => `roof repair ${location.keywordToken}`,
    title: (location) => `${location.name} Roof Repairs to Weatherproof Every Slope`,
  },
  sidingRepair: {
    keyword: (location) => `siding repair ${location.keywordToken}`,
    title: (location) => `${location.name} Siding Repair Stops Moisture Migration`,
  },
  pressureWashing: {
    keyword: (location) => `pressure washing ${location.keywordToken}`,
    title: (location) => `${location.name} Pressure Washing That Respects Every Surface`,
  },
  sidingWash: {
    keyword: (location) => `siding washing ${location.keywordToken}`,
    title: (location) => `${location.name} Siding Wash for Bright, Balanced Color`,
  },
};
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const collapseSpaces = (text) => text.replace(/\s+/g, ' ').trim();

const escapeHtmlAttr = (value) =>
  collapseSpaces(String(value))
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
const buildParagraphs = (location, focusDef, entry) => {
  const paragraphs = [
    `Residents of ${location.name} search for "${entry.keyword}" when ${focusDef.localChallenge}. ${company.name} builds ${focusDef.serviceLabel} programs that respect the architectural mix around ${location.landmark}. We treat every project as a risk-reduction plan that protects curb appeal, keeps insurance carriers satisfied, and preserves the calm pace that ${location.name} homeowners expect. We evaluate roof slope, tree canopy density, and building age so recommendations align with city permitting and insurance expectations. By pairing careful documentation with site-specific cleaning chemistry, we eliminate surprises before a ladder leaves the truck.`,
    `Every engagement begins with ${focusDef.inspection}. Our crews capture still photos, drone imagery, and moisture readings so you know the condition of your roofline or siding before we start service. That transparency helps you coordinate with neighbors, HOA boards, and city inspectors while giving you a permanent baseline for future maintenance decisions.`,
    `${focusDef.method} The detailed process is designed to solve the root of the problem instead of masking symptoms. We carefully stage access routes, protect hardscapes with drop cloths, and communicate progress milestones so you always understand what is happening on site.`,
    `${focusDef.materials} We purchase materials in bulk to control costs and test every product in Bellevue’s microclimates before deploying it broadly. That means treatments perform exactly as promised, whether your home faces Lake Washington winds or sheltered forest groves.`,
    `${focusDef.crew} From fall-protection plans to shoe covers at the front door, every habit is built to respect your property. Crews check in with you before work begins, review the scope mid-day, and walk the perimeter with you before leaving so nothing is overlooked.`,
    `${focusDef.documentation} Each report includes a prioritized punch list, budget guidance, and clear next steps. You can forward the deliverables to property managers, insurance adjusters, or real estate advisors without rewriting a word.`,
    `${focusDef.maintenance} Clients choose between seasonal, semi-annual, or bespoke schedules. We set automatic reminders, monitor weather triggers, and keep a live service history so you can prove maintenance compliance anytime. We also integrate sensor data from smart gutters and local weather stations so scheduling adapts when an atmospheric river is forecasted for King County.`,
    `Working around ${location.landmark} requires careful logistics. We time arrivals to respect school traffic, coordinate parking with neighbors, and stage equipment to keep sidewalks open. We also handle street-use permits when lifts are necessary and share courtesy notices with adjacent homeowners so everyone knows the timeline. That local knowledge shortens service windows and minimizes disruption for your block.`,
    `${focusDef.closing} When you submit the estimate form we immediately create a project record, assign a dedicated advisor, and share preparation checklists so the first site visit feels easy.`,
    `Every visit adds data to your secure client record so we can chart long-term performance. We note component serial numbers, warranty expiration dates, and upcoming seasonal risks so budgeting becomes straightforward. Our reporting highlights energy savings, RainWise opportunities, and proactive upgrades that help ${location.name} homes stay resilient despite changing weather patterns around ${location.landmark}. Clients also receive seasonal text alerts with preparation checklists so patios, walkways, and driveways stay guest-ready between appointments.`,
  ].map(collapseSpaces);

  const wordCount = paragraphs.join(' ').split(/\s+/).length;
  if (wordCount < 600 || wordCount > 800) {
    throw new Error(`Generated copy for ${location.name} / ${entry.title} produced ${wordCount} words`);
  }

  return paragraphs;
};
const createMetaDescription = (paragraphs) => {
  const combined = paragraphs.join(' ');
  if (combined.length <= 155) {
    return combined;
  }
  const snippet = combined.slice(0, 155);
  const lastSpace = snippet.lastIndexOf(' ');
  return snippet.slice(0, lastSpace > 120 ? lastSpace : 155) + '…';
};

const buildFaqMarkup = (faqs) =>
  faqs
    .map(
      (faq) => `          <details class="faq-item">\n            <summary>${faq.question}</summary>\n            <p>${faq.answer}</p>\n          </details>`
    )
    .join('\n');

const buildFaqSchema = (faqs, url) => ({
  '@type': 'FAQPage',
  '@id': `${url}#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});
const renderPage = (location, entry, focusDef) => {
  const paragraphs = buildParagraphs(location, focusDef, entry);
  const metaDescription = createMetaDescription(paragraphs);
  const safeDescription = escapeHtmlAttr(metaDescription);
  const faqs = focusDef.faq(location.name || location);
  const faqMarkup = buildFaqMarkup(faqs);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${company.url}#localbusiness`,
        name: company.name,
        image: `${company.url}assets/images/gutter-full-of-leaves-after.webp`,
        url: company.url,
        telephone: company.phone,
        email: company.email,
        priceRange: company.priceRange,
        address: {
          '@type': 'PostalAddress',
          streetAddress: company.street,
          addressLocality: company.locality,
          addressRegion: company.region,
          postalCode: company.postalCode,
          addressCountry: company.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: company.latitude || 47.6101,
          longitude: company.longitude || -122.2015,
        },
        areaServed: [{ '@type': 'City', name: location.name }],
      },
      buildFaqSchema(faqs, `${company.url}pages/${location.slug}/${entry.slug}/`),
    ],
  };

  const bulletItems = focusDef.bulletPoints
    .map((point) => `            <li>${point}</li>`)
    .join('\n');

  const bodyParagraphs = paragraphs
    .map((paragraph) => `          <p>${paragraph}</p>`)
    .join('\n');

  const phoneDisplay = '(425) 550-1727';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${entry.title} | ${company.name}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="manifest" href="/manifest.json">
    <link rel="alternate" type="application/rss+xml" title="Osprey Exterior Insights" href="/rss.xml">
    <link rel="alternate" type="application/feed+json" title="Osprey Exterior Insights" href="/feed.json">
    <link rel="canonical" href="${company.url}pages/${location.slug}/${entry.slug}/">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${company.name}">
    <meta property="og:title" content="${entry.title} | ${company.name}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${company.url}pages/${location.slug}/${entry.slug}/">
    <meta property="og:image" content="${company.url}assets/images/new-downspout-installation.webp">
    <meta property="og:image:alt" content="Exterior maintenance project in ${location.name}">
    <meta property="og:image:width" content="1600">
    <meta property="og:image:height" content="1067">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${entry.title} | ${company.name}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${company.url}assets/images/new-downspout-installation.webp">
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11395982028"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-11395982028');
      gtag('config', 'G-P1VX9FY873');
    </script>
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
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=841512635074584&ev=PageView&noscript=1" alt=""/></noscript>
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <header class="site-header">
      <div class="header-inner">
        <a class="logo" href="/">
          <img src="/assets/images/Osprey-Exterior-Logo3-01-BLUE.png" alt="Osprey Exterior logo">
          <span class="sr-only">${company.name} home</span>
        </a>
        <nav class="primary-nav">
          <a href="tel:${company.phone}" class="btn btn-primary" data-track="${entry.slug}_header_call">Call ${phoneDisplay}</a>
        </nav>
      </div>
    </header>
    <main>
      <section class="hero" style="background-image: linear-gradient(120deg, rgba(16,32,41,0.92), rgba(26,76,96,0.8)), url('/assets/images/new-downspout-installation.webp');">
        <div class="hero-inner">
          <div class="hero-copy">
            <p class="eyebrow">${focusDef.heroEyebrow}</p>
            <h1>${entry.title}</h1>
            <p>${paragraphs[0]}</p>
            <ul class="checklist">
${bulletItems}
            </ul>
            <div class="hero-ctas">
              <a class="btn btn-primary" href="/contact.html?service=${encodeURIComponent(entry.keyword)}" data-track="${entry.slug}_cta_estimate">Request your estimate</a>
              <a class="btn btn-outline" href="tel:${company.phone}" data-track="${entry.slug}_cta_call">Call ${phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="grid-two">
            <article>
${bodyParagraphs}
              <a class="btn btn-secondary" href="/contact.html?service=${encodeURIComponent(entry.keyword)}" data-track="${entry.slug}_cta_secondary">Book service in ${location.name}</a>
            </article>
            <aside class="info-card">
              <figure>
                <img src="/assets/images/new-downspout-installation.webp" alt="${location.name} project completed by ${company.name}" loading="lazy" data-lat="${location.geo.lat}" data-lng="${location.geo.lng}">
                <figcaption>Documented service completed near ${location.landmark}.</figcaption>
              </figure>
              <ul class="info-list">
                <li><strong>Service focus:</strong> ${focusDef.serviceLabel}</li>
                <li><strong>Neighborhood:</strong> ${location.name}</li>
                <li><strong>Turnaround:</strong> 1-3 days from approved proposal</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <section class="section section-light" id="faq">
        <div class="container">
          <div class="section-header">
            <span>Frequently asked questions</span>
            <h2>${entry.title} — FAQs</h2>
            <p>Get quick answers about scheduling, safety, and warranty coverage before you request service.</p>
          </div>
          <div class="faq-grid">
${faqMarkup}
          </div>
        </div>
      </section>
    </main>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="logo" href="/">
              <img src="/assets/images/Osprey-Exterior-Logo3-01-WHITE.png" alt="${company.name} logo">
            </a>
            <p>RainWise-certified exterior maintenance serving Bellevue, Redmond, Kirkland, Sammamish, and the greater Eastside.</p>
          </div>
          <div>
            <h2>Contact</h2>
            <p><a href="tel:${company.phone}" data-track="${entry.slug}_footer_call">${phoneDisplay}</a></p>
            <p><a href="mailto:${company.email}" data-track="${entry.slug}_footer_email">${company.email}</a></p>
          </div>
          <div>
            <h2>Address</h2>
            <p>${company.street}<br>${company.locality}, ${company.region} ${company.postalCode}</p>
          </div>
        </div>
        <p class="footer-note">© ${new Date().getFullYear()} ${company.name}. All rights reserved.</p>
      </div>
    </footer>
  </body>
</html>`;
};
const buildEntriesForLocation = (location) => {
  const focusOrder = location.focusOrder || baseFocusSequence;
  return focusOrder.map((focusKey) => {
    ensureFocus(focusKey);
    const usePrimary = location.primary && location.primary.focus === focusKey;
    const defaults = focusDefaults[focusKey];
    if (!defaults) {
      throw new Error(`Missing default keyword/title template for ${focusKey}`);
    }
    const keyword = usePrimary ? location.primary.keyword : defaults.keyword(location);
    const title = usePrimary ? location.primary.title : defaults.title(location);
    return {
      focus: focusKey,
      keyword,
      title,
      slug: slugify(title),
    };
  });
};

const outputPages = [];

for (const neighborhood of neighborhoods) {
  const entries = buildEntriesForLocation(neighborhood);
  for (const entry of entries) {
    const focusDef = ensureFocus(entry.focus);
    const html = renderPage(neighborhood, entry, focusDef);
    const outDir = path.join(process.cwd(), 'pages', neighborhood.slug, entry.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'index.html');
    fs.writeFileSync(outPath, html);
    outputPages.push({
      location: neighborhood.name,
      title: entry.title,
      path: `/pages/${neighborhood.slug}/${entry.slug}/`,
    });
  }
}
const buildNavigationPage = (pagesList) => {
  const items = pagesList
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(
      (page) => `        <tr>\n          <td>${escapeHtmlAttr(page.location)}</td>\n          <td><a href="${page.path}">${escapeHtmlAttr(page.title)}</a></td>\n          <td>${page.path}</td>\n        </tr>`
    )
    .join('\n');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${company.url}#localbusiness`,
        name: company.name,
        image: `${company.url}assets/images/gutter-full-of-leaves-after.webp`,
        url: company.url,
        telephone: company.phone,
        email: company.email,
        priceRange: company.priceRange,
        address: {
          '@type': 'PostalAddress',
          streetAddress: company.street,
          addressLocality: company.locality,
          addressRegion: company.region,
          postalCode: company.postalCode,
          addressCountry: company.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: company.latitude || 47.6101,
          longitude: company.longitude || -122.2015,
        },
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Osprey Exterior Page Directory</title>
    <meta name="description" content="Browse every localized service page and guide published by Osprey Exterior.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link rel="canonical" href="${company.url}pages/directory.html">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${company.name}">
    <meta property="og:title" content="Osprey Exterior Page Directory">
    <meta property="og:description" content="Browse every localized service page and guide published by Osprey Exterior.">
    <meta property="og:url" content="${company.url}pages/directory.html">
    <meta property="og:image" content="${company.url}assets/images/new-downspout-installation.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Osprey Exterior Page Directory">
    <meta name="twitter:description" content="Browse every localized service page and guide published by Osprey Exterior.">
    <meta name="twitter:image" content="${company.url}assets/images/new-downspout-installation.webp">
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11395982028"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-11395982028');
      gtag('config', 'G-P1VX9FY873');
    </script>
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
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=841512635074584&ev=PageView&noscript=1" alt=""/></noscript>
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <header class="site-header">
      <div class="header-inner">
        <a class="logo" href="/">
          <img src="/assets/images/Osprey-Exterior-Logo3-01-BLUE.png" alt="Osprey Exterior logo">
          <span class="sr-only">${company.name} home</span>
        </a>
        <nav class="primary-nav">
          <a href="tel:${company.phone}" class="btn btn-primary" data-track="directory_header_call">Call (425) 550-1727</a>
        </nav>
      </div>
    </header>
    <main>
      <section class="section">
        <div class="container">
          <div class="section-header">
            <span>Full site navigation</span>
            <h1>Osprey Exterior HTML Directory</h1>
            <p>Use this directory to jump to any localized service page, blog guide, or legal resource across the Osprey Exterior website.</p>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Title</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
${items}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="logo" href="/">
              <img src="/assets/images/Osprey-Exterior-Logo3-01-WHITE.png" alt="${company.name} logo">
            </a>
            <p>RainWise-certified exterior maintenance for the greater Eastside.</p>
          </div>
          <div>
            <h2>Contact</h2>
            <p><a href="tel:${company.phone}" data-track="directory_footer_call">(425) 550-1727</a></p>
            <p><a href="mailto:${company.email}" data-track="directory_footer_email">${company.email}</a></p>
          </div>
          <div>
            <h2>Address</h2>
            <p>${company.street}<br>${company.locality}, ${company.region} ${company.postalCode}</p>
          </div>
        </div>
        <p class="footer-note">© ${new Date().getFullYear()} ${company.name}. All rights reserved.</p>
      </div>
    </footer>
  </body>
  </html>`;
  };

const outputPageMap = new Map(outputPages.map((page) => [page.path, page]));

const extractTitle = (filePath) => {
  const html = fs.readFileSync(filePath, 'utf8');
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? collapseSpaces(match[1]) : path.basename(filePath);
};

const collectAllHtmlPages = (rootDir) => {
  const entries = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const dirEntries = fs.readdirSync(current, { withFileTypes: true });
    for (const dirent of dirEntries) {
      if (dirent.name.startsWith('.')) {
        continue;
      }
      const fullPath = path.join(current, dirent.name);
      if (dirent.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!dirent.isFile() || !dirent.name.endsWith('.html')) {
        continue;
      }
      const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
      let route = `/${relPath}`;
      if (relPath.endsWith('index.html')) {
        route = `/${relPath.slice(0, -'index.html'.length)}`;
        if (!route.endsWith('/')) {
          route += '/';
        }
        if (route === '//') {
          route = '/';
        }
      }
      const meta = outputPageMap.get(route);
      let locationLabel;
      let titleLabel;
      if (meta) {
        locationLabel = meta.location;
        titleLabel = meta.title;
      } else {
        const segments = route.split('/').filter(Boolean);
        if (segments.length === 0) {
          locationLabel = 'Home';
        } else if (segments[0] === 'pages') {
          locationLabel = segments.length > 1 ? segments.slice(0, segments.length - (route.endsWith('/') ? 1 : 0)).join('/') : 'pages';
        } else {
          locationLabel = segments.slice(0, segments.length - 1).join('/') || segments[0];
        }
        titleLabel = extractTitle(fullPath);
      }
      entries.push({ location: locationLabel, title: titleLabel, path: route });
    }
  }

  return entries;
};

const allPages = collectAllHtmlPages(process.cwd());

const directoryHtml = buildNavigationPage(allPages);
fs.writeFileSync(path.join(process.cwd(), 'pages', 'directory.html'), directoryHtml);

console.log(`Generated ${outputPages.length} localized pages plus directory.`);
