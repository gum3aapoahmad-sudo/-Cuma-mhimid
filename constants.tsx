
import { Preset } from './types';

export const FASHION_PRESETS: Preset[] = [
  {
    id: 'al-naseem-campaign',
    name: 'Al Naseem Luxury Campaign',
    nameAr: 'حملة النسيم الفاخرة',
    descriptionAr: 'تحويل الصورة إلى حملة أزياء عالمية فاخرة مع شعار "النسيم" في الزاوية العلوية اليسرى وجودة طباعة احترافية.',
    icon: '✨',
    prompt: `Transform this image into a high-end luxury fashion campaign suitable for professional printing.
Reveal and enhance the model’s face naturally while preserving her real facial features, expression, and identity with no distortion.
Preserve the exact body proportions, pose, and dress design without any modification.
Replace the background with an ultra-luxurious, elegant setting inspired by international fashion brands.
Use refined architectural elements, warm neutral tones, subtle textures, and cinematic soft lighting to create a premium atmosphere.
Add the luxury brand logo "AL NASEEM" in an elegant, refined style.
Place the logo in the top-left corner with a prestigious, perfectly balanced layout.
Add the Arabic name "النسيم" subtly underneath the English logo in a smaller minimalist font.
Apply professional editorial retouching: natural high-end skin retouch (no plastic effect), enhanced fabric shine and texture, balanced contrast and luxury color grading.
Add subtle premium branding elements: delicate watermark pattern with brand initials, minimal gold or champagne accents.
Output & Print Requirements: Ultra-high resolution, print-ready, professional fashion photography, luxury editorial quality. Aspect ratio optimized for 23.5 × 29.5 cm print.`
  },
  {
    id: 'al-naseem-4k-pro',
    name: 'Al Naseem 4K Ultra',
    nameAr: 'ترقية النسيم 4K فائقة الدقة',
    descriptionAr: 'ترقية احترافية 4K تحافظ على الهوية وملامح الوجه بدقة متناهية مع تحسين ملمس الأقمشة والجلد.',
    icon: '💎',
    prompt: `Ultra high-resolution 4K upscale, professional luxury fashion photography.
Preserve the model’s exact facial features, identity, skin texture, body proportions, and pose with zero distortion.
Enhance sharpness, fine details, fabric texture, lace edges, and leopard pattern clarity.
Natural skin tones, realistic lighting, soft shadows, cinematic depth.
Maintain the elegant luxury interior background, warm color grading, and original composition.
No face alteration, no body reshaping, no artificial beauty filters.
Print-ready, editorial quality, clean and realistic.
Negative Prompt: No face change, no body modification, no blur, no over-smoothing, no plastic skin, no AI artifacts, no distortion, no exaggerated curves, no extra limbs, no change in branding or text.`
  },
  {
    id: 'studio-glam',
    name: 'Studio Glam',
    nameAr: 'إضاءة الاستوديو',
    descriptionAr: 'إضافة إضاءة احترافية وخلفية استوديو نظيفة تحاكي تصوير المجلات العالمية.',
    icon: '📸',
    prompt: `Keep the subject exactly the same. Replace the background with a minimalist high-end architectural studio.
Soft cinematic lighting from the side. Luxury color grading. Magazine cover style. Preserve identity and dress details perfectly.`
  },
  {
    id: 'editorial-chic',
    name: 'Editorial Chic',
    nameAr: 'شياكة المجلات',
    descriptionAr: 'رتوش احترافية تركز على الألوان والتباين لإبراز تفاصيل الموضة بشكل فاخر.',
    icon: '👗',
    prompt: `Professional fashion editorial retouching. Focus on balanced contrast and rich color palette. 
Refined highlights on fabric. High-end magazine aesthetics. Preserve original body and face features without any AI distortion.`
  }
];
