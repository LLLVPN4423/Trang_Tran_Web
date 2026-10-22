import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const roots = [
  'src/modules/booking',
  'src/modules/appointment',
  'src/modules/account',
  'src/modules/orders',
  'src/modules/portfolio',
  'src/modules/catalog',
  'src/modules/shop',
  'src/modules/admin',
  'src/shared/components',
  'src/shared/lib',
]

/** Ordered replacements — longer / more specific first. */
const replacements = [
  [/text-gold-muted/g, 'text-gold-700'],
  [/hover:text-gold(?!-)/g, 'hover:text-gold-300'],
  [/border-gold\/(\d+)/g, 'border-gold-500/$1'],
  [/bg-gold\/(\d+)/g, 'bg-gold-500/$1'],
  [/ring-gold\/(\d+)/g, 'ring-gold-500/$1'],
  [/from-gold\/(\d+)/g, 'from-gold-500/$1'],
  [/to-gold\/(\d+)/g, 'to-gold-500/$1'],
  [/bg-gold(?!-|[a-z])/g, 'bg-gold-500'],
  [/text-gold(?!-|[a-z0-9])/g, 'text-gold-500'],

  [/border-zinc-900\/90/g, 'border-edge/80'],
  [/border-zinc-900\/80/g, 'border-edge/70'],
  [/border-zinc-900/g, 'border-edge'],
  [/border-zinc-800\/90/g, 'border-edge/90'],
  [/border-zinc-800\/80/g, 'border-edge/80'],
  [/border-zinc-800\/70/g, 'border-edge/70'],
  [/border-zinc-800\/60/g, 'border-edge/60'],
  [/border-zinc-800/g, 'border-edge'],
  [/border-zinc-700\/90/g, 'border-edge-strong/90'],
  [/border-zinc-700/g, 'border-edge-strong'],
  [/border-zinc-600/g, 'border-edge-strong'],

  [/hover:border-zinc-700/g, 'hover:border-edge-strong'],
  [/hover:border-zinc-600/g, 'hover:border-edge-strong'],
  [/hover:bg-zinc-900\/60/g, 'hover:bg-elevated/60'],
  [/hover:bg-zinc-900\/80/g, 'hover:bg-elevated/80'],
  [/hover:bg-zinc-900/g, 'hover:bg-elevated'],
  [/hover:text-zinc-300/g, 'hover:text-ink-secondary'],
  [/hover:text-zinc-200/g, 'hover:text-ink'],
  [/hover:text-zinc-100/g, 'hover:text-ink'],

  [/bg-zinc-950\/95/g, 'bg-canvas/95'],
  [/bg-zinc-950\/90/g, 'bg-canvas/90'],
  [/bg-zinc-950\/50/g, 'bg-canvas/50'],
  [/bg-zinc-950\/40/g, 'bg-card/40'],
  [/bg-zinc-950/g, 'bg-canvas'],
  [/bg-zinc-900\/80/g, 'bg-elevated/80'],
  [/bg-zinc-900\/60/g, 'bg-elevated/60'],
  [/bg-zinc-900\/40/g, 'bg-elevated/40'],
  [/bg-zinc-900/g, 'bg-elevated'],

  // Longer zinc text utilities first — avoids text-zinc-50 matching inside text-zinc-500
  [/text-zinc-600/g, 'text-ink-subtle'],
  [/text-zinc-500/g, 'text-ink-subtle'],
  [/text-zinc-400/g, 'text-ink-muted'],
  [/text-zinc-300/g, 'text-ink-secondary'],
  [/text-zinc-200/g, 'text-ink-secondary'],
  [/text-zinc-100/g, 'text-ink'],
  [/text-zinc-50/g, 'text-ink'],

  [/text-emerald-600\/80/g, 'text-success/80'],
  [/text-emerald-500\/90/g, 'text-success/90'],
  [/text-emerald-400/g, 'text-success'],
  [/text-emerald-300\/90/g, 'text-success/90'],
  [/text-emerald-300/g, 'text-success'],
  [/text-emerald-200/g, 'text-success'],
  [/border-emerald-900\/50/g, 'border-success/30'],
  [/border-emerald-900\/40/g, 'border-success/25'],
  [/border-emerald-900/g, 'border-success/30'],
  [/bg-emerald-950\/30/g, 'bg-success/10'],
  [/bg-emerald-950\/20/g, 'bg-success/10'],
  [/bg-emerald-950/g, 'bg-success/10'],

  [/text-amber-400\/90/g, 'text-warning/90'],
  [/text-amber-400/g, 'text-warning'],
  [/text-amber-200\/90/g, 'text-warning/90'],
  [/text-amber-200\/80/g, 'text-warning/80'],
  [/text-amber-200/g, 'text-warning'],
  [/text-amber-100/g, 'text-warning'],
  [/border-amber-900\/50/g, 'border-warning/30'],
  [/border-amber-900\/40/g, 'border-warning/25'],
  [/border-amber-900/g, 'border-warning/30'],
  [/bg-amber-950\/30/g, 'bg-warning/10'],
  [/bg-amber-950\/20/g, 'bg-warning/10'],
  [/bg-amber-950/g, 'bg-warning/10'],
  [/border-t-amber-400/g, 'border-t-warning'],

  [/hover:text-red-400/g, 'hover:text-danger'],
  [/text-red-400/g, 'text-danger'],
  [/text-red-300/g, 'text-danger'],
  [/border-red-900\/50/g, 'border-danger/30'],
  [/border-red-900/g, 'border-danger/30'],
  [/bg-red-950\/20/g, 'bg-danger/10'],
  [/bg-red-950/g, 'bg-danger/10'],
]

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (/\.(tsx|ts|css)$/.test(ent.name)) out.push(p)
  }
  return out
}

const changed = []
for (const root of roots) {
  for (const file of walk(path.join(rootDir, root))) {
    const src = fs.readFileSync(file, 'utf8')
    let next = src
    for (const [re, to] of replacements) next = next.replace(re, to)
    if (next !== src) {
      fs.writeFileSync(file, next)
      changed.push(path.relative(rootDir, file))
    }
  }
}

console.log(`Updated ${changed.length} files`)
for (const f of changed) console.log(' -', f)
