import { normalizeWritingEntries } from './state.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const countGermanWords = text => (String(text ?? '').match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu) || []).length;

export function makeWritingPrompt({exam,part,task='',draft=''}={}) {
  return `Du bist meine Deutschlehrkraft für die B1-Prüfung. Hilf mir, meinen eigenen Text zu verbessern, statt die Aufgabe für mich neu zu schreiben.\n\nAufgabe: Übungsprüfung ${exam}, Schreiben Teil ${Number(part)+1}. Als grober Richtwert gelten etwa ${[80,80,40][part]} Wörter; maßgeblich ist die konkrete Aufgabenstellung.\nPrüfungsaufgabe (von mir übertragen):\n---\n${task || '[Aufgabentext noch nicht eingefügt]'}\n---\nMein Entwurf:\n---\n${draft || '[Entwurf noch nicht eingefügt]'}\n---\n\nBitte beachte nur die Angaben in meiner Aufgabe und erfinde keine fehlenden Anforderungen. Gib zuerst meinen behutsam korrigierten Text auf B1-Niveau aus. Bewahre meine Aussagen, meinen Stil und meine Absicht; ergänze keine erfundenen Inhalte. Erkläre danach die wichtigsten Fehler kurz und verständlich auf Deutsch und gib mir höchstens drei konkrete Tipps. Wenn die Aufgabe fehlt oder etwas unklar ist, sage das deutlich. Bewerte nur, was du anhand des Textes und der vorhandenen Aufgabe beurteilen kannst.`;
}

export function createWritingWorkspace({getState,save,notify=()=>{},onExamComplete,getAccountId=()=>null}) {
  let dialog=null, context=null, draftBuffer=null, dirty=false, timer=null;
  const sameAccount=()=>context && getAccountId()===context.account;
  function closeForAccountChange() {
    clearTimeout(timer);dirty=false;context=null;draftBuffer=null;
    if(dialog?.open)dialog.close();
    notify('Tài khoản đã thay đổi. Hãy mở lại bài viết.');
  }
  function flush() {
    clearTimeout(timer);
    if(!context||!dirty)return true;
    if(!sameAccount()){closeForAccountChange();return false;}
    const state=getState();
    const entries=normalizeWritingEntries(state.writingEntries);
    const idx=entries.findIndex(x=>x.exam===context.exam&&x.part===context.part);
    const entry={...draftBuffer,updatedAt:new Date().toISOString()};
    if(idx<0)entries.push(entry);else entries[idx]=entry;
    state.writingEntries=entries;
    const result=save();
    if(result===false){const status=dialog?.querySelector('[data-writing-status]');if(status)status.textContent='Chưa lưu được. Hãy kiểm tra bộ nhớ.';return false;}
    dirty=false;
    const status=dialog?.querySelector('[data-writing-status]');if(status)status.textContent='Đã lưu';
    return true;
  }
  function close() {
    if(!flush())return;
    if(dialog?.open)dialog.close();
    context=null;draftBuffer=null;
  }
  function refreshPrompt() {
    if(!context||!draftBuffer)return;
    const prompt=dialog.querySelector('[data-writing-prompt]');
    if(prompt)prompt.value=makeWritingPrompt({...context,...draftBuffer});
    const count=dialog.querySelector('[data-writing-count]');
    if(count)count.textContent=`${countGermanWords(draftBuffer.draft)} từ · khoảng ${[80,80,40][context.part]} từ`;
  }
  function ensureDialog() {
    if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.className='writing-dialog';dialog.setAttribute('aria-labelledby','writing-title');document.body.append(dialog);
    dialog.addEventListener('input',event=>{
      const field=event.target.dataset.writingField;
      if(!field||!draftBuffer)return;
      if(!sameAccount()){closeForAccountChange();return;}
      draftBuffer[field]=event.target.value.slice(0,20000);dirty=true;
      const status=dialog.querySelector('[data-writing-status]');if(status)status.textContent='Đang lưu…';
      refreshPrompt();clearTimeout(timer);timer=setTimeout(flush,500);
    });
    dialog.addEventListener('click',async event=>{
      const action=event.target.closest('[data-writing-action]')?.dataset.writingAction;
      if(!action)return;
      if(action==='close'){close();return;}
      if(!sameAccount()){closeForAccountChange();return;}
      if(action==='copy'){
        refreshPrompt();const prompt=dialog.querySelector('[data-writing-prompt]');
        try {await navigator.clipboard.writeText(prompt.value);notify('Đã chép lời nhắc.');}
        catch {prompt.focus();prompt.select();notify('Hãy sao chép lời nhắc đang được chọn.');}
      }
      if(action==='complete'){
        if(!flush()||!sameAccount())return;
        if(onExamComplete)onExamComplete(context.exam,context.part);
        else {const state=getState();state.exams[String(context.exam)].schreiben.parts[context.part]='done';if(save()===false){notify('Chưa lưu được trạng thái hoàn thành.');return;}}
        notify('Đã đánh dấu hoàn thành Teil.');
      }
    });
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('close',()=>{if(context)flush();context=null;draftBuffer=null;});
    return dialog;
  }
  function open(exam,part) {
    exam=Number(exam);part=Number(part);
    if(!Number.isInteger(exam)||exam<1||exam>15||!Number.isInteger(part)||part<0||part>2)throw new RangeError('Đề hoặc Teil không hợp lệ');
    if(dialog?.open){close();if(dialog.open)return;}
    context={exam,part,account:getAccountId()};
    const saved=normalizeWritingEntries(getState().writingEntries).find(x=>x.exam===exam&&x.part===part);
    draftBuffer=saved||{id:`writing-${exam}-${part}`,exam,part,title:`Đề ${exam} · Teil ${part+1}`,task:'',draft:'',corrected:'',feedback:'',promptText:'',updatedAt:''};dirty=false;
    const d=ensureDialog();
    d.innerHTML=`<div class="dialog-head"><div><h2 id="writing-title">Viết · Đề ${exam} · Teil ${part+1}</h2><small data-writing-status aria-live="polite">Tự lưu trên thiết bị</small></div><button type="button" class="close-dialog" data-writing-action="close" aria-label="Đóng">×</button></div>
      <div class="dialog-body writing-body"><p class="writing-hint">Chép lời nhắc → gửi AI → dán bản chữa.</p>
      <label class="field">Đề bài (chép từ sách)<textarea data-writing-field="task" maxlength="20000" rows="3">${escape(draftBuffer.task)}</textarea></label>
      <label class="field">Bài viết của bạn <small data-writing-count></small><textarea data-writing-field="draft" maxlength="20000" rows="8">${escape(draftBuffer.draft)}</textarea></label>
      <details class="writing-prompt"><summary>Lời nhắc tiếng Đức</summary><p class="school-note">Chép lời nhắc và gửi trong công cụ AI bạn chọn.</p><textarea data-writing-prompt readonly rows="8" aria-label="Lời nhắc tiếng Đức"></textarea><button type="button" class="btn secondary small" data-writing-action="copy">Chép lời nhắc</button></details>
      <label class="field">Bản chữa (tự dán)<textarea data-writing-field="corrected" maxlength="20000" rows="7">${escape(draftBuffer.corrected)}</textarea></label>
      <label class="field">Nhận xét cần nhớ<textarea data-writing-field="feedback" maxlength="20000" rows="4">${escape(draftBuffer.feedback)}</textarea></label>
      </div><div class="dialog-actions"><button type="button" class="btn primary" data-writing-action="complete">Hoàn thành Teil</button><button type="button" class="btn secondary" data-writing-action="close">Đóng</button></div>`;
    refreshPrompt();d.showModal();
  }
  return {open,close};
}
