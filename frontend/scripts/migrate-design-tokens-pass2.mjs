import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..', 'src')

const replacements = [
  [/bg-success\/10\/40/g, 'bg-success/10'],
  [/bg-success\/10\/70/g, 'bg-success/15'],
  [/bg-success\/10\/(\d+)/g, 'bg-success/$1'],
  [/text-zinc-950/g, 'text-canvas'],
  [/bg-zinc-800\/90/g, 'bg-elevated'],
  [/ring-zinc-700\/80/g, 'ring-edge-strong/80'],
  [/divide-zinc-900/g, 'divide-edge'],
  [/divide-zinc-800\/80/g, 'divide-edge/80'],
  [/divide-zinc-800\/70/g, 'divide-edge/70'],
  [/divide-zinc-800/g, 'divide-edge'],
  [/from-zinc-950\/90/g, 'from-canvas/90'],
  [/via-zinc-950\/25/g, 'via-canvas/25'],
  [/via-zinc-950\/20/g, 'via-canvas/20'],
  [/to-zinc-950/g, 'to-canvas'],
  [/from-zinc-950/g, 'from-canvas'],
  [/text-zinc-800\/90/g, 'text-ink/20'],
  [/text-emerald-500/g, 'text-success'],
  [/bg-emerald-500\/40/g, 'bg-success/40'],
  [/bg-emerald-500/g, 'bg-success'],
  [/bg-emerald-700\/80/g, 'bg-success/80'],
  [/hover:bg-emerald-600/g, 'hover:bg-success'],
  [/border-emerald-700\/60/g, 'border-success/40'],
  [/ring-emerald-700\/30/g, 'ring-success/30'],
  [/bg-emerald-900\/60/g, 'bg-success/20'],
  [/border-emerald-800\/60/g, 'border-success/40'],
  [/border-emerald-800\/50/g, 'border-success/30'],
  [/text-amber-300/g, 'text-warning'],
  [/bg-amber-400/g, 'bg-warning'],
  [/bg-amber-600/g, 'bg-warning'],
  [/hover:border-zinc-500/g, 'hover:border-edge-strong'],
  [/bg-zinc-700/g, 'bg-edge-strong'],
  [/text-red-200\/80/g, 'text-danger/80'],
  [/hover:text-red-100/g, 'hover:text-danger'],
  [/text-red-100/g, 'text-danger'],
  [/bg-gold-500\/90/g, 'bg-gold-500'],
]

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p)
  }
  return out
}

let n = 0
for (const file of walk(rootDir)) {
  const src = fs.readFileSync(file, 'utf8')
  let next = src
  for (const [re, to] of replacements) next = next.replace(re, to)
  if (next !== src) {
    fs.writeFileSync(file, next)
    n++
    console.log(path.relative(rootDir, file))
  }
}
console.log(`fixed ${n} files`)
