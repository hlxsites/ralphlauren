export default function decorate(block) {
  const children = [...block.children];
  const {
    backgroundimage,
    image,
    link,
    title,
    pretitle,
    description,
  } = children.reduce((target, child) => {
    const name = child.firstElementChild.innerText.toLowerCase().replace(' ', '');
    const value = child.firstElementChild.nextElementSibling;
    target[name] = value;
    child.remove();
    return target;
  }, {});

  if (backgroundimage) {
    const picture = backgroundimage.querySelector('picture');
    const div = document.createElement('div');
    div.classList.add('teaser-background');
    div.appendChild(picture);
    block.insertAdjacentElement('afterbegin', div);
  }

  const div = document.createElement('div');
  div.classList.add('teaser-content');

  if (image) {
    image.classList.add('image');
    div.appendChild(image);
  }
  if (pretitle) {
    pretitle.classList.add('pretitle');
    div.appendChild(pretitle);
  }
  if (title) {
    title.classList.add('title');
    div.appendChild(title);
  }
  if (description) {
    description.classList.add('description');
    div.appendChild(description);
  }
  if (link) {
    link.classList.add(link.children.length === 1 ? 'link' : 'linklist');
    div.appendChild(link);
  }

  block.insertAdjacentElement('beforeend', div);
}
