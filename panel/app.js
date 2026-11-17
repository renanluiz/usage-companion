import './vendor/skullet/element.mjs'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const WEEK = 7 * DAY
const REFRESH_MS = MINUTE
const STALE_MS = 10 * MINUTE
const SKELETON_MIN_MS = 400
const SETUP_COMMAND = 'claude setup-token'
const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'

const EN = {
  title: 'Usage',
  refresh: 'Refresh',
  retry: 'Try again',
  updated: 'Updated',
  loading: 'Reading usage…',
  noData: 'No usage data',
  reasons: {
    'no-token': 'Connect your Claude account to see usage.',
    'signed-out': 'Your token expired or was rejected.',
    'rate-limited': 'Claude is limiting usage checks. Retrying in a few minutes.',
    'invalid-token': 'That token was not accepted.',
    unavailable: "Couldn't reach Claude's usage service right now."
  },
  stale: 'Usage has not updated since then.',
  limitedBy: { five_hour: 'Limited by the 5-hour session', seven_day: 'Limited by the 7-day limit' },
  kpiSession: '5-hour session',
  kpiWeekly: '7-day limit',
  remaining: '{d} remaining',
  resetPassed: 'Reset passed. Waiting for new data.',
  paceTitle: 'Weekly pace',
  paceOver: 'Burning fast. At this pace the limit runs out {when}.',
  paceOverOk: 'Ahead of pace, but the week still ends under the limit.',
  paceUnder: 'Under pace. Projected to finish at {p}%, leaving {left}% unused.',
  paceOn: 'On pace. Projected to finish at {p}%.',
  paceStart: 'The week just started.',
  legendIdeal: 'Ideal pace',
  legendReal: 'Your usage',
  legendProj: 'Projection',
  aboveIdeal: '{n} pts above pace',
  belowIdeal: '{n} pts below pace',
  noSample: 'no reading yet',
  historyNote: 'The line fills in while this panel is open.',
  tokensTitle: 'Tokens, last 7 days',
  tokensTip: '{day}: {n} tokens',
  tokensPctTip: '{day}: {pct}% of your week (~{n} tokens)',
  tokensNote: 'Each day as a share of your weekly limit (estimate).',
  tokensNeedUsage: 'Shares appear once the week has some usage.',
  skillsTitle: 'Skills, last 7 days',
  skillsEmpty: 'No skill calls in the last 7 days.',
  skillTip: '{name}: {n} uses, last {when}',
  setupTitle: 'Connect your Claude account',
  setupSteps: ['Open a terminal and run:', 'Copy the token it prints.', 'Paste it below.'],
  copy: 'Copy',
  copied: 'Copied',
  tokenPlaceholder: 'Paste your token',
  saveToken: 'Save token',
  removeToken: 'Remove token',
  invalidToken: "That doesn't look like a Claude token. It starts with sk-ant-.",
  rejected: 'Claude rejected this token. Create a new one with claude setup-token.'
}

const PT = {
  title: 'Uso',
  refresh: 'Atualizar',
  retry: 'Tentar de novo',
  updated: 'Atualizado',
  loading: 'Lendo o uso…',
  noData: 'Sem dados de uso',
  reasons: {
    'no-token': 'Conecte sua conta do Claude pra ver o uso.',
    'signed-out': 'Seu token expirou ou foi recusado.',
    'rate-limited': 'O Claude está limitando as consultas de uso. Tentando de novo em alguns minutos.',
    'invalid-token': 'Este token não foi aceito.',
    unavailable: 'Não consegui falar com o serviço de uso do Claude agora.'
  },
  stale: 'O uso não foi atualizado desde então.',
  limitedBy: { five_hour: 'Limitado pela sessão de 5 horas', seven_day: 'Limitado pelo limite semanal' },
  kpiSession: 'Sessão de 5 horas',
  kpiWeekly: 'Limite semanal',
  remaining: '{d} restantes',
  resetPassed: 'Resetou. Aguardando novos dados.',
  paceTitle: 'Ritmo semanal',
  paceOver: 'Gastando rápido. Nesse ritmo o limite acaba {when}.',
  paceOverOk: 'Acima do ritmo, mas a semana ainda termina dentro do limite.',
  paceUnder: 'Abaixo do ritmo. Projeção de terminar em {p}%, sobrando {left}% sem usar.',
  paceOn: 'No ritmo. Projeção de terminar em {p}%.',
  paceStart: 'A semana acabou de começar.',
  legendIdeal: 'Ritmo ideal',
  legendReal: 'Seu uso',
  legendProj: 'Projeção',
  aboveIdeal: '{n} pts acima do ritmo',
  belowIdeal: '{n} pts abaixo do ritmo',
  noSample: 'sem leitura ainda',
  historyNote: 'A linha se preenche enquanto este painel está aberto.',
  tokensTitle: 'Tokens, últimos 7 dias',
  tokensTip: '{day}: {n} tokens',
  tokensPctTip: '{day}: {pct}% da sua semana (~{n} tokens)',
  tokensNote: 'Cada dia como parte do seu limite semanal (estimativa).',
  tokensNeedUsage: 'As porcentagens aparecem quando a semana já tiver algum uso.',
  skillsTitle: 'Skills, últimos 7 dias',
  skillsEmpty: 'Nenhuma chamada de skill nos últimos 7 dias.',
  skillTip: '{name}: {n} usos, último {when}',
  setupTitle: 'Conecte sua conta do Claude',
  setupSteps: ['Abra um terminal e rode:', 'Copie o token que ele mostrar.', 'Cole abaixo.'],
  copy: 'Copiar',
  copied: 'Copiado',
  tokenPlaceholder: 'Cole seu token',
  saveToken: 'Salvar token',
  removeToken: 'Remover token',
  invalidToken: 'Isso não parece um token do Claude. Ele começa com sk-ant-.',
  rejected: 'O Claude recusou este token. Gere outro com claude setup-token.'
}

const locale = (window.orca && window.orca.locale) || navigator.language || 'en'
const S = locale.toLowerCase().startsWith('pt') ? PT : EN
const app = document.getElementById('app')
const tip = document.getElementById('tip')
const reveal = document.getElementById('reveal')

const fmtRel = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
const fmtClock = new Intl.DateTimeFormat(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
const fmtDay = new Intl.DateTimeFormat(locale, { weekday: 'short' })
const fmtDayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'short' })
const fmtTime = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
const fmtCompact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })
const fmtNum = new Intl.NumberFormat(locale)

const t = (text, vars = {}) => text.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : ''))
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

function relativeTo(time, now) {
  const minutes = Math.round((time - now) / MINUTE)
  if (Math.abs(minutes) >= 90) {
    return fmtRel.format(Math.round(minutes / 60), 'hour')
  }
  return fmtRel.format(minutes, 'minute')
}

function formatRemaining(ms) {
  const minutes = Math.max(0, Math.round(ms / MINUTE))
  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const mins = minutes % 60
  if (days > 0) {
    return `${days} d ${hours} h`
  }
  if (hours > 0) {
    return `${hours} h ${mins} min`
  }
  return `${mins} min`
}

function dayKeyOf(time) {
  const date = new Date(time)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function pace(window, now) {
  if (!window || !window.resetsAt) {
    return null
  }
  const end = Date.parse(window.resetsAt)
  const start = end - WEEK
  const elapsed = clamp((now - start) / WEEK, 0, 1)
  const p = window.percent
  const ideal = elapsed * 100
  const delta = p - ideal
  const projected = elapsed > 0.02 ? p / elapsed : null
  let hitAt = null
  if (p >= 100) {
    hitAt = now
  } else if (elapsed > 0 && p > 0) {
    const at = start + (100 / p) * (now - start)
    if (at < end) {
      hitAt = at
    }
  }
  const state = elapsed < 0.02 ? 'start' : delta > 5 ? 'over' : delta < -5 ? 'under' : 'on'
  return { start, end, endIso: window.resetsAt, elapsed, p, ideal, delta, projected, hitAt, state }
}

function paceSentence(info, now) {
  if (info.state === 'start') {
    return S.paceStart
  }
  if (info.state === 'over') {
    return info.hitAt ? t(S.paceOver, { when: relativeTo(info.hitAt, now) }) : S.paceOverOk
  }
  if (info.state === 'under') {
    const proj = Math.round(info.projected)
    return t(S.paceUnder, { p: proj, left: Math.max(0, 100 - proj) })
  }
  return t(S.paceOn, { p: Math.round(info.projected ?? info.p) })
}

function cycleSamples(info, history, now) {
  const samples = history.filter((s) => s.r === info.endIso && s.t >= info.start && s.t <= now)
  samples.push({ t: now, p: info.p, r: info.endIso })
  samples.sort((a, b) => a.t - b.t)
  const lastOfDay = new Map()
  for (const sample of samples) {
    lastOfDay.set(dayKeyOf(sample.t), sample)
  }
  return [...lastOfDay.values()]
}

function paceTip(info, point) {
  const day = fmtDayLong.format(point.t)
  const ideal = ((point.t - info.start) / WEEK) * 100
  const diff = point.p - ideal
  const gap = Math.round(Math.abs(diff))
  const note = gap === 0 ? '' : ` · ${esc(t(diff > 0 ? S.aboveIdeal : S.belowIdeal, { n: gap }))}`
  return [
    `<strong>${esc(day)}</strong>`,
    `${esc(S.legendReal)}: ${Math.round(point.p)}%${note}`,
    `${esc(S.legendIdeal)}: ${Math.round(ideal)}%`
  ].join('<br>')
}

function paceChart(width, info, samples, now) {
  const height = clamp(Math.round(width * 0.46), 150, 230)
  const pad = { l: 36, r: 12, t: 12, b: 24 }
  const innerW = Math.max(40, width - pad.l - pad.r)
  const innerH = height - pad.t - pad.b
  const projected = info.projected ?? info.p
  const top = clamp(Math.max(100, info.p, projected), 100, 130)
  const x = (time) => pad.l + ((time - info.start) / WEEK) * innerW
  const y = (value) => pad.t + (1 - value / top) * innerH

  const grid = [0, 50, 100]
    .map((value) => {
      const yy = y(value).toFixed(1)
      return `<line x1="${pad.l}" x2="${width - pad.r}" y1="${yy}" y2="${yy}" stroke="var(--orca-border)" stroke-dasharray="${value === 100 ? '' : '2 4'}"/>
        <text x="${pad.l - 6}" y="${yy}" dy="3.5" text-anchor="end" class="tiny" fill="var(--orca-muted-foreground)">${value}%</text>`
    })
    .join('')

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const time = info.start + i * DAY
    return `<text x="${x(time + DAY / 2).toFixed(1)}" y="${height - 6}" text-anchor="middle" class="tiny" fill="var(--orca-muted-foreground)">${esc(fmtDay.format(time))}</text>`
  }).join('')

  const ideal = `<line x1="${x(info.start).toFixed(1)}" y1="${y(0).toFixed(1)}" x2="${x(info.end).toFixed(1)}" y2="${y(100).toFixed(1)}" stroke="var(--orca-muted-foreground)" stroke-width="1.5" stroke-dasharray="5 4"/>`

  const points = samples.map((s) => [x(s.t), y(s.p)])
  const real =
    points.length > 1
      ? `<polyline points="${points.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--orca-primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`
      : ''
  const dailyDots = points
    .slice(0, -1)
    .map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="var(--orca-primary)"/>`)
    .join('')

  const nowX = x(now).toFixed(1)
  const nowY = y(info.p).toFixed(1)
  const projection =
    info.projected !== null && info.elapsed < 1
      ? `<line x1="${nowX}" y1="${nowY}" x2="${x(info.end).toFixed(1)}" y2="${y(clamp(info.projected, 0, top)).toFixed(1)}" stroke="var(--orca-primary)" stroke-width="2" stroke-dasharray="1 4" stroke-linecap="round" opacity="0.7"/>`
      : ''

  const dot = `<circle cx="${nowX}" cy="${nowY}" r="4.5" fill="var(--orca-primary)" stroke="var(--orca-card)" stroke-width="2"/>`
  const guide = `<line id="pace-guide" x1="0" x2="0" y1="${pad.t}" y2="${pad.t + innerH}" stroke="var(--orca-muted-foreground)" stroke-width="1" opacity="0"/>`
  const hit = `<rect data-pace="1" x="${pad.l}" y="${pad.t}" width="${innerW}" height="${innerH}" fill="transparent"/>`

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(S.paceTitle)}">
    ${grid}${dayLabels}${ideal}${projection}${real}${dailyDots}${guide}${dot}${hit}
  </svg>`
}

function tokensChart(width, days, capacity) {
  const height = 120
  const pad = { t: 8, b: 22 }
  const shares = days.map((d) => (capacity ? (d.tokens / capacity) * 100 : d.tokens))
  const max = Math.max(1, ...shares)
  const slot = width / days.length
  const barW = Math.max(8, Math.min(28, slot * 0.56))
  const bars = days
    .map((d, i) => {
      const share = shares[i]
      const h = Math.max(d.tokens > 0 ? 2 : 0, ((height - pad.t - pad.b) * share) / max)
      const xx = i * slot + (slot - barW) / 2
      const yy = height - pad.b - h
      const label = fmtDay.format(new Date(d.day + 'T12:00:00'))
      const tipText = capacity
        ? t(S.tokensPctTip, { day: label, pct: fmtNum.format(Math.round(share)), n: fmtCompact.format(d.tokens) })
        : t(S.tokensTip, { day: label, n: fmtNum.format(d.tokens) })
      const pctLabel =
        capacity && d.tokens
          ? `<text x="${(i * slot + slot / 2).toFixed(1)}" y="${(yy - 4).toFixed(1)}" text-anchor="middle" class="tiny" fill="var(--orca-foreground)" pointer-events="none">${esc(fmtNum.format(Math.round(share)))}%</text>`
          : ''
      return `<rect x="${(i * slot).toFixed(1)}" y="0" width="${slot.toFixed(1)}" height="${height - pad.b}" fill="transparent" data-tip="${esc(tipText)}"/>
        <rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="var(--orca-primary)" opacity="${d.tokens ? 1 : 0.25}" pointer-events="none"/>
        ${pctLabel}
        <text x="${(i * slot + slot / 2).toFixed(1)}" y="${height - 6}" text-anchor="middle" class="tiny" fill="var(--orca-muted-foreground)" pointer-events="none">${esc(label)}</text>`
    })
    .join('')
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(S.tokensTitle)}">${bars}</svg>`
}

function usageCard(label, window, now) {
  if (!window) {
    return ''
  }
  if (window.resetsAt && Date.parse(window.resetsAt) <= now) {
    return `<div class="card kpi"><div class="label">${esc(label)}</div>
    <div class="value muted">—</div>
    <div class="sub">${esc(S.resetPassed)}</div></div>`
  }
  const percent = clamp(Math.round(window.percent), 0, 100)
  let reset = ''
  if (window.resetsAt) {
    const at = Date.parse(window.resetsAt)
    reset = `${esc(t(S.remaining, { d: formatRemaining(at - now) }))}<br>${esc(fmtClock.format(at))}`
  }
  return `<div class="card kpi"><div class="label">${esc(label)}</div>
    <div class="value ${percent >= 90 ? 'over' : ''}">${percent}%</div>
    <div class="bar"><i class="${percent >= 90 ? 'hot' : ''}" style="width:${percent}%"></i></div>
    <div class="sub">${reset}</div></div>`
}

function weeklyCapacity(usage, tokensByDay) {
  const week = usage.sevenDay
  if (!week || !week.resetsAt || week.percent < 3) {
    return null
  }
  const startDay = dayKeyOf(Date.parse(week.resetsAt) - WEEK)
  const used = tokensByDay.filter((d) => d.day >= startDay).reduce((sum, d) => sum + d.tokens, 0)
  return used > 0 ? used / (week.percent / 100) : null
}

let paceCtx = null

function setupForm(reason) {
  const card = document.createElement('section')
  card.className = 'card setup'
  card.innerHTML = `
    <h2>${esc(S.setupTitle)}</h2>
    <ol class="steps"><li>${esc(S.setupSteps[0])}</li></ol>
    <div class="command"><code>claude <span class="nowrap">setup-token</span></code><button class="icon-btn" type="button" data-role="copy" aria-label="${esc(S.copy)}" title="${esc(S.copy)}">${COPY_ICON}</button></div>
    <ol class="steps" start="2">${S.setupSteps.slice(1).map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
    ${reason === 'signed-out' ? `<p class="error">${esc(S.rejected)}</p>` : ''}
    <form class="token-form" autocomplete="off">
      <input type="password" name="token" placeholder="${esc(S.tokenPlaceholder)}" spellcheck="false" autocomplete="off" />
      <button class="icon" type="submit">${esc(S.saveToken)}</button>
    </form>
    <p class="error" data-role="error" hidden></p>`
  const copyButton = card.querySelector('[data-role="copy"]')
  copyButton.addEventListener('click', () => {
    const field = document.createElement('textarea')
    field.value = SETUP_COMMAND
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()
    const copied = document.execCommand('copy')
    field.remove()
    copyButton.innerHTML = copied ? CHECK_ICON : COPY_ICON
    setTimeout(() => (copyButton.innerHTML = COPY_ICON), 1500)
  })
  const form = card.querySelector('form')
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const input = form.querySelector('input')
    const error = card.querySelector('[data-role="error"]')
    const token = input.value
    input.value = ''
    let result
    try {
      result = await window.orca.plugin.request('token.save', { token })
    } catch {
      result = { ok: false }
    }
    if (!result.ok) {
      error.textContent = S.invalidToken
      error.hidden = false
      return
    }
    void load(true)
  })
  return card
}

function buildView(data) {
  const now = Date.now()
  const view = document.createElement('div')
  view.className = 'view'
  const { usage } = data
  if (!usage.ok) {
    if (['no-token', 'signed-out', 'invalid-token'].includes(usage.reason)) {
      view.innerHTML = `<header><h1>${esc(S.title)}</h1></header>`
      view.append(setupForm(usage.reason))
      return view
    }
    view.innerHTML = `<header><h1>${esc(S.title)}</h1></header>
      <div class="card"><p class="empty">${esc(S.noData)}</p><p class="muted small">${esc(S.reasons[usage.reason])}</p>
        <button class="icon" id="retry" style="margin-top:10px">${esc(S.retry)}</button></div>`
    view.querySelector('#retry')?.addEventListener('click', () => void load(true))
    return view
  }

  const fresh = usage.checkedAt && now - Date.parse(usage.checkedAt) <= STALE_MS
  const weekReset = usage.sevenDay?.resetsAt && Date.parse(usage.sevenDay.resetsAt) <= now
  const info = weekReset ? null : pace(usage.sevenDay, now)
  const weekAgo = now - 7 * DAY
  const skills = (data.skills ?? []).filter((s) => s.lastUsed >= weekAgo)
  const capacity = weeklyCapacity(usage, data.tokensByDay ?? [])

  const skillsHtml = skills.length
    ? `<ul class="list">${skills
        .map((s) => {
          const share = Math.round((s.count / skills[0].count) * 100)
          const tipText = t(S.skillTip, { name: s.name, n: s.count, when: relativeTo(s.lastUsed, now) })
          return `<li data-tip="${esc(tipText)}"><div class="row"><span>${esc(s.name)}</span><span class="muted">${s.count}</span></div>
            <div class="bar"><i style="width:${share}%"></i></div></li>`
        })
        .join('')}</ul>`
    : `<p class="empty">${esc(S.skillsEmpty)}</p>`

  const paceBlock = info
    ? `<section class="card">
        <div class="section-title"><h2>${esc(S.paceTitle)}</h2></div>
        <p class="status ${info.state === 'over' ? 'over' : ''}">${esc(paceSentence(info, now))}</p>
        <div id="pace-chart" class="chart" style="min-height:190px"></div>
        <div class="legend"><span class="ideal">${esc(S.legendIdeal)}</span><span class="real">${esc(
          S.legendReal
        )}</span><span class="proj">${esc(S.legendProj)}</span></div>
        <p class="muted tiny" style="margin:8px 0 0">${esc(S.historyNote)}</p>
      </section>`
    : ''

  view.innerHTML = `
    <header>
      <h1>${esc(S.title)}</h1>
      <span class="muted small updated">${esc(S.updated)} ${esc(fmtTime.format(data.generatedAt))}</span>
      <button class="icon" id="refresh" aria-label="${esc(S.refresh)}">${esc(S.refresh)}</button>
    </header>
    ${usage.error ? `<p class="error" style="margin:0">${esc(S.reasons[usage.error])}</p>` : ''}
    ${!fresh ? `<p class="error" style="margin:0">${esc(S.stale)}</p>` : ''}
    ${usage.limitedBy && fresh ? `<p class="warn" style="margin:0">${esc(S.limitedBy[usage.limitedBy] ?? usage.limitedBy)}</p>` : ''}
    <div class="kpis">
      ${usageCard(S.kpiSession, usage.fiveHour, now)}
      ${usageCard(S.kpiWeekly, usage.sevenDay, now)}
    </div>
    <div class="pills">
      <section class="card"><div class="section-title"><h2>${esc(S.skillsTitle)}</h2></div>${skillsHtml}</section>
      <section class="card"><div class="section-title"><h2>${esc(S.tokensTitle)}</h2></div>
        <p class="muted tiny" style="margin:0 0 8px">${esc(capacity ? S.tokensNote : S.tokensNeedUsage)}</p>
        <div id="tokens-chart" class="chart" style="min-height:130px"></div></section>
    </div>
    ${paceBlock}
    <div class="row" style="justify-content:flex-end"><button class="icon ghost" id="remove-token">${esc(S.removeToken)}</button></div>
  `
  view.querySelector('#refresh')?.addEventListener('click', () => void load(true))
  view.querySelector('#remove-token')?.addEventListener('click', async () => {
    await window.orca.plugin.request('token.clear', {})
    void load(true)
  })
  if (usage.error === 'signed-out') {
    view.append(setupForm('signed-out'))
  }
  return view
}

function mountCharts(view, data) {
  const now = Date.now()
  const { usage } = data
  paceCtx = null
  if (!usage.ok) {
    return
  }
  const info = usage.sevenDay?.resetsAt && Date.parse(usage.sevenDay.resetsAt) > now ? pace(usage.sevenDay, now) : null
  const samples = info ? cycleSamples(info, data.history ?? [], now) : []
  if (info) {
    paceCtx = { info, samples, now }
  }
  const capacity = weeklyCapacity(usage, data.tokensByDay ?? [])
  const chartWidth = (el) => Math.max(120, Math.floor(el.getBoundingClientRect().width))
  const paceEl = view.querySelector('#pace-chart')
  if (paceEl && info) {
    paceEl.innerHTML = paceChart(chartWidth(paceEl), info, samples, now)
    paceEl.style.minHeight = ''
  }
  const tokensEl = view.querySelector('#tokens-chart')
  if (tokensEl) {
    tokensEl.innerHTML = tokensChart(chartWidth(tokensEl), data.tokensByDay ?? [], capacity)
    tokensEl.style.minHeight = ''
  }
}

function showData(data) {
  const view = buildView(data)
  reveal.show(view)
  mountCharts(view, data)
}

// data-tip values hold plain text (skill names come from local transcripts), so they are
// never parsed as HTML. Only paceTip builds markup, and it escapes its own values.
function showTip(content, clientX, clientY, asHtml = false) {
  if (asHtml) {
    tip.innerHTML = content
  } else {
    tip.textContent = content
  }
  tip.style.opacity = '1'
  const box = tip.getBoundingClientRect()
  const left = clientX + 14 + box.width > window.innerWidth ? clientX - box.width - 14 : clientX + 14
  tip.style.left = `${Math.max(4, left)}px`
  tip.style.top = `${Math.max(4, Math.min(clientY + 14, window.innerHeight - box.height - 4))}px`
}

function hideTip() {
  tip.style.opacity = '0'
  document.getElementById('pace-guide')?.setAttribute('opacity', '0')
}

function hoverPace(event, hit) {
  if (!paceCtx) {
    return
  }
  const { info, samples } = paceCtx
  const box = hit.getBoundingClientRect()
  const frac = clamp((event.clientX - box.left) / box.width, 0, 1)
  const cursorTime = info.start + frac * WEEK
  const point = samples.reduce((best, s) => (Math.abs(s.t - cursorTime) < Math.abs(best.t - cursorTime) ? s : best))
  const guide = document.getElementById('pace-guide')
  if (guide) {
    const svgX = Number(hit.getAttribute('x')) + ((point.t - info.start) / WEEK) * Number(hit.getAttribute('width'))
    guide.setAttribute('x1', svgX.toFixed(1))
    guide.setAttribute('x2', svgX.toFixed(1))
    guide.setAttribute('opacity', '1')
  }
  showTip(paceTip(info, point), event.clientX, event.clientY, true)
}

app.addEventListener('pointermove', (event) => {
  const target = event.target
  if (target instanceof Element && target.matches('rect[data-pace]')) {
    hoverPace(event, target)
    return
  }
  const el = target instanceof Element ? target.closest('[data-tip]') : null
  if (el) {
    showTip(el.dataset.tip, event.clientX, event.clientY)
  } else {
    hideTip()
  }
})
app.addEventListener('pointerleave', hideTip)

function sampleData(now) {
  return {
    usage: {
      ok: true,
      fiveHour: { percent: 40, resetsAt: new Date(now + 2 * 60 * MINUTE).toISOString() },
      sevenDay: { percent: 60, resetsAt: new Date(now + 3 * DAY).toISOString() },
      limitedBy: null,
      checkedAt: new Date(now).toISOString()
    },
    history: [],
    skills: [
      { name: 'skill-name', count: 4, lastUsed: now },
      { name: 'skill-name-two', count: 2, lastUsed: now },
      { name: 'skill-name-three', count: 1, lastUsed: now }
    ],
    tokensByDay: Array.from({ length: 7 }, (_, i) => ({ day: dayKeyOf(now - (6 - i) * DAY), tokens: 1_000_000 })),
    generatedAt: now
  }
}

let lastData = null
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function load(force = false) {
  const started = Date.now()
  if (force) {
    reveal.load()
  }
  try {
    const next = await window.orca.plugin.request('dashboard.read', { force })
    if (force) {
      await wait(Math.max(0, SKELETON_MIN_MS - (Date.now() - started)))
    }
    lastData = next
    draw()
  } catch {
    if (lastData) {
      lastData = { ...lastData, usage: { ...lastData.usage, error: 'unavailable' } }
      draw()
    } else {
      const failed = document.createElement('div')
      failed.innerHTML = `<div class="card"><p class="error">${esc(S.reasons.unavailable)}</p>
        <button class="icon" id="retry" style="margin-top:10px">${esc(S.retry)}</button></div>`
      failed.querySelector('#retry')?.addEventListener('click', () => void load(true))
      reveal.show(failed)
    }
  }
}

function draw() {
  if (lastData) {
    showData(lastData)
  }
}

reveal.load(buildView(sampleData(Date.now())))
let lastWidth = 0
let frame = 0
new ResizeObserver(() => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    if (app.clientWidth !== lastWidth) {
      lastWidth = app.clientWidth
      draw()
    }
  })
}).observe(app)
void load()
const timer = setInterval(() => void load(), REFRESH_MS)
window.addEventListener('pagehide', () => clearInterval(timer))
