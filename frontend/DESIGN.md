---
name: Token on Air
description: Understand what’s next.
colors:
  paper: "#f7f3e9"
  ink: "#171717"
  red: "#c92032"
  muted: "#615b53"
  line: "#c9c2b6"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Georgia, serif"
    fontSize: "19px"
    lineHeight: 1.85
spacing:
  gutter: "40px"
  mobile-gutter: "20px"
---

# Token on Air visual system

## Overview

Founder-approved reference: ../docs/design/token-on-air-newsroom-concept.html; original Persona-inspired newsroom, no game imagery or logos.

## Colors

Palette: paper #f7f3e9; ink #171717; red #c92032; muted text #615b53; separator #c9c2b6. Dark column secondary text #d2c5b4. Red is a navigation/accent color, never the sole topic indicator.

## Typography

Type: self-hosted Barlow Condensed Bold (SIL OFL, frontend/public/fonts/OFL.txt) for masthead, headlines and section titles. Arial and regional sans fallbacks for controls/decks; Georgia with regional serif fallbacks for upright article text. Body text 19px desktop/18px mobile, 1.85 paragraph line height, max 68ch. Heading tracking stays at or above -.025em.

## Layout

Composition: max 1320px shell; desktop 40px gutters, tablet 24px, mobile20px. Lead/latest split 1.7:1; equal AI/Crypto columns; single column under640px. A cutout masthead and red/black typographic artwork supply identity when no licensed lead image exists. Latest headlines use an ink panel; no fabricated time-relative urgency or story counts. Analysis appears only with matching real records.

## Components

Articles: quiet upright body; expressive title; visible editor, timestamps, sources, commercial disclosures and corrections. Fixture and private-preview notices remain explicit. Language and signup controls are deferred until their behavior exists.

Interaction: semantic links, main navigation current-state, skip link, visible3px focus, high-contrast selection, reduced-motion-aware short color transitions. No client framework, animation library or runtime font request introduced by this slice.

Verification: build/type checks and HTTP smoke passed. Rendered visual comparison, narrow-viewport overflow and keyboard browser checks remain outstanding because T3 preview is blocked by host AppArmor. Do not treat responsive CSS as measured browser evidence.
