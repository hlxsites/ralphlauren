import { readBlockConfig } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

function createContactForm() {
  const form = document.createElement('form');
  form.setAttribute('action', '#');
  form.setAttribute('method', 'post');
  const input = document.createElement('input');
  input.setAttribute('type', 'email');
  input.setAttribute('name', 'email');
  input.setAttribute('placeholder', 'Enter Email Address');
  form.append(input);
  const button = document.createElement('button');
  button.setAttribute('type', 'submit');
  button.setAttribute('value', 'Submit');
  button.innerText = 'Submit';
  form.append(button);
  return form;
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  const contactForm = footer.querySelector('.icon-contact-form');
  if (contactForm) {
    contactForm.parentNode.append(createContactForm());
  }
  block.append(footer);
}
