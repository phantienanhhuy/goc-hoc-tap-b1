import { MATH_CONTENT } from './school-content-math.js';
import { PHYSICS_CONTENT } from './school-content-physics.js';
import { IT_CONTENT } from './school-content-it.js';

// Learning material stays separate from saved checklists and imported backups.
export const SCHOOL_CONTENT = { ...MATH_CONTENT, ...PHYSICS_CONTENT, ...IT_CONTENT };

export function lessonContent(lesson) {
  const content = SCHOOL_CONTENT[lesson.id];
  return content && lesson.id.startsWith(`${lesson.subject}-`) ? content : null;
}

export function lessonSearchText(lesson) {
  const c = lessonContent(lesson);
  return [lesson.chapter, lesson.title, c?.overview, ...(c?.objectives || []),
    ...(c?.sections || []).flatMap(s => [s.title, ...s.bullets, ...(s.formulas || []).map(f => f.expression)])
  ].join(' ').toLocaleLowerCase('vi');
}
