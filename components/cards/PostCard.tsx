import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/lib/types';

export const PostCard = ({ post }: { post: Post }) => {
  const publishedDate = post.published_at ? new Date(post.published_at).toLocaleDateString() : null;

  return (
    <article className="card h-full">
      {post.featured_image && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
          <Image src={post.featured_image} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-3">
          {publishedDate && <span className="text-xs font-semibold uppercase tracking-wide text-primary">{publishedDate}</span>}
          <h3 className="text-lg font-semibold text-slate-900">
            <Link href={`/blog/${post.slug}`} className="hover:text-primary">
              {post.title}
            </Link>
          </h3>
          {post.excerpt && <p className="text-sm text-slate-600">{post.excerpt}</p>}
        </div>
        <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Read Article
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
};
