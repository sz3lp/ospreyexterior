import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const envFiles = ['.env.local', '.env'];

for (const fileName of envFiles) {
  const filePath = resolve(projectRoot, fileName);
  if (!existsSync(filePath)) {
    continue;
  }

  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || key in process.env) {
      continue;
    }

    let value = trimmed.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value.replace(/\\n/g, '\n');
  }
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Ensure SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

async function main() {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No posts found in the posts table.');
    return;
  }

  console.log(`Fetched ${data.length} post${data.length === 1 ? '' : 's'}:\n`);
  for (const post of data) {
    const { id, title, created_at: createdAt } = post;
    console.log(`- [${id}] ${title ?? '(no title)'}`);
    if (createdAt) {
      console.log(`  created_at: ${createdAt}`);
    }
  }
}

main().catch((err) => {
  console.error('Unexpected error while listing posts:', err);
  process.exit(1);
});
