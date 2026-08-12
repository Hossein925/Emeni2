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
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  FileVideo,
  FileImage,
} from 'lucide-react';
import { EducationalContentRenderer } from './EducationalContentRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [isPreview, setIsPreview] = useState(false);

  // Image Modal State
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isReadingImage, setIsReadingImage] = useState(false);

  // Video Modal State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTab, setVideoTab] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [isReadingVideo, setIsReadingVideo] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Sync contentEditable innerHTML ONLY when value changes externally to prevent resetting caret position
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isPreview]);

  // Save the user's caret selection position inside contentEditable
  const saveCaretPosition = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  // Helper to fix double-encoded URLs (e.g. %2520 -> %20)
  const cleanVideoUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    let cleaned = rawUrl.trim();
    try {
      if (cleaned.includes('%25')) {
        cleaned = decodeURIComponent(cleaned);
      }
    } catch (e) {
      // ignore decode error
    }
    return cleaned;
  };

  // Reliable HTML insertion helper into contentEditable at exact cursor position
  const insertHtmlToEditor = (htmlStr: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    const selection = window.getSelection();
    let targetRange: Range | null = null;

    // Check saved range or active selection inside editorRef
    if (
      savedRangeRef.current &&
      editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)
    ) {
      targetRange = savedRangeRef.current.cloneRange();
    } else if (selection && selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0);
      if (editorRef.current.contains(currentRange.commonAncestorContainer)) {
        targetRange = currentRange;
      }
    }

    if (targetRange && selection) {
      selection.removeAllRanges();
      selection.addRange(targetRange);

      targetRange.deleteContents();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlStr;

      const frag = document.createDocumentFragment();
      let node: Node | null;
      let lastNode: Node | null = null;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }

      targetRange.insertNode(frag);

      if (lastNode) {
        targetRange.setStartAfter(lastNode);
        targetRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(targetRange);
      }
    } else {
      // Append at bottom if no active range
      editorRef.current.innerHTML += htmlStr;
    }

    savedRangeRef.current = null;
    onChange(editorRef.current.innerHTML);
  };

  const formatDoc = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Image File Upload Handler
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsReadingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreviewUrl(dataUrl);
      setIsReadingImage(false);
    };
    reader.onerror = () => {
      alert('خطا در خواندن فایل تصویر.');
      setIsReadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInsertImage = () => {
    let finalSrc = '';
    if (imageTab === 'url') {
      if (!imageUrl.trim()) {
        alert('لطفاً آدرس اینترنتی تصویر را وارد کنید.');
        return;
      }
      finalSrc = imageUrl.trim();
    } else {
      if (!imagePreviewUrl) {
        alert('لطفاً یک فایل تصویر انتخاب کنید.');
        return;
      }
      finalSrc = imagePreviewUrl;
    }

    const imgHtml = `
      <div class="my-3" style="display: block; clear: both;">
        <img src="${finalSrc}" alt="تصویر آموزشی" style="max-width: 100%; height: auto; border-radius: 16px; margin: 8px 0; border: 2px solid rgba(99, 102, 241, 0.25); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);" />
      </div>
      <p><br></p>
    `;
    insertHtmlToEditor(imgHtml);

    // Reset Image Modal State
    setImageUrl('');
    setImageFile(null);
    setImagePreviewUrl('');
    setShowImageModal(false);
  };

  // Video File Upload Handler
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('حجم فایل ویدیو بسیار بالا است (بیش از ۱۰۰ مگابایت). لطفاً جهت کارایی بهتر فایل کم‌حجم‌تری انتخاب فرمایید.');
    }

    setVideoFile(file);
    setIsReadingVideo(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setVideoPreviewUrl(dataUrl);
      setIsReadingVideo(false);
    };
    reader.onerror = () => {
      alert('خطا در خواندن فایل ویدیو.');
      setIsReadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInsertVideo = () => {
    let finalSrc = '';
    let finalTitle = videoTitle.trim() || 'ویدیوی آموزشی';

    if (videoTab === 'url') {
      if (!videoUrl.trim()) {
        alert('لطفاً لینک مستقیم ویدیو را وارد فرمایید.');
        return;
      }
      finalSrc = cleanVideoUrl(videoUrl);
    } else {
      if (!videoPreviewUrl) {
        alert('لطفاً یک فایل ویدیو انتخاب فرمایید.');
        return;
      }
      finalSrc = videoPreviewUrl;
      if (!videoTitle.trim() && videoFile?.name) {
        finalTitle = videoFile.name;
      }
    }

    const videoHtml = `
      <div class="custom-video-wrapper my-4" data-video-src="${finalSrc}" data-video-title="${finalTitle}" style="display: block; clear: both; margin: 16px 0;">
        <video src="${finalSrc}" controls playsinline style="width:100%; max-height:480px; border-radius:16px; border:2px solid #6366f1; background:#000; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); margin: 12px 0;"></video>
      </div>
      <p><br></p>
    `;

    insertHtmlToEditor(videoHtml);

    // Reset Video Modal State
    setVideoUrl('');
    setVideoTitle('');
    setVideoFile(null);
    setVideoPreviewUrl('');
    setShowVideoModal(false);
  };

  return (
    <div className="w-full bg-slate-900 border-2 border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => formatDoc('bold')}
            title="Bold (برجسته)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('italic')}
            title="Italic (کج)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => formatDoc('formatBlock', '<h2>')}
            title="تیتر اصلی (H2)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('formatBlock', '<h3>')}
            title="تیتر فرعی (H3)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => formatDoc('insertUnorderedList')}
            title="لیست نقطه‌ای"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('insertOrderedList')}
            title="لیست عددی"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('formatBlock', '<blockquote>')}
            title="نقل قول / کادر برجسته"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Add Image Button */}
          <button
            type="button"
            onClick={() => {
              saveCaretPosition();
              setShowImageModal(true);
            }}
            title="افزودن تصویر (لینک یا آپلود فایل)"
            className="p-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-cyan-100 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>+ افزودن عکس</span>
          </button>

          {/* Add Video Button */}
          <button
            type="button"
            onClick={() => {
              saveCaretPosition();
              setShowVideoModal(true);
            }}
            title="افزودن ویدیو (لینک یا آپلود فایل)"
            className="p-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-indigo-100 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Video className="w-4 h-4 text-indigo-400" />
            <span>+ افزودن فیلم (با پلیر قوی)</span>
          </button>
        </div>

        {/* Toggle Mode Button */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer border border-slate-700"
        >
          {isPreview ? (
            <>
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>بازگشت به ویرایشگر</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>پیش‌نمایش نهایی</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      {isPreview ? (
        <div className="p-4 sm:p-6 bg-slate-900 min-h-[260px] text-right">
          <EducationalContentRenderer html={value} className="text-slate-100" />
        </div>
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          onInput={(e) => {
            saveCaretPosition();
            onChange(e.currentTarget.innerHTML);
          }}
          onClick={saveCaretPosition}
          onKeyUp={saveCaretPosition}
          onFocus={saveCaretPosition}
          onBlur={saveCaretPosition}
          className="p-4 sm:p-6 text-slate-100 text-sm leading-relaxed focus:outline-none min-h-[260px] max-h-[500px] overflow-y-auto text-right font-medium"
        />
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 text-right shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                افزودن تصویر به مطلب آموزشی
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  imageTab === 'url'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>لینک مستقیم (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  imageTab === 'upload'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>آپلود فایل تصویر</span>
              </button>
            </div>

            {/* Tab 1: URL Mode */}
            {imageTab === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  آدرس اینترنتی مستقیم تصویر (Image URL)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/hospital-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  dir="ltr"
                />
                {imageUrl && (
                  <div className="mt-2 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center max-h-40 overflow-hidden">
                    <img src={imageUrl} alt="پیش‌نمایش" className="max-h-36 rounded-xl object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Upload File Mode */}
            {imageTab === 'upload' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  انتخاب فایل تصویر از کامپیوتر یا گوشی
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-950/60 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isReadingImage ? (
                    <div className="flex flex-col items-center gap-2 text-cyan-400">
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span className="text-xs font-bold">در حال بارگذاری تصویر...</span>
                    </div>
                  ) : imageFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileImage className="w-8 h-8 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200">{imageFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(imageFile.size / (1024 * 1024)).toFixed(2)} مگابایت
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="w-8 h-8 text-cyan-400 mb-1" />
                      <span className="text-xs font-bold text-slate-200">جهت آپلود عکس اینجا کلیک کنید</span>
                      <span className="text-[10px] text-slate-500">پشتیبانی از PNG, JPG, WEBP</span>
                    </div>
                  )}
                </div>

                {imagePreviewUrl && (
                  <div className="mt-2 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center max-h-40 overflow-hidden">
                    <img src={imagePreviewUrl} alt="پیش‌نمایش عکس" className="max-h-36 rounded-xl object-contain" />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={isReadingImage}
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-black cursor-pointer shadow-lg disabled:opacity-50"
              >
                درج تصویر در مطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 text-right shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                افزودن ویدیوی آموزشی (همراه با پلیر اختصاصی)
              </h4>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Title Input (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عنوان ویدیو (جهت نمایش بالای پلیر)
              </label>
              <input
                type="text"
                placeholder="مثلاً: فیلم آموزشی نحوه صحیح شستشوی دست با اسکراب"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setVideoTab('url')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  videoTab === 'url'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>لینک مستقیم ویدیو (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoTab('upload')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  videoTab === 'upload'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>آپلود فایل ویدیو</span>
              </button>
            </div>

            {/* Tab 1: Video URL Mode */}
            {videoTab === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  لینک مستقیم فایل ویدیو (پشتیبانی از uupload، picofile و تمامی آپلودسنترها)
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: https://s17.uupload.ir/files/.../video.mp4?play"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] font-bold text-indigo-300/80 leading-relaxed">
                  هرگونه لینک مستقیم ویدیو (با پسوند MP4/WebM یا پارامترهای آنلاین) پذیرفته شده و با پلیر پیشرفته همراه با امکان پخش تمام‌صفحه قرار می‌گیرد.
                </p>
              </div>
            )}

            {/* Tab 2: Video Upload File Mode */}
            {videoTab === 'upload' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  انتخاب فایل ویدیویی از دستگاه
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-950/60 transition relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isReadingVideo ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-bold">در حال پردازش و خواندن فایل ویدیو...</span>
                    </div>
                  ) : videoFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileVideo className="w-9 h-9 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">{videoFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        حجم: {(videoFile.size / (1024 * 1024)).toFixed(2)} مگابایت
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="w-8 h-8 text-indigo-400 mb-1" />
                      <span className="text-xs font-bold text-slate-200">جهت انتخاب و آپلود فیلم اینجا کلیک کنید</span>
                      <span className="text-[10px] text-slate-500">پشتیبانی از MP4, WebM, MOV, AVI</span>
                    </div>
                  )}
                </div>

                {videoPreviewUrl && (
                  <div className="mt-2 rounded-2xl overflow-hidden border border-indigo-500/30 bg-black">
                    <video src={videoPreviewUrl} controls className="w-full max-h-40 object-contain" />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                disabled={isReadingVideo}
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-black cursor-pointer shadow-lg disabled:opacity-50"
              >
                درج فیلم در مطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
