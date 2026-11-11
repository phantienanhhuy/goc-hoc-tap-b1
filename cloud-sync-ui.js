import {createCloudClient} from './cloud-client.js';
import {CLOUD_CONFIG} from './cloud-config.js';
import {createSyncEngine} from './sync-engine.js';
import {recordsToState,stateToRecords} from './sync-model.js';
import {createAppState,normalizeAppState} from './state.js';

const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=value=>structuredClone(value);
const button=(action,label,extra='')=>`<button type="button" class="btn secondary small" data-cloud-action="${action}" ${extra}>${label}</button>`;
const accountScope=()=>CLOUD_CONFIG.supabaseUrl ? new URL(CLOUD_CONFIG.supabaseUrl).hostname : 'unconfigured';
const collectionLabel={settings:'Cài đặt',days:'Checklist',exams:'15 đề',resources:'Tài liệu',mistakes:'Lỗi cần ôn',scores:'Điểm',pinned:'Việc đã thêm',school_settings:'Cài đặt THPT',school_lessons:'Bài THPT',school_papers:'Đề THPT',school_sessions:'Buổi học'};
const conflictValue=row=>row?.deleted?'Đã xóa':typeof row?.value==='boolean'?(row.value?'Đã đánh dấu':'Chưa đánh dấu'):JSON.stringify(row?.value??null);
function conflictDetails(conflicts=[]) {
  return `<details class="cloud-conflict-details"><summary>Xem các mục khác nhau</summary>${conflicts.map(({change,remote})=>{let path=change.key;try{path=JSON.parse(change.key).join(' / ');}catch{}return `<article><strong>${e(collectionLabel[change.collection]||change.collection)} · ${e(path)}</strong><p>Máy này: ${e(conflictValue(change))}</p><p>Đám mây: ${e(conflictValue(remote))}</p></article>`;}).join('')}</details>`;
}

export function createCloudSyncUI({getState,setState,notify,legacyKey='b1-moi-ngay-v1',client=createCloudClient()}) {
  let user=null,engine=null,transport=null,phase={phase:'local',pending:0},ready=false,applying=false;
  let generation=0,saveTimer,dialog,mode='login',busy=false,backups=[],authMessage='',lastSynced='';
  const unreadableKeys=new Set();
  const cache={
    async get(key){const raw=localStorage.getItem(`b1-cloud-cache:${key}`);return raw?JSON.parse(raw):null;},
    async set(key,value){localStorage.setItem(`b1-cloud-cache:${key}`,JSON.stringify(value));}
  };
  const storageKey=()=>user?`b1-cloud-state:${accountScope()}:${user.id}`:unreadableKeys.has(legacyKey)?`${legacyKey}-recovery-state`:legacyKey;
  const readState=key=>{const raw=localStorage.getItem(key);if(!raw)return null;try{return normalizeAppState(JSON.parse(raw));}catch{localStorage.setItem(`b1-unreadable:${key}:${Date.now()}`,raw);unreadableKeys.add(key);notify('Bản dữ liệu cũ chưa đọc được và đã được giữ riêng.');return null;}};
  function preserveDevice(reason) {
    const key=`b1-device-backup:${Date.now()}`;
    localStorage.setItem(key,JSON.stringify({reason,createdAt:new Date().toISOString(),state:getState()}));
    const previous=Object.keys(localStorage).filter(k=>k.startsWith('b1-device-backup:')).sort().reverse();
    for(const old of previous.slice(3))localStorage.removeItem(old);
    return key;
  }
  function applyState(next) {
    applying=true;
    try {const state=recordsToState(stateToRecords(next));localStorage.setItem(storageKey(),JSON.stringify(state));setState(state);}
    finally {applying=false;}
  }
  function statusLabel() {
    if(!client.configured)return 'Đồng bộ chưa bật';
    if(!user)return 'Đang lưu trên thiết bị';
    return ({loading:'Đang tải tiến độ…',empty:'Chọn tiến độ ban đầu',syncing:'Đang đồng bộ…',pending:'Đang chờ gửi',synced:'Đã đồng bộ',conflict:'Có thay đổi cần chọn',error:'Chưa đồng bộ được'})[phase.phase]||'Đang kết nối…';
  }
  function renderBar() {
    return `<div id="cloud-account-bar" class="cloud-account-bar"><div><strong>${e(statusLabel())}</strong><small>${user?e(user.email||'Tài khoản của bạn'): 'Đăng nhập để học tiếp trên thiết bị khác'}${phase.pending?` · ${phase.pending} mục chờ gửi`:''}</small></div>${button('account',user?'Tài khoản':'Đăng nhập')}</div>`;
  }
  function mount() {
    const current=document.querySelector('#cloud-account-bar');
    if(current)current.outerHTML=renderBar();
    const main=document.querySelector('#main');
    if(main){for(const child of main.children)if(child.id!=='cloud-account-bar')child.inert=Boolean(user&&['loading','empty'].includes(phase.phase));main.setAttribute('aria-busy',String(phase.phase==='loading'));}
  }
  function controls(disabled=busy){if(dialog)for(const el of dialog.querySelectorAll('button,input'))el.disabled=disabled;}
  function ensureDialog() {
    if(!dialog){dialog=document.createElement('dialog');dialog.className='cloud-dialog';dialog.setAttribute('aria-labelledby','cloud-dialog-title');document.body.append(dialog);}
    return dialog;
  }
  function accountBody() {
    if(!client.configured)return '<p>Đồng bộ đang được thiết lập. Tiến độ hiện vẫn lưu trên thiết bị.</p><p class="school-note">Bạn vẫn có thể xuất bản sao trong Cài đặt.</p>';
    if(user){
      if(mode==='recover')return `<p>Đặt mật khẩu mới cho tài khoản.</p>${authForm('recover')}`;
      if(phase.phase==='empty')return `<p>Tài khoản chưa có tiến độ. Chọn dữ liệu để bắt đầu:</p><div class="cloud-actions">${button('seed-local','Dùng tiến độ trên thiết bị')}${button('seed-new','Bắt đầu mới')}</div><p class="school-note">Bản cũ trên thiết bị vẫn được giữ lại.</p>`;
      if(phase.phase==='conflict')return `<p>Hai thiết bị đã sửa cùng một mục. Những mục khác vẫn được giữ.</p><p>Chọn bản dùng cho ${phase.conflicts?.length||0} mục bị trùng:</p>${conflictDetails(phase.conflicts)}<div class="cloud-actions">${button('keep-local','Giữ thay đổi trên máy này')}${button('keep-cloud','Dùng thay đổi trên đám mây')}</div><p class="school-note">Cả hai phiên bản sẽ được sao lưu trước khi áp dụng.</p>`;
      if(mode==='backups')return `<p>Giữ tối đa 10 bản sao gần nhất.</p>${backups.length?backups.map(b=>`<div class="cloud-backup-row"><span>${e(new Date(b.created_at).toLocaleString('vi-VN'))}</span>${button('restore-backup','Khôi phục',`data-backup-id="${e(b.id)}"`)}</div>`).join(''):'<p>Chưa có bản sao.</p>'}${button('account','Quay lại')}`;
      return `<p class="cloud-account-email">${e(user.email||'Tài khoản của bạn')}</p><p role="status">${e(statusLabel())}${lastSynced?` · ${e(lastSynced)}`:''}</p>${phase.phase==='error'?'<p class="cloud-warning">Dữ liệu đang giữ trên máy. Hãy thử đồng bộ lại khi có mạng.</p>':''}<div class="cloud-actions">${button('sync','Đồng bộ ngay')}${button('backup','Tạo bản sao')}${button('backups','Các bản sao')}${button('migrate-local','Đưa tiến độ cũ lên tài khoản')}${button('logout','Đăng xuất')}</div><p class="school-note">Dùng cùng tài khoản trên các thiết bị. Khi mất mạng, thay đổi được giữ để gửi lại.</p>`;
    }
    return `<p>Đăng nhập cùng một tài khoản trên máy tính, iPad và điện thoại.</p>${authForm(mode)}<div class="cloud-actions">${button('login','Đăng nhập')}${button('signup','Tạo tài khoản')}${button('reset','Quên mật khẩu')}</div>`;
  }
  function authForm(kind) {
    return `<form id="cloud-auth-form" data-mode="${e(kind)}">${kind==='recover'?'':`<label class="field">Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label>`}${kind==='reset'?'':`<label class="field">Mật khẩu<input name="password" type="password" autocomplete="${kind==='login'?'current-password':'new-password'}" minlength="8" maxlength="128" required></label>`}<button class="btn primary" type="submit">${({login:'Đăng nhập',signup:'Tạo tài khoản',reset:'Gửi email khôi phục',recover:'Lưu mật khẩu mới'})[kind]||'Đăng nhập'}</button></form>`;
  }
  function openAccount(nextMode='account') {
    mode=nextMode==='account'?'login':nextMode;
    const d=ensureDialog();
    d.innerHTML=`<div class="dialog-head"><h2 id="cloud-dialog-title">Tài khoản & đồng bộ</h2>${button('close','Đóng')}</div><div class="dialog-body">${accountBody()}<p id="cloud-auth-message" class="cloud-warning" role="status">${e(authMessage)}</p></div>`;
    if(!d.open)d.showModal();controls();
  }
  function showError(error){authMessage=error?.message||'Chưa thực hiện được. Vui lòng thử lại.';const target=dialog?.querySelector('#cloud-auth-message');if(target)target.textContent=authMessage;notify(authMessage);}
  async function connect(session) {
    if(!session?.user&&!user&&!engine){mount();return;}
    if(session?.user?.id===user?.id&&engine)return;
    const token=++generation;clearTimeout(saveTimer);engine?.stop();engine=null;ready=false;
    if(!session?.user){user=null;transport=null;phase={phase:'local',pending:0};applyState(readState(legacyKey)||createAppState());mount();return;}
    preserveDevice('before-account-change');
    user=session.user;phase={phase:'loading',pending:0};transport=client.transportFor(user.id);mount();
    const initial=readState(storageKey())||createAppState();
    applyState(initial);
    const activeEngine=createSyncEngine({transport,initialState:initial,cache,accountId:`${accountScope()}:${user.id}`,
      onRemoteState:state=>{if(token===generation)applyState(state);},
      onStatus:status=>{if(token!==generation)return;phase=status;if(status.phase==='synced')lastSynced=new Date().toLocaleTimeString('vi-VN');mount();}
    });
    engine=activeEngine;
    const result=await activeEngine.start();
    if(token!==generation)return;
    ready=true;
    if(mode==='recover'){if(!dialog?.open)openAccount('recover');}
    else if(result==='empty'||result==='conflict')openAccount();
    else if(dialog?.open&&mode!=='recover')dialog.close();
    mount();
  }
  async function syncNow(){if(engine&&ready&&phase.phase!=='empty'&&phase.phase!=='conflict')await engine.syncNow();}
  const assertAccount=token=>{if(token!==generation)throw new Error('Tài khoản đã thay đổi. Hãy mở lại thao tác.');};
  async function cloudBackup(state=getState()) {if(!transport)throw new Error('Bạn cần đăng nhập.');const token=generation,selected=transport;const record=await selected.backup(copy(state));assertAccount(token);if(!record?.id)throw new Error('Chưa tạo được bản sao.');return record;}
  async function replaceProgress(next) {
    if(!engine||!ready)throw new Error('Đồng bộ chưa sẵn sàng.');
    const token=generation,selected=engine;
    preserveDevice('before-progress-replacement');
    await cloudBackup();
    assertAccount(token);
    applyState(normalizeAppState(next));
    await selected.localChanged(getState());assertAccount(token);
    const result=await selected.syncNow();assertAccount(token);
    if(result!=='ready')throw new Error('Bản thay đổi đã giữ trên máy; cần kiểm tra lại đồng bộ.');
  }
  async function handle(action,element) {
    if(action==='close'){dialog?.close();return;}
    if(['account','login','signup','reset'].includes(action)){authMessage='';openAccount(action);return;}
    if(busy)return;
    busy=true;controls();authMessage='';
    const token=generation,selectedTransport=transport,selectedEngine=engine;
    try {
      if(action==='sync'){await syncNow();openAccount();}
      if(action==='seed-local'||action==='seed-new'){
        const candidate=action==='seed-local'?(readState(legacyKey)||createAppState()):createAppState();
        preserveDevice('before-first-upload');await cloudBackup(candidate);
        assertAccount(token);const result=await selectedEngine.initializeRemote(candidate);assertAccount(token);
        if(result!=='ready')throw new Error('Chưa đưa được tiến độ lên tài khoản. Hãy thử lại.');
        dialog.close();notify('Đã lưu tiến độ vào tài khoản.');
      }
      if(action==='keep-local'||action==='keep-cloud'){
        preserveDevice('before-conflict-resolution');await cloudBackup();
        const remoteState=recordsToState(await selectedTransport.readAll());assertAccount(token);
        await cloudBackup(remoteState);
        const result=await selectedEngine.resolveConflict(action==='keep-local'?'local':'remote');assertAccount(token);
        if(result!=='ready')throw new Error('Chưa giải quyết xong thay đổi. Hãy thử lại.');
        dialog.close();notify('Đã xử lý các mục thay đổi.');
      }
      if(action==='backup'){await cloudBackup();notify('Đã tạo bản sao trên tài khoản.');openAccount();}
      if(action==='backups'){const rows=await selectedTransport.listBackups();assertAccount(token);backups=rows;openAccount('backups');}
      if(action==='restore-backup'){
        if(!confirm('Khôi phục bản này? Tiến độ hiện tại sẽ được sao lưu trước.'))return;
        const row=await selectedTransport.getBackup(element.dataset.backupId);assertAccount(token);
        await replaceProgress(normalizeAppState(row.state));dialog.close();notify('Đã khôi phục tiến độ.');
      }
      if(action==='migrate-local'){
        if(!confirm('Dùng tiến độ cũ trên trình duyệt này để thay tiến độ tài khoản? Bản tài khoản hiện tại sẽ được sao lưu.'))return;
        const old=readState(legacyKey);if(!old)throw new Error('Trình duyệt này chưa có tiến độ cũ. Bạn có thể nhập file sao lưu trong Cài đặt.');
        await replaceProgress(old);dialog.close();notify('Đã đưa tiến độ cũ lên tài khoản.');
      }
      if(action==='logout'){
        if(phase.pending){await syncNow();assertAccount(token);if(selectedEngine.status().pending&&!confirm('Một số thay đổi chưa gửi được. Giữ chúng trên thiết bị này và đăng xuất? Lần đăng nhập lại cùng tài khoản sẽ thử gửi tiếp.'))return;}
        assertAccount(token);await client.signOut();if(generation===token)await connect(null);dialog.close();notify('Đã đăng xuất.');
      }
    } catch(error){showError(error);} finally {busy=false;controls();}
  }
  document.addEventListener('click',event=>{const control=event.target.closest('[data-cloud-action]');if(control)void handle(control.dataset.cloudAction,control);});
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='cloud-auth-form')return;event.preventDefault();if(busy)return;
    const form=event.target,data=new FormData(form),kind=form.dataset.mode;busy=true;controls();authMessage='';
    try {
      const email=String(data.get('email')||'').trim(),password=String(data.get('password')||'');
      if(kind==='login'){const result=await client.signIn(email,password);await connect(result.session);}
      if(kind==='signup'){const result=await client.signUp(email,password);if(result.session)await connect(result.session);else{authMessage='Kiểm tra email để xác nhận tài khoản. Mở liên kết trong cùng trình duyệt đã đăng ký.';openAccount('login');}}
      if(kind==='reset'){await client.sendPasswordReset(email);authMessage='Nếu email đã có tài khoản, bạn sẽ nhận hướng dẫn đặt lại mật khẩu.';openAccount('login');}
      if(kind==='recover'){await client.updatePassword(password);authMessage='Đã đổi mật khẩu.';mode='login';openAccount();}
    } catch(error){showError(error);} finally{busy=false;controls();}
  });
  const interval=setInterval(()=>{if(!document.hidden)void syncNow();},20000);
  window.addEventListener('online',()=>void syncNow());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void syncNow();});
  return {
    renderBar,mount,storageKey,
    localChanged(state){if(!engine||!ready||applying||phase.phase==='empty'||phase.phase==='loading')return;void engine.localChanged(copy(state));clearTimeout(saveTimer);saveTimer=setTimeout(()=>void syncNow(),800);},
    async beforeImport(){preserveDevice('before-file-import');if(user)await cloudBackup();},
    async start(){
      if(!client.configured){mount();return;}
      client.onAuthStateChange((event,session)=>{setTimeout(()=>{void connect(session).catch(showError);if(event==='PASSWORD_RECOVERY'){mode='recover';openAccount('recover');}},0);});
      try {await connect(await client.getSession());}catch(error){phase={phase:'error',pending:0};mount();notify('Chưa kết nối được tài khoản. Tiến độ trên máy vẫn được giữ.');}
    },
    stop(){++generation;engine?.stop();clearInterval(interval);clearTimeout(saveTimer);}
  };
}
