import type { StationEquipment } from "./station-equipment-catalog";

type StationPixelSpriteProps = {
  equipment: StationEquipment;
  className?: string;
};

const PIXEL_RISE_PER_METER = 24;

/**
 * V2 stores a footprint but not a user-selected height for adjustable
 * equipment. Use the catalog's verified maximum as the physical silhouette,
 * matching the clearance-oriented height already shown by the maker. The
 * minimum remains in the markup so a future adjustable-height control can
 * use the same measured range without inventing a dimension.
 */
export function stationPixelProjection(equipment: StationEquipment) {
  const minimumHeight = equipment.dimensions?.heightMin ?? 0;
  const maximumHeight = equipment.dimensions?.heightMax ?? 0;
  const rise = Math.round(maximumHeight * PIXEL_RISE_PER_METER);

  return {
    minimumHeight,
    maximumHeight,
    rise,
    // A taller object blocks more of the upper-left light, so its grounded
    // pixel shadow reaches farther down and right on the same dimetric plane.
    shadowRunX: 2 + Math.ceil(rise / 4),
    shadowRunY: 1 + Math.ceil(rise / 8),
  };
}

/**
 * Original, grid-aligned equipment art for the meter-scale station scene.
 * Every sprite uses the same 3/4 dimetric view: light from upper left, a
 * grounded shadow down/right, then the equipment's top and shaded side.
 */
export function StationPixelSprite({ equipment, className = "" }: StationPixelSpriteProps) {
  const projection = stationPixelProjection(equipment);
  const common = <polygon className="station-pixel-shadow" points={`19,68 84,50 ${113 + projection.shadowRunX},${62 + projection.shadowRunY} ${49 + projection.shadowRunX},${86 + projection.shadowRunY}`} />;
  const sprite = equipment.profile === "incline" ? (
    <>
      {common}
      {/* The sloped top starts at the verified tall end; the face stays
          grounded, so a taller measured wedge becomes visibly taller. */}
      <polygon className="station-pixel-side" points={`24,${58 - projection.rise} 89,${40 - projection.rise} 103,${51 - projection.rise} 39,${71 - projection.rise}`} />
      <polygon className="station-pixel-incline-face" points={`24,${58 - projection.rise} 89,${40 - projection.rise} 89,48 39,66 24,61`} />
      <polygon className="station-pixel-incline-top" points={`24,${58 - projection.rise} 74,${44 - projection.rise} 89,${40 - projection.rise} 39,${58 - projection.rise}`} />
      <polygon className="station-pixel-highlight" points={`28,${57 - projection.rise} 73,${45 - projection.rise} 78,${47 - projection.rise} 33,${59 - projection.rise}`} />
      <rect className="station-pixel-seam" x="43" y={56 - projection.rise} width="3" height={4 + projection.rise} />
    </>
  ) : equipment.profile === "vault" ? (
    <>
      {common}
      {/* The table and the top of each support rise from a fixed floor line.
          The feet remain grounded, which makes the catalog height legible. */}
      <polygon className="station-pixel-vault-leg-dark" points={`41,${72 - projection.rise} 55,${76 - projection.rise} 55,69 43,73`} />
      <polygon className="station-pixel-vault-leg" points={`55,${76 - projection.rise} 70,${72 - projection.rise} 70,65 55,69`} />
      <polygon className="station-pixel-vault-brace" points={`45,${91 - projection.rise} 69,${83 - projection.rise} 72,${88 - projection.rise} 47,${97 - projection.rise}`} />
      <polygon className="station-pixel-vault-side" points={`24,${60 - projection.rise} 84,${49 - projection.rise} 103,${61 - projection.rise} 45,${74 - projection.rise}`} />
      <polygon className="station-pixel-vault-top" points={`24,${60 - projection.rise} 66,${46 - projection.rise} 84,${49 - projection.rise} 45,${64 - projection.rise}`} />
      <polygon className="station-pixel-vault-light" points={`31,${59 - projection.rise} 65,${49 - projection.rise} 73,${50 - projection.rise} 40,${61 - projection.rise}`} />
      <rect className="station-pixel-seam" x="50" y={64 - projection.rise} width="4" height="6" />
    </>
  ) : equipment.profile === "trainer" ? (
    <>
      {common}
      <polygon className="station-pixel-trainer-side" points={`24,${55 - projection.rise} 91,${38 - projection.rise} 104,${51 - projection.rise} 39,${71 - projection.rise}`} />
      <polygon className="station-pixel-trainer-top" points={`24,${55 - projection.rise} 77,${41 - projection.rise} 91,${38 - projection.rise} 39,${57 - projection.rise}`} />
      <polygon className="station-pixel-trainer-stripe" points={`39,${51 - projection.rise} 47,${49 - projection.rise} 94,${43 - projection.rise} 87,${46 - projection.rise}`} />
      <polygon className="station-pixel-trainer-stripe" points={`31,${58 - projection.rise} 39,${56 - projection.rise} 93,${42 - projection.rise} 86,${45 - projection.rise}`} />
      {/* This is the grounded face, not a CSS drop-shadow. Its top follows
          the measured height while the lower edge stays on the floor. */}
      <polygon className="station-pixel-trainer-foot" points={`34,${70 - projection.rise} 90,${54 - projection.rise} 97,${60 - projection.rise} 42,65`} />
      <polygon className="station-pixel-highlight" points={`29,${54 - projection.rise} 73,${42 - projection.rise} 78,${43 - projection.rise} 34,${56 - projection.rise}`} />
    </>
  ) : (
    <>
      {common}
      <polygon className="station-pixel-unknown-side" points="27,45 82,31 98,42 43,59" />
      <polygon className="station-pixel-unknown-top" points="27,45 69,29 82,31 43,49" />
    </>
  );

  return (
    <svg
      className={`station-pixel-sprite ${className}`.trim()}
      viewBox="0 0 128 96"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-equipment-profile={equipment.profile}
      data-station-projection="dimetric"
      data-station-light="upper-left"
      data-station-height-min={projection.minimumHeight}
      data-station-height-max={projection.maximumHeight}
      data-station-projected-rise={projection.rise}
    >
      {sprite}
    </svg>
  );
}
