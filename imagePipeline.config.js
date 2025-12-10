module.exports = {
  incomingDir: './incoming-photos',
  processedArchiveDir: './incoming-photos/processed',
  jobsDir: './jobs',
  clustering: {
    maxMiles: 1,
    maxMs: 4 * 60 * 60 * 1000
  },
  geocoder: {
    provider: 'openstreetmap'
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    bucket: 'public'
  },
  imageSettings: {
    full: { width: 2400, quality: 82 },
    medium: { width: 1200, quality: 80 },
    mobile: { width: 600, quality: 78 }
  },
  detection: {
    beforeKeywords: ['before', 'pre', 'dirty', 'clog', 'clogged', 'overflow', 'raw', 'old'],
    afterKeywords: ['after', 'post', 'clean', 'cleaned', 'final', 'done', 'finished', 'result', 'complete']
  },
  serviceTypeNames: {
    'gutter-cleaning': 'Gutter Cleaning',
    'roof-cleaning': 'Roof Cleaning',
    'pressure-washing': 'Pressure Washing',
    'holiday-lighting': 'Holiday Lighting',
    unknown: 'Exterior Service'
  },
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']
};
