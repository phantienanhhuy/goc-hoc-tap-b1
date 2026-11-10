import { SCIENCE_IMAGES } from './school-images-science.js';
import { IT_IMAGES } from './school-images-it.js';

export const SCHOOL_IMAGES = { ...SCIENCE_IMAGES, ...IT_IMAGES };
export const imagesForLesson = id => Object.hasOwn(SCHOOL_IMAGES, id) ? SCHOOL_IMAGES[id] : [];
export const findLessonImage = (lessonId, imageId) => imagesForLesson(lessonId).find(image => image.id === imageId);

export function safeImagePath(src) {
  return typeof src === 'string' && /^\.\/assets\/learning\/(?:science|it)\/[a-z0-9][a-z0-9_-]*\.(?:png|jpg|jpeg|webp|svg|gif)$/.test(src) ? src : '';
}

export function safeImageSource(url) {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : ''; } catch { return ''; }
}
