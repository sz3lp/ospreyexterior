if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/site/service-worker.js')
      .catch((error) => console.error('Service worker registration failed:', error));
  });
}
