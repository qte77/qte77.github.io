---
layout: post
title: "Ledgerline — the Blocker Isn't Capability, It's the Audit Answer"
description: >-
  A one-day build at the SF Enterprise Hackathon: a cross-system sync agent where
  every write is authorised by a human against a spec first, executes in a
  disposable Daytona sandbox, and lands in an append-only hash-chained trail.
excerpt: Cross-system sync automation already exists and still isn't adopted, because nobody will grant an autonomous process write access to a system of record. Ledgerline's answer is the work order — built in a day on SoftwareForge and Daytona, with the governance enforced structurally rather than by convention.
keywords: workflow automation, enterprise integration, human-in-the-loop, audit trail, hash chain, Daytona, SoftwareForge, sandboxed execution, hackathon, qte77
image: /images/ledgerline-audit-trail.png
categories: [agents, ai, tooling]
---

**TL;DR.** At the [SF Enterprise Hackathon][luma] (2026-08-14, one-day sprint, build on
[SoftwareForge][forge] and run on [Daytona][daytona]) I built **[Ledgerline][repo]** — a
cross-system sync agent whose every write is authorised by a human *before* it happens and
permanently traceable *after*. The interesting part isn't the sync. It's that the governance
is enforced **structurally**, not by convention: the downstream write endpoints physically
cannot be called without a token that only an approval mints.

![The Ledgerline audit trail: a SHA-256 chain marked verified, and one record traced back
through its authorising order to the approver, the sandbox, and the code that ran][audit]

## The problem nobody actually has trouble solving

A new customer is typed into the CRM by sales, re-typed into the ERP by operations, then
exported into a spreadsheet by finance. **The same facts, keyed three times.** Survey evidence
puts manual data transfer at [over nine hours per week per employee][parseur] — and
[66% of organisations][ifol] still hand-key invoice data into ERP. *(Both vendor-commissioned.
Directional, not precise — I'd rather label that than launder it.)*

Point-to-point integrations solve this. RPA solves this. Neither gets adopted, because both
**write autonomously**, and no finance or compliance owner grants an autonomous process write
access to a system of record without an answer to *"who approved this, and what exactly did it
do?"* So the integration gets scoped down to read-only, or shelved — and the re-keying
survives.

**The blocker is governance, not capability.** That's the whole thesis.

## The work order

Every propagation is a discrete, reviewable unit: target system, field-level before/after diff,
the derivation rationale, and **the exact code that will run**. Nothing is written until a human
authorises it. There is deliberately no auto-approve mode — human authorisation is the feature,
not a limitation to remove in v2.

Three invariants, each enforced by construction rather than by discipline:

| Property | How it's actually enforced |
|---|---|
| No write without an authorised order | ERP and Accounting endpoints require a **single-use token minted only inside `approve()`**. A direct write returns `403`. Replaying a token, forging one, or using one issued for a different target all fail. |
| Generated code never runs in-process | A **Daytona sandbox is created per authorised order** and destroyed after it. Both states are read back *from Daytona* and stored in the trail. |
| The trail is append-only | SQLite triggers reject `UPDATE` and `DELETE`; a **SHA-256 hash chain** catches tampering that bypasses the triggers. The verifier is re-run server-side on every read. |

That last row matters more than it looks. A test that drops the trigger and edits a row
underneath it still fails, because the chain doesn't care about your database permissions.

## What the hackathon actually asked for

The [problem statement][pdf] weighted judging at **40% working prototype, 30% real use of both
platforms, 20% impact, 10% presentation**, and warned explicitly against "a one-off import" —
judges were told to look for both platforms used *throughout* the build, not bolted on at the
end. That constraint shaped the design: Daytona isn't where the app happens to be hosted, it's
where agent-generated code is *allowed to execute*. Remove it and the security property is gone.

Forge produced the spec pipeline — Intent → BRD → PRD → Architecture → UI Design, including
eight fully-designed screens as standalone HTML. The audit-trail screen shipped as a static
mockup with six hardcoded rows; wiring it to the real trail is what turned "the governance is
true in the backend" into "the governance is visible on screen," which is the only version an
auditor can use.

## Three things that went wrong, honestly

**Forge's architecture picked a stack I didn't build.** It selected Node/TypeScript/Fastify,
PostgreSQL 16, NATS JetStream, Redis, Vault, Terraform — a sound enterprise design, written
against an explicitly stated *five-week Phase 1* premise. The hackathon is one day. I kept its
domain decomposition and every governance property, and substituted Python/FastAPI/SQLite/Daytona.
That deviation is recorded in the module docstring, the commit, and the plan — because the
failure mode here isn't choosing differently, it's choosing differently and letting the next
reader assume the doc was followed.

**A deployed instance can't execute work orders.** Daytona rejects sandbox-to-sandbox toolbox
traffic on this account tier: *"Network access is restricted and cannot be overridden at the
sandbox level"* ([network limits][limits]). The nested sandbox **is** created — its `code_run`
connection is then reset. Run Ledgerline outside a sandbox and the full loop works. The README
says this plainly rather than implying the hosted demo does everything.

**`GET /sandbox` lies.** With a sandbox alive and `STARTED`, the list endpoint returns
`200 {"items": []}` — every variant of it, plus the SDK's `list()`. `GET /sandbox/{id}` returns
the full record. I spent real time believing sandboxes weren't being created, because the
obvious way to check was the broken one. The lesson generalises: **verify by identifier, never
by list** — an empty list is not evidence of absence, it's evidence that one query returned
nothing.

## What's in the repo

Python/FastAPI, one module for the agent, the eight Forge screens, and a test layer that gates
on the things that matter: 16 governance invariants (no credentials needed, so CI runs them),
14 end-to-end checks against **real** Daytona sandboxes, and 17 browser checks driving the audit
screen at two viewports with console errors treated as failures. Deploy and snapshot are one
script. Screens are published to [GitHub Pages][pages] so the link outlives the sandbox.

[Source][repo] · [Screens][pages]

[repo]: https://github.com/qte77/2026-08-14-SF-AWS_EnterpriseHack
[pages]: https://qte77.github.io/2026-08-14-SF-AWS_EnterpriseHack/
[luma]: https://luma.com/ev9ndfke
[forge]: https://softwareforge.ai/
[daytona]: https://www.daytona.io/
[limits]: https://www.daytona.io/docs/en/network-limits/#tier-based-network-restrictions
[parseur]: https://www.prnewswire.com/news-releases/survey-manual-data-entry-costs-american-companies-more-than-28-000-per-employee-each-year-302516867.html
[ifol]: https://acarp-edu.org/accounts-payable-automation-trends-2025/
[pdf]: https://github.com/qte77/2026-08-14-SF-AWS_EnterpriseHack/blob/main/assets/2026-08-14%20SF%20Enterprise%20Hackathon%20Problem%20Statement.pdf
[audit]: /images/ledgerline-audit-trail.png
