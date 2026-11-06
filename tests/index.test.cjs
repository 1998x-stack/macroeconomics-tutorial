const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function runIndex(fetchResult) {
  const cards = [];
  const container = { innerHTML: '', appendChild(node) { cards.push(node); } };
  const elements = {
    '#cardContainer': container,
    '.header .emoji': {},
    '.header .title-text': {},
    '.header .sub': {},
    '.footer': {},
  };
  const document = {
    title: '',
    getElementById(id) { return id === 'cardContainer' ? container : null; },
    querySelector(selector) { return elements[selector]; },
    createElement(tag) {
      return { tag, children: [], appendChild(node) { this.children.push(node); } };
    },
  };
  const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, 'inline course script must exist');
  vm.runInNewContext(script[1], { document, fetch: () => fetchResult });
  return { cards, elements, document };
}

test('file:// fetch rejection leaves all 28 local lessons accessible', async () => {
  const result = runIndex(Promise.reject(new TypeError('Failed to fetch')));
  await new Promise(setImmediate);
  assert.equal(result.cards.length, 28);
  for (let i = 1; i <= 28; i++) {
    const link = result.cards[i - 1].children[0];
    assert.equal(link.href, String(i).padStart(2, '0') + '.html');
  }
  assert.match(result.elements['.header .sub'].textContent, /离线课程目录/);
});

test('successful JSON load keeps course titles and links', async () => {
  const result = runIndex(Promise.resolve({ ok: true, json: () => Promise.resolve({
    title: '宏观经济学', emoji: '📊', subtitle: '课程', chapterCount: 1,
    chapters: [{ num: '01', title: '第一章', file: '01.html', topics: ['GDP'] }],
  }) }));
  await new Promise(setImmediate);
  assert.equal(result.cards.length, 1);
  assert.equal(result.cards[0].children[0].children[1].textContent, '第一章');
  assert.equal(result.cards[0].children[2].children[0].href, '01.html');
});
