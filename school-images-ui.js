import { imagesForLesson, findLessonImage, safeImagePath, safeImageSource } from './school-images.js';

const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceLink = (url, label) => safeImageSource(url) ? `<a class="resource-link" href="${e(safeImageSource(url))}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>` : e(label);
const credits = image => `<span>${sourceLink(image.sourceUrl, image.sourceTitle)} · ${e(image.author)} · ${sourceLink(image.licenseUrl, image.license)}. Ảnh đã thu nhỏ/chuyển sang WebP; ảnh trong suốt được đặt trên nền trắng.</span>`;
const readingSteps = image => `<ol class="image-reading-steps">${image.explanation.map(step => `<li>${e(step)}</li>`).join('')}</ol>`;
const unavailable = '<p class="learning-image-unavailable" role="status">Chưa hiển thị được ảnh. Bạn có thể mở nguồn ảnh bên dưới.</p>';

export function renderLearningGallery(lessonId) {
  const images = imagesForLesson(lessonId).filter(image => safeImagePath(image.src));
  if (!images.length) return '';
  return `<div class="learning-gallery" aria-label="Hình minh họa bài học">${images.map(image => `<figure class="learning-image-card"><div class="learning-image-frame"><button type="button" class="learning-image-button" data-action="lesson-image-open" data-image-lesson="${e(lessonId)}" data-image-id="${e(image.id)}" aria-label="Phóng to: ${e(image.title)}"><img data-learning-image src="${e(safeImagePath(image.src))}" width="${image.width}" height="${image.height}" alt="${e(image.alt)}" loading="lazy" decoding="async"><span class="image-zoom-hint" aria-hidden="true">⤢ Phóng to</span></button>${unavailable}</div><figcaption><h4>${e(image.title)}</h4><p>${e(image.caption)}</p><div class="image-reading"><strong>Nhìn hình như thế nào?</strong>${readingSteps(image)}</div><details class="image-credits"><summary>Nguồn & giấy phép</summary><p>${credits(image)}</p></details></figcaption></figure>`).join('')}</div>`;
}

export function createLessonImageViewer() {
  let dialog, opener;
  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'learning-image-dialog';
    dialog.setAttribute('aria-labelledby', 'learning-image-title');
    document.body.append(dialog);
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll:true}); });
    return dialog;
  }
  document.addEventListener('error', event => {
    const image = event.target;
    if (image?.matches?.('img[data-learning-image]')) image.closest('.learning-image-frame, .learning-image-stage')?.classList.add('has-image-error');
  }, true);
  return {
    handleAction(button) {
      const action = button.dataset.action;
      if (action === 'lesson-image-close') { dialog?.close(); return true; }
      if (action === 'lesson-image-size') {
        const stage = dialog?.querySelector('.learning-image-stage');
        if (stage) {
          const zoomed = stage.classList.toggle('is-zoomed');
          button.textContent = zoomed ? 'Vừa màn hình' : 'Kích thước gốc';
          button.setAttribute('aria-pressed', String(zoomed));
          stage.scrollTop = stage.scrollLeft = 0;
        }
        return true;
      }
      if (action !== 'lesson-image-open') return false;
      const image = findLessonImage(button.dataset.imageLesson, button.dataset.imageId);
      if (!image || !safeImagePath(image.src)) return true;
      opener = button;
      const d = ensureDialog();
      d.innerHTML = `<div class="learning-image-viewer"><header class="image-viewer-head"><h2 id="learning-image-title">${e(image.title)}</h2><button class="icon-btn" type="button" data-action="lesson-image-close" aria-label="Đóng hình minh họa" autofocus>×</button></header><div class="learning-image-stage" tabindex="0" aria-label="Hình minh họa, có thể cuộn khi xem kích thước gốc"><img data-learning-image src="${e(image.src)}" width="${image.width}" height="${image.height}" alt="${e(image.alt)}">${unavailable}</div><div class="image-viewer-controls"><button class="btn secondary small" type="button" data-action="lesson-image-size" aria-pressed="false">Kích thước gốc</button><span class="school-note">${e(image.caption)}</span></div><div class="image-reading">${readingSteps(image)}</div><p class="viewer-image-credits">${credits(image)}</p></div>`;
      if (!d.open) d.showModal();
      return true;
    }
  };
}
