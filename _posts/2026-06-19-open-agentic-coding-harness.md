---
layout: post
title: An Open Agentic Coding Harness — the Loop, the Plugins, the Senses, the Eval
description: >-
  Five open repos that turn Claude Code into an autonomous coding harness — a TDD
  loop in git worktrees, a 60-skill plugin marketplace, local voice + vision,
  recursive agent teams, and a deterministic evaluator. Built Jan–Apr 2026.
excerpt: Five open Apache-2.0 repos turn Claude Code into an autonomous coding harness — a TDD loop in parallel git worktrees, a plugin marketplace, local voice + vision, recursive agent teams, and a deterministic evaluator. Here's how they fit, with honest dates.
keywords: agentic coding, Claude Code, agent harness, ralph loop, TDD, git worktrees, agent evaluation, multi-agent, coding agents, plugins, qte77
image: /images/agentic-harness-map.png
categories: [agents, ai, eval, tooling]
---

**TL;DR.** Over four months (Jan–Apr 2026) I built five open repos that turn Claude Code into an autonomous coding harness: a **loop** that implements stories test-first in parallel git worktrees ([`ralph-loop`][ralph]), a **plugin marketplace** that arms the agent with 60 skills ([`claude-code-plugins`][plugins]), fully local **voice + vision** so it can speak, listen, and read a screen ([`cc-senses`][senses]), a way to **nest agent teams** by clearing Claude Code's own recursion guard ([`cc-recursive-team-mode`][recursion]), and a **deterministic evaluator** that grades five CLI coding agents head-to-head ([`coding-agent-eval`][eval]). All Apache-2.0. This post maps how they fit — with honest creation dates, not a tidy after-the-fact story.

![An open agentic coding harness — the Ralph loop at the center, armed by plugins, given voice and vision, nesting agent teams, and graded by a deterministic evaluator][harness-map]

## The loop — `ralph-loop`

The spine is a Bash-driven autonomous loop. [`ralph-loop-cc-tdd-wt-vibe-kanban-template`][ralph] picks the next story from a `prd.json`, drives Claude Code through a **Red → Green → Refactor** cycle (it refuses to mark a story done without a failing-test `[RED]` commit before the `[GREEN]` implementation), runs `make validate`, retries up to three times, and loops until every story passes. With `N_WT > 1` it runs several agents **in parallel git worktrees**, scores each result (stories passed, test count, coverage, lint penalties), and squash-merges the best — optionally with a Claude-as-judge pass and human approval. A `LEARNINGS.md` is appended after every story and re-read before the next, so knowledge compounds across the run. An optional Vibe Kanban board shows story status live.

It's Geoffrey Huntley's ["Ralph" technique][ralph-technique] — HumanLayer wrote up [a brief history of Ralph][ralph-history] — wired to Claude Code, TDD discipline, and worktree isolation. **Created 2026-01-18** — the first piece, and the center of everything below.

## The plugins — `claude-code-plugins`

A loop is only as good as what its agent can reach for. [`claude-code-plugins`][plugins] is a self-hosted Claude Code plugin marketplace — **25 plugins, 60 skills, 2 agents** — installable with a single `claude plugin marketplace add qte77/claude-code-plugins`. It covers language dev loops (python/rust/go/typescript/cpp/embedded), a `planner` agent and codebase-hardening passes, OWASP/MAESTRO/ATLAS security auditing, a market-research fan-out, and a `cc-meta` layer for context compaction, session hand-off, and parallel-worker orchestration — the harness's self-management. Plugins can even ship `.js` workflow scripts for multi-repo fan-out. **Created 2026-02-22.**

## The senses — `cc-senses`

[`cc-senses`][senses] gives the agent physical I/O it normally lacks, **entirely on-device**: `/speak` (TTS via a Kokoro → edge-tts → Piper → espeak ladder), `/listen` (STT via Moonshine or Vosk with voice-activity detection, injected straight into the Claude Code PTY), and `/see` (a local vision-language model that describes the screen in ~120 tokens — versus ~1,600 for shipping the raw image to a cloud vision API). It hooks `Stop` for auto-read and `SessionStart`/`SessionEnd` to manage the VLM server. **Created 2026-04-04**, grown out of an earlier `cc-voice-plugin-prototype`. No cloud dependency by design.

## Nesting agents — `cc-recursive-team-mode`

Claude Code sets `CLAUDECODE=1` and refuses to spawn itself recursively. [`cc-recursive-team-mode`][recursion] unsets that single variable so `claude -p` can run as a subprocess **from inside a running session**, and flips on experimental teams mode for parallel multi-agent orchestration. It captures the subprocess's `stream-json` into a typed `RunResult` (exit code, duration, tokens, cost in USD, tool-call list) and reconstructs subagent trees from the session JSONL. **Created 2026-03-23.** This is the primitive that lets the harness orchestrate — and audit — agent teams.

## Measuring it — `coding-agent-eval`

You can't trust a harness you can't measure. [`coding-agent-eval`][eval] runs five CLI coding agents — Claude Code, Cline, opencode, Codebuff, and Gemini/Antigravity — **headless, in isolated git worktrees, on identical fixture-backed specs**. It grades with three *deterministic* graders (does `make validate` pass; how much does the agent's diff overlap the canonical one; what fraction of changed files stayed in scope) — **no LLM-as-judge in phase 1** — and reports mean ± stddev over N=3 runs, in an AgentBeats-compatible schema. It depends on `cc-recursive-team-mode` to drive and parse the runs. **Created 2026-03-23** — the same day as the recursion primitive it's built on.

## The supporting cast

The five repos above don't stand alone:

- [`ai-agents-research`][ai-research] (Mar 2026) — a continuously-updated field catalog of sandboxing, orchestration, and plugin patterns across coding agents; it explicitly links the recursion and eval repos and feeds them.
- [`multi-tasking-quality-benchmark`][mtq] (Mar 2026) — correlates WakaTime activity with code-quality metrics to ask whether session patterns (or human-vs-agent authorship) track quality.
- [`learnings-ralphy`][learnings-ralphy] / [`research-ralphy`][research-ralphy] (Apr 2026) — "ralph offspring": self-evolving nodes that run the loop on a weekly cron to distill learnings and implement newly-discovered Claude Code features via TDD, writing results back to `ai-agents-research`.
- [`Agents-eval`][agents-eval] (Jan 2025) — the original PydanticAI multi-agent evaluation framework; the lineage this all descends from (see the earlier [eval write-ups][eval-posts] and the [AgentBeats GraphJudge post][agentbeats-post]).
- [`context-engineering-template-legacy`][ctx-template] (Jul 2025) — the precursor: a BRD → PRD → implementation template that predates the formal loop.

## What it powers

The harness isn't the point — what it builds is. Several agentic applications run on the same Claude Code orchestration:

| Application | What it does | Created |
| ----------- | ------------ | ------- |
| [codebase → scientific report][codebase-report] | a repo becomes an IEEE-format, citation-backed report via `claude -p` subagents | 2025-08 |
| [market research → GTM][market-gtm] | landscape → PMF → go-to-market via CC subagents | 2025-08 |
| [office-forge-orchestrator][office-forge] | parallel CC sessions across office projects (invoices, contracts, reports) | 2026-03 |
| [job offer → application kit][job-kit] | job feeds become tailored applications via CC Workflow-tool scripts | 2026-06 |

Honest note: the two August-2025 apps **predate** `ralph-loop` — they ran on early Claude Code orchestration that the harness later formalized. The point of the harness is to make that orchestration repeatable, testable, and measurable.

## Timeline

The whole arc, by repository creation date (`git log --max-parents=0`):

| Date | Repo | Role |
| ---- | ---- | ---- |
| 2025-01 | Agents-eval | multi-agent eval framework (lineage) |
| 2025-07 | context-engineering-template-legacy | BRD→PRD→code precursor |
| 2025-08 | agentic-market-research-to-gtm | early CC application |
| 2025-08 | agentic-codebase-to-scientific-report | early CC application |
| **2026-01** | **ralph-loop** | **the loop (harness spine)** |
| 2026-02 | claude-code-plugins | plugin marketplace |
| 2026-03 | ai-agents-research | research catalog |
| 2026-03 | multi-tasking-quality-benchmark | quality benchmark |
| 2026-03 | cc-recursive-team-mode | recursion / agent teams |
| 2026-03 | coding-agent-eval | deterministic evaluator |
| 2026-03 | office-forge-orchestrator | parallel CC sessions (app) |
| 2026-04 | cc-senses | local voice + vision |
| 2026-04 | learnings-ralphy / research-ralphy | self-evolving ralph nodes |
| 2026-06 | agentic-job-offer-to-application-kit | CC Workflow-tool app |

A clean read: build the **loop** (Jan), **arm** it (Feb), then in a single March burst add **research**, a **quality benchmark**, **recursion**, and an **evaluator**; give it **senses** and **self-evolving offspring** in April.

## Built before it had a name

The vocabulary for this kind of work mostly arrived *after* the work did. Lining up when each term was coined against when the matching repo shipped:

![Built before it had a name — buzzword coinage vs. qte77 ship dates][buzz-timeline]

| Buzzword | Coined / went viral | qte77 shipped | Gap |
| -------- | ------------------- | ------------- | --- |
| Context engineering | [coined Jun 2025][ce-source] (Lütke, then Karpathy) | [`context-engineering-template`][ctx-template] — Jul 2025 | ~3 weeks after |
| Loop engineering | [named in 2026; viral Jun 2026][loop-source] | [`ralph-loop`][ralph] — Jan 2026 | **~5 months ahead** |
| Harness engineering | [Anthropic's harness posts][harness-source], late 2025–2026 | the harness cluster — Jan–Apr 2026 | in lockstep (ralph-loop cites them) |

Not a priority claim — the ideas were in the air and others coined the words. The point is cadence: *context engineering* adopted within weeks of its naming, a *loop-engineering* harness running months before that phrase went viral, and the *harness* cluster built in step with the literature it cites.

## Quick answers

**What is the "Ralph loop"?** An autonomous agent loop — pick a story, write a failing test, make it pass, refactor, validate, repeat — popularized by Geoffrey Huntley. `ralph-loop` is a Claude Code + TDD + git-worktree implementation of it.

**Do I need all five repos?** No. The loop runs on its own; plugins, senses, recursion, and eval are independent layers you add as needed. They share one idea — Claude Code as the execution engine.

**Is this only useful for qte77's repos?** No. `ralph-loop` is a language-agnostic template (Python and embedded scaffolds ship; others are a `Makefile.<lang>` away), `claude-code-plugins` installs into any Claude Code setup, and `coding-agent-eval` grades five different CLI agents — not just Claude Code.

**How is the eval not gameable?** Phase-1 grading is fully deterministic (validate pass/fail, diff overlap, scope adherence) with no LLM judge, run N=3 for variance, in isolated worktrees. The output schema is AgentBeats-compatible.

**What's the license?** Apache-2.0 across all five.

## Acknowledgements

- **Geoffrey Huntley** — the [Ralph technique][ralph-technique] the loop is named for.
- **HumanLayer** — a body of [context-engineering writing](https://www.hlyr.dev/blog) the harness leans on: ACE-FCA (the basis of its context-management rules), the instruction-budget and context-efficient-backpressure ideas, and [12-factor agents](https://www.hlyr.dev/blog/12-factor-agents) — surveyed in depth in [`ai-agents-research`][ai-research].
- **Anthropic** — Claude Code, and the long-running-agent harness guidance.
- The open models behind `cc-senses` — Kokoro, Piper, Moonshine, Vosk, Moondream2, and Qwen-VL.

[ralph]: https://github.com/qte77/ralph-loop-cc-tdd-wt-vibe-kanban-template
[plugins]: https://github.com/qte77/claude-code-plugins
[senses]: https://github.com/qte77/cc-senses-plugin
[recursion]: https://github.com/qte77/cc-recursive-team-mode
[eval]: https://github.com/qte77/coding-agent-eval
[harness-map]: /images/agentic-harness-map.svg
[ai-research]: https://github.com/qte77/ai-agents-research
[mtq]: https://github.com/qte77/multi-tasking-quality-benchmark
[learnings-ralphy]: https://github.com/qte77/learnings-ralphy
[research-ralphy]: https://github.com/qte77/research-ralphy
[agents-eval]: https://github.com/qte77/Agents-eval
[ctx-template]: https://github.com/qte77/context-engineering-template-legacy
[codebase-report]: https://github.com/qte77/agentic-codebase-to-scientific-report
[market-gtm]: https://github.com/qte77/agentic-market-research-to-gtm
[office-forge]: https://github.com/qte77/office-forge-orchestrator
[job-kit]: https://github.com/qte77/agentic-job-offer-to-application-kit
[ralph-technique]: https://ghuntley.com/ralph/
[ralph-history]: https://www.hlyr.dev/blog/brief-history-of-ralph
[buzz-timeline]: /images/buzzwords-vs-builds.svg
[ce-source]: https://addyo.substack.com/p/context-engineering-bringing-engineering
[harness-source]: https://addyosmani.com/blog/agent-harness-engineering/
[loop-source]: https://www.mindstudio.ai/blog/what-is-loop-engineering-ai-coding-agents
[eval-posts]: /ai-agents-eval-comprehensive-analysis/
[agentbeats-post]: /agentx-agentbeats-writeup/
