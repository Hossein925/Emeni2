import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  HelpCircle,
  Sparkles,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';

export interface FishboneSubcause {
  id: string;
  text: string;
}

export interface FishboneCause {
  id: string;
  text: string;
  subcauses: FishboneSubcause[];
}

export interface FishboneCategoryData {
  id: string;
  title: string;
  shortTitle: string;
  icon?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  fieldKey: string;
  rawText: string;
}

interface FishboneDiagramProps {
  eventTitle: string;
  categories: FishboneCategoryData[];
  onUpdateCategoryText: (fieldKey: string, newText: string) => void;
  onUpdateEventTitle?: (newTitle: string) => void;
  readOnly?: boolean;
}

// Utility: parse multi-line raw string into structured Causes & Subcauses
export function parseRawTextToCauses(rawText: string): FishboneCause[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split('\n');
  const causes: FishboneCause[] = [];
  let currentCause: FishboneCause | null = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if line is indented or marked as subcause (starts with '  ', '\t', '*', '+', '>', '└', '|-')
    const isIndented =
      line.startsWith(' ') ||
      line.startsWith('\t') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('+') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('└') ||
      trimmed.startsWith('|-');

    const cleanText = trimmed.replace(/^[-*+>└|–—•\d+\.]\s*/, '').trim();
    if (!cleanText) return;

    if (isIndented && currentCause) {
      currentCause.subcauses.push({
        id: `sub-${index}-${Math.random()}`,
        text: cleanText,
      });
    } else {
      currentCause = {
        id: `cause-${index}-${Math.random()}`,
        text: cleanText,
        subcauses: [],
      };
      causes.push(currentCause);
    }
  });

  return causes;
}

// Utility: convert structured Causes back to multi-line string
export function serializeCausesToRawText(causes: FishboneCause[]): string {
  return causes
    .map((c) => {
      const main = `- ${c.text}`;
      const subs = c.subcauses.map((sc) => `  * ${sc.text}`).join('\n');
      return subs ? `${main}\n${subs}` : main;
    })
    .join('\n');
}

export const FishboneDiagram: React.FC<FishboneDiagramProps> = ({
  eventTitle,
  categories,
  onUpdateCategoryText,
  onUpdateEventTitle,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active Selected Node for Editing
  const [selectedNode, setSelectedNode] = useState<{
    type: 'event' | 'category' | 'cause' | 'subcause';
    categoryFieldKey?: string;
    causeIndex?: number;
    subcauseIndex?: number;
    initialText?: string;
  } | null>(null);

  const [editText, setEditText] = useState<string>('');
  const [newSubcauseText, setNewSubcauseText] = useState<string>('');
  const [newCauseText, setNewCauseText] = useState<string>('');

  // Parsed Causes per category
  const parsedCategoryData = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      causes: parseRawTextToCauses(cat.rawText),
    }));
  }, [categories]);

  // Calculate dynamic SVG canvas dimensions based on max causes count
  const maxCausesCount = useMemo(() => {
    return Math.max(...parsedCategoryData.map((c) => c.causes.length), 1);
  }, [parsedCategoryData]);

  // SVG Geometry constants - Generous left & right margins so tail and head are never cut off
  const svgWidth = 1600;
  const svgHeight = Math.max(760, 520 + maxCausesCount * 45);
  const spineY = svgHeight / 2;
  const spineXLeft = 280; // Ample margin on left for tail & category labels
  const spineXRight = 1300; // Where event head box attaches
  const eventBoxWidth = 260;
  const eventBoxHeight = 110;

  // Split categories: 3 Top (0,1,2), 3 Bottom (3,4,5)
  const topCategories = parsedCategoryData.slice(0, 3);
  const bottomCategories = parsedCategoryData.slice(3, 6);

  // Handle Zoom controls (Supports up to 500% / 5.0x Zoom)
  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.3).toFixed(2)), 5.0));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.3).toFixed(2)), 0.3));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan / Drag handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Wheel / Trackpad Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      const delta = e.deltaX || e.deltaY;
      setPan((p) => ({
        ...p,
        x: Math.max(-1200, Math.min(1200, p.x - delta)),
      }));
    } else if (e.ctrlKey) {
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((z) => Math.max(0.3, Math.min(5.0, Number((z + zoomDelta).toFixed(2)))));
    } else {
      setPan((p) => ({
        ...p,
        y: Math.max(-600, Math.min(600, p.y - e.deltaY)),
      }));
    }
  };

  // Edit Node Handlers
  const handleOpenEdit = (
    type: 'event' | 'category' | 'cause' | 'subcause',
    categoryFieldKey?: string,
    causeIndex?: number,
    subcauseIndex?: number,
    initialText?: string
  ) => {
    if (readOnly) return;
    setSelectedNode({
      type,
      categoryFieldKey,
      causeIndex,
      subcauseIndex,
      initialText,
    });
    setEditText(initialText || '');
    setNewSubcauseText('');
    setNewCauseText('');
  };

  const handleSaveEdit = () => {
    if (!selectedNode) return;

    if (selectedNode.type === 'event' && onUpdateEventTitle) {
      onUpdateEventTitle(editText);
    } else if (selectedNode.type === 'category' && selectedNode.categoryFieldKey) {
      // Category text updated (rawText)
      onUpdateCategoryText(selectedNode.categoryFieldKey, editText);
    } else if (selectedNode.categoryFieldKey && selectedNode.causeIndex !== undefined) {
      const cat = categories.find((c) => c.fieldKey === selectedNode.categoryFieldKey);
      if (cat) {
        const causes = parseRawTextToCauses(cat.rawText);

        if (selectedNode.type === 'cause') {
          if (causes[selectedNode.causeIndex]) {
            causes[selectedNode.causeIndex].text = editText;
          }
        } else if (
          selectedNode.type === 'subcause' &&
          selectedNode.subcauseIndex !== undefined
        ) {
          if (
            causes[selectedNode.causeIndex] &&
            causes[selectedNode.causeIndex].subcauses[selectedNode.subcauseIndex]
          ) {
            causes[selectedNode.causeIndex].subcauses[selectedNode.subcauseIndex].text =
              editText;
          }
        }

        const newRawText = serializeCausesToRawText(causes);
        onUpdateCategoryText(selectedNode.categoryFieldKey, newRawText);
      }
    }

    setSelectedNode(null);
  };

  const handleAddCause = (categoryFieldKey: string) => {
    if (!newCauseText.trim()) return;
    const cat = categories.find((c) => c.fieldKey === categoryFieldKey);
    if (cat) {
      const causes = parseRawTextToCauses(cat.rawText);
      causes.push({
        id: `cause-${Date.now()}`,
        text: newCauseText.trim(),
        subcauses: [],
      });
      const newRawText = serializeCausesToRawText(causes);
      onUpdateCategoryText(categoryFieldKey, newRawText);
      setNewCauseText('');
    }
  };

  const handleAddSubcause = (categoryFieldKey: string, causeIndex: number) => {
    if (!newSubcauseText.trim()) return;
    const cat = categories.find((c) => c.fieldKey === categoryFieldKey);
    if (cat) {
      const causes = parseRawTextToCauses(cat.rawText);
      if (causes[causeIndex]) {
        causes[causeIndex].subcauses.push({
          id: `sub-${Date.now()}`,
          text: newSubcauseText.trim(),
        });
        const newRawText = serializeCausesToRawText(causes);
        onUpdateCategoryText(categoryFieldKey, newRawText);
        setNewSubcauseText('');
      }
    }
  };

  const handleDeleteCause = (categoryFieldKey: string, causeIndex: number) => {
    const cat = categories.find((c) => c.fieldKey === categoryFieldKey);
    if (cat) {
      const causes = parseRawTextToCauses(cat.rawText);
      causes.splice(causeIndex, 1);
      const newRawText = serializeCausesToRawText(causes);
      onUpdateCategoryText(categoryFieldKey, newRawText);
      setSelectedNode(null);
    }
  };

  const handleDeleteSubcause = (
    categoryFieldKey: string,
    causeIndex: number,
    subcauseIndex: number
  ) => {
    const cat = categories.find((c) => c.fieldKey === categoryFieldKey);
    if (cat) {
      const causes = parseRawTextToCauses(cat.rawText);
      if (causes[causeIndex]) {
        causes[causeIndex].subcauses.splice(subcauseIndex, 1);
        const newRawText = serializeCausesToRawText(causes);
        onUpdateCategoryText(categoryFieldKey, newRawText);
        setSelectedNode(null);
      }
    }
  };

  // Render a Category Branch (Top or Bottom)
  const renderCategoryBranch = (
    cat: (typeof parsedCategoryData)[0],
    colIndex: number,
    isTop: boolean
  ) => {
    // Column attachment points along spine (left to right)
    // colIndex = 0 (left), 1 (middle), 2 (right)
    const totalCols = 3;
    const colSpacing = (spineXRight - spineXLeft - 160) / Math.max(totalCols - 1, 1);
    const spineAttachX = spineXLeft + 80 + colIndex * colSpacing;

    // Diagonal angle delta
    const dx = 130;
    const dy = isTop ? 180 : -180;

    const catBoxX = spineAttachX - dx;
    const catBoxY = spineY - dy;

    const causes = cat.causes;
    const causeCount = causes.length;

    return (
      <g key={cat.id} className="group/branch cursor-pointer">
        {/* Main Diagonal Branch Line */}
        <line
          x1={spineAttachX}
          y1={spineY}
          x2={catBoxX}
          y2={catBoxY}
          stroke={cat.borderColor || '#3B82F6'}
          strokeWidth="4.5"
          strokeLinecap="round"
          className="transition-all duration-300 hover:stroke-amber-400"
        />

        {/* Small Connector Circle at Spine Attachment */}
        <circle
          cx={spineAttachX}
          cy={spineY}
          r="6"
          fill={cat.borderColor || '#3B82F6'}
          stroke="#0F172A"
          strokeWidth="2"
        />

        {/* Category Header Label Box */}
        <g
          transform={`translate(${catBoxX - 90}, ${catBoxY - (isTop ? 40 : -10)})`}
          onClick={() => handleOpenEdit('category', cat.fieldKey, undefined, undefined, cat.title)}
          className="hover:scale-105 transition-transform"
        >
          <rect
            width="180"
            height="44"
            rx="12"
            fill={cat.bgColor || '#1E293B'}
            stroke={cat.borderColor || '#3B82F6'}
            strokeWidth="2.5"
            className="shadow-xl"
          />
          <text
            x="90"
            y="26"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="bold"
            fontFamily="Tahoma, Vazirmatn, sans-serif"
            direction="rtl"
          >
            {cat.title}
          </text>
        </g>

        {/* Causes & Subcauses along the diagonal branch */}
        {causes.map((cause, causeIdx) => {
          // Interpolate point along the diagonal line for cause attachment
          // t varies from 0.2 (near category) to 0.8 (near spine)
          const t = causeCount === 1 ? 0.5 : 0.2 + (causeIdx / Math.max(causeCount - 1, 1)) * 0.6;
          const attachX = catBoxX + t * (spineAttachX - catBoxX);
          const attachY = catBoxY + t * (spineY - catBoxY);

          // Cause Line extending horizontally
          const causeLineLength = 110;
          const causeEndX = attachX - causeLineLength;
          const causeEndY = attachY;

          return (
            <g key={cause.id} className="cause-group">
              {/* Cause Horizontal Branch Line */}
              <line
                x1={attachX}
                y1={attachY}
                x2={causeEndX}
                y2={causeEndY}
                stroke={cat.borderColor || '#64748B'}
                strokeWidth="2.5"
                strokeDasharray={cause.subcauses.length > 0 ? undefined : 'none'}
              />

              {/* Small Connector Circle */}
              <circle cx={attachX} cy={attachY} r="3.5" fill={cat.borderColor || '#3B82F6'} />

              {/* Cause Text Label */}
              <g
                transform={`translate(${causeEndX - 5}, ${causeEndY - 6})`}
                onClick={() =>
                  handleOpenEdit('cause', cat.fieldKey, causeIdx, undefined, cause.text)
                }
                className="hover:scale-105 cursor-pointer transition-transform"
              >
                <rect
                  x="-120"
                  y="-16"
                  width="120"
                  height="22"
                  rx="6"
                  fill="#1E293B"
                  fillOpacity="0.85"
                  stroke={cat.borderColor}
                  strokeWidth="1"
                />
                <text
                  x="-10"
                  y="-1"
                  textAnchor="end"
                  fill="#F8FAFC"
                  fontSize="10.5"
                  fontWeight="600"
                  fontFamily="Tahoma, Vazirmatn, sans-serif"
                  direction="rtl"
                >
                  {cause.text.length > 22 ? cause.text.substring(0, 22) + '...' : cause.text}
                </text>
              </g>

              {/* Subcauses branching from the Cause Line */}
              {cause.subcauses.map((sub, subIdx) => {
                const subT = (subIdx + 1) / (cause.subcauses.length + 1);
                const subAttachX = attachX - subT * causeLineLength;
                const subAttachY = causeEndY;

                const subDy = isTop ? -25 : 25;
                const subEndX = subAttachX - 30;
                const subEndY = subAttachY + subDy;

                return (
                  <g key={sub.id} className="subcause-group">
                    {/* Subcause Diagonal Branch Line */}
                    <line
                      x1={subAttachX}
                      y1={subAttachY}
                      x2={subEndX}
                      y2={subEndY}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />

                    {/* Subcause Text Label */}
                    <g
                      transform={`translate(${subEndX}, ${subEndY + (isTop ? -4 : 12)})`}
                      onClick={() =>
                        handleOpenEdit(
                          'subcause',
                          cat.fieldKey,
                          causeIdx,
                          subIdx,
                          sub.text
                        )
                      }
                      className="hover:scale-105 cursor-pointer transition-transform"
                    >
                      <text
                        x="0"
                        y="0"
                        textAnchor="end"
                        fill="#CBD5E1"
                        fontSize="9"
                        fontWeight="normal"
                        fontFamily="Tahoma, Vazirmatn, sans-serif"
                        direction="rtl"
                      >
                        └ {sub.text.length > 18 ? sub.text.substring(0, 18) + '...' : sub.text}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'min-h-[550px]'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 right-4 left-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-indigo-400/30 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">نمودار واقعی استخوان ماهی (Ishikawa Fishbone)</h4>
            <p className="text-[10px] text-cyan-200/80 font-bold">
              قابلیت Zoom، Pan و کلیک مستقیم روی هر شاخه جهت ویرایش و افزودن علل
            </p>
          </div>
        </div>

        {/* Zoom & Pan Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
            title="بزرگ‌نمایی (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
            title="کوچک‌نمایی (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition cursor-pointer text-xs font-bold flex items-center gap-1"
            title="تنظیم مجدد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{toPersianDigits(Math.round(zoom * 100))}%</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
            title={isFullscreen ? 'خروج از تمام صفحه' : 'نمایش تمام صفحه'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden touch-none select-none pb-14"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height={isFullscreen ? '100vh' : '520'}
          viewBox={`-80 -40 ${svgWidth + 120} ${svgHeight + 80}`}
          className="select-none transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Background Grid Accent */}
          <defs>
            <pattern id="fishboneGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" opacity="0.4" />
            </pattern>

            {/* Spine Arrow Marker */}
            <marker
              id="spineArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38BDF8" />
            </marker>
          </defs>

          <rect width="100%" height="100%" fill="url(#fishboneGrid)" />

          {/* MAIN SPINE LINE (ستون فقرات اصلی) */}
          <line
            x1={spineXLeft}
            y1={spineY}
            x2={spineXRight}
            y2={spineY}
            stroke="#38BDF8"
            strokeWidth="6"
            strokeLinecap="round"
            markerEnd="url(#spineArrow)"
            className="drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
          />

          {/* Spine Start Tail Circle */}
          <circle cx={spineXLeft} cy={spineY} r="8" fill="#38BDF8" />

          {/* EVENT HEAD BOX (رویداد / مشکل اصلی) at Spine Right */}
          <g
            transform={`translate(${spineXRight}, ${spineY - eventBoxHeight / 2})`}
            onClick={() => handleOpenEdit('event', undefined, undefined, undefined, eventTitle)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            {/* Connection Triangle from Spine to Box */}
            <path d={`M 0 ${eventBoxHeight / 2} L -15 ${eventBoxHeight / 2 - 12} L -15 ${eventBoxHeight / 2 + 12} Z`} fill="#0EA5E9" />

            <rect
              width={eventBoxWidth}
              height={eventBoxHeight}
              rx="20"
              fill="url(#eventGrad)"
              stroke="#0EA5E9"
              strokeWidth="3"
              className="drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]"
            />
            <defs>
              <linearGradient id="eventGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
            </defs>

            <text
              x={eventBoxWidth / 2}
              y="32"
              textAnchor="middle"
              fill="#38BDF8"
              fontSize="12"
              fontWeight="900"
              fontFamily="Tahoma, Vazirmatn, sans-serif"
              direction="rtl"
            >
              🎯 رویداد / مشکل اصلی:
            </text>

            {/* Event Description Multiline / Truncated */}
            <foreignObject x="15" y="42" width={eventBoxWidth - 30} height="58">
              <div className="w-full h-full flex items-center justify-center text-center text-white text-xs font-black leading-tight text-ellipsis overflow-hidden dir-rtl">
                {eventTitle || 'رویداد اصلی ثبت نشده است'}
              </div>
            </foreignObject>
          </g>

          {/* TOP CATEGORIES (0, 1, 2) */}
          {topCategories.map((cat, idx) => renderCategoryBranch(cat, idx, true))}

          {/* BOTTOM CATEGORIES (3, 4, 5) */}
          {bottomCategories.map((cat, idx) => renderCategoryBranch(cat, idx, false))}
        </svg>
      </div>

      {/* Bottom Floating Horizontal Rotary Pan Control Bar */}
      <div className="absolute bottom-3 right-3 left-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-cyan-500/40 text-white shadow-2xl">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MoveHorizontal className="w-4 h-4 animate-pulse" />
          </div>
          <span className="text-xs font-black text-cyan-200">
            روتاری پیمایش افقی استخوان ماهی:
          </span>
        </div>

        {/* Rotary Slider with Step Arrows */}
        <div className="flex items-center gap-2 w-full max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setPan((p) => ({ ...p, x: Math.min(p.x + 180, 1100) }))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer shrink-0 border border-slate-700 active:scale-95"
            title="انتقال به سمت چپ (دم)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <input
            type="range"
            min="-1000"
            max="1000"
            step="10"
            value={-pan.x}
            onChange={(e) => setPan((p) => ({ ...p, x: -Number(e.target.value) }))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 border border-slate-700/80 shadow-inner"
            title="اسلایدر روتاری افقی استخوان ماهی"
          />

          <button
            type="button"
            onClick={() => setPan((p) => ({ ...p, x: Math.max(p.x - 180, -1100) }))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer shrink-0 border border-slate-700 active:scale-95"
            title="انتقال به سمت راست (سر)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Position Presets */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setPan((p) => ({ ...p, x: 580 }))}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
              pan.x > 250
                ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            ◄ دم (چپ)
          </button>
          <button
            type="button"
            onClick={() => setPan((p) => ({ ...p, x: 0 }))}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
              Math.abs(pan.x) <= 250
                ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            ● مرکز
          </button>
          <button
            type="button"
            onClick={() => setPan((p) => ({ ...p, x: -580 }))}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
              pan.x < -250
                ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            سر (راست) ►
          </button>
        </div>
      </div>

      {/* EDIT MODAL / DRAWER */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-400/50 p-6 rounded-3xl shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-300/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">
                  {selectedNode.type === 'event'
                    ? 'ویرایش عنوان رویداد اصلی'
                    : selectedNode.type === 'category'
                    ? 'ویرایش عنوان دسته اصلی'
                    : selectedNode.type === 'cause'
                    ? 'ویرایش علت فرعی'
                    : 'ویرایش زیرعلت'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">متن مورد نظر:</label>
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-indigo-300/30 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* If Cause selected, option to add Subcause or Delete */}
              {selectedNode.type === 'cause' && selectedNode.categoryFieldKey && selectedNode.causeIndex !== undefined && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-indigo-300/20 space-y-2">
                  <label className="block text-xs font-bold text-cyan-300">افزودن زیرعلت جدید به این علت:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSubcauseText}
                      onChange={(e) => setNewSubcauseText(e.target.value)}
                      placeholder="متن زیرعلت جدید..."
                      className="flex-1 p-2 rounded-xl bg-slate-900 border border-indigo-300/30 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSubcause(selectedNode.categoryFieldKey!, selectedNode.causeIndex!)
                      }
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-indigo-300/20">
              {/* Delete button for cause or subcause */}
              {(selectedNode.type === 'cause' || selectedNode.type === 'subcause') && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedNode.type === 'cause') {
                      handleDeleteCause(selectedNode.categoryFieldKey!, selectedNode.causeIndex!);
                    } else if (selectedNode.type === 'subcause') {
                      handleDeleteSubcause(
                        selectedNode.categoryFieldKey!,
                        selectedNode.causeIndex!,
                        selectedNode.subcauseIndex!
                      );
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl text-xs font-bold transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف این مورد</span>
                </button>
              )}

              <div className="flex items-center gap-2 mr-auto">
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
