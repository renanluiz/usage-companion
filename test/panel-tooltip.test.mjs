// Run with: node --test
// Loads the real panel/app.js against a tiny stubbed DOM (no dependencies) and checks
// that data-tip tooltips are shown as plain text, while the pace tooltip keeps its markup.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'

class FakeElement {
  constructor(id = '') {
    this.id = id
    this.dataset = {}
    this.style = {}
    this.listeners = {}
    this.htmlWrites = []
    this.textWrites = []
    this.attrs = {}
    // Like the DOM, either assignment replaces everything that was there before.
    this.content = { html: false, value: '' }
  }
  set innerHTML(value) {
    this.htmlWrites.push(String(value))
    this.content = { html: true, value: String(value) }
  }
  get innerHTML() {
    const { html, value } = this.content
    return html ? value : value.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch])
  }
  set textContent(value) {
    this.textWrites.push(String(value))
    this.content = { html: false, value: String(value) }
  }
  get textContent() {
    const { html, value } = this.content
    return html ? value.replace(/<[^>]*>/g, '') : value
  }
  addEventListener(type, fn) {
    ;(this.listeners[type] ??= []).push(fn)
  }
  fire(type, event) {
    for (const fn of this.listeners[type] ?? []) {
      fn(event)
    }
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 300, height: 120 }
  }
  getAttribute(name) {
    return this.attrs[name] ?? null
  }
  setAttribute(name, value) {
    this.attrs[name] = String(value)
  }
  matches() {
    return false
  }
  closest() {
    return null
  }
  querySelector() {
    return null
  }
  append() {}
  load() {}
  show() {}
}

const MINUTE = 60_000
const now = Date.now()
const payload = '<img src=x onerror="globalThis.pwned = true">'
const data = {
  usage: {
    ok: true,
    fiveHour: { percent: 40, resetsAt: new Date(now + 120 * MINUTE).toISOString() },
    sevenDay: { percent: 60, resetsAt: new Date(now + 3 * 24 * 60 * MINUTE).toISOString() },
    limitedBy: null,
    checkedAt: new Date(now).toISOString()
  },
  history: [],
  skills: [{ name: payload, count: 2, lastUsed: now }],
  tokensByDay: [],
  generatedAt: now
}

const app = new FakeElement('app')
const tip = new FakeElement('tip')
const elements = { app, tip, reveal: new FakeElement('reveal') }
const created = []
const windowListeners = {}

globalThis.Element = FakeElement
globalThis.ResizeObserver = class {
  observe() {}
}
globalThis.requestAnimationFrame = () => 0
globalThis.cancelAnimationFrame = () => {}
globalThis.document = {
  getElementById: (id) => elements[id] ?? null,
  querySelectorAll: () => [],
  createElement: () => {
    const el = new FakeElement()
    created.push(el)
    return el
  }
}
globalThis.window = {
  orca: { locale: 'en', plugin: { request: async (method) => (method === 'dashboard.read' ? data : { ok: true }) } },
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: (type, fn) => {
    ;(windowListeners[type] ??= []).push(fn)
  }
}

await import('../panel/app.js')
await new Promise((resolve) => setImmediate(resolve))

after(() => {
  for (const fn of windowListeners.pagehide ?? []) {
    fn()
  }
})

// What the HTML parser hands back as el.dataset.tip for an attribute written with esc().
const decodeAttr = (value) =>
  value.replace(/&(amp|lt|gt|quot|#39);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[name])

function skillTipFor(name) {
  for (const el of created) {
    for (const html of el.htmlWrites) {
      for (const match of html.matchAll(/<li data-tip="([^"]*)">/g)) {
        const text = decodeAttr(match[1])
        if (text.startsWith(`${name}:`)) {
          return text
        }
      }
    }
  }
  return null
}

function hoverSkill(tipText) {
  const li = new FakeElement()
  li.dataset.tip = tipText
  li.closest = (selector) => (selector === '[data-tip]' ? li : null)
  app.fire('pointermove', { target: li, clientX: 10, clientY: 10 })
}

function hoverPace() {
  const hit = new FakeElement()
  hit.attrs = { x: '36', width: '300' }
  hit.matches = (selector) => selector === 'rect[data-pace]'
  app.fire('pointermove', { target: hit, clientX: 150, clientY: 40 })
}

test('a skill name with markup is shown as plain text in the tooltip', () => {
  const tipText = skillTipFor(payload)
  assert.ok(tipText, 'the panel should render a data-tip for the skill')

  const htmlWritesBefore = tip.htmlWrites.length
  hoverSkill(tipText)

  assert.equal(tip.htmlWrites.length, htmlWritesBefore, 'data-tip text must not be written as HTML')
  assert.equal(tip.textContent, tipText)
  assert.equal(tip.style.opacity, '1')
})

test('the pace tooltip still renders its markup', () => {
  hoverPace()

  assert.match(tip.innerHTML, /^<strong>.+<\/strong><br>/)
})

test('moving from the pace tooltip to a skill tooltip leaves only plain text', () => {
  const tipText = skillTipFor(payload)
  hoverPace()
  assert.equal(tip.content.html, true)

  hoverSkill(tipText)

  assert.equal(tip.content.html, false, 'the earlier pace markup must be replaced')
  assert.equal(tip.textContent, tipText)
  assert.doesNotMatch(tip.innerHTML, /<[a-z]/i)
})
