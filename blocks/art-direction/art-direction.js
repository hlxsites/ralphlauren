import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const [desktop, mobile] = block.firstElementChild.querySelectorAll('img');
  const imgs = document.querySelectorAll('img');

  if (!mobile) {
    block.replaceWith(desktop);
    return;
  }

  const isFirst = imgs[0] === desktop;
  const desktopPicture = createOptimizedPicture(desktop.src, desktop.alt, isFirst, [
    { media: '(min-width: 768px)', width: 2000 },
    { width: 767 },
  ]);
  const mobilePicture = createOptimizedPicture(mobile.src, mobile.alt, isFirst, [
    { media: '(max-width: 767px)', width: 767 },
    { width: 767 },
  ]);
  const img = mobilePicture.querySelector('img');
  desktopPicture.querySelectorAll('source[media]').forEach((source) => img.insertAdjacentElement('beforebegin', source));
  mobilePicture.querySelectorAll('source:not([media])').forEach((source) => img.insertAdjacentElement('beforebegin', source));
  block.replaceWith(mobilePicture);
}
