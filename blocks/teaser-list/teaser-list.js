import { lookupPages } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function createCard(row, style) {
  const card = document.createElement('a');
  card.href = row.path;
  card.classList.add('teaser-card');
  if (style) card.classList.add(style);

  card.innerHTML = `<h3>${row.title}</h3>`;
  card.prepend(createOptimizedPicture(row.image, row.title));
  return (card);
}

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  block.textContent = '';
  const teaserList = await lookupPages(pathnames);
  if (teaserList.length) {
    teaserList.forEach((row) => {
      block.append(createCard(row, 'teaser-card'));
    });
  } else {
    block.remove();
  }
}
