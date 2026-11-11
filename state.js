import {createState,normalizeState,SKILLS} from './model.js';
import {createSchoolState,normalizeSchoolState,SUBJECTS,STAGES} from './school-model.js';

export function createAppState() {
  return {...createState(),school:createSchoolState(),writingEntries:[]};
}

export function normalizeWritingEntries(raw) {
  if(!Array.isArray(raw))return [];
  const ids=new Set(), pairs=new Set(), out=[];
  for(const entry of raw){
    if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id.trim()||entry.id.length>200||['__proto__','prototype','constructor'].includes(entry.id))continue;
    const exam=Number(entry.exam),part=Number(entry.part),pair=`${exam}:${part}`;
    if(!Number.isInteger(exam)||exam<1||exam>15||!Number.isInteger(part)||part<0||part>2||ids.has(entry.id)||pairs.has(pair))continue;
    const limit=(value,n)=>typeof value==='string'?value.slice(0,n):'';
    out.push({id:entry.id,exam,part,title:limit(entry.title,200),task:limit(entry.task,20000),draft:limit(entry.draft,20000),corrected:limit(entry.corrected,20000),feedback:limit(entry.feedback,20000),promptText:limit(entry.promptText,20000),updatedAt:limit(entry.updatedAt,64)});
    ids.add(entry.id);pairs.add(pair);
    if(out.length===45)break;
  }
  return out;
}

export function normalizeAppState(raw) {
  const state=normalizeState(raw);
  state.school=normalizeSchoolState(raw.school);
  state.writingEntries=normalizeWritingEntries(raw.writingEntries);
  for(const [date,day] of Object.entries(state.days)){
    const original=raw.days?.[date]?.dailyPlan;
    if(!original||typeof original!=='object'||Array.isArray(original)||original.version!==1)continue;
    const plan={version:1};
    for(const {id,parts} of SKILLS){
      const selected=original[id];
      if(!selected||typeof selected!=='object'||Array.isArray(selected)||! /^(?:[1-9]|1[0-5])$/.test(String(selected.exam))||!Number.isInteger(selected.part)||selected.part<0||selected.part>=parts||typeof selected.review!=='boolean')continue;
      plan[id]={exam:String(selected.exam),part:selected.part,review:selected.review};
    }
    if(Number.isInteger(original.nicoStartSeconds)&&original.nicoStartSeconds>=0&&original.nicoStartSeconds<=86399)plan.nicoStartSeconds=original.nicoStartSeconds;
    day.dailyPlan=plan;
  }
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
