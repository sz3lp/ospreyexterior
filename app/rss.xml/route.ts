import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/data';

const baseUrl = 'https://ospreyexterior.com';

export const GET = async () => {
  const posts = await getPosts();

  const items = posts
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`;
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      return `\n    <item>\n      <title><![CDATA[${post.title}]]></title>\n      <link>${url}</link>\n      <guid>${url}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <description><![CDATA[${post.excerpt || ''}]]></description>\n    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Osprey Exterior Project Journal</title>
      <link>${baseUrl}/blog</link>
      <description>Exterior remodeling inspiration, project recaps, and homeowner resources.</description>${items}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
