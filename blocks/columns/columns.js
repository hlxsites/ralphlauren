export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const section = block.parentElement.parentElement;
  let sectionEl = section.firstElementChild;

  if (sectionEl.matches('.section-background')) {
    sectionEl = sectionEl.nextElementSibling;
  }
  if (sectionEl.matches('.default-content-wrapper')) {
    sectionEl = sectionEl.nextElementSibling;
  }
  for (let index = 1; sectionEl; index += 1) {
    sectionEl.classList.add(`columns-wrapper-${index}`);
    sectionEl = sectionEl.nextElementSibling;
  }

  cols.forEach((col, index) => {
    col.classList.add(`column-${index + 1}`);
    const hasText = !!col.querySelector('p,h1,h2,h3,h4');
    const hasImage = !!col.querySelector('picture');
    if (hasText && hasImage) {
      col.classList.add('column-mixed');
    } else if (hasText) {
      col.classList.add('column-text-only');
    } else if (hasImage) {
      col.classList.add('column-image-only');
    }
  });
}
