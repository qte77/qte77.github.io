---
layout: post
title: Building a Trustworthy Agent Loop for a Physical Lab
description: >-
  An open, sub-$1k self-driving lab: an autonomous perceive→decide→act→record
  agent loop on real lab hardware. The motion layer ships; the decide-agent is next.
excerpt: We build autonomous, self-evaluating agents — and we're building the hardest version of that idea, an open sub-$1k self-driving lab. This is the thesis, the plan, and the one piece that already ships. The AI scientist's missing half is the agent, not the model.
keywords: self-driving lab, autonomous agents, agent loop, lab automation, biolab, pipetting robot, agent evaluation, AI scientist, open hardware, qte77
image: /images/agent-loop-diagram.png
categories: [agents, ml, biolab, automation]
---

**TL;DR.** We build autonomous, self-evaluating agent systems. We are now building the hardest version of that idea — an open, sub-$1k self-driving lab whose goal is a closed `perceive → decide → act → record` loop an agent runs unattended. Being honest about stage is part of the point: today the **motion layer ships** (a working pipetting gantry, hardware-validated — [`i3mega-pipettebot`][pipettebot]) and our **software-side evaluation framework is real** ([`Agents-eval`][agents-eval]); the **closed, agent-decided loop is the next step** — not a result we are reporting. This post is the thesis and the plan, with the one piece that already works. The AI scientist's missing half is not the science model; it is the agent: autonomous enough to execute, trustworthy enough to believe.

![The target agent loop for a physical lab — perceive, decide, act, record — with honest per-step status][loop-diagram]

## The thesis

Building an agent that plans and executes in software is tractable. The hard problems are downstream: Does the agent know when to stop? Can you verify its output without re-running the whole thing? When it fails, does it fail loudly or silently? Does your evaluation catch the difference between an agent that got lucky and one that actually learned?

Software environments are forgiving. A physical lab is not — reagents run out, hardware drifts, a measurement that looks wrong might be wrong or the sensor might be. So the test we set ourselves is whether our agent loop — the same perceive, decide, act, record architecture we use in software — can be made to survive contact with a bench. That is the bet this project exists to settle.

## What's real today

We are deliberate about not reporting results we do not have. Two things are genuinely shipped:

- **The motion layer.** [`i3mega-pipettebot`][pipettebot] turns a ~$150 repurposed 3D printer into a pipetting gantry, with real aspirate/dispense demonstrated on hardware (i3 Mega and Geeetech A30), 121 tests, and tagged releases. It moves a pipette to any well and dispenses. That part works — [full build write-up][pipettebot-post].
- **The evaluation discipline, on the software side.** [`Agents-eval`][agents-eval] is our multi-agent evaluation framework — objective, multi-tier scoring of agent outputs. Our "do not trust an agent you cannot evaluate" stance is already code there, not aspiration.

A third piece is scaffold, and we will call it that: [`so101-biolab-automation`][so101] runs its workflow layer in software stub-mode and ships an eLabFTW client module — but its own README opens with "PROTOTYPE — hardware untested, CAD approximate." It is not a validated robot yet.

This post also isn't about our computational discovery work — the in-silico side (docking, ADMET, molecular dynamics) runs separately. Here the focus is the harder, still-open half: closing an autonomous loop on a physical bench.

## What we're building

The self-driving lab is a build in progress. The target loop, with honest status on each link:

```
perceive  →  our vision tooling reads the dye signal per well           [building]
decide    →  an agent picks the next pipetting volumes from the read    [the core build — does not exist yet]
act       →  the gantry pipettes those volumes                          [shipped]
record    →  reads + decisions stream to an eLabFTW notebook            [client exists; wiring it in is part of the build]
            └─ repeat until the agent judges the plate converged        [the goal]
```

The honest center of gravity is the **decide** step — an agent that picks volumes live from measurements instead of running a script. It is the piece we are building, and it does not exist yet; the perception it would read from — our own vision tooling, [CellPlateVision][cpv] (image-based plate perception) or [vlm-toolkit][vlm] (a YOLO-to-GGUF-VLM pipeline, currently draft, pre-`v0.1.0`) — still has to be pointed at the dye readout and wired in. The closed loop has not run. Our target for a successful run is to converge a well to within ±5% of a dye-signal target in three or fewer iterations, unattended — the goal we are building toward, not a measured result.

The testbed is food dye, read by camera: safe, vivid, fume-hood-free, and enough to prove the one thing that matters — that an agent can drive a measurement to a target without being told how. We are automation and agent engineers, not wet-lab scientists; our drug-discovery work is the separate computational pipeline noted above, and this physical lab loop makes no wet-lab assay claims — its testbed is food dye.

## Why this is an agent problem, not a control problem

Classical lab automation is scripted: you specify volumes, sequences, timing; the instrument executes. There is no decision — only execution.

What we are building is different, and it is why we frame it as an agent problem. The volumes are not known in advance; the agent has to observe the plate, compute what to do next from what it measured, and decide when the plate has converged well enough to stop. That structure — observe, plan, act, self-evaluate, stop when done — is the same one we use in every other agent system we build. The lab just makes the stakes concrete: a wrong decision wastes reagent, time, and a plate well. There is no undo.

## The questions we're designing the decide step around

These are not solved; they are the design constraints we are building against:

**When does the agent stop?** A premature stop wastes a plate; a late stop wastes reagent. The stopping condition has to be a judgment, not just a fixed threshold — "close enough" versus "converged."

**How does it trust a measurement?** A single absorbance reading could be a bad drop, a bubble, or a real result. The agent should flag anomalies and request a re-read rather than accept noise as signal — hallucination detection, instantiated in hardware.

**How do you evaluate the run?** This is where [`Agents-eval`][agents-eval] comes in: the discipline of scoring an agent's decision trace, not just its final answer, is the part of our software work we intend to carry directly onto the bench. Bringing per-run cost accounting across is the same kind of carry-over — intent informed by our software agents, not a feature of this lab yet.

## Honest status

To be unambiguous about maturity:

- The **closed loop has not run** end-to-end. Today is the start of the build.
- **Shipped:** the gantry motion library; the software-side evaluation framework.
- **Building:** dye-signal perception (perceive) via our own vision tooling — [CellPlateVision][cpv] or [vlm-toolkit][vlm] (the latter draft, pre-`v0.1.0`) — the agent that decides volumes (decide), the integration connecting them, and ELN logging wired into the loop.
- The `so101` arm hardware is an **untested prototype**; a private plate-reader REST wrapper (`wallac-victor2-api`) is planned for the remote-instrument path and not a verifiable claim here.
- Run-level decision-trace scoring and per-iteration cost tracking are **disciplines we bring from our software work** — applying them to this lab is intent, not yet implemented here.

## The gap we're building into

If we close the loop, this is the space it fills — cheap, open, and *autonomous*, which is the combination nobody currently serves:

| System                          | Cost           | Open-source | Autonomous decisions |
| ------------------------------- | -------------- | ----------- | -------------------- |
| Opentrons OT-2                  | from $15,950   | no          | no (scripted)        |
| Science Jubilee + pipette       | ~$900+ build   | yes         | no                   |
| **This stack (target)**         | **sub-$1k**    | **yes**     | **the build goal**   |

Managed cloud labs clear five figures a year and are still scripted, not agent-autonomous. The cost and openness are already true of the shipped gantry; the *autonomous decisions* column is exactly what the build is for. (Opentrons figure is vendor list; Jubilee is a community build estimate; verify locally.)

## Where this goes

The proof point we are working toward is a single closed loop: one live convergence on a target, end-to-end and unattended, from a blank plate.

The bigger picture: the AI-scientist conversation concentrates almost entirely on the science model — structure prediction, generative chemistry, literature synthesis. The infrastructure for that model to actually *do* science is largely missing. Running an experiment is not a single tool call; it is a multi-step agent problem with physical stakes, measurement noise, and decisions that need auditing after the fact.

This lab is not the drug-discovery pipeline — that runs separately, in silico. Here we are building the agent infrastructure a discovery pipeline needs at the bench — a loop that can plan an experiment, execute it on real hardware, evaluate its own output honestly, and report results an operator can trust. That is the problem we know how to work on. The lab is where we are testing whether our answer holds — and we will report what it does, not what we hoped.

## Quick answers

**Has the loop run yet?** No. The gantry ships and our evaluation framework is real; the closed, agent-decided loop is the next step. We do not report results we do not have.

**What is actually built?** The pipetting gantry (hardware-validated) and the software-side evaluation framework. The colorimeter and the decide-agent are the next step.

**Is this drug discovery?** This lab loop is agent infrastructure — testbed is food dye, not assays. (Our computational discovery work runs as a separate in-silico track.)

**Why publish before it runs?** Because the thesis and the design are the point, and because being honest about stage is the same discipline we apply to agents.

## Acknowledgements

- The **Science Jubilee** community for the open-source liquid-handling reference.
- **eLabFTW** for the open electronic lab notebook.
- The **Marlin** firmware project — the unmodified target the gantry depends on.

[loop-diagram]: /images/agent-loop-diagram.svg
[agents-eval]: https://github.com/qte77/Agents-eval
[pipettebot]: https://github.com/qte77/i3mega-pipettebot
[pipettebot-post]: /pipettebot-sub-150-pipetting-robot/
[so101]: https://github.com/qte77/so101-biolab-automation
[cpv]: https://github.com/lambda-biolab/CellPlateVision
[vlm]: https://github.com/qte77/vlm-toolkit
[sj]: https://science-jubilee.readthedocs.io/en/latest/
[ot2]: https://opentrons.com/products/ot-2-robot
