(function () {
  const dataLayer = window.dataLayer || (window.dataLayer = []);
  const trackEvent = (detail) => {
    dataLayer.push({ event: 'interaction', ...detail });
  };

  const readingTarget = document.getElementById('reading-time');
  const article = document.querySelector('article');
  if (readingTarget && article) {
    const text = article.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    readingTarget.textContent = `${minutes} min read`;
  }

  const progressBar = document.querySelector('.scroll-progress__bar');
  const updateScroll = () => {
    if (!progressBar || !article) return;
    const totalHeight = article.offsetHeight;
    const scrolled = Math.min(Math.max(window.scrollY - article.offsetTop, 0), totalHeight);
    const percent = totalHeight ? (scrolled / totalHeight) * 100 : 0;
    progressBar.style.transform = `scaleX(${percent / 100})`;
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  const scrollThresholds = [25, 50, 75, 100];
  const firedThresholds = new Set();
  const handleScrollDepth = () => {
    if (!article) return;
    const totalHeight = article.offsetHeight;
    const scrolled = Math.min(Math.max(window.scrollY - article.offsetTop + window.innerHeight, 0), totalHeight);
    const percent = totalHeight ? Math.round((scrolled / totalHeight) * 100) : 0;
    scrollThresholds.forEach((threshold) => {
      if (percent >= threshold && !firedThresholds.has(threshold)) {
        firedThresholds.add(threshold);
        trackEvent({ interaction_type: 'scroll_depth', depth: threshold, page: 'rainwise-rebate' });
      }
    });
  };
  window.addEventListener('scroll', handleScrollDepth, { passive: true });

  const ambientToggle = document.querySelector('.ambient-toggle');
  const ambientAudio = document.getElementById('ambient-audio');
  if (ambientToggle && ambientAudio) {
    let playing = false;
    const updateAmbientUI = () => {
      ambientToggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
      ambientToggle.querySelector('.ambient-toggle__label').textContent = playing ? 'Pause Rain Ambience' : 'Play Rain Ambience';
    };
    updateAmbientUI();
    ambientToggle.addEventListener('click', async () => {
      playing = !playing;
      try {
        if (playing) {
          await ambientAudio.play();
          trackEvent({ interaction_type: 'ambient_play', page: 'rainwise-rebate' });
        } else {
          ambientAudio.pause();
          trackEvent({ interaction_type: 'ambient_pause', page: 'rainwise-rebate' });
        }
      } catch (error) {
        playing = false;
      }
      updateAmbientUI();
    });
  }

  const hapticElements = document.querySelectorAll('[data-track="cta"], .ambient-toggle');
  hapticElements.forEach((el) => {
    el.addEventListener('click', () => {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  const addressField = document.getElementById('address-field');
  if (addressField && 'geolocation' in navigator) {
    addressField.addEventListener('focus', () => {
      if (addressField.dataset.geoLoaded) return;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            if (!response.ok) throw new Error('Geocode failed');
            const data = await response.json();
            if (data && data.display_name) {
              addressField.value = data.display_name;
              addressField.dataset.geoLoaded = 'true';
            }
          } catch (error) {
            addressField.placeholder = 'Seattle, WA';
          }
        },
        () => {
          addressField.placeholder = 'Seattle, WA';
        }
      );
    }, { once: true });
  }

  const heroIndicator = document.querySelector('.scroll-indicator');
  if (heroIndicator) {
    heroIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('#problem');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const tocNav = document.querySelector('.post-toc');
  if (tocNav) {
    const tocLinks = Array.from(tocNav.querySelectorAll('a[href^="#"]'));
    const tocSections = tocLinks
      .map((link) => {
        const selector = link.getAttribute('href');
        const section = selector ? document.querySelector(selector) : null;
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    const setActiveLink = (activeLink) => {
      tocLinks.forEach((link) => {
        link.classList.toggle('is-active', link === activeLink);
      });
    };

    if (tocSections.length) {
      const tocObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const match = tocSections.find(({ section }) => section === entry.target);
                if (match) {
                  setActiveLink(match.link);
                }
              }
            });
          }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.2 })
        : null;

      tocSections.forEach(({ section }) => {
        if (tocObserver) {
          tocObserver.observe(section);
        }
      });

      tocLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          const selector = link.getAttribute('href');
          const target = selector ? document.querySelector(selector) : null;
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (!('IntersectionObserver' in window)) {
              setActiveLink(link);
            }
            trackEvent({ interaction_type: 'toc_click', section: selector.replace('#', ''), page: 'rainwise-rebate' });
          }
        });
      });

      const firstActive = tocSections[0];
      if (firstActive) {
        setActiveLink(firstActive.link);
      }
    }
  }

  const videos = document.querySelectorAll('video.step-video, .hero-video');
  videos.forEach((video) => {
    video.addEventListener('play', () => {
      const id = video.dataset.videoId || video.className || 'video';
      trackEvent({ interaction_type: 'video_play', video_id: id, page: 'rainwise-rebate' });
    }, { once: true });
  });

  const iframe = document.querySelector('.process-video');
  if (iframe) {
    const onMessage = (event) => {
      if (!iframe.contentWindow || event.source !== iframe.contentWindow) return;
      if (typeof event.data === 'string' && event.data.includes('play')) {
        trackEvent({ interaction_type: 'video_play', video_id: 'process-overview', page: 'rainwise-rebate' });
        window.removeEventListener('message', onMessage);
      }
    };
    window.addEventListener('message', onMessage);
  }

  const slider = document.querySelector('.proof-slider');
  if (slider) {
    const track = slider.querySelector('.slider-track');
    const cards = Array.from(slider.querySelectorAll('.proof-card'));
    const prev = slider.querySelector('.slider-control--prev');
    const next = slider.querySelector('.slider-control--next');
    let index = 0;
    const updateSlider = () => {
      if (!cards.length) return;
      const cardWidth = cards[0].getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gapValue = styles.columnGap !== 'normal' ? styles.columnGap : styles.gap;
      const gap = parseFloat(gapValue === 'normal' ? '0' : gapValue || '0');
      const offset = -(cardWidth + gap) * index;
      track.style.transform = `translateX(${offset}px)`;
    };
    const clampIndex = () => {
      if (index < 0) index = cards.length - 1;
      if (index >= cards.length) index = 0;
    };
    const goNext = () => {
      index += 1;
      clampIndex();
      updateSlider();
    };
    const goPrev = () => {
      index -= 1;
      clampIndex();
      updateSlider();
    };
    let autoPlay = setInterval(goNext, 6000);
    const pause = () => clearInterval(autoPlay);
    const resume = () => {
      autoPlay = setInterval(goNext, 6000);
    };
    slider.addEventListener('mouseenter', pause);
    slider.addEventListener('mouseleave', resume);
    if (next) next.addEventListener('click', () => { goNext(); pause(); });
    if (prev) prev.addEventListener('click', () => { goPrev(); pause(); });
    updateSlider();
  }

  const parallaxImage = document.querySelector('.parallax-frame img');
  if (parallaxImage) {
    const updateParallax = () => {
      const rect = parallaxImage.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1;
      const offset = (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;
      const translate = Math.max(Math.min(offset * -40, 30), -30);
      parallaxImage.style.setProperty('--parallax-offset', `${translate}px`);
    };
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }

  const modals = document.querySelectorAll('.modal');
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.hidden = false;
      modal.classList.add('is-active');
      modal.querySelector('.modal__close').focus();
    }
  };
  const closeModal = (modal) => {
    modal.hidden = true;
    modal.classList.remove('is-active');
  };
  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const id = trigger.getAttribute('data-modal');
      if (id) openModal(id);
    });
  });
  modals.forEach((modal) => {
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      modals.forEach((modal) => {
        if (!modal.hidden) closeModal(modal);
      });
    }
  });

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 }) : null;
  if (observer) {
    document.querySelectorAll('.timeline-step').forEach((step, index) => {
      step.style.setProperty('--timeline-index', index);
      observer.observe(step);
    });
  } else {
    document.querySelectorAll('.timeline-step').forEach((step) => step.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  handleScrollDepth();
})();
