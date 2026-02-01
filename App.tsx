
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
  const [sharePreview, setSharePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for existing API key selection on mount.
    const checkKey = async () => {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } catch (e) {
        console.error("API Key check error:", e);
      }
    };
    checkKey();
    // Guideline: Do not use setInterval or delays to mitigate race conditions with key selection.
    // Instead, rely on assuming success immediately after triggering the selection dialog.
  }, []);

  useEffect(() => {
    // Simulated gallery load
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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 glass-panel sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl luxury-font shadow-lg shadow-violet-500/20">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight luxury-font">نانو بنانو</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
            <button 
              onClick={() => setMode(EditingMode.STANDARD)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === EditingMode.STANDARD ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              سريع
            </button>
            <button 
              onClick={() => setMode(EditingMode.PROFESSIONAL)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === EditingMode.PROFESSIONAL ? 'brand-gradient text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              احترافي (4K)
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-all">
              <span className={hasApiKey ? "text-emerald-400" : "text-zinc-500"}>⚙️</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-zinc-100 text-zinc-950 px-5 py-2 rounded-full text-xs font-bold hover:bg-white transition-all shadow-xl"
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
          className={`glass-panel border-l border-zinc-800/50 flex flex-col transition-all duration-500 ease-in-out absolute lg:relative h-full z-50 ${isSidebarOpen ? 'w-[320px] translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden opacity-0'}`}
        >
          <div className="p-6 flex flex-col gap-8 h-full min-w-[320px]">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">الأنماط الإبداعية</label>
              <div className="space-y-2">
                {FASHION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => { setSelectedPresetId(preset.id); setCustomPrompt(''); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-right transition-all group ${
                      selectedPresetId === preset.id && !customPrompt ? 'bg-violet-500/10 border-violet-500/50' : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-bold truncate ${selectedPresetId === preset.id ? 'text-violet-400' : 'text-zinc-200'}`}>{preset.nameAr}</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-tighter truncate">{preset.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">تخصيص يدوي</label>
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="مثال: اجعل الصورة في باريس ليلاً مع إضاءة سينمائية..."
                className="w-full h-32 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 text-xs resize-none placeholder:text-zinc-700 focus:border-violet-500/50 transition-all"
              />
            </div>

            <button 
              disabled={!imageState.original || imageState.isProcessing}
              onClick={handleProcess}
              className="w-full py-4 brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {imageState.isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "معالجة الصورة"
              )}
            </button>
          </div>
        </aside>

        {/* Sidebar Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute bottom-8 right-8 lg:right-auto lg:left-0 z-[55] w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-zinc-800 transition-all group ${!isSidebarOpen && 'lg:translate-x-2'}`}
          title={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          <span className={`text-xl transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
            {isSidebarOpen ? '◀' : '▶'}
          </span>
        </button>

        {/* Canvas Area */}
        <section className="flex-1 bg-[#050505] flex flex-col relative overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-12">
            {!imageState.original ? (
              <div className="text-center max-w-lg space-y-6">
                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-2xl mb-8">✨</div>
                <h2 className="text-4xl font-bold luxury-font leading-tight">اصنع سحرك الخاص مع <span className="text-violet-500">نانو بنانو</span></h2>
                <p className="text-zinc-500 text-sm">ارفع صورتك الآن لتجربة أذكى محرك لتعديل الصور عالمياً.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-white shadow-xl transition-all">رفع صورة</button>
                  <button onClick={startCamera} className="px-8 py-3 border border-zinc-800 rounded-full font-bold hover:bg-zinc-900 transition-all">التقاط بالكاميرا</button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col gap-6 max-w-6xl">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                  {/* Before */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">الأصل</span>
                      <button onClick={() => setImageState({original: null, edited: null, isProcessing: false, error: null})} className="text-xs text-red-400 hover:underline">حذف</button>
                    </div>
                    <div className="flex-1 rounded-3xl overflow-hidden border border-zinc-800/50 bg-zinc-900/20">
                      <img src={imageState.original} alt="Original" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-bold text-violet-500 uppercase">النتيجة</span>
                      {imageState.edited && (
                        <div className="flex gap-2">
                           <button onClick={() => {
                             const link = document.createElement('a');
                             link.href = imageState.edited!;
                             link.download = "nano-banano-result.png";
                             link.click();
                           }} className="text-xs text-violet-400 hover:underline">تحميل ⬇️</button>
                           <button onClick={() => setShowUploadModal(true)} className="text-xs text-zinc-400 hover:underline">نشر 📤</button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 rounded-3xl overflow-hidden border border-violet-500/20 bg-zinc-900/40 relative shadow-2xl shadow-violet-500/5">
                      {imageState.isProcessing && (
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                          <div className="w-12 h-12 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin mb-4" />
                          <p className="text-xs text-violet-400 font-bold animate-pulse">جاري صياغة الإبداع...</p>
                        </div>
                      )}
                      {imageState.edited ? (
                        <img src={imageState.edited} alt="Result" className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-1000" />
                      ) : (
                        <div className="w-full h-full flex flex-center items-center justify-center text-zinc-700 text-xs italic p-12 text-center">
                          اضغط على "معالجة الصورة" لرؤية السحر
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Featured Gallery Section */}
          <div className="p-12 border-t border-zinc-900 bg-zinc-950/50">
            <h3 className="text-xl font-bold luxury-font mb-8">أحدث الإبداعات في المعرض</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-zinc-900 aspect-[3/4] hover:border-violet-500/30 transition-all cursor-pointer">
                  <img src={item.url} alt="User art" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-[10px] font-bold text-white">{item.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h4 className="text-xl font-bold mb-4 luxury-font">إعدادات النظام</h4>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">مفتاح API</span>
                <span className={hasApiKey ? "text-emerald-400 text-xs" : "text-red-400 text-xs"}>{hasApiKey ? "متصل ✅" : "غير متصل ⚠️"}</span>
              </div>
              <button 
                onClick={async () => {
                  // SDK Guideline: Assume success after triggering the selection dialog to prevent race condition issues.
                  await window.aistudio.openSelectKey();
                  setHasApiKey(true);
                  setShowSettingsModal(false);
                }}
                className="w-full py-4 brand-gradient text-white font-bold rounded-2xl"
              >
                اختيار مفتاح من الاستوديو
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="w-full text-zinc-500 text-xs py-2">إغلاق</button>
            </div>
            {/* Added billing info link as per SDK requirement */}
            <div className="mt-6 text-center">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-zinc-500 hover:text-violet-400 underline transition-colors"
              >
                تعلم المزيد عن إعداد الفواتير ومفاتيح API في Google AI Studio
              </a>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center">
            <h4 className="text-lg font-bold mb-4 luxury-font">مشاركة في المعرض</h4>
            <div className="aspect-[3/4] w-32 mx-auto rounded-xl overflow-hidden mb-6 border border-zinc-800">
              <img src={sharePreview || imageState.edited || ''} className="w-full h-full object-cover" />
            </div>
            <input 
              type="text" 
              placeholder="اسمك الإبداعي..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs mb-6 text-center focus:border-violet-500"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setGallery([{id: Date.now().toString(), url: imageState.edited!, userName: userName || 'مبدع مجهول', date: 'الآن', likes: 0}, ...gallery]);
                  setShowUploadModal(false);
                }}
                className="flex-1 py-3 brand-gradient text-white font-bold rounded-xl text-xs"
              >
                نشر الآن
              </button>
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-3 bg-zinc-800 text-zinc-400 rounded-xl text-xs">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="flex-1 w-full h-full object-cover" />
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8">
            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-zinc-200/20 flex items-center justify-center active:scale-90 transition-all">
              <div className="w-14 h-14 bg-zinc-100 rounded-full border-2 border-zinc-950" />
            </button>
            <button onClick={stopCamera} className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center border border-red-500/50">إلغاء</button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default App;
