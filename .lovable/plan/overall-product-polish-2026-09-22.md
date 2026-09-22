# Overall Product Polish

A pass across every page to make the product feel consistent, finished and easy to follow — no new features, no backend changes.

## 1. Visual consistency
- Unify page headers: same title size, icon treatment, subtitle tone on Simulator, Warmup, Dashboard.
- Standardise card padding, spacing between sections, and rounded corners so pages stop drifting apart.
- Replace ad-hoc colour usage (e.g. hard-coded success colours in warmup cards) with shared theme tokens so light and dark both look right.
- Consistent badge styles for risk/status labels (risk levels, plan status, blacklist results).

## 2. Landing page
- Tighten hero wording to one clear promise plus one supporting line, and make the primary button the obvious next step.
- Even rhythm between sections (problem, how it works, features, pricing, call to action) with consistent heading sizes and spacing.
- Add gentle entrance and hover motion so the page feels alive without being busy.

## 3. Wizard and results (Simulator)
- Clearer step indicator with completed/current/upcoming states and the ability to go back without losing entries.
- Friendlier validation messages telling the user exactly what is missing instead of generic errors.
- Results section grouped into "what's wrong", "why it matters", "what to do next" so the advice is actionable.

## 4. Dashboard and Warmup
- Consistent empty states with a short explanation and one action button.
- Consistent loading states (skeleton placeholders instead of blank areas or plain "Loading…" text).
- Plain-language labels: replace shorthand like "BR" with "Bounce rate", and explain the 2% threshold inline.
- Tidy the warmup plan card: summary always visible, charts and history behind one clear toggle.

## 5. Mobile and accessibility
- Check every page at phone width: no horizontal scrolling, readable text, tappable buttons, working mobile menu.
- Charts and tables stay usable on small screens.
- Keyboard focus visible on all controls, labels on all inputs, meaningful alt text and button labels.

## 6. Copy and trust details
- One consistent voice across headings, buttons and toasts; fix any leftover placeholder or duplicated wording.
- Confirm the browser tab title, description and social preview text match the product.
- Friendly 404 page with a route back to the main pages.

## Technical notes
- Work stays in presentation code: `src/index.css` tokens, Tailwind config, landing sections, wizard steps, warmup components, Dashboard, Header/Footer, NotFound, `index.html` metadata.
- No database, edge function, auth or business-logic changes.
- Verify with a browser pass on `/`, `/simulator`, `/dashboard`, `/warmup` at desktop and mobile widths, checking for console errors.

## Open item
- Product naming: the plan keeps the current name. If you want a rename, tell me the new name and I will fold it into this pass.
