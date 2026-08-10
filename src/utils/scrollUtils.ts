export const scrollToTopAndResetZoom = () => {
  try {
    // 1. Scroll window and document elements to absolute top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTop = 0;
    }

    // 2. Reset CSS zoom property on body if modified
    if (document.body) {
      document.body.style.zoom = '100%';
    }

    // 3. Reset mobile viewport pinch-zoom scale back to 1.0
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
      setTimeout(() => {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }, 50);
    }
  } catch (err) {
    console.error('Error resetting scroll and zoom:', err);
  }
};
