import {createState,normalizeState} from './model.js';
import {createSchoolState,normalizeSchoolState,SUBJECTS,STAGES} from './school-model.js';

export function createAppState() {
  return {...createState(),school:createSchoolState()};
}

export function normalizeAppState(raw) {
  const state=normalizeState(raw);
  state.school=normalizeSchoolState(raw.school);
  // Retain school links alongside the original German pinned-task schema.
  state.pinned=state.pinned.map(item=>{
    const old=raw.pinned?.find(p=>p&&p.id===item.id);
    if(!old||!SUBJECTS.some(s=>s.id===old.subject))return item;
    return {...item,subject:old.subject,
      ...(typeof old.lessonId==='string'?{lessonId:old.lessonId.slice(0,200)}:{}),
      ...(STAGES.some(s=>s.id===old.stage)?{stage:old.stage}:{})};
  });
  return state;
}
