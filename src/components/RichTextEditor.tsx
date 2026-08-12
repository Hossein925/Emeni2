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
  Palette,
  Type,
  Highlighter,
  Unlink,
  ExternalLink,
} from 'lucide-react';
import { EducationalContentRenderer } from './EducationalContentRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const PRESET_TEXT_COLORS = [
  { name: 'سفید', value: '#ffffff', bg: 'bg-white' },
  { name: 'مشکی/تیره', value: '#1e293b', bg: 'bg-slate-800' },
  { name: 'قرمز هشداری', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'کهربایی / طلایی', value: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'سبز درخشان', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'فیروزه‌ای', value: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'آبی روشن', value: '#38bdf8', bg: 'bg-sky-400' },
  { name: 'آبی تیره', value: '#2563eb', bg: 'bg-blue-600' },
  { name: 'بنفش', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'صورتی', value: '#f43f5e', bg: 'bg-rose-500' },
];

const PRESET_HIGHLIGHT_COLORS = [
  { name: 'بدون هایلایت', value: 'transparent', bg: 'bg-slate-700' },
  { name: 'زرد', value: '#fef08a', bg: 'bg-yellow-200' },
  { name: 'سبز', value: '#bbf7d0', bg: 'bg-emerald-200' },
  { name: 'آبی', value: '#bae6fd', bg: 'bg-sky-200' },
  { name: 'صورتی', value: '#fbcfe8', bg: 'bg-pink-200' },
  { name: 'نارنجی', value: '#fed7aa', bg: 'bg-orange-200' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [isPreview, setIsPreview] = useState(false);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Popover States
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

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

  // Sync contentEditable innerHTML ONLY when value changes externally
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

  const restoreCaretPosition = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const formatDoc = (cmd: string, val: string = '') => {
    restoreCaretPosition();
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyTextColor = (colorVal: string) => {
    formatDoc('foreColor', colorVal);
    setShowColorPicker(false);
  };

  const applyHighlightColor = (colorVal: string) => {
    formatDoc('hiliteColor', colorVal);
    setShowHighlightPicker(false);
  };

  // Open Link Modal
  const openLinkModal = () => {
    saveCaretPosition();
    let selectedTxt = '';
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      selectedTxt = sel.toString().trim();
    } else if (savedRangeRef.current) {
      selectedTxt = savedRangeRef.current.toString().trim();
    }
    setLinkText(selectedTxt);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  // Apply Link on Selection or Insert New Link
  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      alert('لطفاً آدرس اینترنتی (URL) لینک را وارد نمایید.');
      return;
    }

    let finalUrl = linkUrl.trim();
    if (
      !/^https?:\/\//i.test(finalUrl) &&
      !finalUrl.startsWith('mailto:') &&
      !finalUrl.startsWith('tel:') &&
      !finalUrl.startsWith('#')
    ) {
      finalUrl = 'https://' + finalUrl;
    }

    if (!editorRef.current) return;
    restoreCaretPosition();

    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed && sel.toString().trim().length > 0;

    if (hasSelection) {
      document.execCommand('createLink', false, finalUrl);
      const links = editorRef.current.querySelectorAll('a');
      links.forEach((a) => {
        if (a.getAttribute('href') === finalUrl) {
          if (openInNewTab) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          }
          a.style.color = '#38bdf8';
          a.style.textDecoration = 'underline';
          a.style.fontWeight = 'bold';
          a.className = 'text-cyan-400 underline font-bold hover:text-cyan-300';
        }
      });
    } else {
      const displayText = linkText.trim() || finalUrl;
      const targetAttr = openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
      const linkHtml = `<a href="${finalUrl}" ${targetAttr} style="color: #38bdf8; text-decoration: underline; font-weight: bold;" class="text-cyan-400 underline font-bold hover:text-cyan-300">${displayText}</a>&nbsp;`;
      insertHtmlToEditor(linkHtml);
    }

    onChange(editorRef.current.innerHTML);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleRemoveLink = () => {
    formatDoc('unlink');
    setShowLinkModal(false);
  };

  // Helper to fix double-encoded URLs
  const cleanVideoUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    let cleaned = rawUrl.trim();
    try {
      if (cleaned.includes('%25')) {
        cleaned = decodeURIComponent(cleaned);
      }
    } catch (e) {
      // ignore
    }
    return cleaned;
  };

  // Reliable HTML insertion helper
  const insertHtmlToEditor = (htmlStr: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    let targetRange: Range | null = null;

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
      editorRef.current.innerHTML += htmlStr;
    }

    savedRangeRef.current = null;
    onChange(editorRef.current.innerHTML);
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
          {/* Bold */}
          <button
            type="button"
            onClick={() => formatDoc('bold')}
            title="Bold (برجسته)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => formatDoc('italic')}
            title="Italic (کج)"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 border border-slate-700/80 rounded-xl px-2 py-1 bg-slate-900">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  saveCaretPosition();
                  formatDoc('fontSize', e.target.value);
                  e.target.value = '';
                }
              }}
              title="تغییر و افزایش اندازه متن"
              className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-300">اندازه قلم...</option>
              <option value="1" className="bg-slate-900 text-slate-200">خیلی کوچک (10px)</option>
              <option value="2" className="bg-slate-900 text-slate-200">کوچک (12px)</option>
              <option value="3" className="bg-slate-900 text-slate-200">عادی (14px)</option>
              <option value="4" className="bg-slate-900 text-slate-200">متوسط (16px)</option>
              <option value="5" className="bg-slate-900 text-slate-200">بزرگ (18px)</option>
              <option value="6" className="bg-slate-900 text-slate-200">خیلی بزرگ (24px)</option>
              <option value="7" className="bg-slate-900 text-slate-200">تیتر درشت (36px)</option>
            </select>
          </div>

          {/* Text Color Picker Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveCaretPosition();
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              title="تغییر رنگ متن"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
            >
              <Palette className="w-4 h-4 text-amber-400" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full right-0 mt-2 z-30 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-56 text-right space-y-2">
                <div className="text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
                  انتخاب رنگ نوشته:
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_TEXT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => applyTextColor(c.value)}
                      title={c.name}
                      className={`w-7 h-7 rounded-lg border border-slate-600 ${c.bg} hover:scale-110 transition cursor-pointer`}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">رنگ سفارشی:</span>
                  <input
                    type="color"
                    onChange={(e) => applyTextColor(e.target.value)}
                    className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Highlight Color Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                saveCaretPosition();
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              title="هایلایت و رنگ پس‌زمینه متن"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
            >
              <Highlighter className="w-4 h-4 text-yellow-300" />
            </button>

            {showHighlightPicker && (
              <div className="absolute top-full right-0 mt-2 z-30 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-56 text-right space-y-2">
                <div className="text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
                  هایلایت پس‌زمینه متن:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_HIGHLIGHT_COLORS.map((h) => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => applyHighlightColor(h.value)}
                      className="p-1.5 rounded-lg border border-slate-700 text-[10px] font-bold text-slate-900 bg-slate-200 hover:scale-105 transition cursor-pointer flex items-center justify-center gap-1"
                      style={{ backgroundColor: h.value === 'transparent' ? '#334155' : h.value, color: h.value === 'transparent' ? '#fff' : '#000' }}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Hyperlink Link Button */}
          <button
            type="button"
            onClick={openLinkModal}
            title="اعمال لینک روی نوشته انتخابی (Hyperlink)"
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-300"
          >
            <LinkIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold hidden sm:inline">لینک‌گذاری</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Headings */}
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

          {/* Unordered List */}
          <button
            type="button"
            onClick={() => formatDoc('insertUnorderedList')}
            title="لیست نقطه‌ای"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => formatDoc('insertOrderedList')}
            title="لیست عددی"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Blockquote */}
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
            <span>+ عکس</span>
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
            <span>+ فیلم</span>
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
              <span>ویرایشگر</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>پیش‌نمایش</span>
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

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 max-w-md w-full space-y-4 text-right shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-cyan-400" />
                افزودن و تنظیم لینک روی متن (Hyperlink)
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                متن نمایش‌داده‌شده:
              </label>
              <input
                type="text"
                placeholder="مثلاً: وب‌سایت سازمان نظام پزشکی"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                اگر متن متناظر را قبل از زدن دکمه لینک انتخاب کرده باشید، لینک مستقیماً روی همان نوشته اعمال می‌شود.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                آدرس اینترنتی لینک (URL):
              </label>
              <input
                type="text"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                dir="ltr"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-950 border-slate-700"
              />
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                باز شدن لینک در زبانه (تب) جدید مرورگر
              </span>
            </label>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleRemoveLink}
                className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-xs text-rose-300 font-bold cursor-pointer flex items-center gap-1"
                title="حذف لینک از متن انتخاب شده"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>حذف لینک</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-black cursor-pointer shadow-lg"
                >
                  تایید و اعمال لینک
                </button>
              </div>
            </div>
          </div>
        </div>
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

            {/* Video Title Input */}
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

