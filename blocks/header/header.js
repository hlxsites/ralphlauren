import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);
    block.append(nav);

    // show menu content
    nav.querySelectorAll('header nav .nav-menu>div:first-child').forEach((menuHeader) => {
      menuHeader.addEventListener('mouseenter', (e) => {
        const menuContent = e.target.parentElement.children[1];
        if (menuContent) {
          menuContent.classList.add('visible');
        }
      });
    });

    // hide menu content
    nav.querySelectorAll('header nav .nav-menu').forEach((navMenu) => {
      navMenu.addEventListener('mouseleave', (e) => {
        const menuContent = e.target.children[1];
        menuContent.classList.remove('visible');
      });
    });
  }
}
