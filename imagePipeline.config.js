module.exports = {
  incomingDir: './incoming-photos',
  processedArchiveDir: './incoming-photos/processed',
  jobsDir: './jobs',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    bucket: 'public'
  },
  services: [
    {
      slug: 'gutter-cleaning',
      name: 'Gutter Cleaning',
      keywords: ['gutter', 'gutters', 'downspout', 'downspouts', 'gutter-cleaning', 'guttercleaning'],
      descriptors: ['clogged', 'leaf-packed', 'overflowing'],
      flowKeywords: ['overflow', 'spill', 'backed-up']
    },
    {
      slug: 'roof-cleaning',
      name: 'Roof Cleaning',
      keywords: ['roof', 'roofing', 'moss', 'algae', 'roof-cleaning'],
      descriptors: ['mossy', 'stained', 'granule-loss'],
      flowKeywords: ['drainage', 'valley', 'ridge']
    },
    {
      slug: 'pressure-washing',
      name: 'Pressure Washing',
      keywords: ['pressure', 'powerwash', 'pressurewash', 'pressure-wash', 'pressure-washing'],
      descriptors: ['concrete-brightened', 'patio-wash', 'siding-rinse'],
      flowKeywords: ['streaking', 'runoff']
    },
    {
      slug: 'holiday-lighting',
      name: 'Holiday Lighting',
      keywords: ['holiday', 'lighting', 'lights', 'christmas', 'string-light'],
      descriptors: ['trimline', 'gable-outline'],
      flowKeywords: []
    }
  ],
  cities: [
    {
      slug: 'bellingham',
      name: 'Bellingham',
      state: 'WA',
      keywords: ['bellingham', 'fairhaven', 'whatcom']
    },
    {
      slug: 'ferndale',
      name: 'Ferndale',
      state: 'WA',
      keywords: ['ferndale', 'lynden', 'blaine']
    },
    {
      slug: 'mount-vernon',
      name: 'Mount Vernon',
      state: 'WA',
      keywords: ['mount-vernon', 'mt-vernon', 'skagit', 'burlington']
    },
    {
      slug: 'clarksville',
      name: 'Clarksville',
      state: 'TN',
      keywords: ['clarksville', 'tn', 'sango']
    }
  ],
  imageSettings: {
    full: { width: 2400, quality: 82 },
    medium: { width: 1200, quality: 80 },
    mobile: { width: 600, quality: 78 }
  },
  detection: {
    beforeKeywords: ['before', 'pre', 'dirty', 'clog', 'clogged', 'overflow', 'raw', 'old'],
    afterKeywords: ['after', 'post', 'clean', 'cleaned', 'final', 'done', 'finished', 'result', 'complete']
  },
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']
};
