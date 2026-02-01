
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
    const checkKey = async () => {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkKey();
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initialItems: GalleryItem[] = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80',
        userName: 'سارة الأحمد',
        date: '٢٠٢٤/١٢/٠١',
        likes: 156
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
        userName: 'نورة السعيد',
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

  const handleShareFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSharePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setImageState(prev => ({ ...prev, error: "فشل الوصول إلى الكاميرا. يرجى التحقق من الأذونات." }));
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImageState({
          original: dataUrl,
          edited: null,
          isProcessing: false,
          error: null
        });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const cropToSquare = () => {
    if (!imageState.original) return;
    const img = new Image();
    img.src = imageState.original;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const xOffset = (img.width - size) / 2;
        const yOffset = (img.height - size) / 2;
        ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, size, size);
        const croppedDataUrl = canvas.toDataURL('image/png');
        setImageState(prev => ({
          ...prev,
          original: croppedDataUrl,
          edited: null
        }));
      }
    };
  };

  const handleManageKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } catch (err) {
      console.error("API Key selection error:", err);
    }
  };

  const checkAndRun = async () => {
    if (mode === EditingMode.PROFESSIONAL) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setShowSettingsModal(true);
        return;
      }
    }
    handleProcess();
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
        setImageState(prev => ({ ...prev, isProcessing: false }));
      } else {
        setImageState(prev => ({ ...prev, error: "حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى.", isProcessing: false }));
      }
    }
  };

  const downloadImage = () => {
    if (!imageState.edited) return;
    const link = document.createElement('a');
    link.href = imageState.edited;
    link.download = `nano-banano-${Date.now()}.png`;
    link.click();
  };

  const voteImage = (id: string) => {
    setGallery(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
  };

  const shareToGallery = () => {
    if (!imageState.edited) return;
    setSharePreview(imageState.edited);
    setShowUploadModal(true);
  };

  const confirmUpload = () => {
    const finalImageUrl = sharePreview || imageState.edited;
    if (!finalImageUrl) return;
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      url: finalImageUrl,
      userName: userName || 'مبدع نانو بنانو',
      date: new Date().toLocaleDateString('ar-SA'),
      likes: 0
    };
    setGallery([newItem, ...gallery]);
    setShowUploadModal(false);
    setUserName('');
    setSharePreview(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-100 selection:bg-amber-500/30 overflow-x-hidden">
      <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center text-slate-950 font-bold text-3xl luxury-font shadow-lg shadow-amber-500/20">
            N
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold tracking-tighter luxury-font">نانو بنانو</h1>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">NANO BANANO EDITOR</span>
               <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded-full border border-emerald-500/20 font-bold">محرر صور بالذكاء الاصطناعي</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setMode(EditingMode.STANDARD)}
              className={`px-4 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${mode === EditingMode.STANDARD ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              الوضع السريع
            </button>
            <button
              onClick={() => setMode(EditingMode.PROFESSIONAL)}
              className={`px-4 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${mode === EditingMode.PROFESSIONAL ? 'gold-gradient text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              الوضع الاحترافي
            </button>
          </nav>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-full transition-all active:scale-95 border ${hasApiKey ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-slate-950 rounded-full font-bold hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 text-xs"
            >
              <span>رفع صورة</span>
            </button>
          </div>
          <input type="file" id="mainFileInput" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Toggle Button for Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute z-[45] hidden lg:flex top-1/2 -translate-y-1/2 transition-all duration-500 items-center justify-center w-10 h-24 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-r-3xl text-amber-500 shadow-2xl ${isSidebarOpen ? 'left-[380px]' : 'left-0'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform duration-500 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Sidebar */}
        <aside 
          className={`glass-panel lg:border-l border-slate-800 p-8 flex flex-col gap-8 overflow-y-auto z-40 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-full lg:w-[380px] opacity-100' : 'w-0 lg:w-0 opacity-0 overflow-hidden !p-0'}`}
        >
          <div className="space-y-6 min-w-[320px]">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block">أنماط "نانو بنانو" الفاخرة</label>
              <div className="grid grid-cols-1 gap-3">
                {FASHION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomPrompt('');
                    }}
                    className={`group relative flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 text-right ${
                      selectedPresetId === preset.id && !customPrompt
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${selectedPresetId === preset.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {preset.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-xs ${selectedPresetId === preset.id ? 'text-amber-500' : 'text-slate-200'}`}>
                        {preset.nameAr}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{preset.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block">تخصيص يدوي</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="صف تفاصيل التعديل التي تريدها من نانو بنانو..."
                className="w-full h-28 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
              />
            </div>

            <button
              onClick={checkAndRun}
              disabled={!imageState.original || imageState.isProcessing}
              className="w-full py-4 gold-gradient text-slate-950 font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {imageState.isProcessing ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>توليد النتيجة الفاخرة</span>
              )}
            </button>
          </div>
        </aside>

        {/* Image Canvas Area */}
        <section className="flex-1 overflow-y-auto bg-black flex flex-col transition-all duration-500">
          <div className="flex-1 min-h-[500px] flex items-center justify-center p-4 sm:p-12 relative">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-8 right-8 z-[46] hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-500 hover:bg-amber-500/10 transition-all"
              >
                <span>فتح الأدوات</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {showCamera && (
              <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
                <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-2 border-amber-500 shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                    <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-slate-200">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-900" />
                    </button>
                    <button onClick={stopCamera} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {!imageState.original ? (
              <div className="text-center space-y-8 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="w-24 h-24 gold-gradient rounded-[32px] mx-auto flex items-center justify-center text-4xl shadow-2xl rotate-3">
                   📸
                </div>
                <h2 className="text-4xl sm:text-6xl font-bold luxury-font tracking-tight leading-tight">
                   الجمال في <br/><span className="text-amber-500 italic">أبهى صوره</span>
                </h2>
                <p className="text-slate-400 text-lg font-light">
                  ارفع صورتك الآن ودع ذكاء "نانو بنانو" الاصطناعي يتولى مهمة تحويلها لعمل فني فاخر.
                </p>
                <div className="flex gap-4 justify-center">
                   <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold hover:bg-slate-200 transition-all shadow-xl">رفع صورة</button>
                   <button onClick={startCamera} className="px-10 py-4 border border-slate-700 rounded-full font-bold hover:border-amber-500 transition-all">التقاط صورة</button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col gap-6 max-w-7xl mx-auto">
                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                  <div className="flex-1 flex flex-col group relative">
                    <div className="flex items-center justify-between mb-2 px-2">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">الأصل</span>
                       <div className="flex gap-2">
                         <button onClick={cropToSquare} className="text-[10px] bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">قص مربع</button>
                         <button onClick={() => setImageState({ original: null, edited: null, isProcessing: false, error: null })} className="text-[10px] text-red-400 font-bold hover:underline">حذف</button>
                       </div>
                    </div>
                    <div className="flex-1 rounded-[32px] overflow-hidden border border-slate-800 bg-slate-900/30">
                      <img src={imageState.original} alt="Original" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col relative">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 px-2">معالجة نانو بنانو</span>
                    <div className="flex-1 rounded-[32px] overflow-hidden border border-amber-500/20 bg-slate-900/50 shadow-2xl relative">
                      {imageState.isProcessing && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                          <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                          <p className="text-amber-500 font-bold text-sm mt-4">جاري المعالجة...</p>
                        </div>
                      )}
                      {imageState.edited ? (
                        <img src={imageState.edited} alt="AI Result" className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-700" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-3">
                           <p className="luxury-font italic text-xs italic">في انتظار لمستك الإبداعية...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {imageState.edited && (
                  <div className="flex flex-wrap justify-center gap-4 py-4 animate-in slide-in-from-bottom-4 duration-500">
                    <button onClick={downloadImage} className="px-8 py-3 gold-gradient text-slate-950 font-bold rounded-full shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                      <span>حفظ النتيجة</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                    <button onClick={shareToGallery} className="px-8 py-3 bg-slate-900 border border-slate-700 rounded-full font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                      <span>نشر في المعرض</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <section className="bg-slate-900/20 border-t border-slate-800/50 p-10">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold luxury-font mb-8">معرض إبداعات "نانو بنانو"</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/30 transition-all">
                    <img src={item.url} alt="Gallery" className="aspect-[3/4] w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-bold text-slate-300">{item.userName}</span>
                         <button onClick={() => voteImage(item.id)} className="flex items-center gap-1 text-[8px] text-amber-500">
                           <span>💎</span> {item.likes}
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* Modals remain the same but styled consistently */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative">
              <button onClick={() => setShowSettingsModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="text-center mb-6">
                 <h4 className="text-xl font-bold luxury-font mb-1">إدارة مفتاح الوصول</h4>
                 <p className="text-slate-500 text-[10px]">مطلوب للوضع الاحترافي عالي الجودة</p>
              </div>
              <div className="space-y-4">
                 <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-xs">حالة المفتاح:</span>
                    {hasApiKey ? <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">نشط ✅</span> : <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">غير متصل ⚠️</span>}
                 </div>
                 <button onClick={handleManageKey} className="w-full py-3 gold-gradient text-slate-950 font-bold rounded-xl text-sm shadow-lg active:scale-95 transition-all">اختيار مفتاح من الاستوديو</button>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-center text-[9px] text-amber-500 hover:underline uppercase tracking-widest font-bold">معلومات الفوترة في جوجل</a>
              </div>
           </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
              <div className="text-center mb-6">
                 <h4 className="text-xl font-bold luxury-font mb-2">مشاركة الإبداع</h4>
              </div>
              <div className="space-y-4">
                 <div className="aspect-[3/4] w-32 mx-auto rounded-xl overflow-hidden border border-amber-500/30">
                    <img src={sharePreview || imageState.edited || ''} alt="Upload" className="w-full h-full object-cover" />
                 </div>
                 <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="اسمك الفني..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-amber-500 transition-all"
                 />
                 <div className="flex gap-2">
                    <button onClick={confirmUpload} className="flex-1 py-3 gold-gradient text-slate-950 font-bold rounded-xl text-xs active:scale-95 transition-all">نشر</button>
                    <button onClick={() => setShowUploadModal(false)} className="px-4 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs">إلغاء</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="py-6 px-8 border-t border-slate-900 bg-slate-950 text-center">
        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em]">© {new Date().getFullYear()} نانو بنانو | محرك الجمال بالأقمار الصناعية</p>
      </footer>
    </div>
  );
};

export default App;
