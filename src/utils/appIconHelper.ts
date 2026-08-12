import { DataAccessLayer } from '../services/dal';

// Helper utility for managing and dynamically applying App Icons & PWA Favicons

export interface ProcessedAppIcons {
  icon512: string;
  icon192: string;
  icon180: string;
  icon32: string;
}

const STORAGE_KEY = 'hospital_custom_app_icon';

/**
 * Applies the given base64 or Data URI icon to the document head
 */
export function applyAppIcon(iconDataUrl: string): void {
  if (typeof document === 'undefined' || !iconDataUrl) return;

  try {
    // 1. Update 32x32 Favicon
    let favicon32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]') ||
                    document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon32) {
      favicon32 = document.createElement('link');
      favicon32.rel = 'icon';
      document.head.appendChild(favicon32);
    }
    favicon32.href = iconDataUrl;
    favicon32.type = 'image/png';

    // 2. Update Apple Touch Icon (iOS Home Screen)
    let appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = iconDataUrl;

    // 3. Dynamic PWA Web App Manifest
    const manifestObject = {
      name: 'Safe Care - سامانه جامع مدیریت کیفیت و ایمنی بیمار',
      short_name: 'Safe Care',
      description: 'سامانه جامع اعتباربخشی، ارزیابی پرسنل، خطاهای پزشکی و ایمنی بیمار - Safe Care',
      start_url: '/',
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#0284c7',
      orientation: 'portrait',
      icons: [
        {
          src: iconDataUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: iconDataUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(manifestObject)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    } else {
      // revoke old URL if blob
      if (manifestLink.href.startsWith('blob:')) {
        URL.revokeObjectURL(manifestLink.href);
      }
    }
    manifestLink.href = manifestURL;

    // 4. Save to LocalStorage & Supabase DB asynchronously
    localStorage.setItem(STORAGE_KEY, iconDataUrl);
    DataAccessLayer.saveAppSetting('app_icon', iconDataUrl).catch(() => {});

    // 5. Dispatch Event for real-time reactivity in open windows
    window.dispatchEvent(new CustomEvent('app_icon_changed', { detail: iconDataUrl }));
  } catch (err) {
    console.error('Error applying custom app icon:', err);
  }
}

/**
 * Loads stored custom app icon on application startup (LocalStorage & Supabase)
 */
export function loadStoredAppIcon(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    applyAppIcon(stored);
  }

  // Also check Supabase DB in background
  DataAccessLayer.getAppSetting('app_icon').then((dbIcon) => {
    if (dbIcon && dbIcon !== stored) {
      applyAppIcon(dbIcon);
    }
  }).catch(() => {});

  return stored;
}

/**
 * Clears custom icon and restores default
 */
export function resetAppIconToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  
  // Remove custom dynamic manifest/favicon blob overrides
  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (manifestLink && manifestLink.href.startsWith('blob:')) {
    URL.revokeObjectURL(manifestLink.href);
    manifestLink.remove();
  }

  // Reload page or re-dispatch event
  window.dispatchEvent(new CustomEvent('app_icon_changed', { detail: null }));
}

/**
 * Processes an uploaded image File using HTML5 Canvas
 * Resizes and returns high-quality PNG Data URLs for different device dimensions
 */
export function processUploadedImageToIcon(file: File): Promise<ProcessedAppIcons> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خطا در خواندن فایل تصویر'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('فرمت تصویر پشتیبانی نمی‌شود'));
      img.onload = () => {
        try {
          const createResizedIcon = (size: number): string => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return '';

            // High-quality scaling settings
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Optional subtle rounded corners for app icon look
            const cornerRadius = size * 0.18; // Standard iOS/Android Squircle feel
            ctx.beginPath();
            ctx.moveTo(cornerRadius, 0);
            ctx.lineTo(size - cornerRadius, 0);
            ctx.quadraticCurveTo(size, 0, size, cornerRadius);
            ctx.lineTo(size, size - cornerRadius);
            ctx.quadraticCurveTo(size, size, size - cornerRadius, size);
            ctx.lineTo(cornerRadius, size);
            ctx.quadraticCurveTo(0, size, 0, size - cornerRadius);
            ctx.lineTo(0, cornerRadius);
            ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
            ctx.closePath();
            ctx.clip();

            // Draw image scaled to fill
            ctx.drawImage(img, 0, 0, size, size);

            return canvas.toDataURL('image/png', 0.95);
          };

          const icons: ProcessedAppIcons = {
            icon512: createResizedIcon(512),
            icon192: createResizedIcon(192),
            icon180: createResizedIcon(180),
            icon32: createResizedIcon(32),
          };

          resolve(icons);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
