import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateBlock,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  createOptimizedPicture,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  let title = main.querySelector('h1');
  let picture = main.querySelector('.art-direction');
  if (picture) decorateBlock(picture); else picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (title && picture
    && (title.compareDocumentPosition(picture) === Node.DOCUMENT_POSITION_PRECEDING)) {
    const subTitle = title.nextElementSibling;
    const oldSection = title.parentElement;
    if (subTitle && subTitle.nodeName === 'P') {
      const titleGroup = document.createElement('div');
      titleGroup.className = 'title-group';
      titleGroup.append(title, subTitle);
      title = titleGroup;
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, title] }));
    main.prepend(section);
    oldSection.remove();
  }
}

function buildImage(src, alt, cls, width, height, cb, inline = false) {
  const img = document.createElement('img');
  img.className = cls;
  img.alt = alt;
  img.src = src;
  img.width = width;
  img.height = height;
  cb(img);
  // if it is an svg replace the image with the svg itself so we can style it
  if (src.endsWith('.svg') && inline) {
    fetch(src)
      .then((resp) => resp.text())
      .then((text) => {
        const fragment = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = fragment.querySelector('svg');
        if (svg) {
          cls.split(' ').forEach((c) => svg.classList.add(c));
          img.replaceWith(svg);
        }
      });
  }
}

function buildImageSignatures(main) {
  main.querySelectorAll('em').forEach((em) => {
    const alt = em.innerText.trim();
    const lower = alt.toLowerCase();
    let src;
    let width;
    let height;
    let inline = false;
    if (lower === 'rl at home') {
      src = '/icons/rl-at-home.svg';
      width = 482;
      height = 152;
      inline = true;
    } else if (lower === 'rl signature') {
      src = '/icons/rl-signature.webp';
      width = 370;
      height = 80;
    }
    if (src) {
      buildImage(src, alt, `image-signature ${lower.replaceAll(' ', '-')}`, width, height, (img) => em.replaceWith(img), inline);
    }
  });
}

function buildImageLinks(main) {
  main.querySelectorAll('a[href]').forEach((link) => {
    const { href } = link;
    let src;
    let width;
    let height;
    let cls;
    if (href && href.indexOf('https://itunes.apple.com/') === 0) {
      src = '/icons/Apple-App-Store-Badge.svg';
      width = 300;
      height = 100;
      cls = 'app-store apple-app-store';
    } else if (href && href.indexOf('https://play.google.com/') === 0) {
      src = '/icons/Google-Play-App-Store-badge.svg';
      width = 300;
      height = 89;
      cls = 'app-store google-play';
    }
    if (src) {
      buildImage(src, link.innerText, cls, width, height, (img) => link.replaceChildren(img));
    }
  });
}

function buildSectionBackgrounds(main) {
  main.querySelectorAll(':scope > [data-background-image]').forEach((section) => {
    if (section.dataset.backgroundImage) {
      const backgrounds = section.dataset.backgroundImage.split(',');
      const div = document.createElement('div');
      div.className = 'section-background';
      backgrounds.forEach((background) => {
        const { pathname } = new URL(background);
        const picture = createOptimizedPicture(pathname, '', false);
        div.appendChild(picture);
      });
      section.insertAdjacentElement('afterbegin', div);
    }
  });
  main.querySelectorAll(':scope > [data-background-color]').forEach((section) => {
    if (section.dataset.backgroundColor) {
      const backgroundColor = section.dataset.backgroundColor.match(/#[A-Fa-f0-9]{6}/);
      if (backgroundColor) {
        [section.style.backgroundColor] = backgroundColor;
      }
    }
  });
}

export async function lookupPages(pathnames) {
  if (!window.pageIndex) {
    const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
    const json = await resp.json();
    const lookup = {};
    json.data.forEach((row) => {
      lookup[row.path] = row;
      if (row.image || row.image.startsWith('/default-meta-image.png')) row.image = `/${window.hlx.codeBasePath}${row.image}`;
    });
    window.pageIndex = { data: json.data, lookup };
  }
  const result = pathnames.map((path) => window.pageIndex.lookup[path]).filter((e) => e);
  return (result);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildImageSignatures(main);
    buildImageLinks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  buildSectionBackgrounds(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.ico`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
