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

function buildImageSignatures(main) {
  main.querySelectorAll('em').forEach((em) => {
    const alt = em.innerText.trim();
    const lower = alt.toLowerCase();
    let src;
    let width;
    let height;
    if (lower === 'rl at home') {
      src = '/icons/rl-at-home.svg';
      width = 482;
      height = 152;
    } else if (lower === 'rl signature') {
      src = '/icons/rl-signature.webp';
      width = 370;
      height = 80;
    }
    if (src) {
      const img = document.createElement('img');
      img.className = `image-signature ${lower.replaceAll(' ', '-')}`;
      img.alt = alt;
      img.src = src;
      img.width = width;
      img.height = height;
      em.replaceWith(img);
      // if it is an svg replace the image with the svg itself so we can style it
      if (src.endsWith('.svg')) {
        fetch(src)
          .then((resp) => resp.text())
          .then((text) => {
            const fragment = new DOMParser().parseFromString(text, 'image/svg+xml');
            const svg = fragment.querySelector('svg');
            svg.classList.add('image-signature', lower.replaceAll(' ', '-'));
            img.replaceWith(svg);
          });
      }
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildImageSignatures(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Builds all sections with background image data elements.
 * @param {Element} main The container element
 */
function decorateSectionWithBackgroundImages(main) {
  try {
    main.querySelectorAll('div[data-background-image]').forEach((el) => {
      // there might be more than one background image. Pick up all of them
      const bgimages = el.dataset.backgroundImage.split(',');
      let backgroundImageValue = '';

      bgimages.forEach((bgimage) => {
        if (backgroundImageValue !== '') {
          // subsequent background images
          backgroundImageValue += `, url('${bgimage}')`;
        } else {
          // first background image
          backgroundImageValue += `url('${bgimage}')`;
        }
      });
      // set the background image values
      el.style.backgroundImage = backgroundImageValue;
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Decorating section with background images failed!', error);
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
  decorateBlocks(main);
  decorateSectionWithBackgroundImages(main);
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
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
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
