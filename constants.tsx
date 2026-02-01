
import { Preset } from './types';

export const FASHION_PRESETS: Preset[] = [
  {
    id: 'nano-lux-campaign',
    name: 'Nano Lux Campaign',
    nameAr: 'حملة نانو الفاخرة',
    descriptionAr: 'تحويل صورتك إلى حملة إعلانية لبراند عالمي مع رتوش سينمائية وشعار فخم.',
    icon: '✨',
    prompt: `Transform this image into a high-end luxury fashion campaign suitable for professional printing.
Preserve facial features exactly. Replace background with ultra-luxurious elegant setting.
Add luxury branding 'NANO LUX' in a prestigious layout. Professional editorial retouching. 
High-end skin texture (realistic). Enhanced fabric shine. 
Output: Ultra-high resolution, sharp details, print-ready.`
  },
  {
    id: 'nano-4k-pro',
    name: 'Nano 4K Pro',
    nameAr: 'ترقية نانو 4K',
    descriptionAr: 'زيادة حدة التفاصيل ووضوح ملمس القماش والبشرة بجودة فائقة.',
    icon: '💎',
    prompt: `Ultra high-resolution 4K upscale. Preserve exact identity and skin texture.
Enhance sharpness and clarity. Natural skin tones. Cinematic depth of field. 
Editorial quality, clean and realistic. No distortion.`
  },
  {
    id: 'studio-glam',
    name: 'Studio Glam',
    nameAr: 'إضاءة الاستوديو',
    descriptionAr: 'إضافة إضاءة احترافية وخلفية استوديو نظيفة تحاكي تصوير المجلات.',
    icon: '📸',
    prompt: `Keep the subject exactly the same. Replace the background with a minimalist high-end architectural studio.
Soft cinematic lighting from the side. Luxury color grading. Magazine cover style.`
  },
  {
    id: 'editorial-chic',
    name: 'Editorial Chic',
    nameAr: 'شياكة المجلات',
    descriptionAr: 'رتوش احترافية تركز على الألوان والتباين لإبراز تفاصيل الموضة.',
    icon: '👗',
    prompt: `Professional fashion editorial retouching. Focus on balanced contrast and rich color palette. 
Refined highlights on fabric. High-end magazine aesthetics.`
  }
];
