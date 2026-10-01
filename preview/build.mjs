// Собирает превью-страницу из кода для Тильды.
// Фото с static.tildacdn.pro в превью недоступны, поэтому подменяются подписанными заглушками.
// Запуск: node preview/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '../tilda/temires-autumn.html'), 'utf8');

const placeholders = {
  'WhatsApp_Image_2026-.jpeg': 'Фото печи «Веста Плюс»',
  '14369636.jpg': 'Фото металлоконструкций',
  'photo.png': 'Фото модульного здания',
};

function placeholder(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9cfc1"/><stop offset="1" stop-color="#b9ab98"/></linearGradient>
<pattern id="h" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="18" height="18" fill="none"/><line x1="0" y1="0" x2="0" y2="18" stroke="#a89880" stroke-width="1" opacity=".35"/></pattern>
</defs>
<rect width="800" height="1000" fill="url(#g)"/><rect width="800" height="1000" fill="url(#h)"/>
<g font-family="JetBrains Mono, monospace" text-anchor="middle" fill="#4a3f35">
<text x="400" y="490" font-size="30">${label}</text>
<text x="400" y="535" font-size="20" opacity=".7">на сайте будет ваше фото с Тильды</text>
</g></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

let body = source.replace(/https:\/\/static\.tildacdn\.pro\/[^"]+\/([^"/]+)"/g, (match, file) => {
  const label = placeholders[file];
  if (!label) throw new Error('Нет заглушки для ' + file);
  return placeholder(label) + '"';
});

const shim = `
<style>
  :root { color-scheme: light; }
  html, body { margin: 0; background: #ffffff; }
  .tes-preview-badge {
    position: fixed; right: 12px; top: 72px; z-index: 200;
    font: 500 12px/1.3 'JetBrains Mono', ui-monospace, monospace; letter-spacing: .04em;
    background: #1e1813; color: #fcfaf6; padding: 9px 12px; border-radius: 2px;
    box-shadow: 0 8px 24px rgba(30, 24, 19, .25); max-width: calc(100vw - 32px);
  }
  .tes-preview-badge b { color: #f5a800; font-weight: 600; }
</style>
<script>
  /* Только для превью: имитация отправки формы, которую на сайте делает Тильда */
  window.t_forms__initBtnClick = function (e) {
    var form = e.target.closest('form');
    var ok = true;
    form.querySelectorAll('[data-tilda-req="1"]').forEach(function (input) {
      var err = input.parentNode.querySelector('.t-input-error');
      var empty = !input.value.trim();
      if (err) err.textContent = empty ? 'Обязательное поле' : '';
      if (empty) ok = false;
    });
    if (!ok) return;
    var box = form.querySelector('.js-successbox');
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
</script>`;

const page = `<title>Темирэнергострой Осень</title>
<meta name="description" content="Превью осенней версии сайта ТОО «Темирэнергострой»">
${body}
<div class="tes-preview-badge"><b>Превью</b> · фото — заглушки</div>
${shim}
`;

writeFileSync(join(here, 'index.html'), page);
console.log('preview/index.html готов,', Math.round(page.length / 1024), 'КБ');
