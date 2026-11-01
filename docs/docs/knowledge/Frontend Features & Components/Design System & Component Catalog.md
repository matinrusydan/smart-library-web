# Design System & Component Catalog

## Source of truth
Target visual reference: Figma file `Smart-Library` (`kNDLPmgGdLgo3AKQn8FEyk`), page `Version 2` (`153:54`). Phase 0 tokens were transcribed from `Smart-Library-Figma/smart-library/assets/tokens.css`; local CSS documents layout and component conventions. These files are not proof of live Figma parity. Exact 1:1 verification remains an explicit gate.

## Token architecture
`src/styles/tokens.css` is the central source for semantic colors, typography, spacing, radii, layout, sidebar, icon sizes, and shadows. Tailwind CSS v4 utilities are mapped to semantic variables via `@theme inline` in `src/app/globals.css`. Theme switching changes semantic values using `data-theme`; consumers should reference token-backed utilities rather than embed repeated values. The black overlay token remains constant across themes.

## Global components
- `Button`: primary, ghost and danger actions
- `Field`: labeled input/select composition
- `Badge`: neutral/success/danger status
- `Panel`: standard surface container
- `DataTable`: data-driven columns and rows
- `Pagination`: range and previous/next controls
- `Modal`: native dialog and themed 50% scrim
- `AppShell`, `Sidebar`, `Topbar`: shared application composition

Feature-specific compositions should remain local to their feature. Promote a local component only when a stable pattern is shared by multiple features.

## Current showcase
`src/features/design-system/Showcase.js` demonstrates tokens and components with in-memory fixture rows. Fixtures are for UI demonstration only and must never be treated as application/business data.

## Figma-specific interaction requirements to validate
- Modal uses an overlay over the underlying page; page content remains visible beneath a 50% dark scrim.
- Filter bars align controls to the bottom and must grow to fit the tallest child.
- Light/Dark is token-driven, not duplicated page markup.
- Compare at the same viewport and record any remaining mismatches before calling parity complete.
