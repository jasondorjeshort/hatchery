#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
// The wave lead's script (ADR 0025): one change, run from the files of its lead directory
// <repo>/.lead/<slug>/ and the repository, never from what an agent returned. Contract:
// docs/hatchery/decisions/0025-lead-contract.md, sections 3 to 5. Not promised (ADR 0025, item 12):
// the commands, their output, .lead/, the prompts and the deny texts.
//
//   node .claude/hooks/lead.js init <slug> --writer coder|tester [--cap 0|1|2] [--humans]
//   node .claude/hooks/lead.js next <d> [--take] | wait <d> | refused <d> | verdict <d>
//   node .claude/hooks/lead.js stop <d> "<reason>" | resume <d> [--now] [--fresh] | status
//   node .claude/hooks/lead.js close <d> [--override "<reason>" | --resolved "<how>"]
//   node .claude/hooks/lead.js --hook        (PreToolUse and PostToolUse, payload on stdin)
//
// <d> is .lead/<slug>, from the work tree's root (an absolute path works too). Exit 0; status exits
// 1 while a change needs the coordinator; 2 on a usage error or a refusal, with one stderr line.
// Module: step(dir) derives the one permitted step and records what it derived (commits, files,
// a stop, landed) in lead.json; installed(root) says whether <root>/.claude/settings.json runs
// the hook. The script runs git only to read. Test seam: LEAD_WAIT_SECONDS shortens wait's 540.
// Node built-ins only (ADR 0013).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SLUG = /^[a-z0-9-]{1,40}$/;
const WRITERS = ['coder', 'tester'];
const CAP_DEFAULT = 2;
const NO_OUTPUT_MS = 60 * 60 * 1000;
const POLL_SECONDS = 5;
const WAIT_SECONDS = 540; // under the Bash tool's 600
const BASE_LEAD_TYPES = ['wave-lead']; // usage.finishAgents's base value: used when the policy does not load or a policy.js lacks the key
const PRE_TOOLS = ['Agent', 'SendMessage', 'Bash', 'PowerShell', 'Write', 'Edit'];
const AGENT_KEYS = new Set(['subagent_type', 'prompt', 'description', 'run_in_background']);
const SEND_KEYS = new Set(['to', 'message', 'summary', 'type', 'recipient', 'recipient_kind', 'content']);
const LEAD_COMMAND = /^node \.claude\/hooks\/lead\.js (next|wait|verdict|refused) (\.lead\/[a-z0-9-]{1,40})$/;
const QUEUES = ['docs/ideas/', 'docs/operator/', 'docs/findings/'];
const isHandoff = (p) => p === 'docs/HANDOFF.md' || p.startsWith('docs/handoff/');
const NO_RESUME = ['declined', 'open after cap', 'rethink'];
const USAGE = 'node .claude/hooks/lead.js init <slug> --writer coder|tester [--cap 0|1|2] [--humans] | next <d> [--take] | wait <d> | refused <d> | verdict <d> | stop <d> "<reason>" | resume <d> [--now] [--fresh] | status | close <d> [--override "<reason>" | --resolved "<how>"]';
const HOOK_ENTRY = 'node "${CLAUDE_PROJECT_DIR}/.claude/hooks/lead.js" --hook';

// ---------- templates (section 4) ----------
const T = {
  writer: (d) => `Read ${d}/steps.md (Writer) and ${d}/brief-writer.md and do the work.`,
  commit: (d, k) => `Run the commit brief ${d}/commit-${k}.md exactly as written and report.`,
  review1: (d, sha) => `Read ${d}/steps.md (Review) and ${d}/brief-reviewer.md; review commit ${sha}; write ${d}/review-1.md.`,
  fixMessage: (d, k) => `Fix round ${k}: read ${d}/steps.md (Fix) and ${d}/review-${k}.md; write ${d}/response-${k}.md.`,
  fixFresh: (d, k, sha) => `You take over a change as its writer. Read ${d}/steps.md (Fix), ${d}/brief-writer.md, ${d}/writer-1.md and ${d}/review-${k}.md; the change is commit ${sha}; write ${d}/response-${k}.md.`,
  check: (d, k, a, b) => `Read ${d}/steps.md (Check) and ${d}/brief-reviewer.md; check git diff ${a} ${b} against ${d}/review-${k - 1}.md; write ${d}/review-${k}.md.`,
};

function stepsText(d) {
  return [
    'The files here are the record. What you return to your launcher is not read.',
    '',
    `This directory is ${d}; every path below is from the repository's root.`,
    '',
    '## Writer',
    '',
    `Do the brief; do not commit. Write ${d}/message.txt: a subject under 70 characters, a blank line,`,
    'the body, and the Co-Authored-By trailer the brief names. Then, last, write ' + `${d}/writer-1.md:`,
    '',
    '    Status: done',
    '    Files:',
    '    <a repository-relative path per line, for every file created, changed or deleted>',
    '',
    '    <the report>',
    '',
    'One file per line: a new directory\'s files each on their own line; never a directory or a pattern.',
    '',
    'or, blocked, the first line "Status: blocked: <reason>". Blocked means tests that cannot pass in',
    'scope, or a dependency or interface the brief lacks.',
    '',
    '## Review',
    '',
    'The reviewer\'s own rules apply. The file the prompt names begins with these four lines, a line each:',
    '',
    '    Verdict: push | fix first | rethink',
    '    Blocking: <id>, <id> | none',
    '    Serious: <id>, <id> | none',
    '    Minor: <id>, <id> | none',
    '',
    'An id is <review number>-<n>, for example 1-2. The findings follow, each under its id.',
    '',
    '## Fix',
    '',
    'Fix every Blocking and Serious id of the review the prompt names, or decline it with a reason (so',
    `too when it needs scope the brief lacks). Do not commit. Rewrite ${d}/message.txt if what it says`,
    'changed. Last, write the response file the prompt names:',
    '',
    '    <id> fixed',
    '    <id> declined: <reason>',
    '    (a line per Blocking and Serious id)',
    '',
    '    Files:',
    '    <a repository-relative path per line, for every file this fix created, changed or deleted>',
    '',
    'Files: as for the writer, one file per line, for what this round changed.',
    '',
    '## Check',
    '',
    'Read the diff first, then the earlier review\'s Blocking and Serious findings; there is no response',
    'file for you. List each finding still open under its old id, and each new defect in what the diff',
    'changed under a new id; the rest are closed. The file begins with the four lines of the Review',
    'section.',
    '',
  ].join('\n');
}

// ---------- small helpers ----------
const uniq = (a) => [...new Set(a)];
const norm = (s) => String(s).trim().replace(/\s+/g, ' ');
const nowIso = () => new Date().toISOString();
const str = (v) => (typeof v === 'string' && v !== '' ? v : null);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const dName = (s) => `.lead/${s.slug}`;
const rootOf = (dir) => path.resolve(dir, '..', '..');
function readText(dir, name) {
  try { return fs.readFileSync(path.join(dir, name), 'utf8'); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}
const exists = (f) => { try { fs.statSync(f); return true; } catch (_) { return false; } };
const isLeadDir = (dir) => { try { return fs.statSync(path.join(dir, 'lead.json')).isFile(); } catch (_) { return false; } };

// Paths after "--" are read literally (no glob magic); check-ignore refuses the flag, and takes none.
function git(root, args) {
  const r = spawnSync('git', [...(args.includes('--') ? ['--literal-pathspecs'] : []), '-C', root, ...args], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true, env: Object.assign({}, process.env, { GIT_OPTIONAL_LOCKS: '0' }),
  });
  return { code: r.status, out: r.stdout || '', err: (r.stderr || (r.error ? r.error.message : '')).trim() };
}
function gitOut(root, args) {
  const r = git(root, args);
  if (r.code !== 0) throw new Error(`git ${args[0]} failed: ${r.err.split(/\r?\n/)[0] || `exit ${r.code}`}`);
  return r.out;
}
const toplevel = (dir) => {
  if (!dir) return null;
  const r = git(dir, ['rev-parse', '--show-toplevel']);
  return r.code === 0 && r.out.trim() ? r.out.trim() : null;
};
const headSha = (root) => gitOut(root, ['rev-parse', 'HEAD']).trim();
const currentBranch = (root) => gitOut(root, ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
const isAncestor = (root, a, b) => git(root, ['merge-base', '--is-ancestor', a, b]).code === 0;
const onRemote = (root, sha) => gitOut(root, ['branch', '-r', '--contains', sha]).trim() !== '';
// The paths git status lists (untracked files one by one; both sides of a rename), from the root.
function dirtyPaths(root, files) {
  const args = ['status', '--porcelain', '-z', '--untracked-files=all'];
  if (files) { if (files.length === 0) return []; args.push('--', ...files); }
  const parts = gitOut(root, args).split('\0');
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i];
    if (e.length < 4) continue;
    out.push(e.slice(3));
    if (e[0] === 'R' || e[0] === 'C') { i++; if (parts[i]) out.push(parts[i]); }
  }
  return uniq(out);
}

// ---------- lead.json ----------
function load(dir) {
  const f = path.join(dir, 'lead.json');
  let s;
  try { s = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { throw new Error(`${f} is unreadable (${e.code || e.message})`); }
  if (!s || typeof s !== 'object' || Array.isArray(s)) throw new Error(`${f} is not a lead record`);
  // The fields that reach a prompt, a subagent type or the cap are held to their value sets.
  const bad = s.slug !== path.basename(path.resolve(dir)) || !SLUG.test(String(s.slug)) ? 'slug is not the directory\'s name'
    : !WRITERS.includes(s.writer) ? 'writer is not coder or tester'
      : ![0, 1, 2].includes(s.cap) ? 'cap is not 0, 1 or 2'
        : !['running', 'landed', 'stopped'].includes(s.status) ? 'status is not running, landed or stopped' : null;
  if (bad) throw new Error(`${f} is not a lead record (${bad})`);
  for (const k of ['baseline', 'files', 'commits', 'permits', 'responses', 'denies']) if (!Array.isArray(s[k])) s[k] = [];
  if (!s.agents || typeof s.agents !== 'object') s.agents = { writer: null };
  return s;
}
function save(dir, s) {
  const f = path.join(dir, 'lead.json');
  const text = `${JSON.stringify(s, null, 2)}\n`;
  const tmp = `${f}.${process.pid}.tmp`;
  try { fs.writeFileSync(tmp, text); fs.renameSync(tmp, f); } catch (_) {
    fs.writeFileSync(f, text);
    try { fs.unlinkSync(tmp); } catch (__) { /* gone */ }
  }
}
// The lead directories under <root>/.lead/ (absolute), by name.
function leadDirs(root) {
  const top = path.join(root, '.lead');
  let names = [];
  try { names = fs.readdirSync(top); } catch (_) { return []; }
  return names.filter((n) => SLUG.test(n)).sort().map((n) => path.join(top, n)).filter(isLeadDir);
}
const runningDirs = (root) => leadDirs(root).filter((d) => load(d).status === 'running');

// ---------- readings (the usage-state file, read only) ----------
function readings(sid) {
  const none = { five: null, seven: null, read: null };
  if (!sid || !/^[A-Za-z0-9_-]+$/.test(sid)) return none;
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'usage-state', `${sid}.json`), 'utf8')); } catch (_) { return none; }
  const o = obj(j);
  const pct = (w) => (w && typeof w.used_percentage === 'number' ? w.used_percentage : null);
  return { five: pct(o.five_hour), seven: pct(o.seven_day), read: typeof o.updatedAt === 'number' ? o.updatedAt : null };
}
function newPermit(root, r, sid) {
  const p = { t: nowIso(), step: r.step, tool: r.tool };
  if (r.tool === 'Agent') p.type = r.subagent_type; else p.to = r.to;
  p.head = headSha(root);
  return Object.assign(p, readings(sid));
}
const permitOf = (s, step) => s.permits.find((p) => p.step === step) || null;

// ---------- the agents' files ----------
function cleanPath(l) {
  const p = l.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!p || p.startsWith('/') || /^[A-Za-z]:/.test(p) || p.split('/').includes('..')) return null;
  return p;
}
// writer-1.md: { blocked } | { malformed } | { files }.
function parseWriter(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
  const b = /^Status: blocked(?::\s*(.*))?$/.exec(lines[0]);
  if (b) return { blocked: (b[1] || '').trim() };
  if (lines[0] !== 'Status: done') return { malformed: 'its first line is not "Status: done" or "Status: blocked: <reason>"' };
  if (lines[1] !== 'Files:') return { malformed: 'its second line is not "Files:"' };
  const files = [];
  for (let i = 2; i < lines.length && lines[i] !== ''; i++) {
    const p = cleanPath(lines[i]);
    if (!p) return { malformed: `"${lines[i]}" is not a repository-relative path` };
    files.push(p);
  }
  if (files.length === 0) return { malformed: 'Files: lists no path' };
  return { files: uniq(files) };
}
// review-<k>.md: { verdict, blocking, serious, minor } | { malformed }.
function parseReview(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
  const v = /^Verdict: (push|fix first|rethink)$/.exec(lines[0] || '');
  if (!v) return { malformed: 'its first line is not "Verdict: push | fix first | rethink"' };
  const out = { verdict: v[1] };
  for (const [i, name] of [[1, 'Blocking'], [2, 'Serious'], [3, 'Minor']]) {
    const m = new RegExp(`^${name}: (.+)$`).exec(lines[i] || '');
    if (!m) return { malformed: `line ${i + 1} is not "${name}: <id>, <id> | none"` };
    const key = name.toLowerCase();
    if (m[1].trim() === 'none') { out[key] = []; continue; }
    const ids = m[1].split(',').map((x) => x.trim());
    if (ids.some((id) => !/^\d+-\d+$/.test(id))) return { malformed: `"${name}:" holds something other than ids <review number>-<n> or none` };
    out[key] = uniq(ids);
  }
  return out;
}
// response-<k>.md: { answers: Map id -> { fixed, reason }, files }. A line that does not read as an
// answer answers nothing. A Files: line that does not read as a path is kept as written (trimmed),
// so rule 4's entry check names it.
function parseResponse(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
  const answers = new Map();
  let i = 0;
  for (; i < lines.length && lines[i] !== ''; i++) {
    const m = /^(\d+-\d+) (?:(fixed)|declined:\s*(.*))$/.exec(lines[i]);
    if (m && !answers.has(m[1])) answers.set(m[1], m[2] ? { fixed: true } : { fixed: false, reason: m[3] });
  }
  const files = [];
  const j = lines.indexOf('Files:', i);
  if (j >= 0) for (let t = j + 1; t < lines.length && lines[t].trim() !== ''; t++) files.push(cleanPath(lines[t]) || lines[t].trim());
  return { answers, files: uniq(files) };
}
// The change's files the commit of step k covers: the writer's, then each earlier response's.
function filesUpTo(dir, k) {
  const w = readText(dir, 'writer-1.md');
  const pw = w === null ? {} : parseWriter(w);
  let files = pw.files ? pw.files.slice() : [];
  for (let j = 1; j < k; j++) {
    const r = readText(dir, `response-${j}.md`);
    if (r !== null) files = uniq([...files, ...parseResponse(r).files]);
  }
  return files;
}
// The change's paths: files and every path a response lists, a stopped fix round's included (what
// the verdict's Tree: marks, and what close --override needs clean).
function changePaths(dir, s) {
  let last = 0;
  while (exists(path.join(dir, `response-${last + 1}.md`))) last++;
  return uniq([...s.files, ...filesUpTo(dir, last + 1)]);
}
// Rule 4's search: the newest commit in ref..HEAD touching files, with those files clean.
function findCommit(root, ref, files) {
  if (!ref || files.length === 0) return null;
  const r = git(root, ['log', '--format=%H', '-1', `${ref}..HEAD`, '--', ...files]);
  const sha = r.code === 0 ? r.out.trim() : '';
  if (!sha) return null;
  return dirtyPaths(root, files).length === 0 ? sha : null;
}
function hasOutput(dir, s, p) {
  const root = rootOf(dir);
  if (p.step === 'writer') return exists(path.join(dir, 'writer-1.md'));
  let m = /^review-(\d+)$/.exec(p.step);
  if (m) return exists(path.join(dir, `review-${m[1]}.md`));
  m = /^fix-(\d+)$/.exec(p.step);
  if (m) return exists(path.join(dir, `response-${m[1]}.md`));
  m = /^commit-(\d+)$/.exec(p.step);
  if (m) {
    const k = Number(m[1]);
    if (s.commits[k - 1]) return true;
    return findCommit(root, k === 1 ? s.base : p.head, filesUpTo(dir, k)) !== null;
  }
  return true; // a step this script does not issue waits for nothing
}
const pendingPermits = (dir, s) => s.permits.filter((p) => !hasOutput(dir, s, p));
// Dirty paths rule 5 does not explain: outside the baseline, the handoff files and (unless the
// change's own) the queue directories.
function unexplained(root, s) {
  const baseline = new Set(s.baseline);
  const files = new Set(s.files);
  return dirtyPaths(root).filter((p) => !baseline.has(p) && !isHandoff(p) && !(QUEUES.some((q) => p.startsWith(q)) && !files.has(p)));
}

// ---------- the step function (section 3) ----------
// derive(dir, s, { session, now }) works on s in memory: it records commits, files, landed or a
// stop there, and returns { step, tool: 'Agent', subagent_type, prompt } | { step, tool:
// 'SendMessage', to, message } | { tool: 'wait', step, permit } | { tool: 'verdict' }. A commit
// step also carries kind ('new' | 'amend' | 'follow-up') and stage (the paths to add).
function derive(dir, s, opts = {}) {
  const root = rootOf(dir);
  const d = dName(s);
  const now = opts.now || Date.now();
  const stop = (reason, detail) => { s.status = 'stopped'; s.stop = { reason, detail: detail || '' }; return { tool: 'verdict' }; };
  // Rule 1.
  if (s.status !== 'running') return { tool: 'verdict' };
  const missing = ['brief-writer.md', 'brief-reviewer.md'].filter((f) => !exists(path.join(dir, f)));
  if (missing.length) return stop('brief missing', missing.join(', '));
  const branch = currentBranch(root);
  if (branch !== s.branch) return stop('history moved', `the branch is ${branch}, not ${s.branch}`);
  if (!isAncestor(root, s.base, 'HEAD')) return stop('history moved', `${s.base} is not an ancestor of HEAD`);
  // Rule 2.
  const pending = pendingPermits(dir, s)[0];
  if (pending) {
    const since = Date.parse(pending.t);
    const done = s.responses.some((r) => r.step === pending.step && r.status === 'completed' && Date.parse(r.t) >= since);
    if (done) return stop('no output', `${pending.step}: its agent completed without writing its output`);
    if (!(now - since < NO_OUTPUT_MS)) return stop('no output', `${pending.step}: no output 60 minutes after its permit of ${pending.t}`);
    return { tool: 'wait', step: pending.step, permit: pending };
  }
  // Rule 3.
  const w = readText(dir, 'writer-1.md');
  if (w === null) return { step: 'writer', tool: 'Agent', subagent_type: s.writer, prompt: T.writer(d) };
  const pw = parseWriter(w);
  if (pw.blocked !== undefined) return stop('writer blocked', pw.blocked);
  if (pw.malformed) return stop('writer output malformed', `writer-1.md: ${pw.malformed}`);
  const msg = readText(dir, 'message.txt');
  if (msg === null) return stop('writer output malformed', 'message.txt is missing');
  if (!/^Co-Authored-By:/m.test(msg)) return stop('writer output malformed', 'message.txt lacks a Co-Authored-By: line');
  s.files = pw.files.slice();
  let round = pw.files; // the Files: list of the round commit-<k> takes
  for (let k = 1; ; k++) {
    // Rule 4.
    if (!s.commits[k - 1]) {
      const p = permitOf(s, `commit-${k}`);
      const sha = findCommit(root, k === 1 ? s.base : p && p.head, s.files);
      if (!sha) {
        // Each entry of the round is one dirty file (git status lists them file by file) or a path
        // an earlier list holds; a directory, a pattern or pathspec magic is neither.
        const dirty = dirtyPaths(root);
        const dirtySet = new Set(dirty);
        const earlier = new Set(k === 1 ? [] : filesUpTo(dir, k - 1));
        const bad = round.find((e) => !dirtySet.has(e) && !earlier.has(e));
        if (bad !== undefined) {
          return stop('writer output malformed', `${k === 1 ? 'writer-1.md' : `response-${k - 1}.md`}: Files: entry "${bad}" is not one file this round created, changed or deleted`);
        }
        const own = new Set(s.files);
        const stage = dirty.filter((x) => own.has(x)); // files' dirty paths, never a clean or committed one
        const head = headSha(root);
        const kind = k === 1 ? 'new' : s.commits[k - 2] === head && !onRemote(root, head) ? 'amend' : 'follow-up';
        return { step: `commit-${k}`, tool: 'Agent', subagent_type: 'runner', prompt: T.commit(d, k), kind, stage };
      }
      s.commits[k - 1] = sha;
    }
    // Rules 5 and 6. Rule 5 applies until response-<k>.md exists: dirty tree while there is no
    // review-<k>.md, tree changed during review once it parses. With a response the tree holds the
    // fix, which rule 4 takes for k + 1; rule 5 next applies before review-<k+1>.
    const rv = readText(dir, `review-${k}.md`);
    if (rv === null) {
      const stray = unexplained(root, s);
      if (stray.length) return stop('dirty tree', stray.join(', '));
      const prompt = k === 1 ? T.review1(d, s.commits[0]) : T.check(d, k, s.commits[k - 2], s.commits[k - 1]);
      return { step: `review-${k}`, tool: 'Agent', subagent_type: 'reviewer', prompt };
    }
    const pr = parseReview(rv);
    if (pr.malformed) return stop('review malformed', `review-${k}.md: ${pr.malformed}`);
    const rs = readText(dir, `response-${k}.md`);
    if (rs === null) {
      const stray = unexplained(root, s);
      if (stray.length) return stop('tree changed during review', stray.join(', '));
    }
    if (pr.verdict === 'rethink') return stop('rethink', `review-${k}.md`);
    const ids = [...pr.blocking, ...pr.serious];
    if (ids.length === 0) { s.status = 'landed'; s.stop = null; return { tool: 'verdict' }; }
    if (k - 1 >= s.cap) return stop('open after cap', `${ids.join(', ')} open after ${s.cap} of ${s.cap} fix rounds`);
    // Rule 7.
    if (rs === null) {
      const wr = s.agents && s.agents.writer;
      const session = opts.session || null;
      if (wr && str(wr.id) && session && wr.session === session && !s.fresh) {
        return { step: `fix-${k}`, tool: 'SendMessage', to: wr.id, message: T.fixMessage(d, k) };
      }
      return { step: `fix-${k}`, tool: 'Agent', subagent_type: s.writer, prompt: T.fixFresh(d, k, s.commits[k - 1]) };
    }
    const ans = parseResponse(rs);
    const declined = ids.filter((id) => ans.answers.has(id) && !ans.answers.get(id).fixed);
    if (declined.length) return stop('declined', declined.map((id) => `${id}: ${ans.answers.get(id).reason || 'no reason given'}`).join('; '));
    const unanswered = ids.filter((id) => !ans.answers.has(id));
    if (unanswered.length) return stop('unanswered', unanswered.join(', '));
    s.files = uniq([...s.files, ...ans.files]);
    round = ans.files;
  }
}

const session = () => str(process.env.CLAUDE_CODE_SESSION_ID);
// step(dir): load, derive, save what changed.
function step(dir, opts = {}) {
  const s = load(dir);
  const before = JSON.stringify(s);
  const r = derive(dir, s, Object.assign({ session: session() }, opts));
  if (JSON.stringify(s) !== before) save(dir, s);
  return r;
}

// installed(root): <root>/.claude/settings.json carries both entries in a form that binds: a
// PreToolUse group whose matcher is a plain list naming every tool of PRE_TOOLS, and a PostToolUse
// group whose list names Agent, each with a hook that binds (bindingHook). Anything weaker is not
// installed: the gate gives a lead its finish line on this answer. Loading this module is the other half.
// A binding hook: type "command", no key outside HOOK_KEYS (so no async, no condition, no fail-mode
// override), no shell other than the default or bash (Windows PowerShell's -Command turns exit 2
// into 1), and exactly `node <script> --hook` where <script> is <placeholder>/.claude/hooks/lead.js
// (a relative path fails from a subfolder, exit 1, which does not block): in the shell form one
// command string, the script double-quoted so a path with a space stays one word, and nothing that
// could mask the exit code (no ||, ;, &&, |, redirection, or trailing word); in the exec form
// command "node" and args ["${CLAUDE_PROJECT_DIR}/.claude/hooks/lead.js", "--hook"].
const HOOK_KEYS = new Set(['type', 'command', 'args', 'timeout', 'shell', 'statusMessage']);
const SHELL_HOOK = /^[ \t]*node(\.exe)?[ \t]+"(\$\{CLAUDE_PROJECT_DIR(:-\.)?\}|\$CLAUDE_PROJECT_DIR)\/\.claude\/hooks\/lead\.js"[ \t]+--hook[ \t]*$/;
const EXEC_SCRIPT = '${CLAUDE_PROJECT_DIR}/.claude/hooks/lead.js';
function bindingHook(h) {
  if (!h || typeof h !== 'object' || h.type !== 'command' || typeof h.command !== 'string') return false;
  if (Object.keys(h).some((k) => !HOOK_KEYS.has(k))) return false;
  if (h.shell !== undefined && h.shell !== 'bash') return false;
  if (h.args === undefined) return SHELL_HOOK.test(h.command);
  return Array.isArray(h.args) && /^node(\.exe)?$/.test(h.command) && h.args.length === 2 &&
    h.args[0] === EXEC_SCRIPT && h.args[1] === '--hook';
}
const listNames = (m) => (typeof m === 'string' && /^[A-Za-z0-9_]+(\|[A-Za-z0-9_]+)*$/.test(m) ? m.split('|') : []);
function installed(root) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(root, '.claude', 'settings.json'), 'utf8')); } catch (_) { return false; }
  if (!j || typeof j !== 'object' || !j.hooks || typeof j.hooks !== 'object' || j.disableAllHooks === true) return false;
  const binds = (event, tools) => Array.isArray(j.hooks[event]) && j.hooks[event].some((g) => g && typeof g === 'object' &&
    tools.every((t) => listNames(g.matcher).includes(t)) && Array.isArray(g.hooks) && g.hooks.some(bindingHook));
  return binds('PreToolUse', PRE_TOOLS) && binds('PostToolUse', ['Agent']);
}

// ---------- the commit brief (section 4) ----------
// A staged path as a literal pathspec, single-quoted for the shell: git expands no pattern or magic
// in it (a literal directory would still stage what is under it; rule 4's entry check prevents one).
const lit = (p) => `':(literal)${p.replace(/'/g, `'\\''`)}'`;
function trailers(msg) {
  const paras = msg.replace(/\r/g, '').trim().split(/\n\s*\n/);
  const last = paras[paras.length - 1].split('\n').filter((l) => /^[A-Za-z][A-Za-z0-9-]*: /.test(l));
  return last.length ? last : msg.replace(/\r/g, '').split('\n').filter((l) => /^Co-Authored-By:/.test(l));
}
function writeCommitBrief(dir, s, r) {
  const d = dName(s);
  const k = Number(r.step.slice('commit-'.length));
  let cmd;
  let amend = '';
  // The amend form names the commit it amends and opens with a check, because the brief can be run
  // after HEAD has moved (a wrap-up runs it after a handoff commit) and would amend the wrong commit.
  let check = ' ';
  if (r.kind === 'new') cmd = `git commit -F ${d}/message.txt`;
  else if (r.kind === 'amend') {
    const sha = s.commits[k - 2];
    check = ` First run git rev-parse HEAD: it must print exactly ${sha}. If it prints anything else, stop and report, staging nothing and committing nothing.\n`;
    cmd = `git commit --amend -F ${d}/message.txt`;
    amend = `Amend: ${sha} is HEAD and on no remote-tracking branch.\n`;
  } else {
    cmd = `git commit -F ${d}/message-fix-${k}.txt`;
    const msg = readText(dir, 'message.txt') || '';
    const subject = (msg.replace(/\r/g, '').split('\n')[0] || '').trim();
    const rv = readText(dir, `review-${k - 1}.md`);
    const pr = rv === null ? {} : parseReview(rv);
    const ids = pr.malformed || !pr.blocking ? [] : [...pr.blocking, ...pr.serious];
    const text = `${`Review fixes: ${subject}`.slice(0, 70).trimEnd()}\n\nCloses ${ids.join(', ')} from the review of ${s.commits[k - 2]}.\n\n${trailers(msg).join('\n')}\n`;
    fs.writeFileSync(path.join(dir, `message-fix-${k}.txt`), text);
  }
  fs.writeFileSync(path.join(dir, `commit-${k}.md`),
    `Commit the following.${check}Stage exactly these files: git add -- ${r.stage.map(lit).join(' ')}\n${cmd}\n${amend}` +
    'The message file carries its trailer; add nothing. Run git status --short before and after and include both. Do not push.\n');
}

// ---------- the verdict (section 5) ----------
const L = 'lead.js';
// The addition at declined and unanswered (section 5's row): the round's fix is in the tree, uncommitted.
const FIX_LEFT = (d) => 'The round\'s fix is in the tree, uncommitted: no commit step ran, so the commit is still the one the reviewer read, ' +
  'and no check will read the fix; your reading of the response stands in, as for a fix you relay. The paths Tree: marks as the change\'s are ' +
  `committed before close, never as WIP: on an override, by a runner on your brief (commit skill), amending that commit with ${d}/message.txt ` +
  `while it is HEAD and unpushed, else as a follow-up, and ${L} close ${d} --override is refused while one is dirty; on a relayed fix, in that ` +
  'fix\'s commit beside its own files. A wrap-up before then leaves them uncommitted and the change open.';
function nextText(s, d) {
  const status = s.status;
  if (status === 'running') return `If no lead is turning it (it ended at maxTurns, was stopped, or its calls fail): ${L} stop ${d} "<reason>", then as for a stop at no output: ${nextText({ status: 'stopped', stop: { reason: 'no output' } }, d)}`;
  if (status === 'landed') {
    return s.humans ? `The owner reviews what humans see; file what is worth filing, then ${L} close ${d} --resolved "<how>".`
      : `File what is worth filing, then ${L} close ${d}.`;
  }
  const reason = s.stop ? s.stop.reason : '';
  const uncommitted = `Uncommitted files of the change are never a WIP commit: its commit step takes them, run by a lead's runner or, at wrap-up, by the coordinator from ${d}/commit-<k>.md.`;
  if (reason === 'writer blocked') return `Read ${d}/writer-1.md; widen the brief or take the decision; ${L} close ${d} --resolved "<how>", then a new change or a WIP commit.`;
  if (reason === 'refused') return `After the reset or the owner's grant: ${L} resume ${d} --now (a refused call started nothing), then a new lead on this directory, or ${L} next ${d} --take by hand. ${uncommitted}`;
  if (NO_RESUME.includes(reason) || reason === 'unanswered') {
    const base = `Read the review and the response; override (${L} close ${d} --override "<reason>"), or relay the fix yourself (brief skill, Reports by path) and ${L} close ${d} --resolved "<how>"; after rethink the design goes to the architect or a runner reverts the commit. The cap is not raised.`;
    if (reason !== 'declined' && reason !== 'unanswered') return base;
    return `${base} ${FIX_LEFT(d)}`;
  }
  if (reason === 'dirty tree' || reason === 'tree changed during review') return `Find who wrote the listed paths; nothing is committed over them; ${L} resume ${d} once the tree is explained.`;
  return `Know that the last permitted agent (the Launches: line) has ended, or stop it by its id, before ${L} resume ${d} --now (P4); else resume waits out the hour. Mend a malformed file by hand. Or ${L} close ${d} --resolved "<how>". ${uncommitted}`;
}
function verdictText(dir) {
  const s = load(dir);
  const root = rootOf(dir);
  const d = dName(s);
  const lines = [];
  let head;
  if (s.status === 'running') {
    let at;
    try {
      const copy = JSON.parse(JSON.stringify(s));
      const r = derive(dir, copy, { session: session() });
      if (copy.status === 'landed') at = 'landed';
      else if (copy.status === 'stopped') at = `a stop (${copy.stop.reason})`;
      else if (r.tool === 'wait') at = `${r.step} (waiting for its output)`;
      else at = r.step;
    } catch (e) { at = `unknown (${e.message})`; }
    head = `running, at ${at}`;
  } else if (s.status === 'landed') head = s.humans ? 'landed, waits for the owner\'s review' : 'landed';
  else head = `stopped: ${s.stop ? s.stop.reason : 'unknown'}${s.stop && s.stop.detail ? ` (${s.stop.detail})` : ''}`;
  lines.push(`Change ${s.slug}: ${head}`);
  const pushed = (sha) => { try { return onRemote(root, sha) ? 'pushed' : 'unpushed'; } catch (_) { return 'unknown'; } };
  lines.push(`Commits: ${s.commits.length ? s.commits.map((c) => `${c} (${pushed(c)})`).join(', ') : 'none'}`);
  const reviews = [];
  const responses = [];
  for (let k = 1; ; k++) {
    const rv = readText(dir, `review-${k}.md`);
    const rs = readText(dir, `response-${k}.md`);
    if (rv === null && rs === null) break;
    if (rv !== null) reviews.push({ k, p: parseReview(rv) });
    if (rs !== null) responses.push({ k, p: parseResponse(rs) });
  }
  const rounds = uniq([...responses.map((r) => r.k), ...s.permits.filter((p) => /^fix-\d+$/.test(p.step)).map((p) => Number(p.step.slice(4)))]).length;
  lines.push(`Rounds: ${rounds} of ${s.cap}`);
  lines.push(`Reviews: ${reviews.length ? reviews.map(({ k, p }) => (p.malformed ? `review-${k}.md (malformed)`
    : `review-${k}.md (${p.verdict}; blocking ${p.blocking.length}, serious ${p.serious.length}, minor ${p.minor.length})`)).join(', ') : 'none'}`);
  lines.push(`Responses: ${responses.length ? responses.map(({ k, p }) => {
    const v = [...p.answers.values()];
    return `response-${k}.md (${v.filter((a) => a.fixed).length} fixed, ${v.filter((a) => !a.fixed).length} declined)`;
  }).join(', ') : 'none'}`);
  const last = reviews.length ? reviews[reviews.length - 1] : null;
  let open = [];
  if (last && !last.p.malformed && s.status !== 'landed') {
    const resp = responses.find((r) => r.k === last.k);
    for (const [sev, ids] of [['blocking', last.p.blocking], ['serious', last.p.serious]]) {
      for (const id of ids) {
        if (!resp) open.push(`${id} ${sev} open`);
        else if (!resp.p.answers.has(id)) open.push(`${id} ${sev} unanswered`);
        else if (!resp.p.answers.get(id).fixed) open.push(`${id} ${sev} declined`);
      }
    }
  }
  lines.push(`Open: ${open.length ? open.join(', ') : 'none'}`);
  lines.push(`Minor left: ${last && !last.p.malformed && last.p.minor.length ? last.p.minor.join(', ') : 'none'}`);
  const wr = s.agents && s.agents.writer;
  lines.push(`Writer: ${d}/writer-1.md${exists(path.join(dir, 'writer-1.md')) ? '' : ' (not written)'}, agent ${wr && wr.id ? wr.id : 'not recorded'}`);
  if (s.permits.length) {
    const counts = new Map();
    for (const p of s.permits) { const key = p.tool === 'Agent' ? p.type : `message to ${p.to}`; counts.set(key, (counts.get(key) || 0) + 1); }
    const lp = s.permits[s.permits.length - 1];
    lines.push(`Launches: ${[...counts].map(([k, n]) => `${k} ${n}`).join(', ')}; last ${lp.tool === 'Agent' ? lp.type : `message to ${lp.to}`} (${lp.step}) at ${lp.t}`);
  } else lines.push('Launches: none');
  const meter = (key, label) => {
    const rs = s.permits.filter((p) => typeof p[key] === 'number');
    return rs.length ? `${label} ${rs[0][key]}% to ${rs[rs.length - 1][key]}%` : null;
  };
  const ms = [meter('five', '5h'), meter('seven', '7d')].filter(Boolean);
  let largest = null;
  for (let i = 1; i < s.permits.length; i++) {
    for (const [key, label] of [['five', '5h'], ['seven', '7d']]) {
      const a = s.permits[i - 1][key];
      const b = s.permits[i][key];
      if (typeof a === 'number' && typeof b === 'number' && (!largest || b - a > largest.delta)) largest = { delta: b - a, label, step: s.permits[i].step };
    }
  }
  lines.push(`Meters: ${ms.length ? `${ms.join(', ')}; largest step ${largest ? `${largest.label} +${largest.delta} (${largest.step})` : 'n/a'}` : 'no readings'}`);
  let tree;
  try {
    const own = new Set(changePaths(dir, s));
    const paths = dirtyPaths(root);
    tree = paths.length ? paths.map((p) => (own.has(p) ? `${p} (the change's)` : p)).join(', ') : 'clean';
  } catch (e) { tree = `unknown (${e.message})`; }
  lines.push(`Tree: ${tree}`);
  lines.push(`Next: ${nextText(s, d)}`);
  return `${lines.join('\n')}\n`;
}

// ---------- the hook (section 3) ----------
function finishAgents() {
  try {
    const l = require('./policy').load();
    const v = l && !l.error && l.policy && l.policy.usage ? l.policy.usage.finishAgents : undefined;
    if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v;
  } catch (_) { /* the base list */ }
  return BASE_LEAD_TYPES;
}
function hookRoot(p) {
  return toplevel(str(p.cwd)) || toplevel(str(process.env.CLAUDE_PROJECT_DIR)) || path.resolve(__dirname, '..', '..');
}
function denyJson(what) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny',
    permissionDecisionReason: `Lead guard: ${what}. Do not retry: run lead.js refused and hand back the verdict.` } }));
}
function judgePre(p, root, sid) {
  const tool = p.tool_name;
  const ti = obj(p.tool_input);
  let running = null;
  const theRunning = () => { if (running === null) running = runningDirs(root); return running; };
  // A deny: logged in the one running change's record, when there is exactly one.
  const deny = (what, dir, s) => {
    const entry = { t: nowIso(), tool: String(tool), what };
    if (dir && s) { s.denies.push(entry); save(dir, s); } else {
      try {
        const r = theRunning();
        if (r.length === 1) { const st = load(r[0]); st.denies.push(entry); save(r[0], st); }
      } catch (_) { /* the deny stands without its log line */ }
    }
    denyJson(what);
  };
  if (tool === 'Bash') {
    const m = LEAD_COMMAND.exec(typeof ti.command === 'string' ? ti.command.trim() : '');
    if (ti.run_in_background === true || !m || !isLeadDir(path.join(root, m[2]))) return deny('command not allowed');
    return undefined; // allowed: no output
  }
  if (tool !== 'Agent' && tool !== 'SendMessage') return deny('tool not allowed');
  const r0 = theRunning();
  if (r0.length !== 1) return deny('no running change');
  const dir = r0[0];
  const s = load(dir);
  const keys = tool === 'Agent' ? AGENT_KEYS : SEND_KEYS;
  const extra = Object.keys(ti).find((k) => !keys.has(k));
  const r = derive(dir, s, { session: sid });
  if (extra !== undefined) return deny(`key not allowed (${extra})`, dir, s);
  if (r.tool === 'wait') {
    const pp = r.permit;
    const same = pp.tool === tool && (tool === 'Agent' ? pp.type === ti.subagent_type : pp.to === ti.to);
    return deny(same ? 'step already permitted' : 'not the permitted step (wait)', dir, s);
  }
  const notIt = () => deny(`not the permitted step (${r.step || r.tool})`, dir, s);
  if (r.tool !== tool) return notIt();
  if (tool === 'Agent') {
    if (ti.subagent_type !== r.subagent_type || typeof ti.prompt !== 'string' || norm(ti.prompt) !== norm(r.prompt)) return notIt();
  } else {
    if (ti.to !== r.to || typeof ti.message !== 'string' || norm(ti.message) !== norm(r.message)) return notIt();
    if (typeof ti.recipient === 'string' && ti.recipient !== r.to) return notIt();
    if (typeof ti.content === 'string' && norm(ti.content) !== norm(r.message)) return notIt();
  }
  if (permitOf(s, r.step)) return deny('step already permitted', dir, s);
  s.permits.push(newPermit(rootOf(dir), r, sid));
  save(dir, s);
  return undefined;
}
function judgePostAgent(p, root, sid) {
  // The change whose newest Agent permit is the newest: the call that just returned.
  let best = null;
  for (const dir of leadDirs(root)) {
    const s = load(dir);
    const agentPermits = s.permits.filter((x) => x.tool === 'Agent');
    const lp = agentPermits[agentPermits.length - 1];
    if (lp && (!best || Date.parse(lp.t) > Date.parse(best.permit.t))) best = { dir, s, permit: lp };
  }
  if (!best) return;
  const tr = obj(p.tool_response);
  const rec = { t: nowIso(), step: best.permit.step, agentId: str(tr.agentId), agentType: str(tr.agentType), model: str(tr.resolvedModel), status: str(tr.status) };
  best.s.responses.push(rec);
  if (rec.agentId && (rec.step === 'writer' || /^fix-\d+$/.test(rec.step))) best.s.agents.writer = { id: rec.agentId, session: sid };
  save(best.dir, best.s);
}
function hookMain(raw) {
  let p;
  try { p = JSON.parse(raw); } catch (_) { return 0; }
  if (!p || typeof p !== 'object') return 0;
  if (typeof p.agent_id !== 'string' || p.agent_id === '' || typeof p.agent_type !== 'string') return 0;
  if (!finishAgents().includes(p.agent_type)) return 0;
  try {
    const root = hookRoot(p);
    const sid = str(process.env.CLAUDE_CODE_SESSION_ID) || str(p.session_id);
    if (p.hook_event_name === 'PreToolUse') judgePre(p, root, sid);
    else if (p.hook_event_name === 'PostToolUse') { if (p.tool_name === 'Agent') judgePostAgent(p, root, sid); }
    // Another event carrying a guarded tool is refused; one without a tool (a stop-type event)
    // passes, since exit 2 there would block the stop.
    else if (PRE_TOOLS.includes(p.tool_name)) throw new Error(`unexpected hook_event_name ${JSON.stringify(p.hook_event_name)} for ${p.tool_name}`);
    return 0;
  } catch (e) {
    // After the call (PostToolUse) nothing can be refused: the agent is launched; say what was lost.
    if (p.hook_event_name === 'PostToolUse') {
      process.stderr.write(`lead.js: internal error (${e.message}) after the Agent call ran; the agent it launched is not stopped, but its response is not recorded in lead.json (for a writer: no agent id, so a fix round cannot message it). Launch nothing further and hand back to the coordinator quoting this line; once that agent has finished, the coordinator checks lead.json and the step's output, then runs lead.js stop <d> and resume <d> --fresh, or close <d>.\n`);
      return 2;
    }
    process.stderr.write(`lead.js: internal error (${e.message}); the call is refused. Run lead.js refused and hand back the verdict.\n`);
    return 2;
  }
}

// ---------- the CLI ----------
class Refusal extends Error {}
const refuse = (msg) => { throw new Refusal(msg); };
const usage = (reason) => refuse(`usage: ${reason}; ${USAGE}`);
function cliRoot() { return toplevel(process.cwd()); }
function resolveDir(arg) {
  if (!arg || arg.startsWith('--')) usage('a lead directory <d> is needed');
  const root = cliRoot();
  if (!root) refuse('not in a git work tree; run it from the repository\'s work tree');
  // <d> is .lead/<slug> of this work tree: a path into another tree's .lead/ is refused, so a
  // mistyped or sibling path never stops, resumes or deletes another change.
  const dir = path.resolve(root, arg);
  if (path.dirname(dir) !== path.resolve(root, '.lead') || !SLUG.test(path.basename(dir))) {
    refuse(`${arg} is not a directory .lead/<slug> of this work tree (${root})`);
  }
  if (!isLeadDir(dir)) refuse(`no lead directory at ${arg} (no lead.json there)`);
  return dir;
}
function flags(args, spec) {
  const o = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const name = a.slice(2);
      if (!(name in spec)) usage(`unknown flag ${a}`);
      if (spec[name] === 'value') { if (i + 1 >= args.length) usage(`${a} needs a value`); o[name] = args[++i]; } else o[name] = true;
    } else o._.push(a);
  }
  return o;
}
function out(text) { process.stdout.write(text.endsWith('\n') ? text : `${text}\n`); }

function cmdInit(args) {
  const o = flags(args, { writer: 'value', cap: 'value', humans: 'flag' });
  if (o._.length !== 1) usage('init takes one slug');
  const slug = o._[0];
  if (!SLUG.test(slug)) usage(`the slug must match [a-z0-9-]{1,40}, not ${slug}`);
  if (!WRITERS.includes(o.writer)) usage('--writer must be coder or tester');
  const cap = o.cap === undefined ? CAP_DEFAULT : Number(o.cap);
  if (!['0', '1', '2', undefined].includes(o.cap)) usage('--cap must be 0, 1 or 2');
  const root = cliRoot();
  if (!root) refuse('not in a git work tree; run init from the repository\'s work tree');
  if (git(root, ['check-ignore', '-q', '.lead/x']).code !== 0) refuse('.lead/ is not git-ignored here; add the line .lead/ to .gitignore, then run init again');
  if (!installed(root)) {
    refuse(`the lead hook is not installed; merge two entries into .claude/settings.json, PreToolUse with matcher "${PRE_TOOLS.join('|')}" and PostToolUse with matcher "Agent", each running ${HOOK_ENTRY}`);
  }
  const running = runningDirs(root);
  if (running.length) refuse(`another change is running; see node .claude/hooks/lead.js verdict .lead/${path.basename(running[0])}`);
  const dir = path.join(root, '.lead', slug);
  if (exists(dir)) refuse(`.lead/${slug} exists; pick another slug, or close it (lead.js close .lead/${slug})`);
  const h = git(root, ['rev-parse', '--verify', '-q', 'HEAD']);
  if (h.code !== 0) refuse('HEAD has no commit; a change starts from a commit');
  const s = {
    slug, writer: o.writer, cap, humans: o.humans === true, fresh: false, status: 'running', stop: null,
    base: h.out.trim(), branch: currentBranch(root), baseline: dirtyPaths(root), files: [], commits: [],
    agents: { writer: null }, permits: [], responses: [], denies: [],
  };
  fs.mkdirSync(dir, { recursive: true });
  save(dir, s);
  fs.writeFileSync(path.join(dir, 'steps.md'), stepsText(dName(s)));
  out(dName(s));
}
function cmdNext(args) {
  const o = flags(args, { take: 'flag' });
  if (o._.length !== 1) usage('next takes one <d>');
  const dir = resolveDir(o._[0]);
  const s = load(dir);
  const before = JSON.stringify(s);
  const r = derive(dir, s, { session: session() });
  let printed;
  if (r.tool === 'Agent') printed = { step: r.step, tool: 'Agent', subagent_type: r.subagent_type, prompt: r.prompt };
  else if (r.tool === 'SendMessage') printed = { step: r.step, tool: 'SendMessage', to: r.to, message: r.message };
  else printed = { tool: r.tool };
  if (r.kind) writeCommitBrief(dir, s, r);
  if (o.take && (r.tool === 'Agent' || r.tool === 'SendMessage')) s.permits.push(newPermit(rootOf(dir), r, session()));
  if (JSON.stringify(s) !== before) save(dir, s);
  out(JSON.stringify(printed));
}
function cmdWait(args) {
  if (args.length !== 1) usage('wait takes one <d>');
  const dir = resolveDir(args[0]);
  const max = Number(process.env.LEAD_WAIT_SECONDS) > 0 ? Number(process.env.LEAD_WAIT_SECONDS) : WAIT_SECONDS;
  const start = Date.now();
  const cell = new Int32Array(new SharedArrayBuffer(4));
  for (;;) {
    if (step(dir).tool !== 'wait') { out('ready'); return; }
    const left = max * 1000 - (Date.now() - start);
    if (left <= 0) { out('waiting'); return; }
    Atomics.wait(cell, 0, 0, Math.min(POLL_SECONDS * 1000, left));
  }
}
function readingsText() {
  const pol = require('./policy');
  const l = pol.load();
  const r = readings(session());
  const v = { '5h': r.five, '7d': r.seven };
  return pol.meterThresholds(l.policy.usage).map(([label, t]) => {
    const lines = [`hold ${t.hold}`];
    if (typeof t.finish === 'number' && t.finish > t.hold) lines.push(`finish ${t.finish}`); // null resolves to hold: no line
    if (typeof t.deny === 'number') lines.push(`deny ${t.deny}`);
    return `${label} ${v[label] === null ? 'n/a' : `${v[label]}%`} (${lines.join(', ')})`;
  }).join(', ');
}
function cmdRefused(args) {
  if (args.length !== 1) usage('refused takes one <d>');
  const dir = resolveDir(args[0]);
  const s = load(dir);
  if (s.status !== 'running') { out(`${dName(s)} is ${s.status}${s.stop ? `: ${s.stop.reason}` : ''}; nothing changed`); return; }
  const lastPermit = s.permits[s.permits.length - 1];
  const lastDeny = s.denies[s.denies.length - 1];
  const detail = lastDeny && (!lastPermit || Date.parse(lastDeny.t) > Date.parse(lastPermit.t))
    ? `${lastDeny.tool}: ${lastDeny.what}` : readingsText();
  s.status = 'stopped';
  s.stop = { reason: 'refused', detail };
  save(dir, s);
  out(`${dName(s)} stopped: refused (${detail})`);
}
function cmdStop(args) {
  if (args.length !== 2) usage('stop takes <d> and a quoted reason');
  const dir = resolveDir(args[0]);
  const s = load(dir);
  if (s.status !== 'running') refuse(`${dName(s)} is ${s.status}; stop applies to a running change`);
  s.status = 'stopped';
  s.stop = { reason: 'stopped by the coordinator', detail: args[1] };
  save(dir, s);
  out(`${dName(s)} stopped: stopped by the coordinator (${args[1]}); agents already running are not stopped`);
}
function cmdResume(args) {
  const o = flags(args, { now: 'flag', fresh: 'flag' });
  if (o._.length !== 1) usage('resume takes one <d>');
  const dir = resolveDir(o._[0]);
  const s = load(dir);
  const d = dName(s);
  if (s.status !== 'stopped') refuse(`${d} is ${s.status}; resume applies to a stopped change`);
  const reason = s.stop ? s.stop.reason : '';
  if (NO_RESUME.includes(reason)) refuse(`${d} stopped at ${reason}, which resume does not lift; close it with --override or --resolved`);
  const others = runningDirs(rootOf(dir)).filter((x) => path.resolve(x) !== path.resolve(dir));
  if (others.length) refuse(`another change is running (.lead/${path.basename(others[0])}); one lead per work tree`);
  const pending = pendingPermits(dir, s);
  const young = pending.find((p) => !(Date.now() - Date.parse(p.t) >= NO_OUTPUT_MS));
  if (young && !o.now) {
    const until = new Date(Date.parse(young.t) + NO_OUTPUT_MS).toISOString();
    refuse(`the permit for ${young.step} (${young.t}) is under 60 minutes old; once you know its agent is not running, resume ${d} --now; else wait until ${until}`);
  }
  s.permits = s.permits.filter((p) => !pending.includes(p));
  s.status = 'running';
  s.stop = null;
  if (o.fresh) s.fresh = true;
  save(dir, s);
  out(`${d} running${pending.length ? `; cleared the permit for ${pending.map((p) => p.step).join(', ')}` : ''}${o.fresh ? '; fix rounds go to a fresh writer' : ''}`);
}
function cmdStatus(args) {
  if (args.length) usage('status takes no argument');
  const root = cliRoot();
  if (!root) refuse('not in a git work tree');
  let code = 0;
  const top = path.join(root, '.lead');
  let names = [];
  try { names = fs.readdirSync(top).filter((n) => SLUG.test(n) && isLeadDir(path.join(top, n))).sort(); } catch (_) { /* none */ }
  for (const n of names) {
    let s;
    try { s = load(path.join(top, n)); } catch (_) { out(`${n} unreadable - .lead/${n}`); code = 1; continue; }
    const lastSha = s.commits.length ? s.commits[s.commits.length - 1] : '-';
    out(`${n} ${s.status}${s.status === 'stopped' && s.stop ? `: ${s.stop.reason}` : ''} ${lastSha} .lead/${n}`);
    if (s.status === 'running' || s.status === 'stopped' || (s.status === 'landed' && s.humans)) code = 1;
  }
  return code;
}
function cmdClose(args) {
  const o = flags(args, { override: 'value', resolved: 'value' });
  if (o._.length !== 1) usage('close takes one <d>');
  if (o.override !== undefined && o.resolved !== undefined) usage('--override and --resolved are exclusive');
  const dir = resolveDir(o._[0]); // only <root>/.lead/<slug>: nothing else is ever deleted
  const s = load(dir);
  const d = dName(s);
  if (s.status === 'running') refuse(`${d} is running; stop it first (lead.js stop ${d} "<reason>")`);
  const flag = o.override !== undefined ? ['override', o.override] : o.resolved !== undefined ? ['resolved', o.resolved] : null;
  if (!flag && (s.status === 'stopped' || (s.status === 'landed' && s.humans))) {
    refuse(`${d} is ${s.status === 'stopped' ? `stopped (${s.stop ? s.stop.reason : 'unknown'})` : 'landed and waits for the owner\'s review'}; close it with --override "<reason>" or --resolved "<how>"`);
  }
  if (flag && flag[0] === 'override') {
    // An override closes the record; the change's own paths must be committed first, or nothing
    // would say whose they are once the directory is gone.
    const own = new Set(changePaths(dir, s));
    const left = dirtyPaths(rootOf(dir)).filter((p) => own.has(p));
    if (left.length) refuse(`${d} has uncommitted paths of the change (${left.join(', ')}); commit them as the verdict's Next: line says, then close --override; nothing deleted`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  out(`closed ${d}${flag ? ` (${flag[0]}: ${flag[1]})` : ''}`);
}

function main(argv) {
  const [cmd, ...rest] = argv;
  try {
    let code = 0;
    if (cmd === 'init') cmdInit(rest);
    else if (cmd === 'next') cmdNext(rest);
    else if (cmd === 'wait') cmdWait(rest);
    else if (cmd === 'refused') cmdRefused(rest);
    else if (cmd === 'verdict') { if (rest.length !== 1) usage('verdict takes one <d>'); process.stdout.write(verdictText(resolveDir(rest[0]))); }
    else if (cmd === 'stop') cmdStop(rest);
    else if (cmd === 'resume') cmdResume(rest);
    else if (cmd === 'status') code = cmdStatus(rest);
    else if (cmd === 'close') cmdClose(rest);
    else usage(cmd ? `unknown command ${cmd}` : 'no command');
    process.exitCode = code;
  } catch (e) {
    process.stderr.write(`lead.js: ${e instanceof Refusal ? e.message : `error: ${e.message}`}\n`.replace(/\n(?!$)/g, ' '));
    process.exitCode = 2;
  }
}

module.exports = { step, installed };

if (require.main === module) {
  if (process.argv[2] === '--hook') {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (raw += c));
    process.stdin.on('end', () => { process.exitCode = hookMain(raw); });
  } else main(process.argv.slice(2));
}
