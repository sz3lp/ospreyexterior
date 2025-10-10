'use client';

import { FormEvent, useState, useTransition } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { LeadPayload } from '@/lib/types';

const initialState: LeadPayload = {
  full_name: '',
  email: '',
  phone: '',
  city: '',
  message: '',
  source: 'website'
};

export const LeadForm = ({ city }: { city?: string }) => {
  const [formState, setFormState] = useState<LeadPayload>({ ...initialState, city: city || '' });
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const supabase = supabaseBrowserClient();
        const { error } = await supabase.from('leads').insert({
          full_name: formState.full_name,
          email: formState.email,
          phone: formState.phone,
          city: formState.city,
          message: formState.message,
          source: formState.source,
          page_path: window.location.pathname
        });

        if (error) {
          console.error('[Supabase] lead insert error', error);
          setStatusMessage('Something went wrong. Please try again or call us directly.');
          return;
        }

        setStatusMessage('Thank you! Our team will reach out shortly.');
        setFormState({ ...initialState, city: city || '' });
      } catch (err) {
        console.error(err);
        setStatusMessage('Something went wrong. Please try again later.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" id="contact">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Request a Quote</h3>
          <p className="text-sm text-slate-600">Tell us about your project and we will contact you within one business day.</p>
        </div>
        <span className="hidden h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25C21.66 3 22.5 3.839 22.5 4.875v14.25c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 19.125V4.875Zm1.875-.375a.375.375 0 0 0-.375.375v.428l8.759 5.37a.75.75 0 0 0 .782 0l8.759-5.37V4.875a.375.375 0 0 0-.375-.375H3.375Zm17.25 2.297-7.977 4.89a2.25 2.25 0 0 1-2.296 0L2.25 6.797v12.328c0 .207.168.375.375.375h17.25a.375.375 0 0 0 .375-.375V6.797Z" />
          </svg>
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
          <input
            required
            type="text"
            name="full_name"
            value={formState.full_name}
            onChange={(event) => setFormState((prev) => ({ ...prev, full_name: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Jane Smith"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
          <input
            required
            type="email"
            name="email"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formState.phone}
            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="(425) 555-0123"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</label>
          <input
            required
            type="text"
            name="city"
            value={formState.city}
            onChange={(event) => setFormState((prev) => ({ ...prev, city: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Bellevue"
          />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project Details</label>
        <textarea
          required
          name="message"
          value={formState.message}
          onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
          className="h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Tell us about the scope, timeline, and any inspiration you have."
        />
      </div>
      <button type="submit" className="btn-primary mt-6 w-full md:w-auto" disabled={isPending}>
        {isPending ? 'Sending...' : 'Get My Quote'}
      </button>
      {statusMessage && <p className="mt-3 text-sm text-primary-dark">{statusMessage}</p>}
    </form>
  );
};
