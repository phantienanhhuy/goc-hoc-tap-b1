export function createClockState(minutes = 25) {
  return { duration: minutes * 60, remaining: minutes * 60, end: null, notified: false };
}
export function remainingSeconds(clock, now = Date.now()) {
  return clock.end === null ? clock.remaining : Math.max(0, Math.ceil((clock.end - now) / 1000));
}
export function elapsedPercent(clock, now = Date.now()) {
  return clock.duration ? Math.max(0, Math.min(100, (clock.duration - remainingSeconds(clock, now)) / clock.duration * 100)) : 0;
}
export function startClock(clock, now = Date.now()) {
  if (clock.end === null && clock.remaining > 0) clock.end = now + clock.remaining * 1000;
  return clock;
}
export function pauseClock(clock, now = Date.now()) {
  clock.remaining = remainingSeconds(clock, now);
  clock.end = null;
  return clock;
}
export function resetClock(clock) {
  clock.remaining = clock.duration; clock.end = null; clock.notified = false;
  return clock;
}
export function setClockMinutes(clock, minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return clock;
  clock.duration = minutes * 60;
  return resetClock(clock);
}

export function createFocusTimer({ notify = () => {} } = {}) {
  const clock = createClockState();
  let interval = null;
  let dialog = null;
  const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const readout = () => `<div class="focus-readout" data-focus-time>${format(remainingSeconds(clock))}</div><div class="focus-progress" role="progressbar" aria-label="Tiến độ tập trung" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(elapsedPercent(clock))}"><span class="focus-progress-fill" style="width:${elapsedPercent(clock)}%"></span></div>`;
  const compactControls = () => `<div class="timer-controls"><button class="btn primary" data-action="timer-toggle">${clock.end === null ? 'Bắt đầu' : 'Tạm dừng'}</button><button class="icon-btn" data-action="timer-reset" aria-label="Đặt lại đồng hồ">↺</button><button class="icon-btn" data-action="timer-expand" aria-label="Mở rộng đồng hồ">⛶</button></div><div class="timer-controls focus-presets">${[5,25,60].map(n => `<button class="chip" data-action="timer-set" data-minutes="${n}">${n} phút</button>`).join('')}</div>`;
  const renderCompact = () => `<div class="focus-compact" aria-label="Thời gian tập trung"><div class="eyebrow">CHỈ CẦN BẮT ĐẦU</div>${readout()}${compactControls()}</div>`;
  function update() {
    const seconds = remainingSeconds(clock);
    if (clock.end !== null && seconds === 0) {
      clock.remaining = 0; clock.end = null;
      if (!clock.notified) { clock.notified = true; notify('Đã hết thời gian tập trung.'); }
    }
    document.querySelectorAll('.focus-compact, #focus-dialog').forEach(root => {
      const display = root.querySelector('[data-focus-time]');
      if (display) display.textContent = format(seconds);
      const bar = root.querySelector('.focus-progress');
      const percent = elapsedPercent(clock);
      if (bar) { bar.setAttribute('aria-valuenow', String(Math.round(percent))); bar.querySelector('.focus-progress-fill').style.width = `${percent}%`; }
      const toggleButton = root.querySelector('[data-action="timer-toggle"], [data-focus-action="toggle"]');
      if (toggleButton) toggleButton.textContent = clock.end === null ? 'Bắt đầu' : 'Tạm dừng';
    });
  }
  function mount() { update(); if (!interval) interval = setInterval(update, 250); }
  function toggle() { if (clock.end === null) startClock(clock); else pauseClock(clock); update(); }
  function reset() { resetClock(clock); update(); }
  function setMinutes(minutes) { setClockMinutes(clock, Number(minutes)); update(); }
  function openExpanded() {
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.id = 'focus-dialog'; dialog.className = 'focus-dialog';
      dialog.innerHTML = `<div class="focus-dialog-inner"><div class="focus-dialog-head"><span class="eyebrow">THỜI GIAN TẬP TRUNG</span><div><button class="icon-btn" data-focus-action="fullscreen" aria-label="Toàn màn hình">⛶</button><button class="icon-btn" data-focus-action="close" aria-label="Đóng đồng hồ">×</button></div></div><div class="focus-clock">${readout()}</div><div class="focus-dialog-controls"><div class="timer-controls">${[5,25,60].map(n => `<button class="chip" data-focus-action="set" data-minutes="${n}">${n} phút</button>`).join('')}</div><div class="timer-controls"><button class="btn primary" data-focus-action="toggle">Bắt đầu</button><button class="btn secondary" data-focus-action="reset">Đặt lại</button></div></div></div>`;
      document.body.append(dialog);
      dialog.addEventListener('click', async event => {
        const button = event.target.closest('[data-focus-action]'); if (!button) return;
        const action = button.dataset.focusAction;
        if (action === 'toggle') toggle(); else if (action === 'reset') reset(); else if (action === 'set') setMinutes(button.dataset.minutes);
        else if (action === 'close') { if (document.fullscreenElement) await document.exitFullscreen().catch(() => {}); dialog.close(); }
        else if (action === 'fullscreen') { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (dialog.requestFullscreen) await dialog.requestFullscreen(); } catch { /* Dialog remains usable when fullscreen is unavailable. */ } }
      });
    }
    if (!dialog.open) dialog.showModal();
    mount(); update();
  }
  function destroy() { if (interval) clearInterval(interval); interval = null; if (dialog) { dialog.close(); dialog.remove(); dialog = null; } }
  return { renderCompact, mount, toggle, reset, setMinutes, openExpanded, destroy };
}
