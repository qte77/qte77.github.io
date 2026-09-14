---
layout: post
title: An Idle-Discovery Agent for the Agent Natives Builders Hackathon
description: >-
  A same-day hackathon build — a Cloudflare Worker that wakes with no queued
  task, decides its own goal from bounded live signals via a real metered AIsa
  call, executes it as real GitHub issues on two independent repos, and
  exposes both an MCP server and a static landing page. Built and submitted
  in one session, 2026-08-27.
excerpt: A Cloudflare Worker that wakes with no queued task, reads three bounded live signals from its own repo, spends a real metered AIsa call deciding a goal, and executes it as real GitHub issues on two independent repos — built and submitted same-day for the Agent Natives Builders Hackathon.
keywords: hackathon, AI agents, Cloudflare Workers, MCP, AIsa, idle discovery, agent-native, qte77
categories: [agents, ai, tooling]
---

**TL;DR.** Built and submitted same-day (2026-08-27) for the Agent Natives Builders Hackathon,
internal track: an agent that wakes with no queued task, self-selects **one** goal from three
bounded live signals on its own repo, spends a real metered [AIsa](https://aisa.one) call deciding
it, then **executes** the goal — not just narrates it — as real GitHub issues on this repo and an
independently-maintained counterparty repo, each read back to confirm it actually landed. It
exposes both a real [MCP](https://modelcontextprotocol.io) server for other agents and a static
landing page for humans. Repo:
[`2026-08-26-AgentNativeHack-FT-CF-SF`](https://github.com/qte77/2026-08-26-AgentNativeHack-FT-CF-SF).

## The design

Three bounded, cheap signals — not open-ended exploration — feed one AIsa-gated decision:

1. **Observe**: GitHub Actions run status, open Dependabot alerts, and which file/directory has
   the highest edit frequency in the last 10 commits.
2. **Decide**: one call to `api.aisa.one/v1/chat/completions` (`qwen-flash`), asked for exactly one
   goal sentence or `NONE`. Verified live — real request/response, a `chatcmpl-` id, internally
   consistent token counts, timestamped to the exact trigger moment.
3. **Fall back on purpose**: if nothing is actionable, that's a designed branch, not a failure —
   the agent reads the next open row from its own plan file and works on itself instead of idling.
4. **Execute + check**: the goal becomes a real GitHub issue on this repo *and* on an
   independently-maintained counterparty repo (`org2`), each read back afterward to confirm the
   write actually landed, not just that the API call returned 2xx.
5. **Checkpoint**: every episode goes into Workers KV, so `npm run replay` reproduces a committed
   one deterministically offline — no live calls, no credentials.

## Two independent agents, not one pretending to be two

The counterparty repo isn't a passive inbox. It has its **own** GitHub Actions workflow, unrelated
to the Worker's code, that reacts to every new request file with the Actions-provided
`GITHUB_TOKEN` — no shared credential — commenting on the linked issue and logging to its own
`PROCESSED.md`. Two real systems, talking through the GitHub API, not one agent narrating both
sides.

## What a live E2E pass actually found

A browser-driven pass (Playwright/Patchright, via
[`polyfetch-scrape`](https://github.com/qte77/polyfetch-scrape)) against the real deployed page —
not just plain HTTP checks — caught a real bug: the checkpoint timeline silently failed to load.
Root cause wasn't the obvious one (missing CORS headers were already present on every
happy/404 path) — it was that **any uncaught exception** fell through to Cloudflare's own error
page, which has no CORS header at all. Two other real issues surfaced the same way: checkpoint
keys sorting lexicographically by UUID instead of chronologically (silently showing the wrong
"most recent" episode), and older checkpoints written before a schema change 500ing on read. All
three are the kind of thing a plain `curl` check never catches and a real browser does.

## The honest gap

Cotal mesh coordination — the piece that would give this a second, judge-visible coordination
channel — stayed a documented no-op through most of the session (its only client interface is a
persistent NATS connection, which a stateless Worker can't hold), then got further than expected
late in the day via a Tenki cloud sandbox and a carefully pty-driven login — only to hit a mesh
ACL permission wall one step before actually sending a message. Better to say that plainly than
overstate what shipped: four of five rubric lines are solid and verified live; this one is real
progress, not yet a finished integration.

## The result

Internal track Runner-up. Mean score 66.63/100 across 8 judges, ranking 12th of 22 teams overall
(the Internal track winner, Climatico, scored 73.25; the overall event leader, Showtonic, scored
81). Two of the harder judge critiques are worth answering directly rather than leaving the prose
above to speak past them.

"Real metered AIsa call" means exactly this and no more: a real, live `chat/completions` call with
a real request/response and a genuine usage receipt captured in each checkpoint — not a paid
settlement. The tested account ran on a free-tier model, so no money changed hands; AIsa's x402
pay-per-call surface was confirmed live and well-formed in earlier research for this build, but
completing a real on-chain settlement was deliberately never attempted, and nothing here should be
read as implying it was.

And `org2` is not organizationally independent — same owner, same person, created after this repo.
The claim worth standing behind is narrower and still real: org2's agent runs on its own ephemeral,
repo-scoped `GITHUB_TOKEN` that cannot read this repo's AIsa key, cannot write to this repo, and
cannot read its checkpoints — a platform-enforced credential boundary between the two agents, not
an organizational one.

## Try it

- Landing page: <https://qte77.github.io/2026-08-26-AgentNativeHack-FT-CF-SF/>
- MCP server: `POST https://agent-native-hack.cloudflare-driveway392.workers.dev/mcp`
- Source: <https://github.com/qte77/2026-08-26-AgentNativeHack-FT-CF-SF>
