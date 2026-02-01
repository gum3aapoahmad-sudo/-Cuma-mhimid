
import React, { useState, useRef, useEffect } from 'react';
import { EditingMode, ImageState, GalleryItem } from './types';
import { FASHION_PRESETS } from './constants';
import { processImage } from './services/geminiService';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    edited: null,
    isProcessing: false,
    error: null,
  });
  const [mode, setMode] = useState<EditingMode>(EditingMode.STANDARD);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(FASHION_PRESETS[0].id);
  const [showCamera, setShowCamera] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } catch (e) {
        console.error("API Key check error:", e);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    const initialItems: GalleryItem[] = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
        userName: 'نانو كولكشن',
        date: '٢٠٢٤/١٢/٠١',
        likes: 156
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
        userName: 'آمنة فاشون',
        date: '٢٠٢٤/١٢/٠٥',
        likes: 243
      }
    ];
    setGallery(initialItems);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageState({
          original: event.target?.result as string,
          edited: null,
          isProcessing: false,
          error: null
        });
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!imageState.original) return;
    setImageState(prev => ({ ...prev, isProcessing: true, error: null }));

    const activePreset = FASHION_PRESETS.find(p => p.id === selectedPresetId);
    const finalPrompt = customPrompt.trim() || activePreset?.prompt || FASHION_PRESETS[0].prompt;

    try {
      const result = await processImage(imageState.original, finalPrompt, mode);
      setImageState(prev => ({ ...prev, edited: result, isProcessing: false }));
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setShowSettingsModal(true);
      } else {
        setImageState(prev => ({ ...prev, error: "فشل التعديل، يرجى المحاولة لاحقاً.", isProcessing: false }));
      }
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setShowCamera(false);
      setImageState(prev => ({ ...prev, error: "لا يمكن الوصول للكاميرا." }));
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setImageState({ original: canvas.toDataURL('image/png'), edited: null, isProcessing: false, error: null });
      stopCamera();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-violet-500/30">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 glass-panel sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-white font-bold text-2xl luxury-font shadow-lg shadow-violet-500/20 border border-white/10">
            N
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight luxury-font bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">نانو بنانو</h1>
            <span className="text-[9px] text-violet-400 uppercase tracking-[0.2em] font-bold">Al Naseem AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800 shadow-inner">
            <button 
              onClick={() => setMode(EditingMode.STANDARD)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === EditingMode.STANDARD ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <span>⚡</span> كلاسيك
            </button>
            <button 
              onClick={() => setMode(EditingMode.PROFESSIONAL)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === EditingMode.PROFESSIONAL ? 'brand-gradient text-white shadow-lg border border-white/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <span>💎</span> احترافي 4K
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all">
              <span className={hasApiKey ? "text-emerald-400" : "text-zinc-500"}>⚙️</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black px-6 py-2 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
            >
              رفع صورة
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Collapsible Sidebar */}
        <aside 
          className={`glass-panel border-l border-zinc-800/50 flex flex-col transition-all duration-500 ease-in-out absolute lg:relative h-full z-50 ${isSidebarOpen ? 'w-[340px] translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden opacity-0'}`}
        >
          <div className="p-6 flex flex-col gap-8 h-full min-w-[340px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">بصمة النسيم</label>
                <span className="text-[9px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20">PREMIUM</span>
              </div>
              <div className="space-y-3">
                {FASHION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => { setSelectedPresetId(preset.id); setCustomPrompt(''); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-right transition-all group relative overflow-hidden ${
                      selectedPresetId === preset.id && !customPrompt ? 'bg-violet-500/10 border-violet-500/50 shadow-lg' : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {selectedPresetId === preset.id && (
                       <div className="absolute top-0 right-0 w-1 h-full bg-violet-500"></div>
                    )}
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{preset.icon}</span>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-sm font-bold truncate ${selectedPresetId === preset.id ? 'text-violet-300' : 'text-zinc-200'}`}>{preset.nameAr}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter truncate opacity-60">{preset.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 block">توجيه مخصص</label>
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="صف مشهدك الخاص: 'فستان مخملي في قصر تاريخي بإنارة خافتة...'"
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm resize-none placeholder:text-zinc-700 focus:border-violet-500/50 transition-all shadow-inner"
              />
            </div>

            <div className="flex-1"></div>

            <div className="space-y-3 pb-4">
              <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 text-center">
                 <p className="text-[10px] text-zinc-500 mb-1">الدقة المختارة</p>
                 <p className="text-xs font-bold text-zinc-300">{mode === EditingMode.PROFESSIONAL ? '4K Ultra High Definition' : 'Standard HD'}</p>
              </div>
              
              <button 
                disabled={!imageState.original || imageState.isProcessing}
                onClick={handleProcess}
                className="w-full py-5 brand-gradient text-white font-bold rounded-2xl shadow-2xl shadow-violet-500/30 disabled:opacity-50 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-3 border border-white/10"
              >
                {imageState.isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>تطبيق السحر</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute bottom-8 right-8 lg:right-auto lg:left-0 z-[55] w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-zinc-800 transition-all group ${!isSidebarOpen && 'lg:translate-x-2'}`}
        >
          <span className={`text-xl transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
            {isSidebarOpen ? '◀' : '▶'}
          </span>
        </button>

        {/* Canvas Area */}
        <section className="flex-1 bg-[#020202] flex flex-col relative overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16">
            {!imageState.original ? (
              <div className="text-center max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] mx-auto flex items-center justify-center text-5xl shadow-2xl mb-4 transform -rotate-6">✨</div>
                <div className="space-y-3">
                   <h2 className="text-5xl font-bold luxury-font leading-tight">ارتقِ بصورك لمستوى <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">عالمي فاخر</span></h2>
                   <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">حوّل لقطاتك العادية إلى حملات أزياء احترافية مطبوعة بجودة "النسيم" الاستثنائية.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-5 pt-4">
                  <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 shadow-2xl shadow-white/10 transition-all transform hover:-translate-y-1">رفع صورة للبدء</button>
                  <button onClick={startCamera} className="px-10 py-4 border border-zinc-800 rounded-2xl font-bold hover:bg-zinc-900 transition-all transform hover:-translate-y-1 bg-zinc-900/40">التقاط حي</button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col gap-8 max-w-7xl">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-0">
                  {/* Before */}
                  <div className="flex flex-col gap-3 group">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">الأصل</span>
                      <button onClick={() => setImageState({original: null, edited: null, isProcessing: false, error: null})} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">إلغاء الصورة</button>
                    </div>
                    <div className="flex-1 rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900/20 shadow-inner group-hover:border-zinc-700 transition-all">
                      <img src={imageState.original} alt="Original" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="flex flex-col gap-3 group">
                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">إبداع النسيم</span>
                        {mode === EditingMode.PROFESSIONAL && <span className="text-[9px] bg-violet-500 text-white px-2 py-0.5 rounded-full font-bold">4K PRO</span>}
                      </div>
                      {imageState.edited && (
                        <div className="flex gap-4">
                           <button onClick={() => {
                             const link = document.createElement('a');
                             link.href = imageState.edited!;
                             link.download = "al-naseem-fashion-result.png";
                             link.click();
                           }} className="text-xs text-white bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center gap-1">تحميل <span>⬇️</span></button>
                           <button onClick={() => setShowUploadModal(true)} className="text-xs text-violet-400 font-bold hover:underline transition-all">نشر للمعرض 📤</button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 rounded-[2rem] overflow-hidden border border-violet-500/20 bg-zinc-950 relative shadow-2xl shadow-violet-500/10 group-hover:border-violet-500/40 transition-all">
                      {imageState.isProcessing && (
                        <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center z-10">
                          <div className="w-14 h-14 border-4 border-violet-500/10 border-t-violet-400 rounded-full animate-spin mb-6 shadow-2xl shadow-violet-500/20" />
                          <div className="text-center space-y-2">
                            <p className="text-lg font-bold text-white luxury-font animate-pulse">جاري صياغة الفخامة...</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Al Naseem Editorial Quality</p>
                          </div>
                        </div>
                      )}
                      {imageState.edited ? (
                        <img src={imageState.edited} alt="Result" className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-1000" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 text-sm italic p-16 text-center space-y-4">
                          <div className="w-16 h-16 border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center text-2xl">✨</div>
                          <p>بانتظار لمستك الإبداعية لتفعيل سحر النسيم</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Featured Gallery Section */}
          <div className="p-16 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-2xl font-bold luxury-font">معرض إبداعات النسيم</h3>
                  <p className="text-zinc-500 text-xs">مجموعة مختارة من أفضل تصاميم مجتمع نانو بنانو</p>
               </div>
               <button className="text-xs text-zinc-400 hover:text-white underline">عرض الكل</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="group relative rounded-[1.5rem] overflow-hidden border border-zinc-900 aspect-[3/4] hover:border-violet-500/40 transition-all duration-500 cursor-pointer shadow-xl">
                  <img src={item.url} alt="User art" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <p className="text-xs font-bold text-white mb-1">{item.userName}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] text-zinc-400">{item.date}</span>
                       <span className="text-[10px] text-violet-400">❤️ {item.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 brand-gradient"></div>
            <h4 className="text-2xl font-bold mb-6 luxury-font">إعدادات المحرك</h4>
            <div className="space-y-6">
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center shadow-inner">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">توصيل API</span>
                   <span className="text-xs text-zinc-400">Google Gemini Studio</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${hasApiKey ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                  {hasApiKey ? "متصل" : "غير متصل"}
                </span>
              </div>
              
              <button 
                onClick={async () => {
                  await window.aistudio.openSelectKey();
                  setHasApiKey(true);
                  setShowSettingsModal(false);
                }}
                className="w-full py-5 brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                تحديث مفتاح الوصول
              </button>
              
              <div className="text-center space-y-4">
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-zinc-500 hover:text-violet-400 underline transition-colors block"
                >
                  إرشادات الفوترة والحساب في Google Cloud
                </a>
                <button onClick={() => setShowSettingsModal(false)} className="text-zinc-600 hover:text-zinc-400 text-xs py-2 transition-colors">إغلاق الإعدادات</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl text-center">
            <h4 className="text-xl font-bold mb-6 luxury-font">مشاركة في مجتمع النسيم</h4>
            <div className="aspect-[3/4] w-36 mx-auto rounded-2xl overflow-hidden mb-8 border border-zinc-800 shadow-2xl transform hover:scale-105 transition-transform">
              <img src={imageState.edited || ''} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="أدخل اسمك الفني..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-center focus:border-violet-500 outline-none transition-all shadow-inner"
              />
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setGallery([{id: Date.now().toString(), url: imageState.edited!, userName: userName || 'مبدع مجهول', date: 'الآن', likes: 0}, ...gallery]);
                    setShowUploadModal(false);
                  }}
                  className="flex-1 py-4 brand-gradient text-white font-bold rounded-xl text-xs shadow-lg shadow-violet-500/20"
                >
                  تأكيد النشر
                </button>
                <button onClick={() => setShowUploadModal(false)} className="px-6 py-4 bg-zinc-800 text-zinc-400 rounded-xl text-xs hover:bg-zinc-700 transition-colors">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500">
          <video ref={videoRef} autoPlay playsInline className="flex-1 w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
          <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-12">
            <button onClick={stopCamera} className="w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500/20 hover:text-red-400 transition-all">
              <span className="text-2xl">✕</span>
            </button>
            <button onClick={capturePhoto} className="w-24 h-24 bg-white rounded-full border-[10px] border-white/20 flex items-center justify-center active:scale-90 transition-all shadow-2xl">
              <div className="w-16 h-16 bg-zinc-50 rounded-full border-2 border-zinc-950 flex items-center justify-center">
                 <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse"></div>
              </div>
            </button>
            <div className="w-16 h-16"></div> {/* Spacer for symmetry */}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute top-10 left-0 right-0 text-center pointer-events-none">
             <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.4em] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">Al Naseem Live Capture</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
