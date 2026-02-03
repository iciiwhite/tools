import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Copy, 
  Trash2, 
  RotateCcw, 
  Grid, 
  Square, 
  Code, 
  Layers, 
  MousePointer2,
  ChevronRight,
  ChevronLeft,
  Download,
  Check,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const PRESETS = {
  Geometric: [
    { name: 'Triangle', points: [[50,0], [100,100], [0,100]] },
    { name: 'Trapezoid', points: [[20,0], [80,0], [100,100], [0,100]] },
    { name: 'Parallelogram', points: [[25,0], [100,0], [75,100], [0,100]] },
    { name: 'Rhombus', points: [[50,0], [100,50], [50,100], [0,50]] },
    { name: 'Pentagon', points: [[50,0], [100,38], [82,100], [18,100], [0,38]] },
    { name: 'Hexagon', points: [[25,0], [75,0], [100,50], [75,100], [25,100], [0,50]] },
    { name: 'Heptagon', points: [[50,0], [90,22], [100,62], [75,100], [25,100], [0,62], [10,22]] },
    { name: 'Octagon', points: [[30,0], [70,0], [100,30], [100,70], [70,100], [30,100], [0,70], [0,30]] },
    { name: 'Star (5pt)', points: [[50,0], [61,35], [98,35], [68,57], [79,91], [50,70], [21,91], [32,57], [2,35], [39,35]] },
    { name: 'Cross', points: [[35,0], [65,0], [65,35], [100,35], [100,65], [65,65], [65,100], [35,100], [35,65], [0,65], [0,35], [35,35]] }
  ],
  "UI Elements": [
    { name: 'Message Left', points: [[0,0], [100,0], [100,75], [25,75], [0,100], [0,75]] },
    { name: 'Message Right', points: [[0,0], [100,0], [100,100], [75,75], [0,75]] },
    { name: 'Ticket Vertical', points: [[0,0], [100,0], [100,40], [85,50], [100,60], [100,100], [0,100], [0,60], [15,50], [0,40]] },
    { name: 'Tab Top', points: [[15,0], [85,0], [100,100], [0,100]] },
    { name: 'Arrow Right', points: [[0,20], [60,20], [60,0], [100,50], [60,100], [60,80], [0,80]] },
    { name: 'Arrow Left', points: [[40,0], [40,20], [100,20], [100,80], [40,80], [40,100], [0,50]] },
    { name: 'Chevron Right', points: [[0,0], [40,0], [100,50], [40,100], [0,100], [60,50]] },
    { name: 'Bevel', points: [[15,0], [85,0], [100,15], [100,85], [85,100], [15,100], [0,85], [0,15]] },
    { name: 'Tag', points: [[0,50], [25,0], [100,0], [100,100], [25,100]] },
    { name: 'Folded Corner', points: [[0,0], [80,0], [100,20], [100,100], [0,100]] }
  ],
  "Creative": [
    { name: 'Slash', points: [[20,0], [100,0], [80,100], [0,100]] },
    { name: 'Wedge', points: [[0,0], [100,0], [100,80], [0,100]] },
    { name: 'Burst (8pt)', points: [[50,0], [60,40], [100,50], [60,60], [50,100], [40,60], [0,50], [40,40]] },
    { name: 'Frame', points: [[0,0], [100,0], [100,100], [0,100], [0,10], [90,10], [90,90], [10,90], [10,0], [0,0]] },
    { name: 'Ribbon', points: [[0,0], [100,0], [90,50], [100,100], [0,100], [10,50]] },
    { name: 'S-Curve (Block)', points: [[0,0], [100,0], [100,70], [70,100], [30,100], [0,70]] },
    { name: 'ZigZag Top', points: [[0,20], [25,0], [50,20], [75,0], [100,20], [100,100], [0,100]] },
    { name: 'Pointed Top', points: [[50,0], [100,20], [100,100], [0,100], [0,20]] },
    { name: 'Diamond', points: [[50,0], [100,50], [50,100], [0,50]] },
    { name: 'Inward Bevel', points: [[0,0], [100,0], [85,15], [85,85], [100,100], [0,100], [15,85], [15,15]] }
  ]
};

const App = () => {
  const [points, setPoints] = useState(PRESETS.Geometric[0].points);
  const [activeTab, setActiveTab] = useState('CSS');
  const [copied, setCopied] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const containerRef = useRef(null);

  const polygonString = useMemo(() => {
    return `polygon(${points.map(p => `${p[0]}% ${p[1]}%`).join(', ')})`;
  }, [points]);

  const svgPoints = useMemo(() => {
    return points.map(p => `${p[0]},${p[1]}`).join(' ');
  }, [points]);

  const handlePointChange = (idx, axis, value) => {
    const nextPoints = [...points];
    nextPoints[idx][axis] = Math.max(0, Math.min(100, Number(value)));
    setPoints(nextPoints);
  };

  const deletePoint = (idx) => {
    if (points.length <= 3) return;
    setPoints(points.filter((_, i) => i !== idx));
  };

  const addPoint = (e) => {
    if (draggingIdx !== null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPoints([...points, [x, y]]);
  };

  const handleMouseDown = (e, idx) => {
    e.stopPropagation();
    setDraggingIdx(idx);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingIdx === null) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      handlePointChange(draggingIdx, 0, x);
      handlePointChange(draggingIdx, 1, y);
    };

    const handleMouseUp = () => setDraggingIdx(null);

    if (draggingIdx !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIdx]);

  const copyToClipboard = () => {
    const text = activeTab === 'CSS' ? `clip-path: ${polygonString};` : `<clipPath id="path">\n  <polygon points="${svgPoints}" />\n</clipPath>`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-zinc-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
            title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="flex items-center gap-3 ml-2 border-l border-zinc-800 pl-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <MousePointer2 className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-sm tracking-widest uppercase text-white">Clip Path Engineer</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-md transition-colors ${showGrid ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-xs font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Presets */}
        <aside 
          className={`border-r border-zinc-800 bg-[#0c0c0e] transition-all duration-300 ease-in-out overflow-hidden flex flex-col shrink-0 ${
            sidebarOpen ? 'w-72 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0'
          }`}
        >
          <div className="p-4 space-y-8 overflow-y-auto custom-scrollbar flex-1 w-72">
            {Object.entries(PRESETS).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">{category}</h3>
                <div className="grid grid-cols-1 gap-1">
                  {items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setPoints(item.points.map(p => [...p]))}
                      className="group flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-800/50 transition-all text-left"
                    >
                      <div 
                        className="w-10 h-10 bg-zinc-800 rounded border border-zinc-700 overflow-hidden flex-shrink-0 group-hover:border-blue-500/50"
                        style={{ clipPath: `polygon(${item.points.map(p => `${p[0]}% ${p[1]}%`).join(', ')})` }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-100 truncate">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative">
            {/* Context-aware Toggle when sidebar is closed */}
            {!sidebarOpen && (
               <button 
               onClick={() => setSidebarOpen(true)}
               className="absolute top-4 left-4 p-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500 hover:text-white transition-all shadow-xl z-10"
             >
               <PanelLeftOpen size={16} />
             </button>
            )}

            <div 
              ref={containerRef}
              onDoubleClick={addPoint}
              className="relative w-full max-w-2xl aspect-square bg-zinc-900 border border-zinc-800 shadow-2xl rounded-sm group cursor-crosshair"
              style={{
                backgroundImage: showGrid ? 'linear-gradient(to right, #18181b 1px, transparent 1px), linear-gradient(to bottom, #18181b 1px, transparent 1px)' : 'none',
                backgroundSize: '10% 10%'
              }}
            >
              {/* The Target Element */}
              <div 
                className="absolute inset-0 transition-all duration-300 pointer-events-none"
                style={{ 
                  clipPath: polygonString,
                  backgroundColor: '#2563eb'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=1200" 
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                  alt="Preview"
                />
              </div>

              {/* Interaction Overlay */}
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <polygon 
                  points={points.map(p => `${p[0]}%,${p[1]}%`).join(' ')}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="vector-path"
                />
              </svg>

              {/* Interactive Nodes */}
              {points.map((p, i) => (
                <div
                  key={i}
                  onMouseDown={(e) => handleMouseDown(e, i)}
                  className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 cursor-move pointer-events-auto transition-all
                    ${draggingIdx === i ? 'bg-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-125 z-10' : 'bg-zinc-900 border-blue-600 hover:scale-110'}`}
                  style={{ left: `${p[0]}%`, top: `${p[1]}%` }}
                >
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-1.5 py-0.5 bg-zinc-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                    {p[0]}%, {p[1]}%
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-4 text-[10px] font-mono text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded">
                100 x 100 UNIT GRID | DOUBLE CLICK TO ADD POINT
              </div>
            </div>
          </div>

          {/* Footer Code Panel */}
          <div className="h-64 border-t border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0">
            <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-900/30">
              {['CSS', 'SVG'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-[11px] font-bold tracking-widest transition-colors relative ${activeTab === tab ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
              ))}
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 p-4 bg-zinc-950/50 overflow-auto font-mono text-xs leading-relaxed custom-scrollbar">
                {activeTab === 'CSS' ? (
                  <pre className="text-blue-300">
                    <span className="text-zinc-500">.clipped-element</span> {'{\n'}
                    {'  '}clip-path: <span className="text-indigo-400">{polygonString}</span>;{'\n'}
                    {'}'}
                  </pre>
                ) : (
                  <pre className="text-indigo-300">
                    <span className="text-zinc-500">&lt;svg width="0" height="0"&gt;</span>{'\n'}
                    {'  '}<span className="text-zinc-500">&lt;clipPath id="myPath" clipPathUnits="objectBoundingBox"&gt;</span>{'\n'}
                    {'    '}&lt;polygon points="<span className="text-blue-300">{points.map(p => `${p[0]/100},${p[1]/100}`).join(' ')}</span>" /&gt;{'\n'}
                    {'  '}<span className="text-zinc-500">&lt;/clipPath&gt;</span>{'\n'}
                    <span className="text-zinc-500">&lt;/svg&gt;</span>
                  </pre>
                )}
              </div>
              
              {/* Point Inspector */}
              <div className="w-80 border-l border-zinc-800 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Points Inspector</span>
                  <button onClick={() => setPoints(PRESETS.Geometric[0].points)} className="text-zinc-500 hover:text-white" title="Reset to Square">
                    <RotateCcw size={14}/>
                  </button>
                </div>
                <div className="space-y-1">
                  {points.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-[10px] font-mono text-zinc-600 w-4">{i}</span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 flex items-center">
                          <span className="text-[9px] text-zinc-600 mr-2">X</span>
                          <input 
                            type="number" 
                            value={p[0]} 
                            onChange={(e) => handlePointChange(i, 0, e.target.value)}
                            className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 flex items-center">
                          <span className="text-[9px] text-zinc-600 mr-2">Y</span>
                          <input 
                            type="number" 
                            value={p[1]} 
                            onChange={(e) => handlePointChange(i, 1, e.target.value)}
                            className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => deletePoint(i)}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Remove point"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        .vector-path { vector-effect: non-scaling-stroke; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}} />
    </div>
  );
};

export default App;