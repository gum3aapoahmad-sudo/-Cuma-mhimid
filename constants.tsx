
import { Preset } from './types';

export const FASHION_PRESETS: Preset[] = [
  {
    id: 'al-naseem-campaign',
    name: 'Al Naseem Luxury Campaign',
    nameAr: 'حملة النسيم الفاخرة',
    descriptionAr: 'تحويل الصورة إلى حملة إعلانية عالمية مع شعار "النسيم" بلمسة ذهبية ملكية.',
    icon: '✨',
    prompt: `Transform this image into a high-end luxury fashion campaign suitable for professional printing.
Reveal and enhance the model’s face naturally while preserving her real facial features, expression, and identity with no distortion.
Preserve the exact body proportions, pose, and dress design without any modification.
Replace the background with an ultra-luxurious, elegant setting inspired by international fashion brands.
Use refined architectural elements, warm neutral tones, subtle textures, and cinematic soft lighting to create a premium atmosphere.
Add the luxury brand logo AL NASEEM in an elegant, refined style. Place the logo in the top-left corner with a prestigious, perfectly balanced layout.
Add the Arabic name النسيم subtly underneath the English logo in a smaller minimalist font.
Apply professional editorial retouching:
Natural high-end skin retouch (no plastic effect)
Enhanced fabric shine and texture
Balanced contrast and luxury color grading
Refined highlights on face and dress
Add subtle premium branding elements so the logo does not appear alone:
Delicate watermark pattern with brand initials
Minimal gold or champagne accents
International luxury fashion campaign aesthetic
Output & Print Requirements:
Aspect ratio optimized for print (23.5 × 29.5 cm)
Ultra-high resolution, sharp details, no noise, no artifacts.
Negative Prompt: No face change, no body modification, no blur, no over-smoothing, no plastic skin, no AI artifacts, no distortion.`
  },
  {
    id: 'ultra-realistic-upscale',
    name: '4K Pro Upscale',
    nameAr: 'ترقية 4K احترافية',
    descriptionAr: 'زيادة حدة التفاصيل ووضوح ملمس القماش والبشرة بجودة 4K حقيقية.',
    icon: '💎',
    prompt: `Ultra high-resolution 4K upscale, professional luxury fashion photography.
Preserve the model’s exact facial features, identity, skin texture, body proportions, and pose with zero distortion.
Enhance sharpness, fine details, fabric texture, lace edges, and clarity.
Natural skin tones, realistic lighting, soft shadows, cinematic depth.
Maintain the elegant luxury interior background, warm color grading, and original composition.
No face alteration, no body reshaping, no artificial beauty filters.
Print-ready, editorial quality, clean and realistic.`
  },
  {
    id: 'editorial-retouch',
    name: 'Editorial Master',
    nameAr: 'رتوش المجلات العالمية',
    descriptionAr: 'تعديل احترافي للإضاءة والألوان يمنح الصورة طابع غلاف مجلات الموضة العالمية.',
    icon: '📸',
    prompt: `Professional editorial retouching while keeping the person and background exactly as they are.
Apply high-end skin retouch (preserving texture), enhance fabric highlights, and perform luxury color grading.
Ensure the image looks like it came from a professional fashion magazine shoot.
High contrast, refined shadows, and cinematic atmosphere.`
  },
  {
    id: 'minimalist-studio',
    name: 'Minimalist Background',
    nameAr: 'خلفية استوديو راقية',
    descriptionAr: 'استبدال الخلفية ببيئة معمارية هادئة وتفاصيل رخامية وألوان بيج دافئة.',
    icon: '🏛️',
    prompt: `Keep the person in the foreground exactly the same.
Change the background to a minimalist, high-end architectural studio setting with warm beige and cream tones.
Soft cinematic lighting from the side, clean surfaces, and an atmosphere of quiet luxury.`
  }
];