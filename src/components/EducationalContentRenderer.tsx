import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface EducationalContentRendererProps {
  html: string;
  className?: string;
}

export const EducationalContentRenderer: React.FC<EducationalContentRendererProps> = ({
  html,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set HTML content
    containerRef.current.innerHTML = html || '';

    // Collect all video elements safely
    const elementsToProcess: { element: Element; src: string; title: string }[] = [];
    const wrappers = Array.from(
      containerRef.current.querySelectorAll('.custom-video-wrapper, .video-embed-wrapper')
    ) as HTMLElement[];

    wrappers.forEach((wrapper) => {
      const videoChild = wrapper.querySelector('video') as HTMLVideoElement | null;
      const src =
        wrapper.getAttribute('data-video-src') ||
        videoChild?.getAttribute('src') ||
        videoChild?.src ||
        '';
      const title =
        wrapper.getAttribute('data-video-title') ||
        videoChild?.getAttribute('data-title') ||
        '';
      if (src) {
        elementsToProcess.push({ element: wrapper, src, title });
      }
    });

    // Find any standalone video tags not inside wrappers
    const allVideos = Array.from(containerRef.current.querySelectorAll('video')) as HTMLVideoElement[];
    allVideos.forEach((video) => {
      const isInsideWrapper = wrappers.some((w) => w.contains(video));
      if (!isInsideWrapper) {
        const src = video.getAttribute('src') || video.src || '';
        const title = video.getAttribute('data-title') || video.title || '';
        if (src) {
          elementsToProcess.push({ element: video, src, title });
        }
      }
    });

    const roots: ReactDOM.Root[] = [];

    // Replace each video element/wrapper with CustomVideoPlayer
    elementsToProcess.forEach(({ element, src, title }) => {
      if (!element.parentNode) return;

      const mountNode = document.createElement('div');
      mountNode.className = 'my-4 w-full';
      element.parentNode.replaceChild(mountNode, element);

      const root = ReactDOM.createRoot(mountNode);
      root.render(<CustomVideoPlayer src={src} title={title} />);
      roots.push(root);
    });

    return () => {
      roots.forEach((root) => {
        setTimeout(() => {
          try {
            root.unmount();
          } catch (e) {
            // ignore
          }
        }, 0);
      });
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`text-slate-900 text-sm font-bold leading-relaxed space-y-4 max-w-none text-right ${className}`}
    />
  );
};

