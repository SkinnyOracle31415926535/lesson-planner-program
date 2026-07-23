# Station-board reference images

## Intent

The owner supplied these exact cropped gym-board images on 2026-07-19 after
identifying that automatic crops from the larger layout were frequently wrong.
For a listed station, the app must display this reference image as-is. It must
not apply `object-fit: cover`, re-crop it, or substitute another part of the
gym diagram.

Every direct board uses the same compact 16:10 lesson-plan canvas, regardless
of whether its source is narrow, square, or panoramic. The image remains fully
visible at its original ratio inside that frame; it is letterboxed, never
cropped. Placement coordinates are projected into the outer plan canvas, where
the label and active-placement targets are clamped inside the visible bounds.
Nearby placed labels receive a small vertical lane rather than overlapping.

The browser copies live in `web-editor/public/station-boards/`. They are
private local app assets, not imported vault media or student media.

| Local board key | Asset | Intended presentation |
| --- | --- | --- |
| `f6` | `f6.png` | F6 |
| `wr` | `wr.png` | Weight Room |
| `sr-ph` | `sr-ph.png` | Still Rings + Pommel Horse |
| `rings` | `sr.png` | Still Rings |
| `ph` | `ph.png` | Pommel Horse |
| `hb` | `hb.png` | High Bar |
| `pb` | `pb.png` | Parallel Bars |
| `pb-hb` | `pb-hb.png` | PB + HB |
| `beam-1` | `beam-1.png` | Beam 1 |
| `beam-2` | `beam-2.png` | Beam 2 |
| `beam-all` / `beam` | `beam-all.png` | All Beams |
| `fx` | `fx.png` | Full Floor (FX-only) |
| `fx-ts` | `fx-ts.png` | FX + Tumble Strip |
| `f5` | `f5.png` | Floor 5 |
| `ts` | `ts.png` | Tumble Strip |
| `vault` | `vault.png` | Vault |
| `pit-pb` | `pit-pb.png` | Pit PB |
| `pit-highbar-rings-pb` | `pit-highbar-rings-pb.png` | Pit High Bar + Rings + PB |
| `ub1-ub2-strap` | `ub1-ub2-strap.png` | UB1 + UB2 + Strap Bar |
| `pit-strap` | `pit-strap.png` | Pit + Strap Bar |
| `trampoline` | `trampoline.png` | Trampoline |
| `tumble-track` | `tumble-track.png` | Tumble Track |
| `ub3` | `ub3.png` | UB3 |
| `preschool` | `preschool.png` | Preschool |

## Remaining mapping note

- **F6 semantic mapping:** the browser uses the established local
  `zone-ninja-room` anchor set for placement only. `F6` is the owner-facing
  board name; a durable schedule/semantic alias remains a separate review.

The yellow-anchor contract remains a placement layer. The visible board image
comes from this reference registry, while empty anchors remain hidden outside
an explicit place action.
