---
layout: post
title: A $150 Pipetting Robot from a Stock 3D Printer
description: >-
  Build a 96-well pipetting robot for ~$150 from a used Anycubic i3 Mega and a
  DLAB dPette+ — unmodified Marlin firmware, Python host control. Apache-2.0.
excerpt: Turn a used Anycubic i3 Mega + a DLAB dPette+ electronic pipette into a 96-well disposable-tip pipetting robot. Marlin runs unmodified. Python drives. Apache-2.0.
keywords: pipetting robot, lab automation, 3D printer hack, Anycubic i3 Mega, dPette, Marlin firmware, Python, biolab, open hardware
categories: [biolab, automation, hardware, python]
---

**TL;DR.** [`i3mega-pipettebot`][repo] turns a used [Anycubic][anycubic] i3
Mega 3D printer plus a [DLAB][dlab] dPette+ electronic pipette into a
disposable-tip 96-well pipetting robot. Total reference build: **~$150**.
[Marlin][marlin] firmware runs **unmodified** — the print head and PCB are
physically removed; the chassis becomes a bare 3-axis gantry with the
pipette mounted on the carriage. A separate USB-serial link talks to the
pipette. Python drives both. Apache-2.0. Also supports the [Geeetech][geeetech]
A30 (Smartto firmware) via the same library.

![dpette+i3 (i3 Mega) pipetting robot — full cycle][cycle-gif]

## The cost gap

Commercial pipetting robots start at five figures. Even the well-loved
open-source builds start near a grand. Pipettebot collapses the gap:

| Solution                                         | Cost           | Tips         | API control |
| ------------------------------------------------ | -------------- | ------------ | ----------- |
| **i3 Mega (used) + dPette (new) + this repo**    | **~$150**      | Disposable   | Python      |
| **A30 (used) + dPette (new) + this repo**        | **~$200**      | Disposable   | Python      |
| [Science Jubilee][sj] + OT-2 pipette toolhead    | ~$900+ build   | Disposable   | Python      |
| [Opentrons OT-2][ot2]                            | from $15,950   | Disposable   | Python      |

Sources: Opentrons price is the vendor list; Jubilee figure is a community
build estimate anchored at the [Science Jubilee project][sj]
([OT-2 pipette toolhead build][sj-pipette]). Used i3 Mega and dPette
prices are market estimates from secondary listings (no canonical source —
verify locally).

Disposable tips matter: cross-contamination is the failure mode that kills
amateur lab automation. The dPette+ uses the standard SBS-pitch tip stack.

## The hack

The insight: a consumer FDM printer is already a precise 3-axis motion
platform. The only parts you don't need are the print head, hotend, and
extruder PCB. Strip those, mount the pipette on the bare carriage, and you
have a gantry that can move a tool to any (x, y, z) in the build volume.

Firmware stays stock. No [Klipper][klipper] flash, no Marlin patch, no
Arduino work. The PC is the host:

```
host (Python)
   │
   ├──→ /dev/ttyUSB0  ──→  Marlin (gantry, G-code over 250000 baud)
   │
   └──→ /dev/ttyUSB1  ──→  dPette+ (pipette, USB-serial)
```

The library auto-discovers firmware family from `M115` and dispatches per
platform: plain `G28` on Marlin/i3, polled-Z descent on Smartto/A30 (stock
`G28 Z` is broken on A30). Calling code just writes `bot.move_to(x, y, z)`
and `bot.aspirate(volume)` — the family-specific quirks are isolated in a
`safe_home` dispatcher.

## Pipette as a Protocol

The pipette interface is `_Pipette` (Python `Protocol`). The dPette+ is the
reference implementation, wired in via [`dpette-usb-driver`][driver] by
Lambda-Biolab.

Swapping in a multichannel head or an open-source pipette is a matter of
writing a new adapter against the protocol. The gantry side does not
change.

## What runs

After hookup, preflight (no motion sent, just firmware probe):

```bash
uv run tools/preflight.py
```

The canonical end-to-end demo — full 96-well plate fill with real
aspirate/dispense at the dPette+:

```bash
uv run examples/showcase_v0_i3_full_pipettebot.py
```

Gantry-only mode runs if `PIPETTE_PORT` is unset (motion executes for real,
aspirate/dispense are log-only stubs). Useful for cabling bring-up before
the pipette arrives. Project tooling uses [`uv`][uv] by Astral.

Experiment profiles (TOML) drive cycle counts, per-cycle volumes, and
reservoir gradient notes. Motion profiles (SLOW / MID / FAST) tune gantry
acceleration via M203/M201/M204/M205 for liquid-handling-friendly moves.

## Companion tools

A pipetting robot is one node in a wet-lab loop. Two siblings cover the
gaps:

- [`so101-biolab-automation`][so101] — dual SO-101 robot arm that
  retrieves the used-tips bin from the deck after the i3 homes. The gantry
  is precise but rigid; the arm is flexible but less precise. Different
  failure modes, complementary.
- [`CellPlateVision`][cpv] — image-based confluence estimation for round
  Petri dishes, with [eLabFTW][elabftw] ELN integration. Closes the loop
  on the *outcome* side: pipette → grow → image → measure → report.
  OpenCV / Cellpose / Fiji backends; Apache-2.0.

## Limitations

The repo is honest about what's out of scope:

- No deck library, no soft limits, no calibration auto-routine yet — caller
  passes raw `(x, y, z)`.
- Aspirate verification (Hamilton-style MAD / TADM pressure monitoring) is
  surveyed in the repo but not implemented.
- Stage 1+ firmware integration (modified Marlin, UART tap to dPette) is
  deliberately out of scope for the PC-as-host architecture.

The thesis: pipetting cycles are slow (seconds per move, seconds per
aspirate); USB-serial round-trip latency (~20–50 ms) doesn't matter. PC
hosting buys you Python's ecosystem at near-zero motion-control cost.

## Why this matters

A wet-lab person can stand up a working pipetting robot for the price of a
used 3D printer and a used pipette. That's a different ceiling from "buy an
Opentrons or write a grant." Disposable tips solve the cross-contamination
foot-gun. Python on a host PC means existing analysis code reaches the
deck.

## Quick answers

**How much does the reference build cost?** ~$150 — a used Anycubic i3 Mega
plus a DLAB dPette+. The A30 variant is ~$200.

**Do I need to flash custom firmware?** No. Marlin (on the i3 Mega) and
Smartto (on the A30) run unmodified. The print head and PCB come off the
carriage; everything else stays stock.

**Does it use disposable tips?** Yes. The dPette+ uses standard SBS-pitch
disposable tips. Cross-contamination is the failure mode that kills amateur
lab automation; disposable tips solve it directly.

**Can I use a different pipette?** Yes. The pipette interface is a Python
`Protocol` (`_Pipette`). Writing a new adapter for a multichannel head or
an open-source pipette doesn't touch the gantry side.

**Does it work with other 3D printers?** Currently i3 Mega (Marlin) and
Geeetech A30 (Smartto) are first-class. The library auto-detects firmware
family from `M115` and dispatches per platform.

**What's the license?** Apache-2.0.

## Acknowledgements

- **Lambda-Biolab** for [`dpette-usb-driver`][driver].
- The **Science Jubilee** community for the open-source liquid-handling
  reference build.
- The **Marlin** firmware project — the unmodified target this build
  depends on.

[repo]: https://github.com/qte77/i3mega-pipettebot
[cycle-gif]: https://raw.githubusercontent.com/qte77/i3mega-pipettebot/main/assets/images/dpette%2Bi3_full_cycle.gif
[driver]: https://github.com/Lambda-Biolab/dpette-usb-driver
[so101]: https://github.com/qte77/so101-biolab-automation
[cpv]: https://github.com/lambda-biolab/CellPlateVision
[elabftw]: https://www.elabftw.net/
[sj]: https://science-jubilee.readthedocs.io/en/latest/
[sj-pipette]: https://science-jubilee.readthedocs.io/en/latest/building/pipette_tool.html
[ot2]: https://opentrons.com/products/ot-2-robot
[marlin]: https://marlinfw.org/
[klipper]: https://www.klipper3d.org/
[uv]: https://docs.astral.sh/uv/
[anycubic]: https://www.anycubic.com/
[geeetech]: https://www.geeetech.com/
[dlab]: https://www.dlabsci.com/
