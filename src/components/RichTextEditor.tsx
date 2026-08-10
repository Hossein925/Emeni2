import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Quote,
  Eye,
  Edit3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync contentEditable innerHTML ONLY when value changes externally to prevent resetting caret position!
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isPreview]);

  const formatDoc = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    const imgHtml = `<img src="${imageUrl}" alt="تصویر آموزشی" style="max-width: 100%; border-radius: 12px; margin: 12px 0; border: 1px solid rgba(255,255,255,0.1);" />`;
    formatDoc('insertHTML', imgHtml);
    setImageUrl('');
    setShowImageModal(false);
  };

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;
    let embedSrc = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      const vId = new URL(videoUrl).searchParams.get('v');
      if (vId) embedSrc = `https://www.youtube.com/embed/${vId}`;
    } else if (videoUrl.includes('aparat.com/v/')) {
      const parts = videoUrl.split('/v/');
      if (parts[1]) embedSrc = `https://www.aparat.com/video/video/embed/videohash/${parts[1]}/vt/frame`;
    }

    const videoHtml = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 16px 0;">
        <iframe src="${embedSrc}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"></iframe>
      </div>
    `;
    formatDoc('insertHTML', videoHtml);
    setVideoUrl('');
    setShowVideoModal(false);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-950 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => formatDoc('bold')}
            title="Bold"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('italic')}
            title="Italic"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => formatDoc('formatBlock', '<h2>')}
            title="Heading 2"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('formatBlock', '<h3>')}
            title="Heading 3"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => formatDoc('insertUnorderedList')}
            title="Bullet List"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('insertOrderedList')}
            title="Numbered List"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('formatBlock', '<blockquote>')}
            title="Quote"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="درج تصویر"
            className="p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition flex items-center gap-1 text-xs cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">عکس</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            title="درج ویدیو"
            className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition flex items-center gap-1 text-xs cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">ویدیو</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
        >
          {isPreview ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>ویرایش</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>پیش‌نمایش</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Editable Area */}
      {isPreview ? (
        <div
          dir="rtl"
          className="p-4 sm:p-6 text-slate-100 text-sm leading-relaxed prose prose-invert max-w-none min-h-[220px] text-right"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-slate-500">محتوایی ثبت نشده است.</p>' }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className="p-4 sm:p-6 text-slate-100 text-sm leading-relaxed focus:outline-none min-h-[220px] max-h-[400px] overflow-y-auto text-right"
        />
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              افزودن آدرس تصویر (URL)
            </h4>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              dir="ltr"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-medium cursor-pointer"
              >
                درج تصویر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              افزودن لینک ویدیو (آپارات / یوتیوب / لینک مستقیم)
            </h4>
            <input
              type="text"
              placeholder="https://www.aparat.com/v/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              dir="ltr"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium cursor-pointer"
              >
                درج ویدیو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
