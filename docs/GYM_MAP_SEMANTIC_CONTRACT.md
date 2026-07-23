# Gym map semantic contract

`contracts/gym-map-semantics.json` is the durable identity registry shared by the planner's iPad app, Mac editor, schedule mapping, and future map renderer. It is deliberately a semantic contract, not a drawing file.

## What is authoritative now

- The owner-supplied `GYM LAYOUT.pdf` and `GYM LAYOUT ZONES.pdf` establish labels, zone identity, selectable versus landmark status, and stated group relationships.
- The PDFs do **not** establish physical coordinates, dimensions, scale, rotation, z-order, or exact visual placement. The owner reported visual displacement in the PDF export.
- The owner-provided Skeleton Freeform board is the only authority for physical geometry. The bounded first pass is in `contracts/gym-layout-geometry-draft.json`; it references the durable IDs in this registry rather than inventing new names.

This keeps a bad PDF export from becoming a bad permanent gym map while letting planning use the real language of the gym immediately.

## Consumer rules

| Situation | Required behavior |
| --- | --- |
| A user taps a library card to place it | Offer only `placementEligible: true` zones currently valid for the phase; never offer a landmark. |
| A user selects `FX` | Expand it to the four child floor slices in the declared F4, F3, F2, F1 order. Cards belong to a slice, not the FX container. |
| A user selects TS or Tumble Track | Treat them as separate physical destinations. TS always means **Tumble Strip**. |
| A schedule says `PBHB` or `SRPH` | Resolve the named composite group and render one combined board containing its member-zone overlays. It is not an extra third station. |
| Multiple named zones overlap on the finished map | Preserve each ID; overlap is valid and does not merge destinations. |
| Two zones share a visible label | Preserve separate IDs. Beam 2 A/B remain separate until the owner confirms better names. |

## Geometry handoff

`contracts/gym-layout-geometry-draft.json` holds the geometry-only record from the available Skeleton Freeform board. The currently confirmed sections are FX/F4–F1, SR, PH, HB, the two-shape PB draft, Tumble Strip, and Vault. It must not change the semantic meanings above without an explicit owner review.

Clients may render high-confidence geometry, preserve PB/HB and SR/PH as combined views, and use labeled fallback panels for intentionally unmapped areas. They must not recreate any remaining geometry from the PDF export.
