export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  
  const columnsWrapper = block.parentElement;
  const columnsWrappers = columnsWrapper.parentElement.querySelectorAll('.columns-wrapper');
  const index = [...columnsWrappers].indexOf(columnsWrapper);
  columnsWrapper.classList.add(`columns-wrapper--${index + 1}`);

  cols.forEach((col, index) => {
    col.classList.add(`column--${index + 1}`)
    const hasText = !!col.querySelector('p,h1,h2,h3,h4');
    const hasImage = !!col.querySelector('picture');
    if (hasText && hasImage) {
      col.classList.add('column--mixed');
    } else if (hasText) {
      col.classList.add('column--text-only');
    } else if (hasImage) {
      col.classList.add('column--image-only');
    }
  })

}
