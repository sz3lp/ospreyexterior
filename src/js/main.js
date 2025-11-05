import { createSupabaseClient } from './supabaseClient.js';
import {
  SUPABASE_TABLE,
  SUPABASE_NOTIFICATION_EMAIL,
  QUALIFICATION_ENDPOINT,
} from './config.js';

const REQUIRED_LEAD_FIELDS = ['name', 'email', 'phone', 'zip', 'service'];

function pushEvent(event, details = {}) {
  if (typeof window.pushAnalyticsEvent === 'function') {
    window.pushAnalyticsEvent(event, details);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...details,
    });
  }
}

function ensureFieldName(form, selectors, name) {
  for (const selector of selectors) {
    const field = form.querySelector(selector);
    if (field) {
      field.setAttribute('name', name);
      return field;
    }
  }
  return null;
}

function createInputField({
  label,
  name,
  type = 'text',
  placeholder = '',
  required = false,
  autocomplete,
  pattern,
}) {
  const wrapper = document.createElement('div');
  const labelElement = document.createElement('label');
  labelElement.setAttribute('for', `${name}-field`);
  labelElement.textContent = label;

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
  } else {
    input = document.createElement('input');
    input.type = type;
  }

  input.id = `${name}-field`;
  input.name = name;
  if (placeholder) {
    input.placeholder = placeholder;
  }
  if (autocomplete) {
    input.autocomplete = autocomplete;
  }
  if (pattern) {
    input.pattern = pattern;
  }
  if (required) {
    input.required = true;
  }

  wrapper.appendChild(labelElement);
  wrapper.appendChild(input);
  return wrapper;
}

function ensureZipField(form, grid) {
  const existingZip = ensureFieldName(form, [
    'input[name="zip"]',
    'input[name="postal_code"]',
    'input[name="zip_code"]',
  ], 'zip');

  if (existingZip) {
    existingZip.id = existingZip.id || 'zip-field';
    existingZip.placeholder = existingZip.placeholder || '98004';
    existingZip.autocomplete = existingZip.autocomplete || 'postal-code';
    existingZip.required = true;
    return;
  }

  const zipField = createInputField({
    label: 'ZIP code',
    name: 'zip',
    placeholder: '98004',
    autocomplete: 'postal-code',
    required: true,
  });

  const addressField = form.querySelector('[name="address"]')?.closest('div');
  const notesField = form.querySelector('textarea')?.closest('div');
  if (addressField && addressField.parentElement === grid) {
    grid.insertBefore(zipField, notesField || addressField.nextSibling);
  } else {
    grid.appendChild(zipField);
  }
}

function ensureServiceField(form) {
  const serviceField = ensureFieldName(form, [
    'input[name="service"]',
    'input[name="service_type"]',
  ], 'service');

  if (serviceField) {
    serviceField.type = 'hidden';
    return serviceField;
  }

  const hiddenService = document.createElement('input');
  hiddenService.type = 'hidden';
  hiddenService.name = 'service';
  hiddenService.value = form.dataset.service || '';
  form.appendChild(hiddenService);
  return hiddenService;
}

function ensureNotesField(form, grid) {
  const notesField = ensureFieldName(form, [
    'textarea[name="notes"]',
    'textarea[name="message"]',
  ], 'notes');

  if (notesField) {
    notesField.placeholder = notesField.placeholder || 'Tell us about timing, debris, or access.';
    return;
  }

  const notesWrapper = createInputField({
    label: 'Notes (optional)',
    name: 'notes',
    type: 'textarea',
    placeholder: 'Tell us about timing, debris, or access.',
  });
  notesWrapper.style.gridColumn = '1 / -1';
  grid.appendChild(notesWrapper);
}

function ensureStatusElement(form) {
  let status = form.querySelector('.form-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-status';
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton && submitButton.parentElement === form) {
      form.insertBefore(status, submitButton.nextSibling);
    } else {
      form.appendChild(status);
    }
  }
  return status;
}

function standardizeLeadForm(form) {
  const grid = form.querySelector('.form-grid');
  if (!grid) {
    return;
  }

  const nameField = ensureFieldName(form, [
    'input[name="name"]',
    'input[name="full_name"]',
  ], 'name');
  if (nameField) {
    nameField.autocomplete = nameField.autocomplete || 'name';
    nameField.required = true;
  }

  const emailField = ensureFieldName(form, [
    'input[name="email"]',
    'input[type="email"]',
  ], 'email');
  if (emailField) {
    emailField.type = 'email';
    emailField.autocomplete = emailField.autocomplete || 'email';
    emailField.required = true;
  }

  const phoneField = ensureFieldName(form, [
    'input[name="phone"]',
    'input[name="phone_number"]',
    'input[type="tel"]',
  ], 'phone');
  if (phoneField) {
    phoneField.type = 'tel';
    phoneField.autocomplete = phoneField.autocomplete || 'tel';
    phoneField.required = true;
  }

  ensureZipField(form, grid);
  ensureServiceField(form);
  ensureNotesField(form, grid);

  const utmField = ensureFieldName(form, ['input[name="utm_source"]'], 'utm_source');
  if (utmField) {
    const params = new URLSearchParams(window.location.search);
    utmField.value = params.get('utm_source') || 'website';
  }

  const geoField = ensureFieldName(form, ['input[name="geo"]'], 'geo');
  if (geoField && geoField.value.trim() === '') {
    geoField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

function sanitizeLeadPayload(formData, form) {
  const cleaned = {};
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        cleaned[key] = trimmed;
      }
    }
  });

  cleaned.name = cleaned.name || cleaned.full_name || '';
  cleaned.email = cleaned.email || '';
  cleaned.phone = cleaned.phone || cleaned.phone_number || '';
  cleaned.zip = cleaned.zip || cleaned.postal_code || cleaned.zip_code || '';
  cleaned.service = cleaned.service || cleaned.service_type || form.dataset.service || '';
  cleaned.notes = cleaned.notes || cleaned.message || '';
  cleaned.city = cleaned.city || cleaned.geo || form.dataset.city || '';
  cleaned.source_url = window.location.href;
  cleaned.utm_source = cleaned.utm_source || 'website';

  if (SUPABASE_NOTIFICATION_EMAIL && !cleaned.notification_email) {
    cleaned.notification_email = SUPABASE_NOTIFICATION_EMAIL;
  }

  delete cleaned.full_name;
  delete cleaned.service_type;
  delete cleaned.message;
  delete cleaned.postal_code;
  delete cleaned.zip_code;

  return cleaned;
}

function validateLeadPayload(payload) {
  const missing = REQUIRED_LEAD_FIELDS.filter((field) => !payload[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

async function insertLead(payload) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .insert([payload])
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function triggerLeadQualification(leadId) {
  try {
    const response = await fetch(QUALIFICATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leadId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Qualification request failed');
    }
  } catch (error) {
    console.error('Lead qualification failed', error);
    throw error;
  }
}

function handleFormSubmit(form) {
  standardizeLeadForm(form);
  const statusElement = ensureStatusElement(form);
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.classList.remove('form-error', 'form-success');
    statusElement.textContent = 'Sending your request...';

    const originalButtonText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(form);
      const payload = sanitizeLeadPayload(formData, form);
      validateLeadPayload(payload);

      const lead = await insertLead(payload);
      const leadId = lead && (lead.id || lead.uuid || lead.lead_id);
      if (!leadId) {
        throw new Error('Lead insert did not return an id.');
      }

      form.dataset.leadId = leadId;
      form.classList.add('form-success');
      statusElement.textContent = 'Thanks! We received your request and will confirm shortly.';
      if (submitButton) {
        submitButton.textContent = 'Submitted';
      }

      form.reset();

      const eventName = form.getAttribute('data-event') || 'lead_submit';
      pushEvent(eventName, {
        service_type: payload.service || 'general',
        city: payload.city || 'unspecified',
      });

      try {
        await triggerLeadQualification(leadId);
      } catch (qualError) {
        statusElement.textContent =
          'We received your request, but automation needs another try. Our team will follow up if it does not resolve shortly.';
        form.classList.add('form-qualification-warning');
      }

      setTimeout(() => {
        const redirectUrl = new URL('/thank-you.html', window.location.origin);
        if (payload.service) {
          redirectUrl.searchParams.set('service_type', payload.service);
        }
        window.location.href = redirectUrl.toString();
      }, 500);
    } catch (error) {
      console.error(error);
      form.classList.add('form-error');
      statusElement.textContent =
        'Something went wrong while sending your request. Please check the form and try again.';
      if (submitButton) {
        submitButton.textContent = 'Try again';
      }
    } finally {
      if (submitButton) {
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }, 2000);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => {
      const eventName = element.getAttribute('data-track');
      const label = element.getAttribute('data-label') || element.textContent.trim();
      const city = element.getAttribute('data-city');
      const serviceType = element.getAttribute('data-service-type');
      const payload = { label };
      if (city) payload.city = city;
      if (serviceType) payload.service_type = serviceType;
      pushEvent(eventName, payload);
    });
  });

  document.querySelectorAll('.accordion-item').forEach((item) => {
    const button = item.querySelector('.accordion-button');
    if (!button) return;
    button.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });

  document.querySelectorAll('.before-after').forEach((component) => {
    const range = component.querySelector('input[type=range]');
    const after = component.querySelector('.after-image');
    if (range && after) {
      after.style.setProperty('--reveal', range.value);
      range.addEventListener('input', () => {
        after.style.setProperty('--reveal', range.value);
      });
    }
  });

  document.querySelectorAll('form[data-supabase]').forEach((form) => {
    handleFormSubmit(form);
  });

  const blogFeedGrid = document.querySelector('.blog-grid[data-feed-source]');
  if (blogFeedGrid) {
    const feedUrl = blogFeedGrid.getAttribute('data-feed-source') || '/feed.json';
    const placeholder = blogFeedGrid.innerHTML;

    const createBlogCard = (item) => {
      const article = document.createElement('article');
      article.className = 'blog-card';
      article.setAttribute('itemprop', 'itemListElement');
      article.setAttribute('itemscope', '');
      article.setAttribute('itemtype', 'https://schema.org/BlogPosting');

      if (Array.isArray(item.tags) && item.tags.length) {
        article.setAttribute('data-tags', item.tags.join(','));
      }

      const imageSrc = item.image || '/assets/images/permeable-hardscape-and-xericulture.webp';
      const img = document.createElement('img');
      img.src = imageSrc;
      img.loading = 'lazy';
      img.alt = item.title || 'Osprey Exterior blog post';
      img.setAttribute('itemprop', 'image');
      article.appendChild(img);

      const content = document.createElement('div');
      content.className = 'content';

      const heading = document.createElement('h3');
      heading.setAttribute('itemprop', 'headline');
      const link = document.createElement('a');
      link.href = item.url || item.id || '#';
      link.textContent = item.title || 'Read more';
      link.setAttribute('itemprop', 'url');
      heading.appendChild(link);
      content.appendChild(heading);

      if (item.summary) {
        const summary = document.createElement('p');
        summary.setAttribute('itemprop', 'description');
        summary.textContent = item.summary;
        content.appendChild(summary);
      }

      if (item.date_published) {
        const time = document.createElement('time');
        time.dateTime = item.date_published;
        const publishedDate = new Date(item.date_published);
        if (!Number.isNaN(publishedDate.getTime())) {
          time.textContent = publishedDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
        time.setAttribute('itemprop', 'datePublished');
        content.appendChild(time);
      }

      article.appendChild(content);
      return article;
    };

    fetch(feedUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load blog feed');
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.items)) {
          throw new Error('Invalid feed structure');
        }
        blogFeedGrid.innerHTML = '';
        data.items.slice(0, 6).forEach((item) => {
          blogFeedGrid.appendChild(createBlogCard(item));
        });
      })
      .catch((error) => {
        console.error(error);
        blogFeedGrid.innerHTML = placeholder;
      });
  }
});
