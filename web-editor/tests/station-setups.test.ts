import assert from "node:assert/strict";
import test from "node:test";
import {
  BIG_BLOCK_COLORS,
  BUNGEE_COLORS,
  BUNGEE_LOOP_CIRCUMFERENCE_INCHES,
  BUNGEE_LOOP_LAY_FLAT_LENGTH_INCHES,
  BUNGEE_LOOP_RESTING_WIDTH_INCHES,
  BUNGEE_LOOP_SIZE,
  BUNGEE_LOOP_THICKNESS_INCHES,
  CHALK_BUCKET_COLORS,
  CHALK_BUCKET_DIAMETER_INCHES,
  CHALK_BUCKET_HEIGHT_INCHES,
  CHALK_BUCKET_RADIUS_INCHES,
  CHALK_BUCKET_SEGMENTS,
  CHALK_BUCKET_SIZE,
  MAT_PLACEHOLDER_SHAPES,
  MAT_PLACEHOLDER_SIZES,
  BIG_CHEESE_MAT_DEPTH_INCHES,
  BIG_CHEESE_MAT_HEIGHT_INCHES,
  BIG_CHEESE_MAT_LENGTH_INCHES,
  BIG_CHEESE_MAT_SIZE,
  BIG_CHEESE_MAT_SLOPED_LENGTH_INCHES,
  BIG_OCTAGON_DIAMETER_INCHES,
  BIG_OCTAGON_LENGTH_FEET,
  BIG_OCTAGON_SIZE,
  CLOUD_MAT_DEPTH_INCHES,
  CLOUD_MAT_HEIGHT_INCHES,
  CLOUD_MAT_LENGTH_INCHES,
  CLOUD_MAT_SIZE,
  CLOUD_MAT_VELCRO_INSET_INCHES,
  MEDIUM_CHEESE_MAT_DEPTH_INCHES,
  MEDIUM_CHEESE_MAT_HEIGHT_INCHES,
  MEDIUM_CHEESE_MAT_LENGTH_INCHES,
  MEDIUM_CHEESE_MAT_SIZE,
  MEDIUM_CHEESE_MAT_STRIPE_COLORS,
  LARGE_CHEESE_MAT_DEPTH_INCHES,
  LARGE_CHEESE_MAT_HEIGHT_INCHES,
  LARGE_CHEESE_MAT_LENGTH_INCHES,
  LARGE_CHEESE_MAT_SIZE,
  SMALL_CHEESE_MAT_COLORS,
  SMALL_CHEESE_MAT_DEPTH_INCHES,
  SMALL_CHEESE_MAT_HEIGHT_INCHES,
  SMALL_CHEESE_MAT_LENGTH_INCHES,
  SMALL_CHEESE_MAT_SIZE,
  TINY_CHEESE_MAT_DEPTH_INCHES,
  TINY_CHEESE_MAT_HEIGHT_INCHES,
  TINY_CHEESE_MAT_LENGTH_INCHES,
  TINY_CHEESE_MAT_SIZE,
  SQUISHY_CHEESE_MAT_SIDE_SECTIONS,
  SQUISHY_CHEESE_MAT_SIZE,
  SPRINGBOARD_COLORS,
  SPRINGBOARD_FLOOR_LENGTH_INCHES,
  SPRINGBOARD_HEIGHT_INCHES,
  SPRINGBOARD_SIZE,
  SPRINGBOARD_SPRING_COILS,
  SPRINGBOARD_SPRING_COUNT,
  SPRINGBOARD_TOP_DEPTH_INCHES,
  SPRINGBOARD_TOP_LENGTH_INCHES,
  PRESCHOOL_SPRINGBOARD_FLOOR_LENGTH_INCHES,
  PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES,
  PRESCHOOL_SPRINGBOARD_SIZE,
  PRESCHOOL_SPRINGBOARD_SPRING_COILS,
  PRESCHOOL_SPRINGBOARD_SPRING_COUNT,
  PRESCHOOL_SPRINGBOARD_TOP_DEPTH_INCHES,
  PRESCHOOL_SPRINGBOARD_TOP_LENGTH_INCHES,
  T_TRAINER_BED_DEPTH_INCHES,
  T_TRAINER_CROSS_LINE_FROM_HIGH_INCHES,
  T_TRAINER_DASH_COUNT,
  T_TRAINER_FLOOR_LENGTH_INCHES,
  T_TRAINER_HIGH_HEIGHT_INCHES,
  T_TRAINER_LOW_HEIGHT_INCHES,
  T_TRAINER_RAIL_RISE_INCHES,
  T_TRAINER_RAIL_WIDTH_INCHES,
  T_TRAINER_SIZE,
  T_TRAINER_TOTAL_HEIGHT_INCHES,
  T_TRAINER_TRAMPOLINE_DEPTH_INCHES,
  T_TRAINER_TRAMPOLINE_LENGTH_INCHES,
  MAIL_BOX_BASE_HEIGHT_INCHES,
  MAIL_BOX_DEPTH_INCHES,
  MAIL_BOX_HEIGHT_INCHES,
  MAIL_BOX_LENGTH_INCHES,
  MAIL_BOX_ROOF_SEGMENTS,
  MAIL_BOX_SIZE,
  GREEN_MAIL_BOX_BASE_HEIGHT_INCHES,
  GREEN_MAIL_BOX_DEPTH_INCHES,
  GREEN_MAIL_BOX_HEIGHT_INCHES,
  GREEN_MAIL_BOX_LENGTH_INCHES,
  GREEN_MAIL_BOX_SIZE,
  COLT_BASE_HEIGHT_INCHES,
  COLT_DEPTH_INCHES,
  COLT_HANDLE_RISE_INCHES,
  COLT_HEIGHT_INCHES,
  COLT_LENGTH_INCHES,
  COLT_ROOF_RADIUS_INCHES,
  COLT_ROOF_SEGMENTS,
  COLT_SIZE,
  PARALLETTE_BASE_DEPTH_INCHES,
  PARALLETTE_HEIGHT_INCHES,
  PARALLETTE_LENGTH_INCHES,
  PARALLETTE_SIZE,
  MINI_LOW_BAR_BASE_COLORS,
  MINI_LOW_BAR_BASE_DEPTH_INCHES,
  MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES,
  MINI_LOW_BAR_HEIGHTS_INCHES,
  MINI_LOW_BAR_LENGTH_INCHES,
  MINI_LOW_BAR_SIZE,
  ADVANCED_MINI_BAR_BASE_DEPTH_INCHES,
  ADVANCED_MINI_BAR_HEIGHT_INCHES,
  ADVANCED_MINI_BAR_LENGTH_INCHES,
  ADVANCED_MINI_BAR_RAIL_DIAMETER_INCHES,
  ADVANCED_MINI_BAR_RAIL_SEGMENTS,
  ADVANCED_MINI_BAR_SIZE,
  REC_MINI_BAR_BASE_DEPTH_INCHES,
  REC_MINI_BAR_HEIGHT_INCHES,
  REC_MINI_BAR_LENGTH_INCHES,
  REC_MINI_BAR_RAIL_DIAMETER_INCHES,
  REC_MINI_BAR_RAIL_SEGMENTS,
  REC_MINI_BAR_REPORTED_THIRD_MEASURE_INCHES,
  REC_MINI_BAR_SIZE,
  TRAFFIC_CONE_BASE_HEIGHT_INCHES,
  TRAFFIC_CONE_BASE_SIZE_INCHES,
  TRAFFIC_CONE_HEIGHT_INCHES,
  TRAFFIC_CONE_SEGMENTS,
  TRAFFIC_CONE_SIZE,
  TRAFFIC_CONE_TOP_DIAMETER_INCHES,
  TARGET_MARKER_DIAMETER_INCHES,
  TARGET_MARKER_HEIGHT_INCHES,
  TARGET_MARKER_RADIUS_INCHES,
  TARGET_MARKER_RED_TARGET_RATIO,
  TARGET_MARKER_SEGMENTS,
  TARGET_MARKER_SIZE,
  BEANBAG_CENTER_SQUARE_SIZE_INCHES,
  BEANBAG_CENTER_THICKNESS_INCHES,
  BEANBAG_SQUARE_SIZE_INCHES,
  BEANBAG_SIZE,
  RAINBOW_MAT_ARCH_SEGMENTS,
  RAINBOW_MAT_CUTOUT_DIAMETER_INCHES,
  RAINBOW_MAT_CUTOUT_RADIUS_INCHES,
  RAINBOW_MAT_DEPTH_INCHES,
  RAINBOW_MAT_DIAMETER_INCHES,
  RAINBOW_MAT_RADIUS_INCHES,
  RAINBOW_MAT_SIZE,
  PAC_MAN_CURVE_SEGMENTS,
  PAC_MAN_DIAMETER_INCHES,
  PAC_MAN_HEIGHT_INCHES,
  PAC_MAN_RADIUS_INCHES,
  PAC_MAN_SIZE,
  TRAPEZE_BAR_LENGTH_INCHES,
  TRAPEZE_BAR_SEGMENTS,
  TRAPEZE_BAR_THICKNESS_INCHES,
  TRAPEZE_SIZE,
  TRAPEZE_STRAP_LENGTH_INCHES,
  PVC_PIPE_DIAMETER_INCHES,
  PVC_PIPE_LENGTH_INCHES,
  PVC_PIPE_RADIUS_INCHES,
  PVC_PIPE_SEGMENTS,
  PVC_PIPE_SIZE,
  SMALL_BAR_PAD_DIAMETER_INCHES,
  SMALL_BAR_PAD_LENGTH_INCHES,
  SMALL_BAR_PAD_RADIUS_INCHES,
  SMALL_BAR_PAD_SEGMENTS,
  SMALL_BAR_PAD_SIZE,
  ROLLING_BAR_AXLE_DIAMETER_INCHES,
  ROLLING_BAR_AXLE_LENGTH_INCHES,
  ROLLING_BAR_SIZE,
  ROLLING_BAR_TOTAL_LENGTH_INCHES,
  ROLLING_BAR_WHEEL_DIAMETER_INCHES,
  ROLLING_BAR_WHEEL_SEGMENTS,
  ROLLING_BAR_WHEEL_THICKNESS_INCHES,
  WOODEN_CLIMBING_LADDER_LENGTH_INCHES,
  WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES,
  WOODEN_CLIMBING_LADDER_RUNG_COUNT,
  WOODEN_CLIMBING_LADDER_RUNG_THICKNESS_INCHES,
  WOODEN_CLIMBING_LADDER_RUNG_WIDTH_INCHES,
  WOODEN_CLIMBING_LADDER_SIZE,
  WOODEN_CLIMBING_LADDER_THICKNESS_INCHES,
  WOODEN_CLIMBING_LADDER_WIDTH_INCHES,
  BOSE_BALL_DIAMETER_INCHES,
  BOSE_BALL_HEIGHT_INCHES,
  BOSE_BALL_RADIUS_INCHES,
  BOSE_BALL_SEGMENTS,
  BOSE_BALL_SIZE,
  FOAM_ROLLER_DIAMETER_INCHES,
  FOAM_ROLLER_END_COLORS,
  FOAM_ROLLER_LENGTH_INCHES,
  FOAM_ROLLER_RADIUS_INCHES,
  FOAM_ROLLER_SEGMENTS,
  FOAM_ROLLER_SIZE,
  YOGA_BALL_COLORS,
  YOGA_BALL_DIAMETER_INCHES,
  YOGA_BALL_RADIUS_INCHES,
  YOGA_BALL_SEGMENTS,
  YOGA_BALL_SIZE,
  VAULT_TRAINER_DEPTH_INCHES,
  VAULT_TRAINER_HEIGHT_INCHES,
  VAULT_TRAINER_LENGTH_INCHES,
  VAULT_TRAINER_ROUND_EDGE_DIAMETER_INCHES,
  VAULT_TRAINER_ROUND_EDGE_SEGMENTS,
  VAULT_TRAINER_SIZE,
  BIG_BOULDER_CURVE_SEGMENTS,
  BIG_BOULDER_DIAMETER_INCHES,
  BIG_BOULDER_HEIGHT_INCHES,
  BIG_BOULDER_LENGTH_INCHES,
  BIG_BOULDER_SIDE_HEIGHT_INCHES,
  BIG_BOULDER_SIZE,
  MEDIUM_BOULDER_CURVE_SEGMENTS,
  MEDIUM_BOULDER_DIAMETER_INCHES,
  MEDIUM_BOULDER_HEIGHT_INCHES,
  MEDIUM_BOULDER_LENGTH_INCHES,
  MEDIUM_BOULDER_SIDE_HEIGHT_INCHES,
  MEDIUM_BOULDER_SIZE,
  SMALL_BOULDER_CURVE_SEGMENTS,
  SMALL_BOULDER_DIAMETER_INCHES,
  SMALL_BOULDER_HEIGHT_INCHES,
  SMALL_BOULDER_LENGTH_INCHES,
  SMALL_BOULDER_SIDE_HEIGHT_INCHES,
  SMALL_BOULDER_SIZE,
  SMALL_SEMICIRCLE_CURVE_SEGMENTS,
  SMALL_SEMICIRCLE_DIAMETER_INCHES,
  SMALL_SEMICIRCLE_DEPTH_INCHES,
  SMALL_SEMICIRCLE_HEIGHT_INCHES,
  SMALL_SEMICIRCLE_SIZE,
  MINI_MUSHROOM_DIAMETER_INCHES,
  MINI_MUSHROOM_HEIGHT_INCHES,
  MINI_MUSHROOM_SEGMENTS,
  MINI_MUSHROOM_SIZE,
  FLOOR_MUSHROOM_DIAMETER_INCHES,
  FLOOR_MUSHROOM_HEIGHT_INCHES,
  FLOOR_MUSHROOM_SEGMENTS,
  FLOOR_MUSHROOM_SIZE,
  MUSHROOM_MAT_DIAMETER_INCHES,
  MUSHROOM_MAT_HEIGHT_INCHES,
  MUSHROOM_MAT_RADIUS_INCHES,
  MUSHROOM_MAT_SEGMENTS,
  MUSHROOM_MAT_SIZE,
  MUSHROOM_MAT_COLORS,
  CYLINDER_DIAMETER_INCHES,
  CYLINDER_HEIGHT_INCHES,
  CYLINDER_RADIUS_INCHES,
  CYLINDER_SEGMENTS,
  CYLINDER_SIZE,
  GREEN_TRAPEZOID_DIMENSIONS_INCHES,
  RED_TRAPEZOID_DIMENSIONS_INCHES,
  TRAPEZOID_MAT_BOTTOM_DEPTH_INCHES,
  TRAPEZOID_MAT_LENGTH_INCHES,
  TRAPEZOID_MAT_SLICE_HEIGHT_INCHES,
  TRAPEZOID_MAT_TOP_DEPTH_INCHES,
  TRAPEZOID_MAT_TOTAL_HEIGHT_INCHES,
  YELLOW_TRAPEZOID_DIMENSIONS_INCHES,
  MEDIUM_OCTAGON_DIAMETER_INCHES,
  MEDIUM_OCTAGON_HEIGHT_INCHES,
  MEDIUM_OCTAGON_SIZE,
  SMALL_OCTAGON_DIAMETER_INCHES,
  SMALL_OCTAGON_LENGTH_INCHES,
  PBAR_BLOCK_DIMENSIONS_INCHES,
  HALF_BLOCK_DIMENSIONS_INCHES,
  BLUE_RESI_DIMENSIONS_INCHES,
  MINI_RESI_DIMENSIONS_INCHES,
  FOUR_INCH_RESI_DIMENSIONS_INCHES,
  FOUR_INCH_RESI_COLORS,
  BIG_FOUR_INCH_RESI_DIMENSIONS_INCHES,
  EIGHT_INCH_RESI_DIMENSIONS_INCHES,
  SIXTEEN_INCH_RESI_DIMENSIONS_INCHES,
  RESI_CROSS_STRIPE_CENTER_FROM_END_INCHES,
  RESI_CROSS_STRIPE_WIDTH_INCHES,
  PINK_BEAM_MAT_DIMENSIONS_INCHES,
  CARTWHEEL_MAT_DIMENSIONS_INCHES,
  CARTWHEEL_MAT_COLORS,
  STAIRS_DEPTH_INCHES,
  STAIRS_HEIGHT_INCHES,
  STAIRS_LOW_STEP_HEIGHT_INCHES,
  STAIRS_SIZE,
  STAIRS_STEP_DEPTH_INCHES,
  STAIRS_WIDTH_INCHES,
  VELCRO_BEAM_DIMENSIONS_INCHES,
  VELCRO_BEAM_COLORS,
  STING_MAT_DIMENSIONS_INCHES,
  GYM_NOVA_MAT_DIMENSIONS_INCHES,
  TEDDY_MAT_DIMENSIONS_INCHES,
  HAND_MAT_DIMENSIONS_INCHES,
  RED_NORBERT_BLOCK_DIMENSIONS_INCHES,
  BLUE_NORBERT_BLOCK_DIMENSIONS_INCHES,
  GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES,
  MINI_RED_NORBERT_BLOCK_DIMENSIONS_INCHES,
  SQUISHY_NORBERT_BLOCK_DIMENSIONS_INCHES,
  SMALL_GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES,
  HALF_BLOCK_COLORS,
  STATION_CANVAS,
  STATION_STACK_STEP,
  PANEL_MAT_PANEL_HEIGHT_INCHES,
  PANEL_MAT_FOLDED_HEIGHT_INCHES,
  PANEL_MAT_FOLDED_HEIGHT,
  PANEL_MAT_CLOSED_SIZE,
  PANEL_MAT_OPEN_SIZE,
  FOUR_PANEL_MAT_COLORWAYS,
  FIVE_PANEL_MAT_CLOSED_SIZE,
  FIVE_PANEL_MAT_COLORWAYS,
  FIVE_PANEL_MAT_FOLDED_HEIGHT,
  FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES,
  FIVE_PANEL_MAT_OPEN_SIZE,
  FIVE_PANEL_MAT_PANEL_COUNT,
  FIVE_PANEL_MAT_PANEL_DEPTH_FEET,
  FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES,
  FIVE_PANEL_MAT_PANEL_LENGTH_FEET,
  SIX_PANEL_MAT_CLOSED_SIZE,
  SIX_PANEL_MAT_COLORWAYS,
  SIX_PANEL_MAT_FOLDED_HEIGHT,
  SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES,
  SIX_PANEL_MAT_OPEN_SIZE,
  SIX_PANEL_MAT_PANEL_COUNT,
  SIX_PANEL_MAT_PANEL_DEPTH_FEET,
  SIX_PANEL_MAT_PANEL_HEIGHT_INCHES,
  SIX_PANEL_MAT_PANEL_LENGTH_FEET,
  autoStackStationObject,
  canPlaceStationObject,
  bigBlockDimensions,
  bigBlockSide,
  bigBlockVerticalHeight,
  bungeeLoopSpriteGeometry,
  chalkBucketSpriteGeometry,
  chalkBucketVerticalHeight,
  bigCheeseMatVerticalHeight,
  cloudMatDimensions,
  cloudMatVerticalHeight,
  bigOctagonSpriteGeometry,
  bigOctagonVerticalHeight,
  clearStationSetupCrop,
  constrainStationObjectToCanvas,
  createStationObject,
  createStationSetup,
  cropStationSetupToContent,
  flipBigBlockSide,
  flipStationObjectFace,
  isStationAssetFlippable,
  isStationSetup,
  isStationSetupSaveable,
  moveStationObjectVertical,
  mediumCheeseMatSpriteGeometry,
  mediumCheeseMatVerticalHeight,
  mediumOctagonSpriteGeometry,
  mediumOctagonVerticalHeight,
  nudgeStationObject,
  normalizeStationSetupDimensions,
  panelMatColors,
  panelMatFoldedSidePanels,
  panelMatOpenSidePanels,
  panelMatState,
  fivePanelMatFoldedSidePanels,
  fivePanelMatOpenSidePanels,
  fivePanelMatOpenTopPanels,
  randomBigBlockColor,
  rotateStationObject,
  saveStationSetup,
  stationAsset,
  stationAssetFaceCount,
  stationAssets,
  stationCheeseMatSpriteGeometry,
  stationMakerAssets,
  stationObjectFace,
  stationObjectFloorFootprint,
  stationObjectFootprint,
  stationObjectVerticalRange,
  springboardSpriteGeometry,
  springboardSpringGeometry,
  springboardVerticalHeight,
  preschoolSpringboardSpriteGeometry,
  preschoolSpringboardVerticalHeight,
  tTrainerSpriteGeometry,
  tTrainerVerticalHeight,
  mailBoxSpriteGeometry,
  mailBoxVerticalHeight,
  greenMailBoxSpriteGeometry,
  greenMailBoxVerticalHeight,
  matPlaceholderShapePoints,
  coltSpriteGeometry,
  coltVerticalHeight,
  paralletteSpriteGeometry,
  paralletteVerticalHeight,
  miniLowBarHeight,
  miniLowBarSpriteGeometry,
  miniLowBarVerticalHeight,
  advancedMiniBarFloorFootprints,
  advancedMiniBarSpriteGeometry,
  advancedMiniBarVerticalHeight,
  recMiniBarFloorFootprints,
  recMiniBarSpriteGeometry,
  recMiniBarVerticalHeight,
  trafficConeSpriteGeometry,
  trafficConeVerticalHeight,
  targetMarkerSpriteGeometry,
  targetMarkerVerticalHeight,
  beanbagSpriteGeometry,
  beanbagVerticalHeight,
  rainbowMatFloorFootprints,
  rainbowMatSpriteGeometry,
  rainbowMatVerticalHeight,
  pacManFloorFootprints,
  pacManSpriteGeometry,
  pacManVerticalHeight,
  trapezeSpriteGeometry,
  trapezeVerticalHeight,
  pvcPipeSpriteGeometry,
  pvcPipeVerticalHeight,
  smallBarPadSpriteGeometry,
  smallBarPadVerticalHeight,
  rollingBarSpriteGeometry,
  rollingBarVerticalHeight,
  woodenClimbingLadderFloorFootprints,
  woodenClimbingLadderSpriteGeometry,
  woodenClimbingLadderVerticalHeight,
  boseBallSpriteGeometry,
  boseBallVerticalHeight,
  foamRollerSpriteGeometry,
  foamRollerVerticalHeight,
  yogaBallSpriteGeometry,
  yogaBallVerticalHeight,
  vaultTrainerSpriteGeometry,
  vaultTrainerVerticalHeight,
  bigBoulderSpriteGeometry,
  bigBoulderVerticalHeight,
  mediumBoulderSpriteGeometry,
  mediumBoulderVerticalHeight,
  smallBoulderSpriteGeometry,
  smallBoulderVerticalHeight,
  smallSemicircleSpriteGeometry,
  smallSemicircleVerticalHeight,
  miniMushroomSpriteGeometry,
  miniMushroomVerticalHeight,
  floorMushroomSpriteGeometry,
  floorMushroomVerticalHeight,
  mushroomMatSpriteGeometry,
  mushroomMatVerticalHeight,
  cylinderFaceDimensions,
  cylinderFaceLabel,
  cylinderSpriteGeometry,
  cylinderVerticalHeight,
  smallCheeseMatVerticalHeight,
  tinyCheeseMatVerticalHeight,
  trapezoidMatDimensions,
  trapezoidMatFaceDimensions,
  trapezoidMatSpriteGeometry,
  trapezoidMatVerticalHeight,
  stationSetupCropBounds,
  stationObjectsOverlap,
  cheeseMatState,
  foldedCheeseMatFaceDimensions,
  isFoldableCheeseMatAsset,
  setCheeseMatState,
  setPanelMatState,
  setMatPlaceholderShape,
  sixPanelMatOpenSidePanels,
  sixPanelMatOpenTopPanels,
  pbarBlockDimensions,
  halfBlockDimensions,
  blueResiDimensions,
  miniResiDimensions,
  stripedResiDimensions,
  pinkBeamMatDimensions,
  cartwheelMatDimensions,
  stairsSpriteGeometry,
  velcroBeamDimensions,
  stingMatDimensions,
  gymNovaMatDimensions,
  teddyMatDimensions,
  handMatDimensions,
  redNorbertBlockDimensions,
  blueNorbertBlockDimensions,
  greenNorbertBlockDimensions,
  miniRedNorbertBlockDimensions,
  squishyNorbertBlockDimensions,
  smallGreenNorbertBlockDimensions,
  miniResiVerticalHeight,
  pinkBeamMatVerticalHeight,
  cartwheelMatVerticalHeight,
  stairsVerticalHeight,
  velcroBeamVerticalHeight,
  stingMatVerticalHeight,
  gymNovaMatVerticalHeight,
  teddyMatVerticalHeight,
  handMatVerticalHeight,
  redNorbertBlockVerticalHeight,
  blueNorbertBlockVerticalHeight,
  greenNorbertBlockVerticalHeight,
  miniRedNorbertBlockVerticalHeight,
  squishyNorbertBlockVerticalHeight,
  smallGreenNorbertBlockVerticalHeight,
  halfBlockFaceColors,
  octagonFaceDimensions,
  mediumCheeseMatFaceDimensions,
  cheeseMatFaceDimensions,
} from "../app/station-setups";

test("generic station palette has the planned gymnastics building blocks", () => {
  const resiFamily = ["blue-resi", "mini-resi", "four-inch-resi", "big-four-inch-resi", "eight-inch-resi", "sixteen-inch-resi"];
  assert.deepEqual(stationAssets.slice(0, 10).map((asset) => asset.id), ["panel", "five-panel", "six-panel", "big-block", ...resiFamily]);
  assert.deepEqual(stationMakerAssets.slice(0, 10).map((asset) => asset.id), ["panel", "five-panel", "six-panel", "big-block", ...resiFamily]);
  assert.ok(stationMakerAssets.every((asset) => !["folded-panel", "wedge", "block", "landing", "strip", "barrel", "beam"].includes(asset.id)));
  assert.equal(stationAsset("block").heightCue, "tall");
  assert.equal(stationAsset("big-block").heightCue, "tall");
  assert.equal(stationAsset("blue-resi").heightCue, "tall");
  assert.equal(stationAsset("mini-resi").heightCue, "tall");
  assert.equal(stationAsset("four-inch-resi").heightCue, "flat");
  assert.equal(stationAsset("big-four-inch-resi").heightCue, "flat");
  assert.equal(stationAsset("eight-inch-resi").heightCue, "raised");
  assert.equal(stationAsset("sixteen-inch-resi").heightCue, "raised");
  assert.equal(stationAsset("pink-beam-mat").heightCue, "flat");
  assert.equal(stationAsset("cartwheel-mat").heightCue, "flat");
  assert.equal(stationAsset("velcro-beam").heightCue, "flat");
  assert.equal(stationAsset("sting-mat").heightCue, "flat");
  assert.equal(stationAsset("gym-nova-mat").heightCue, "raised");
  assert.equal(stationAsset("teddy-mat").heightCue, "flat");
  assert.equal(stationAsset("hand-mat").heightCue, "flat");
  assert.equal(stationAsset("red-norbert-block").heightCue, "raised");
  assert.equal(stationAsset("blue-norbert-block").heightCue, "raised");
  assert.equal(stationAsset("green-norbert-block").heightCue, "tall");
  assert.equal(stationAsset("mini-red-norbert-block").heightCue, "raised");
  assert.equal(stationAsset("squishy-norbert-block").heightCue, "tall");
  assert.equal(stationAsset("small-green-norbert-block").heightCue, "raised");
  assert.equal(stationAsset("big-octagon").heightCue, "tall");
  assert.equal(stationAsset("medium-octagon").heightCue, "tall");
  assert.equal(stationAsset("small-octagon").heightCue, "raised");
  assert.equal(stationAsset("half-block").heightCue, "raised");
  assert.equal(stationAsset("five-panel").heightCue, "flat");
  assert.equal(stationAsset("six-panel").heightCue, "flat");
  assert.equal(stationAsset("tiny-cheese-mat").heightCue, "raised");
  assert.equal(stationAsset("small-cheese-mat").heightCue, "raised");
  assert.equal(stationAsset("medium-cheese-mat").heightCue, "raised");
  assert.equal(stationAsset("large-cheese-mat").heightCue, "raised");
  assert.equal(stationAsset("big-cheese-mat").heightCue, "raised");
  assert.equal(stationAsset("squishy-cheese-mat").heightCue, "raised");
  assert.equal(stationAsset("cloud-mat").heightCue, "raised");
  assert.equal(stationAsset("springboard").heightCue, "raised");
  assert.equal(stationAsset("preschool-springboard").heightCue, "raised");
  assert.equal(stationAsset("t-trainer").heightCue, "raised");
  assert.equal(stationAsset("mail-box").heightCue, "raised");
  assert.equal(stationAsset("green-mail-box").heightCue, "tall");
  assert.equal(stationAsset("green-mail-box").noFlip, true);
  assert.equal(stationAsset("colt").heightCue, "tall");
  assert.equal(stationAsset("parallette").heightCue, "raised");
  assert.equal(stationAsset("mini-low-bar").heightCue, "raised");
  assert.equal(stationAsset("rec-mini-bar").heightCue, "tall");
  assert.equal(stationAsset("advanced-mini-bar").heightCue, "tall");
  assert.equal(stationAsset("traffic-cone").heightCue, "raised");
  assert.equal(stationAsset("target-marker").heightCue, "flat");
  assert.equal(stationAsset("beanbag").heightCue, "flat");
  assert.equal(stationAsset("rainbow-mat").heightCue, "tall");
  assert.equal(stationAsset("pac-man").heightCue, "tall");
  assert.equal(stationAsset("trapeze").heightCue, "tall");
  assert.equal(stationAsset("pvc-pipe").heightCue, "flat");
  assert.equal(stationAsset("small-bar-pad").heightCue, "flat");
  assert.equal(stationAsset("rolling-bar").heightCue, "raised");
  assert.equal(stationAsset("wooden-climbing-ladder").heightCue, "raised");
  assert.equal(stationAsset("bose-ball").heightCue, "raised");
  assert.equal(stationAsset("foam-roller").heightCue, "raised");
  assert.equal(stationAsset("yoga-ball").heightCue, "tall");
  assert.equal(stationAsset("vault-trainer").heightCue, "tall");
  assert.equal(stationAsset("big-boulder").heightCue, "raised");
  assert.equal(stationAsset("medium-boulder").heightCue, "raised");
  assert.equal(stationAsset("small-boulder").heightCue, "raised");
  assert.equal(stationAsset("small-semicircle").heightCue, "raised");
  assert.equal(stationAsset("small-semicircle").noFlip, true);
  assert.equal(stationAsset("mini-mushroom").heightCue, "raised");
  assert.equal(stationAsset("floor-mushroom").heightCue, "flat");
  assert.equal(stationAsset("mushroom-mat").heightCue, "tall");
  assert.equal(stationAsset("cylinder").heightCue, "tall");
  assert.equal(stationAsset("red-trapezoid").heightCue, "raised");
  assert.equal(stationAsset("yellow-trapezoid").heightCue, "raised");
  assert.equal(stationAsset("green-trapezoid").heightCue, "raised");
  assert.equal(stationAsset("bungee").heightCue, "flat");
  assert.equal(stationAsset("chalk-bucket").heightCue, "raised");
  assert.equal(stationAsset("mat-placeholder").heightCue, "flat");
  assert.equal(stationAsset("panel").heightCue, "flat");
});

test("Bungee Loop uses the documented continuous exercise-band length and five requested colors", () => {
  const bungee = createStationObject("bungee", 1, "bungee");
  const sprite = bungeeLoopSpriteGeometry(30, 0, { width: bungee.width, height: bungee.height });

  assert.equal(BUNGEE_LOOP_LAY_FLAT_LENGTH_INCHES, 41);
  assert.equal(BUNGEE_LOOP_CIRCUMFERENCE_INCHES, 82);
  assert.equal(BUNGEE_LOOP_THICKNESS_INCHES, 3 / 16);
  assert.equal(BUNGEE_LOOP_RESTING_WIDTH_INCHES, 16);
  assert.deepEqual(BUNGEE_LOOP_SIZE, { width: 32, height: 82 });
  assert.deepEqual(BUNGEE_COLORS, ["green", "purple", "black", "orange", "blue"]);
  assert.deepEqual({ width: bungee.width, height: bungee.height, bungeeColor: bungee.bungeeColor }, { width: 32, height: 82, bungeeColor: "black" });
  assert.equal(stationAsset("bungee").noFlip, true);
  assert.equal(stationAssetFaceCount("bungee"), 0);
  assert.equal(sprite.loop.length, 11);
  assert.notDeepEqual(sprite.loop[0], sprite.loop[3]);
  assert.equal(isStationSetup({ ...createStationSetup("bungee-setup"), objects: [{ ...bungee, bungeeColor: "orange" }] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-bungee-setup"), objects: [{ ...bungee, bungeeColor: "ultraviolet" }] }), false);
});

test("Chalk Buckets retain a twelve-inch circular footprint, fifteen-inch clearance, and orange/pink choices", () => {
  const chalkBucket = createStationObject("chalk-bucket", 1, "chalk-bucket");
  const pinkBucket = { ...chalkBucket, chalkBucketColor: "pink" as const, rotation: 30 };
  const sprite = chalkBucketSpriteGeometry(pinkBucket.rotation, 0, { width: pinkBucket.width, height: pinkBucket.height });
  const onePanelHigher = moveStationObjectVertical(chalkBucket, "up");
  const aboveChalkBucket = Array.from({ length: 11 }).reduce((object) => moveStationObjectVertical(object, "up"), chalkBucket);

  assert.deepEqual({ diameter: CHALK_BUCKET_DIAMETER_INCHES, radius: CHALK_BUCKET_RADIUS_INCHES, height: CHALK_BUCKET_HEIGHT_INCHES }, { diameter: 12, radius: 6, height: 15 });
  assert.deepEqual({ width: chalkBucket.width, height: chalkBucket.height }, CHALK_BUCKET_SIZE);
  assert.deepEqual(CHALK_BUCKET_COLORS, ["orange", "pink"]);
  assert.equal(CHALK_BUCKET_SEGMENTS, 10);
  assert.equal(chalkBucket.chalkBucketColor, "orange");
  assert.equal(stationAsset("chalk-bucket").noFlip, true);
  assert.equal(stationAssetFaceCount("chalk-bucket"), 0);
  assert.equal(isStationAssetFlippable("chalk-bucket"), false);
  assert.equal(sprite.chalkTop.length, CHALK_BUCKET_SEGMENTS);
  assert.ok(sprite.coloredSides.length > 0);
  assert.ok(sprite.rimSides.length > 0);
  assert.equal(sprite.handle.length, 4);
  assert.equal(stationObjectFloorFootprint(pinkBucket).length, CHALK_BUCKET_SEGMENTS);
  assert.equal(chalkBucketVerticalHeight(), STATION_STACK_STEP * CHALK_BUCKET_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(chalkBucket, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(chalkBucket, aboveChalkBucket), false);
  assert.equal(isStationSetup({ ...createStationSetup("chalk-bucket-pink"), objects: [pinkBucket] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-chalk-bucket"), objects: [{ ...chalkBucket, chalkBucketColor: "lime" }] }), false);
});

test("a named mat placeholder can stand in for a missing collection item with a visible chosen shape", () => {
  const placeholder = createStationObject("mat-placeholder", 1, "missing-mat");
  const round = setMatPlaceholderShape({ ...placeholder, missingMatLabel: "Soft Landing Circle" }, "round");
  const wedge = setMatPlaceholderShape(placeholder, "wedge");
  const center = { x: placeholder.x + placeholder.width / 2, y: placeholder.y + placeholder.height / 2 };

  assert.deepEqual(MAT_PLACEHOLDER_SHAPES, ["rectangle", "square", "round", "wedge"]);
  assert.deepEqual({ width: placeholder.width, height: placeholder.height, missingMatLabel: placeholder.missingMatLabel, matPlaceholderShape: placeholder.matPlaceholderShape }, { width: 96, height: 64, missingMatLabel: "NEW MAT", matPlaceholderShape: "rectangle" });
  assert.deepEqual(MAT_PLACEHOLDER_SIZES.round, { width: 72, height: 72 });
  assert.deepEqual({ width: round.width, height: round.height, center: { x: round.x + round.width / 2, y: round.y + round.height / 2 } }, { width: 72, height: 72, center });
  assert.equal(matPlaceholderShapePoints("round", round).length, 8);
  assert.equal(matPlaceholderShapePoints("wedge", wedge).length, 4);
  assert.equal(stationObjectFootprint(round).length, 8);
  assert.equal(stationObjectFloorFootprint(round).length, 8);
  assert.equal(stationAsset("mat-placeholder").noFlip, true);
  assert.equal(isStationAssetFlippable("mat-placeholder"), false);
  assert.equal(isStationSetup({ ...createStationSetup("missing-mat-setup"), objects: [round] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-missing-mat-setup"), objects: [{ ...round, matPlaceholderShape: "star" }] }), false);
});

test("Blue Resi, Mini Resi, 4/8/16 Resis, Gym Nova Mats, Teddy Mats, Hand Mats, Norbert Blocks, PBar Blocks, Half Blocks, Octagons, and Cheese Mats flip onto every physical face", () => {
  const assets = ["blue-resi", "mini-resi", "four-inch-resi", "big-four-inch-resi", "eight-inch-resi", "sixteen-inch-resi", "cartwheel-mat", "gym-nova-mat", "teddy-mat", "hand-mat", "red-norbert-block", "blue-norbert-block", "green-norbert-block", "mini-red-norbert-block", "squishy-norbert-block", "small-green-norbert-block", "pbar-block", "half-block", "big-octagon", "medium-octagon", "small-octagon", "tiny-cheese-mat", "small-cheese-mat", "medium-cheese-mat", "large-cheese-mat", "big-cheese-mat", "squishy-cheese-mat"] as const;
  for (const assetId of assets) {
    const first = createStationObject(assetId, 1, `${assetId}-first`);
    const center = { x: first.x + first.width / 2, y: first.y + first.height / 2 };
    const faces = Array.from({ length: stationAssetFaceCount(assetId) }, (_, index) => Array.from({ length: index }, () => undefined).reduce((object) => flipStationObjectFace(object, "next"), first));
    const looped = Array.from({ length: stationAssetFaceCount(assetId) }, () => undefined).reduce((object) => flipStationObjectFace(object, "next"), first);
    assert.deepEqual([...new Set(faces.map(stationObjectFace))].sort((first, second) => first - second), Array.from({ length: stationAssetFaceCount(assetId) }, (_, index) => index));
    assert.ok(faces.every((object) => object.x + object.width / 2 === center.x && object.y + object.height / 2 === center.y));
    assert.deepEqual({ face: stationObjectFace(looped), width: looped.width, height: looped.height, x: looped.x, y: looped.y }, { face: stationObjectFace(first), width: first.width, height: first.height, x: first.x, y: first.y });
  }

  assert.deepEqual(PBAR_BLOCK_DIMENSIONS_INCHES, { long: 50.5, medium: 38.5, short: 26 });
  assert.deepEqual(HALF_BLOCK_DIMENSIONS_INCHES, { long: 50.5, medium: 19.25, short: 26 });
  assert.deepEqual(BLUE_RESI_DIMENSIONS_INCHES, { long: 94, medium: 59, short: 32 });
  assert.deepEqual(MINI_RESI_DIMENSIONS_INCHES, { long: 96, medium: 48, short: 16 });
  assert.deepEqual(FOUR_INCH_RESI_DIMENSIONS_INCHES, { long: 120, medium: 60, short: 4 });
  assert.deepEqual(FOUR_INCH_RESI_COLORS, ["blue", "green", "purple"]);
  assert.equal(isStationSetup({ ...createStationSetup("green-four-inch-resi"), objects: [{ ...createStationObject("four-inch-resi", 1), fourInchResiColor: "green" }] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-four-inch-resi"), objects: [{ ...createStationObject("four-inch-resi", 1), fourInchResiColor: "orange" }] }), false);
  assert.deepEqual(BIG_FOUR_INCH_RESI_DIMENSIONS_INCHES, { long: 120, medium: 82.5, short: 4 });
  assert.deepEqual(EIGHT_INCH_RESI_DIMENSIONS_INCHES, { long: 120, medium: 60, short: 8 });
  assert.deepEqual(SIXTEEN_INCH_RESI_DIMENSIONS_INCHES, { long: 120, medium: 60, short: 16 });
  assert.equal(RESI_CROSS_STRIPE_WIDTH_INCHES, 4);
  assert.equal(RESI_CROSS_STRIPE_CENTER_FROM_END_INCHES, 20);
  assert.deepEqual(GYM_NOVA_MAT_DIMENSIONS_INCHES, { long: 59, medium: 35, short: 8 });
  assert.deepEqual(HAND_MAT_DIMENSIONS_INCHES, { long: 52, medium: 49, short: 1 });
  assert.deepEqual(CARTWHEEL_MAT_DIMENSIONS_INCHES, { long: 72, medium: 24, short: .5 });
  assert.deepEqual(RED_NORBERT_BLOCK_DIMENSIONS_INCHES, { long: 36, medium: 24, short: 12 });
  assert.deepEqual(BLUE_NORBERT_BLOCK_DIMENSIONS_INCHES, { long: 42, medium: 24, short: 8 });
  assert.deepEqual(GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES, { long: 36, medium: 24, short: 17 });
  assert.deepEqual(MINI_RED_NORBERT_BLOCK_DIMENSIONS_INCHES, { long: 24, medium: 14, short: 8 });
  assert.deepEqual(SQUISHY_NORBERT_BLOCK_DIMENSIONS_INCHES, { long: 36, medium: 24, short: 21 });
  assert.deepEqual(SMALL_GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES, { long: 24, medium: 21, short: 8.5 });
  assert.deepEqual(HALF_BLOCK_COLORS, ["green-yellow", "blue"]);
  assert.deepEqual(pbarBlockDimensions(0), { widthInches: 50.5, depthInches: 26, heightInches: 38.5 });
  assert.deepEqual(halfBlockDimensions(2), { widthInches: 50.5, depthInches: 19.25, heightInches: 26 });
  assert.deepEqual(blueResiDimensions(2), { widthInches: 94, depthInches: 59, heightInches: 32 });
  assert.deepEqual(miniResiDimensions(2), { widthInches: 96, depthInches: 48, heightInches: 16 });
  assert.deepEqual(stripedResiDimensions("four-inch-resi", 2), { widthInches: 120, depthInches: 60, heightInches: 4 });
  assert.deepEqual(stripedResiDimensions("big-four-inch-resi", 2), { widthInches: 120, depthInches: 82.5, heightInches: 4 });
  assert.deepEqual(stripedResiDimensions("eight-inch-resi", 2), { widthInches: 120, depthInches: 60, heightInches: 8 });
  assert.deepEqual(stripedResiDimensions("sixteen-inch-resi", 2), { widthInches: 120, depthInches: 60, heightInches: 16 });
  assert.deepEqual(gymNovaMatDimensions(2), { widthInches: 59, depthInches: 35, heightInches: 8 });
  assert.deepEqual(teddyMatDimensions(2), { widthInches: 43, depthInches: 35, heightInches: 2 });
  assert.deepEqual(handMatDimensions(2), { widthInches: 52, depthInches: 49, heightInches: 1 });
  assert.deepEqual(cartwheelMatDimensions(2), { widthInches: 72, depthInches: 24, heightInches: .5 });
  assert.deepEqual(redNorbertBlockDimensions(2), { widthInches: 36, depthInches: 24, heightInches: 12 });
  assert.deepEqual(blueNorbertBlockDimensions(2), { widthInches: 42, depthInches: 24, heightInches: 8 });
  assert.deepEqual(greenNorbertBlockDimensions(2), { widthInches: 36, depthInches: 24, heightInches: 17 });
  assert.deepEqual(miniRedNorbertBlockDimensions(2), { widthInches: 24, depthInches: 14, heightInches: 8 });
  assert.deepEqual(smallGreenNorbertBlockDimensions(2), { widthInches: 24, depthInches: 21, heightInches: 8.5 });
  assert.deepEqual(squishyNorbertBlockDimensions(2), { widthInches: 36, depthInches: 24, heightInches: 21 });
  assert.deepEqual(halfBlockFaceColors(0), { top: "blue", sides: ["yellow", "green", "yellow", "green"] });
  assert.deepEqual(halfBlockFaceColors(2), { top: "green", sides: ["yellow", "blue", "yellow", "blue"] });
  assert.deepEqual(halfBlockFaceColors(0, "blue"), { top: "blue", sides: ["blue", "blue", "blue", "blue"] });
  assert.deepEqual(octagonFaceDimensions("small-octagon", 0), { widthInches: SMALL_OCTAGON_DIAMETER_INCHES, depthInches: SMALL_OCTAGON_DIAMETER_INCHES, heightInches: SMALL_OCTAGON_LENGTH_INCHES });
  assert.deepEqual(octagonFaceDimensions("small-octagon", 2), { widthInches: SMALL_OCTAGON_LENGTH_INCHES, depthInches: SMALL_OCTAGON_DIAMETER_INCHES, heightInches: SMALL_OCTAGON_DIAMETER_INCHES });
  assert.deepEqual(mediumCheeseMatFaceDimensions(2), { widthInches: 36, depthInches: 15.5, heightInches: 72 });
  assert.deepEqual(cheeseMatFaceDimensions("large-cheese-mat", 2), { widthInches: 48, depthInches: 16, heightInches: 72 });
  assert.deepEqual(cheeseMatFaceDimensions("big-cheese-mat", 2), { widthInches: 60, depthInches: 17, heightInches: BIG_CHEESE_MAT_LENGTH_INCHES });
});

test("Blue Resi starts flat as a solid-blue 32 by 59 by 94-inch block", () => {
  const resi = createStationObject("blue-resi", 1, "blue-resi");
  const onePanelHigher = moveStationObjectVertical(resi, "up");
  const aboveResi = Array.from({ length: 22 }).reduce((object) => moveStationObjectVertical(object, "up"), resi);

  assert.deepEqual({ width: resi.width, height: resi.height, face: stationObjectFace(resi), color: resi.color }, { width: 188, height: 118, face: 2, color: "blue" });
  assert.equal(stationAssetFaceCount("blue-resi"), 6);
  assert.equal(stationObjectsOverlap(resi, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(resi, aboveResi), false);
});

test("every standard mat either flips through its physical faces or carries the no-flip tag", () => {
  const flippableMats = ["pink-beam-mat", "cartwheel-mat", "sting-mat", "gym-nova-mat", "hand-mat", "cloud-mat", "tiny-cheese-mat", "small-cheese-mat", "medium-cheese-mat", "large-cheese-mat", "big-cheese-mat", "squishy-cheese-mat", "red-trapezoid", "yellow-trapezoid", "green-trapezoid"] as const;
  for (const assetId of flippableMats) {
    const first = createStationObject(assetId, 1, `${assetId}-first`);
    const turned = flipStationObjectFace(first, "next");
    assert.equal(isStationAssetFlippable(assetId), true);
    assert.ok(stationAssetFaceCount(assetId) >= 5);
    assert.notEqual(stationObjectFace(turned), stationObjectFace(first));
    const faces = Array.from({ length: stationAssetFaceCount(assetId) }, (_, index) => Array.from({ length: index }, () => undefined).reduce((object) => flipStationObjectFace(object, "next"), first));
    assert.deepEqual([...new Set(faces.map(stationObjectFace))].sort((firstFace, secondFace) => firstFace - secondFace), Array.from({ length: stationAssetFaceCount(assetId) }, (_, index) => index));
  }
  for (const assetId of ["panel", "five-panel", "six-panel"] as const) {
    assert.equal(stationAsset(assetId).noFlip, true);
    assert.equal(isStationAssetFlippable(assetId), false);
  }
});

test("a moved mat automatically stacks on the highest overlapping support", () => {
  const bottom = { ...createStationObject("panel", 1, "bottom"), x: 256, y: 224 };
  const middle = { ...createStationObject("panel", 2, "middle"), x: 256, y: 224, elevation: stationObjectVerticalRange(bottom).top };
  const moving = { ...createStationObject("panel", 3, "moving"), x: 256, y: 224 };
  const stacked = autoStackStationObject(moving, [bottom, middle]);

  assert.ok(stacked);
  assert.equal(stacked.elevation, stationObjectVerticalRange(middle).top);
  assert.equal(canPlaceStationObject(stacked, [bottom, middle]), true);
});

test("Mini Resi preserves its 8-foot by 4-foot by 16-inch footprint and stacking clearance", () => {
  const miniResi = createStationObject("mini-resi", 1, "mini-resi");
  const onePanelHigher = moveStationObjectVertical(miniResi, "up");
  const aboveMiniResi = Array.from({ length: 11 }).reduce((object) => moveStationObjectVertical(object, "up"), miniResi);

  assert.deepEqual({ width: miniResi.width, height: miniResi.height, face: stationObjectFace(miniResi), color: miniResi.color }, { width: 192, height: 96, face: 2, color: "blue" });
  assert.equal(stationAssetFaceCount("mini-resi"), 6);
  assert.equal(miniResiVerticalHeight(), STATION_STACK_STEP * 16 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(miniResi, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(miniResi, aboveMiniResi), false);
});

test("4/8/16 Resis retain their shared 10-foot by 5-foot footprint, physical faces, and true stacking clearance", () => {
  const cases = [
    ["four-inch-resi", 4, 240, 120],
    ["big-four-inch-resi", 4, 240, 165],
    ["eight-inch-resi", 8, 240, 120],
    ["sixteen-inch-resi", 16, 240, 120],
  ] as const;
  for (const [assetId, heightInches, width, height] of cases) {
    const resi = createStationObject(assetId, 1, assetId);
    const onePanelHigher = moveStationObjectVertical(resi, "up");
    const clear = Array.from({ length: Math.ceil(heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES) + 1 }).reduce((object) => moveStationObjectVertical(object, "up"), resi);
    assert.deepEqual({ width: resi.width, height: resi.height, face: stationObjectFace(resi), color: resi.color }, { width, height, face: 2, color: "blue" });
    assert.equal(stationAssetFaceCount(assetId), 6);
    assert.equal(stationObjectVerticalRange(resi).top, STATION_STACK_STEP * heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES);
    assert.equal(stationObjectsOverlap(resi, onePanelHigher), true);
    assert.equal(stationObjectsOverlap(resi, clear), false);
  }
});

test("Pink Beam and Sting Mats preserve their documented thin real-world dimensions", () => {
  const pinkBeamMat = createStationObject("pink-beam-mat", 1, "pink-beam-mat");
  const stingMat = createStationObject("sting-mat", 2, "sting-mat");

  assert.deepEqual(PINK_BEAM_MAT_DIMENSIONS_INCHES, { long: 54, medium: 36, short: .35 });
  assert.deepEqual(STING_MAT_DIMENSIONS_INCHES, { long: 76, medium: 55, short: 1.5 });
  assert.deepEqual(pinkBeamMatDimensions(), { widthInches: 54, depthInches: 36, heightInches: .35 });
  assert.deepEqual(stingMatDimensions(), { widthInches: 76, depthInches: 55, heightInches: 1.5 });
  assert.deepEqual({ width: pinkBeamMat.width, height: pinkBeamMat.height, color: pinkBeamMat.color }, { width: 108, height: 72, color: "pink" });
  assert.deepEqual({ width: stingMat.width, height: stingMat.height, color: stingMat.color }, { width: 152, height: 110, color: "brown" });
  assert.ok(Math.abs(pinkBeamMatVerticalHeight() - STATION_STACK_STEP * .35 / PANEL_MAT_PANEL_HEIGHT_INCHES) < .000001);
  assert.equal(stingMatVerticalHeight(), STATION_STACK_STEP);
  assert.equal(stationObjectsOverlap(pinkBeamMat, moveStationObjectVertical(pinkBeamMat, "up")), false);
  assert.equal(stationObjectsOverlap(stingMat, moveStationObjectVertical(stingMat, "up")), false);
});

test("Cartwheel Mats retain their six-foot pale-yellow center stripe, thin physical profile, colors, and face flips", () => {
  const cartwheelMat = createStationObject("cartwheel-mat", 1, "cartwheel-mat");
  const lightBlue = { ...cartwheelMat, cartwheelMatColor: "light-blue" as const };
  const overlapping = { ...cartwheelMat, elevation: cartwheelMatVerticalHeight() - 1 };
  const clear = moveStationObjectVertical(cartwheelMat, "up");

  assert.deepEqual(CARTWHEEL_MAT_COLORS, ["blue", "pink", "light-blue", "dark-blue", "purple"]);
  assert.deepEqual({ width: cartwheelMat.width, height: cartwheelMat.height, face: stationObjectFace(cartwheelMat), color: cartwheelMat.color, cartwheelMatColor: cartwheelMat.cartwheelMatColor }, { width: 144, height: 48, face: 2, color: "blue", cartwheelMatColor: "blue" });
  assert.deepEqual(cartwheelMatDimensions(4), { widthInches: 24, depthInches: .5, heightInches: 72 });
  assert.equal(stationAssetFaceCount("cartwheel-mat"), 6);
  assert.equal(isStationAssetFlippable("cartwheel-mat"), true);
  assert.equal(cartwheelMatVerticalHeight(), STATION_STACK_STEP * .5 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(cartwheelMat, overlapping), true);
  assert.equal(stationObjectsOverlap(cartwheelMat, clear), false);
  assert.equal(isStationSetup({ ...createStationSetup("light-blue-cartwheel-mat"), objects: [lightBlue] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-cartwheel-mat"), objects: [{ ...cartwheelMat, cartwheelMatColor: "orange" }] }), false);
});

test("Stairs retain their two-foot square base, 18-inch two-step rise, literal colors, and no-flip tag", () => {
  const stairs = createStationObject("stairs", 1, "stairs");
  const raised = moveStationObjectVertical(stairs, "up");
  const sprite = stairsSpriteGeometry(stairs.rotation, stairs.elevation, { width: stairs.width, height: stairs.height });

  assert.deepEqual({ width: STAIRS_WIDTH_INCHES, depth: STAIRS_DEPTH_INCHES, height: STAIRS_HEIGHT_INCHES, stepDepth: STAIRS_STEP_DEPTH_INCHES, lowStepHeight: STAIRS_LOW_STEP_HEIGHT_INCHES }, { width: 24, depth: 24, height: 18, stepDepth: 12, lowStepHeight: 9 });
  assert.deepEqual({ width: STAIRS_SIZE.width, height: STAIRS_SIZE.height }, { width: 48, height: 48 });
  assert.deepEqual({ width: stairs.width, height: stairs.height, color: stairs.color }, { width: 48, height: 48, color: "blue" });
  assert.equal(stationAssetFaceCount("stairs"), 0);
  assert.equal(isStationAssetFlippable("stairs"), false);
  assert.equal(stairsVerticalHeight(), STATION_STACK_STEP * STAIRS_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.ok(sprite.surfaces.some((surface) => surface.color === "red-top"));
  assert.ok(sprite.surfaces.some((surface) => surface.color === "blue"));
  assert.ok(sprite.surfaces.some((surface) => surface.color === "yellow"));
  assert.equal(stationObjectsOverlap(stairs, raised), true);
  assert.equal(isStationSetup({ ...createStationSetup("stairs-setup"), objects: [stairs] }), true);
});

test("Velcro Beams retain their eight-foot by four-inch profile, five requested colors, and physical face flips", () => {
  const beam = createStationObject("velcro-beam", 1, "velcro-beam");
  const blue = { ...beam, velcroBeamColor: "blue" as const };
  const side = flipStationObjectFace(beam, "next");
  const edge = flipStationObjectFace(side, "next");

  assert.deepEqual(VELCRO_BEAM_DIMENSIONS_INCHES, { long: 96, medium: 4, short: .5 });
  assert.deepEqual(VELCRO_BEAM_COLORS, ["red", "orange", "yellow", "green", "blue"]);
  assert.deepEqual({ width: beam.width, height: beam.height, face: stationObjectFace(beam), color: beam.color, velcroBeamColor: beam.velcroBeamColor }, { width: 192, height: 8, face: 2, color: "blue", velcroBeamColor: "red" });
  assert.deepEqual(velcroBeamDimensions(2), { widthInches: 96, depthInches: 4, heightInches: .5 });
  assert.deepEqual(velcroBeamDimensions(3), { widthInches: 96, depthInches: 4, heightInches: .5 });
  assert.deepEqual(velcroBeamDimensions(4), { widthInches: 4, depthInches: .5, heightInches: 96 });
  assert.equal(stationAssetFaceCount("velcro-beam"), 6);
  assert.equal(isStationAssetFlippable("velcro-beam"), true);
  assert.equal(stationObjectFace(side), 3);
  assert.deepEqual({ width: side.width, height: side.height }, { width: 192, height: 8 });
  assert.deepEqual({ face: stationObjectFace(edge), width: edge.width, height: edge.height }, { face: 4, width: 8, height: 1 });
  assert.equal(velcroBeamVerticalHeight(), STATION_STACK_STEP * .5 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(beam, { ...beam, elevation: velcroBeamVerticalHeight() - .001 }), true);
  assert.equal(stationObjectsOverlap(beam, { ...beam, elevation: velcroBeamVerticalHeight() }), false);
  assert.equal(isStationSetup({ ...createStationSetup("blue-velcro-beam"), objects: [blue] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-velcro-beam"), objects: [{ ...beam, velcroBeamColor: "purple" }] }), false);
});

test("Gym Nova Mats retain their gray-and-cream 59 by 35 by 8-inch profile", () => {
  const gymNovaMat = createStationObject("gym-nova-mat", 1, "gym-nova-mat");
  const onePanelHigher = moveStationObjectVertical(gymNovaMat, "up");
  const aboveGymNovaMat = Array.from({ length: 6 }).reduce((object) => moveStationObjectVertical(object, "up"), gymNovaMat);

  assert.deepEqual(GYM_NOVA_MAT_DIMENSIONS_INCHES, { long: 59, medium: 35, short: 8 });
  assert.deepEqual(gymNovaMatDimensions(), { widthInches: 59, depthInches: 35, heightInches: 8 });
  assert.deepEqual({ width: gymNovaMat.width, height: gymNovaMat.height, face: stationObjectFace(gymNovaMat), color: gymNovaMat.color }, { width: 118, height: 70, face: 2, color: "gray" });
  assert.equal(stationAssetFaceCount("gym-nova-mat"), 6);
  assert.equal(gymNovaMatVerticalHeight(), STATION_STACK_STEP * 8 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(gymNovaMat, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(gymNovaMat, aboveGymNovaMat), false);
});

test("Teddy Mats retain their dark brown 43 by 35 by 2-inch profile and flip onto their side faces", () => {
  const teddyMat = createStationObject("teddy-mat", 1, "teddy-mat");
  const upright = flipStationObjectFace(flipStationObjectFace(teddyMat, "next"), "next");
  const onePanelHigher = moveStationObjectVertical(teddyMat, "up");
  const aboveTeddyMat = moveStationObjectVertical(onePanelHigher, "up");

  assert.deepEqual(TEDDY_MAT_DIMENSIONS_INCHES, { long: 43, medium: 35, short: 2 });
  assert.deepEqual(teddyMatDimensions(), { widthInches: 43, depthInches: 35, heightInches: 2 });
  assert.deepEqual(teddyMatDimensions(4), { widthInches: 35, depthInches: 2, heightInches: 43 });
  assert.deepEqual({ width: teddyMat.width, height: teddyMat.height, face: stationObjectFace(teddyMat), color: teddyMat.color }, { width: 86, height: 70, face: 2, color: "brown" });
  assert.deepEqual({ width: upright.width, height: upright.height, face: stationObjectFace(upright) }, { width: 70, height: 4, face: 4 });
  assert.equal(stationAssetFaceCount("teddy-mat"), 6);
  assert.equal(isStationAssetFlippable("teddy-mat"), true);
  assert.equal(teddyMatVerticalHeight(), STATION_STACK_STEP * 2 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(teddyMatVerticalHeight(4), STATION_STACK_STEP * 43 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(teddyMat, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(teddyMat, aboveTeddyMat), false);
  assert.equal(isStationSetup({ ...createStationSetup("teddy-mat-setup"), objects: [upright] }), true);
});

test("Hand Mats retain their burgundy 52 by 49 by 1-inch profile and flip onto their side faces", () => {
  const handMat = createStationObject("hand-mat", 1, "hand-mat");
  const upright = flipStationObjectFace(flipStationObjectFace(handMat, "next"), "next");
  const onePanelHigher = moveStationObjectVertical(handMat, "up");

  assert.deepEqual(HAND_MAT_DIMENSIONS_INCHES, { long: 52, medium: 49, short: 1 });
  assert.deepEqual(handMatDimensions(), { widthInches: 52, depthInches: 49, heightInches: 1 });
  assert.deepEqual(handMatDimensions(4), { widthInches: 49, depthInches: 1, heightInches: 52 });
  assert.deepEqual({ width: handMat.width, height: handMat.height, face: stationObjectFace(handMat), color: handMat.color }, { width: 104, height: 98, face: 2, color: "burgundy" });
  assert.deepEqual({ width: upright.width, height: upright.height, face: stationObjectFace(upright) }, { width: 98, height: 2, face: 4 });
  assert.equal(stationAssetFaceCount("hand-mat"), 6);
  assert.equal(isStationAssetFlippable("hand-mat"), true);
  assert.equal(handMatVerticalHeight(), STATION_STACK_STEP / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(handMatVerticalHeight(4), STATION_STACK_STEP * 52 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(handMat, onePanelHigher), false);
  assert.equal(isStationSetup({ ...createStationSetup("hand-mat-setup"), objects: [upright] }), true);
});

test("Red Norbert Blocks preserve their 36 by 24 by 12-inch block footprint and clearance", () => {
  const norbert = createStationObject("red-norbert-block", 1, "red-norbert-block");
  const onePanelHigher = moveStationObjectVertical(norbert, "up");
  const aboveNorbert = Array.from({ length: 8 }).reduce((object) => moveStationObjectVertical(object, "up"), norbert);

  assert.deepEqual({ width: norbert.width, height: norbert.height, face: stationObjectFace(norbert), color: norbert.color }, { width: 72, height: 48, face: 2, color: "red" });
  assert.equal(stationAssetFaceCount("red-norbert-block"), 6);
  assert.equal(redNorbertBlockVerticalHeight(), STATION_STACK_STEP * 12 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(norbert, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(norbert, aboveNorbert), false);
});

test("Blue, Green, and Mini Red Norbert Blocks retain their separate dimensions, fixed colors, faces, and stacking clearance", () => {
  const blue = createStationObject("blue-norbert-block", 1, "blue-norbert-block");
  const green = createStationObject("green-norbert-block", 2, "green-norbert-block");
  const miniRed = createStationObject("mini-red-norbert-block", 3, "mini-red-norbert-block");

  assert.deepEqual({ width: blue.width, height: blue.height, face: stationObjectFace(blue), color: blue.color }, { width: 84, height: 48, face: 2, color: "blue" });
  assert.deepEqual({ width: green.width, height: green.height, face: stationObjectFace(green), color: green.color }, { width: 72, height: 48, face: 2, color: "green" });
  assert.deepEqual({ width: miniRed.width, height: miniRed.height, face: stationObjectFace(miniRed), color: miniRed.color }, { width: 48, height: 28, face: 2, color: "red" });
  assert.equal(stationAssetFaceCount("blue-norbert-block"), 6);
  assert.equal(stationAssetFaceCount("green-norbert-block"), 6);
  assert.equal(stationAssetFaceCount("mini-red-norbert-block"), 6);
  assert.equal(blueNorbertBlockVerticalHeight(), STATION_STACK_STEP * 8 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(greenNorbertBlockVerticalHeight(), STATION_STACK_STEP * 17 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(miniRedNorbertBlockVerticalHeight(), STATION_STACK_STEP * 8 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(blue, Array.from({ length: 6 }).reduce((object) => moveStationObjectVertical(object, "up"), blue)), false);
  assert.equal(stationObjectsOverlap(green, Array.from({ length: 12 }).reduce((object) => moveStationObjectVertical(object, "up"), green)), false);
  assert.equal(stationObjectsOverlap(miniRed, Array.from({ length: 6 }).reduce((object) => moveStationObjectVertical(object, "up"), miniRed)), false);
});

test("Squishy Norbert Blocks preserve their 36 by 24 by 21-inch footprint, color choices, and clearance", () => {
  const norbert = createStationObject("squishy-norbert-block", 1, "squishy-norbert-block");
  const green = { ...norbert, squishyNorbertBlockColor: "green" as const };
  const onePanelHigher = moveStationObjectVertical(norbert, "up");
  const aboveNorbert = Array.from({ length: 14 }).reduce((object) => moveStationObjectVertical(object, "up"), norbert);

  assert.deepEqual({ width: norbert.width, height: norbert.height, face: stationObjectFace(norbert), color: norbert.color, squishyNorbertBlockColor: norbert.squishyNorbertBlockColor }, { width: 72, height: 48, face: 2, color: "blue", squishyNorbertBlockColor: "blue" });
  assert.equal(stationAssetFaceCount("squishy-norbert-block"), 6);
  assert.equal(isStationAssetFlippable("squishy-norbert-block"), true);
  assert.equal(squishyNorbertBlockVerticalHeight(), STATION_STACK_STEP * 21 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(norbert, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(norbert, aboveNorbert), false);
  assert.equal(isStationSetup({ ...createStationSetup("green-squishy-norbert"), objects: [green] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-squishy-norbert"), objects: [{ ...norbert, squishyNorbertBlockColor: "red" }] }), false);
});

test("Small Green Norbert Blocks preserve their 24 by 21 by 8.5-inch fixed-green footprint and clearance", () => {
  const norbert = createStationObject("small-green-norbert-block", 1, "small-green-norbert-block");
  const onePanelHigher = moveStationObjectVertical(norbert, "up");
  const aboveNorbert = Array.from({ length: 6 }).reduce((object) => moveStationObjectVertical(object, "up"), norbert);
  const barelyOverlapping = { ...norbert, elevation: smallGreenNorbertBlockVerticalHeight() - 1 };

  assert.deepEqual({ width: norbert.width, height: norbert.height, face: stationObjectFace(norbert), color: norbert.color }, { width: 48, height: 42, face: 2, color: "green" });
  assert.equal(stationAssetFaceCount("small-green-norbert-block"), 6);
  assert.equal(isStationAssetFlippable("small-green-norbert-block"), true);
  assert.equal(smallGreenNorbertBlockVerticalHeight(), STATION_STACK_STEP * 8.5 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(norbert, barelyOverlapping), true);
  assert.equal(stationObjectsOverlap(norbert, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(norbert, aboveNorbert), false);
  assert.equal(isStationSetup({ ...createStationSetup("small-green-norbert"), objects: [norbert] }), true);
});

test("Half Blocks share dimensions while offering blue and green/yellow color options", () => {
  const block = createStationObject("half-block", 1, "half-block");
  const blueBlock = { ...block, id: "blue-half-block", halfBlockColor: "blue" as const };
  const onePanelHigher = moveStationObjectVertical(block, "up");
  const aboveBlock = Array.from({ length: 19 }).reduce((object) => moveStationObjectVertical(object, "up"), block);

  assert.deepEqual({ width: block.width, height: block.height, halfBlockColor: block.halfBlockColor }, { width: 101, height: 52, halfBlockColor: "green-yellow" });
  assert.deepEqual({ width: blueBlock.width, height: blueBlock.height, halfBlockColor: blueBlock.halfBlockColor }, { width: 101, height: 52, halfBlockColor: "blue" });
  assert.equal(stationAssetFaceCount("half-block"), 6);
  assert.equal(stationObjectsOverlap(block, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(block, aboveBlock), false);
  const legacy = { ...blueBlock, assetId: "blue-half-block", width: 96, height: 40 };
  assert.equal(isStationSetup({ ...createStationSetup("legacy-blue-half-block"), objects: [legacy] }), true);
  assert.deepEqual(
    normalizeStationSetupDimensions({ ...createStationSetup("legacy-blue-half-block"), objects: [legacy] } as never).objects[0],
    { ...blueBlock, assetId: "half-block", x: 93.5, y: 90 },
  );
});

test("station setup is versioned and objects use the equipment's default footprint", () => {
  const setup = createStationSetup("station-one");
  const block = createStationObject("block", 2, "block-one");
  assert.equal(setup.version, 2);
  assert.deepEqual(setup.canvas, STATION_CANVAS);
  assert.equal(block.width, stationAsset("block").width);
  assert.equal(block.height, stationAsset("block").height);
  assert.equal(isStationSetup({ ...setup, objects: [block] }), true);
});

test("new Panel Mats start folded and preserve their center when they open", () => {
  const folded = createStationObject("panel", 1, "folded-panel");
  const opened = setPanelMatState(folded, "open");

  assert.equal(panelMatState(folded), "closed");
  assert.deepEqual({ width: folded.width, height: folded.height }, PANEL_MAT_CLOSED_SIZE);
  assert.equal(panelMatState(opened), "open");
  assert.deepEqual({ width: opened.width, height: opened.height }, PANEL_MAT_OPEN_SIZE);
  assert.deepEqual(
    { x: opened.x + opened.width / 2, y: opened.y + opened.height / 2 },
    { x: folded.x + folded.width / 2, y: folded.y + folded.height / 2 },
  );
  assert.equal(panelMatState({ ...opened, panelState: undefined }), "open");
});

test("opened Panel Mat sides continue the color of their matching top panels", () => {
  assert.deepEqual(panelMatOpenSidePanels(0).map((side) => side.color), ["yellow", "red", "green", "blue", "yellow"]);
});

test("folded Panel Mats stack all four colored panels to their real combined height", () => {
  const folded = createStationObject("panel", 1, "folded-stack");
  const onePanelHigher = moveStationObjectVertical(folded, "up");
  const aboveFoldedStack = Array.from({ length: 4 }).reduce((object) => moveStationObjectVertical(object, "up"), folded);

  assert.deepEqual(panelMatFoldedSidePanels(0).slice(0, 4).map((side) => side.color), ["red", "green", "blue", "yellow"]);
  assert.equal(PANEL_MAT_PANEL_HEIGHT_INCHES, 1.5);
  assert.equal(PANEL_MAT_FOLDED_HEIGHT_INCHES, 6);
  assert.equal(PANEL_MAT_FOLDED_HEIGHT, STATION_STACK_STEP * 4);
  assert.equal(stationObjectsOverlap(folded, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(folded, aboveFoldedStack), false);
});

test("the corrected 5 Panel Mat folds five 5-foot by 2-foot by 1.1-inch panels", () => {
  const folded = createStationObject("five-panel", 1, "five-panel");
  const opened = setPanelMatState(folded, "open");
  const onePanelHigher = moveStationObjectVertical(folded, "up");
  const aboveFoldedStack = Array.from({ length: 4 }).reduce((object) => moveStationObjectVertical(object, "up"), folded);

  assert.deepEqual({ count: FIVE_PANEL_MAT_PANEL_COUNT, length: FIVE_PANEL_MAT_PANEL_LENGTH_FEET, depth: FIVE_PANEL_MAT_PANEL_DEPTH_FEET, height: FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES }, { count: 5, length: 5, depth: 2, height: 1.1 });
  assert.deepEqual({ width: folded.width, height: folded.height }, FIVE_PANEL_MAT_CLOSED_SIZE);
  assert.deepEqual({ width: opened.width, height: opened.height }, FIVE_PANEL_MAT_OPEN_SIZE);
  assert.deepEqual({ x: opened.x + opened.width / 2, y: opened.y + opened.height / 2 }, { x: folded.x + folded.width / 2, y: folded.y + folded.height / 2 });
  assert.equal(FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES, 5.5);
  assert.equal(FIVE_PANEL_MAT_FOLDED_HEIGHT, 88);
  assert.equal(fivePanelMatOpenTopPanels(0).length, 5);
  assert.deepEqual(fivePanelMatOpenSidePanels(0).map((side) => side.color), ["blue", "blue", "blue", "blue", "blue", "blue"]);
  assert.deepEqual(fivePanelMatFoldedSidePanels(0, 0, undefined, panelMatColors("five-panel", "blue-green")).slice(0, 5).map((side) => side.color), ["blue", "green", "blue", "green", "blue"]);
  assert.equal(stationObjectsOverlap(folded, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(folded, aboveFoldedStack), false);
});

test("the true 6 Panel Mat folds six 6-foot by 2-foot panels in documented colorways", () => {
  const folded = createStationObject("six-panel", 1, "six-panel");
  const opened = setPanelMatState(folded, "open");

  assert.deepEqual({ count: SIX_PANEL_MAT_PANEL_COUNT, length: SIX_PANEL_MAT_PANEL_LENGTH_FEET, depth: SIX_PANEL_MAT_PANEL_DEPTH_FEET, height: SIX_PANEL_MAT_PANEL_HEIGHT_INCHES }, { count: 6, length: 6, depth: 2, height: 1.1 });
  assert.deepEqual({ width: folded.width, height: folded.height }, SIX_PANEL_MAT_CLOSED_SIZE);
  assert.deepEqual({ width: opened.width, height: opened.height }, SIX_PANEL_MAT_OPEN_SIZE);
  assert.equal(SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES, 6.6);
  assert.equal(SIX_PANEL_MAT_FOLDED_HEIGHT, 105.6);
  assert.equal(sixPanelMatOpenTopPanels(0).length, 6);
  assert.deepEqual(sixPanelMatOpenSidePanels(0).map((side) => side.color), ["light-blue", "light-blue", "light-blue", "light-blue", "light-blue", "light-blue", "light-blue"]);
  assert.deepEqual(panelMatColors("six-panel", "rainbow"), ["dark-blue", "red", "green", "yellow", "light-blue", "yellow"]);
});

test("4- and 5-panel mats offer purple and blue/green alternating colorways", () => {
  assert.deepEqual(FOUR_PANEL_MAT_COLORWAYS, ["rainbow", "purple", "blue-green"]);
  assert.deepEqual(FIVE_PANEL_MAT_COLORWAYS, ["blue", "purple", "blue-green"]);
  assert.deepEqual(SIX_PANEL_MAT_COLORWAYS, ["light-blue", "dark-blue", "rainbow"]);
  assert.deepEqual(panelMatColors("panel", "purple"), ["purple", "purple", "purple", "purple"]);
  assert.deepEqual(panelMatColors("panel", "blue-green"), ["blue", "green", "blue", "green"]);
  assert.deepEqual(panelMatColors("five-panel", "purple"), ["purple", "purple", "purple", "purple", "purple"]);
  assert.deepEqual(panelMatColors("five-panel", "blue-green"), ["blue", "green", "blue", "green", "blue"]);
});

test("version-one layouts migrate the mislabeled former 6 Panel Mat into the corrected 5 Panel Mat", () => {
  const legacy = { ...createStationSetup("legacy-six-panel"), version: 1 as const, objects: [{ ...setPanelMatState(createStationObject("six-panel", 1, "legacy-six-panel"), "open"), panelMatColorway: undefined }] };
  const migrated = normalizeStationSetupDimensions(legacy);

  assert.equal(isStationSetup(legacy), true);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.objects[0].assetId, "five-panel");
  assert.equal(migrated.objects[0].panelMatColorway, "blue");
  assert.deepEqual({ width: migrated.objects[0].width, height: migrated.objects[0].height }, FIVE_PANEL_MAT_OPEN_SIZE);
});

test("Big Blocks use one random approved color and flip through all six physical faces", () => {
  const block = createStationObject("big-block", 1, "big-block");
  const firstFlip = flipBigBlockSide(block, "next");
  const flippedAllTheWayAround = Array.from({ length: 6 }).reduce((object) => flipBigBlockSide(object, "next"), block);
  const onePanelHigher = moveStationObjectVertical(block, "up");
  const aboveBlock = Array.from({ length: 24 }).reduce((object) => moveStationObjectVertical(object, "up"), block);

  assert.ok(block.bigBlockColor && BIG_BLOCK_COLORS.includes(block.bigBlockColor));
  assert.equal(randomBigBlockColor(() => 0), "orange");
  assert.equal(randomBigBlockColor(() => .999999), "black");
  assert.equal(bigBlockSide(block), 0);
  assert.deepEqual(bigBlockDimensions(bigBlockSide(block)), { widthFeet: 4, depthFeet: 2, heightFeet: 3 });
  assert.deepEqual(bigBlockDimensions(bigBlockSide(firstFlip)), { widthFeet: 4, depthFeet: 3, heightFeet: 2 });
  assert.deepEqual({ width: firstFlip.width, height: firstFlip.height }, { width: 96, height: 72 });
  assert.equal(bigBlockSide(flippedAllTheWayAround), 0);
  assert.equal(bigBlockVerticalHeight(bigBlockSide(block)), STATION_STACK_STEP * 24);
  assert.equal(stationObjectsOverlap(block, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(block, aboveBlock), false);
});

test("Big Octagons are 30-inch diameter, 3-foot red prisms with green octagonal ends", () => {
  const octagon = createStationObject("big-octagon", 1, "big-octagon");
  const zero = bigOctagonSpriteGeometry(0);
  const thirty = bigOctagonSpriteGeometry(30);
  const onePanelHigher = moveStationObjectVertical(octagon, "up");
  const aboveOctagon = Array.from({ length: 20 }).reduce((object) => moveStationObjectVertical(object, "up"), octagon);

  assert.deepEqual({ diameter: BIG_OCTAGON_DIAMETER_INCHES, length: BIG_OCTAGON_LENGTH_FEET }, { diameter: 30, length: 3 });
  assert.deepEqual({ width: octagon.width, height: octagon.height }, BIG_OCTAGON_SIZE);
  assert.ok(zero.outerFaces.length > 0);
  assert.equal(zero.endFaces.length, 1);
  assert.equal(zero.endFaces[0].length, 8);
  assert.notDeepEqual(thirty, zero);
  assert.equal(bigOctagonVerticalHeight(), STATION_STACK_STEP * 20);
  assert.equal(stationObjectsOverlap(octagon, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(octagon, aboveOctagon), false);
});

test("Medium Octagons preserve a 2-foot footprint, 30-inch height, green outer faces, and yellow octagons", () => {
  const octagon = createStationObject("medium-octagon", 1, "medium-octagon");
  const geometry = mediumOctagonSpriteGeometry(0);
  const bounded = constrainStationObjectToCanvas({ ...octagon, x: 0, y: 0 });
  const onePanelHigher = moveStationObjectVertical(octagon, "up");
  const aboveOctagon = Array.from({ length: 20 }).reduce((object) => moveStationObjectVertical(object, "up"), octagon);

  assert.deepEqual({ diameter: MEDIUM_OCTAGON_DIAMETER_INCHES, height: MEDIUM_OCTAGON_HEIGHT_INCHES }, { diameter: 24, height: 30 });
  assert.deepEqual({ width: octagon.width, height: octagon.height }, MEDIUM_OCTAGON_SIZE);
  assert.deepEqual({ width: bounded.width, height: bounded.height }, MEDIUM_OCTAGON_SIZE);
  assert.deepEqual(
    normalizeStationSetupDimensions({ ...createStationSetup("legacy-medium-octagon"), objects: [{ ...octagon, width: 4, height: 4 }] }).objects[0],
    { ...octagon, width: 48, height: 48, x: 74, y: 74 },
  );
  assert.deepEqual(
    normalizeStationSetupDimensions({ ...createStationSetup("legacy-medium-octagon-side"), objects: [{ ...octagon, face: 2, width: 60, height: 4 }] }).objects[0],
    { ...octagon, face: 2, width: 60, height: 48, x: 96, y: 74 },
  );
  assert.equal(geometry.top.length, 8);
  assert.equal(geometry.bottom.length, 8);
  assert.ok(geometry.outerFaces.length > 0);
  assert.equal(mediumOctagonVerticalHeight(), STATION_STACK_STEP * 20);
  assert.equal(stationObjectsOverlap(octagon, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(octagon, aboveOctagon), false);
});

test("Medium Cheese Mats retain their real wedge dimensions, striped triangles, and stacking clearance", () => {
  const cheese = createStationObject("medium-cheese-mat", 1, "medium-cheese-mat");
  const geometry = mediumCheeseMatSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(cheese, "up");
  const aboveCheese = Array.from({ length: 11 }).reduce((object) => moveStationObjectVertical(object, "up"), cheese);

  assert.deepEqual({ length: MEDIUM_CHEESE_MAT_LENGTH_INCHES, depth: MEDIUM_CHEESE_MAT_DEPTH_INCHES, height: MEDIUM_CHEESE_MAT_HEIGHT_INCHES }, { length: 72, depth: 36, height: 15.5 });
  assert.deepEqual({ width: cheese.width, height: cheese.height }, MEDIUM_CHEESE_MAT_SIZE);
  assert.deepEqual(geometry.sideStripes.map((stripe) => stripe.color), MEDIUM_CHEESE_MAT_STRIPE_COLORS);
  assert.ok(geometry.end);
  assert.equal(mediumCheeseMatVerticalHeight(), STATION_STACK_STEP * MEDIUM_CHEESE_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(cheese, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(cheese, aboveCheese), false);
});

test("Small Cheese Mats preserve their 4 by 2 foot by 16 inch wedge and documented color variants", () => {
  const cheese = createStationObject("small-cheese-mat", 1, "small-cheese-mat");
  const orangePurple = stationCheeseMatSpriteGeometry("small-cheese-mat", 0, 0, 0, SMALL_CHEESE_MAT_SIZE, "orange-purple");
  const green = stationCheeseMatSpriteGeometry("small-cheese-mat", 0, 0, 0, SMALL_CHEESE_MAT_SIZE, "green");
  const red = stationCheeseMatSpriteGeometry("small-cheese-mat", 0, 0, 0, SMALL_CHEESE_MAT_SIZE, "red");
  const onePanelHigher = moveStationObjectVertical(cheese, "up");
  const aboveCheese = Array.from({ length: 12 }).reduce((object) => moveStationObjectVertical(object, "up"), cheese);

  assert.deepEqual({ length: SMALL_CHEESE_MAT_LENGTH_INCHES, depth: SMALL_CHEESE_MAT_DEPTH_INCHES, height: SMALL_CHEESE_MAT_HEIGHT_INCHES }, { length: 48, depth: 24, height: 16 });
  assert.deepEqual({ width: cheese.width, height: cheese.height, smallCheeseMatColor: cheese.smallCheeseMatColor }, { ...SMALL_CHEESE_MAT_SIZE, smallCheeseMatColor: "orange-purple" });
  assert.deepEqual(SMALL_CHEESE_MAT_COLORS, ["orange-purple", "green", "red"]);
  assert.equal(orangePurple.find((surface) => surface.role === "top")?.color, "orange");
  assert.deepEqual(orangePurple.filter((surface) => surface.role === "side").map((surface) => surface.color), ["purple"]);
  assert.equal(green.find((surface) => surface.role === "top")?.color, "green");
  assert.deepEqual(green.filter((surface) => surface.role === "side").map((surface) => surface.color), ["blue", "yellow", "blue", "yellow"]);
  assert.equal(red.find((surface) => surface.role === "top")?.color, "red");
  assert.deepEqual(red.filter((surface) => surface.role === "side").map((surface) => surface.color), ["blue", "yellow", "blue", "yellow"]);
  assert.equal(smallCheeseMatVerticalHeight(), STATION_STACK_STEP * SMALL_CHEESE_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(cheese, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(cheese, aboveCheese), false);
});

test("Tiny Cheese Mats preserve their all-red 4-foot wedge profile from zero to five inches", () => {
  const cheese = createStationObject("tiny-cheese-mat", 1, "tiny-cheese-mat");
  const surfaces = stationCheeseMatSpriteGeometry("tiny-cheese-mat", 0, 0);
  const onePanelHigher = moveStationObjectVertical(cheese, "up");
  const aboveCheese = Array.from({ length: 4 }).reduce((object) => moveStationObjectVertical(object, "up"), cheese);

  assert.deepEqual({ length: TINY_CHEESE_MAT_LENGTH_INCHES, depth: TINY_CHEESE_MAT_DEPTH_INCHES, height: TINY_CHEESE_MAT_HEIGHT_INCHES }, { length: 48, depth: 24, height: 5 });
  assert.deepEqual({ width: cheese.width, height: cheese.height }, TINY_CHEESE_MAT_SIZE);
  assert.ok(surfaces.every((surface) => surface.color === "red"));
  assert.equal(stationAssetFaceCount("tiny-cheese-mat"), 5);
  assert.equal(tinyCheeseMatVerticalHeight(), STATION_STACK_STEP * TINY_CHEESE_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(cheese, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(cheese, aboveCheese), false);
});

test("Huge Cheese Mats preserve their separate 5 by 7-foot floor footprint and 17-inch rise", () => {
  const bigCheese = createStationObject("big-cheese-mat", 1, "big-cheese-mat");
  const surfaces = stationCheeseMatSpriteGeometry("big-cheese-mat", 0, 0);
  const onePanelHigher = moveStationObjectVertical(bigCheese, "up");
  const aboveBigCheese = Array.from({ length: 12 }).reduce((object) => moveStationObjectVertical(object, "up"), bigCheese);

  assert.deepEqual({ length: BIG_CHEESE_MAT_LENGTH_INCHES, width: BIG_CHEESE_MAT_DEPTH_INCHES, height: BIG_CHEESE_MAT_HEIGHT_INCHES }, { length: 84, width: 60, height: 17 });
  assert.ok(Math.abs(Math.hypot(BIG_CHEESE_MAT_LENGTH_INCHES, BIG_CHEESE_MAT_HEIGHT_INCHES) - BIG_CHEESE_MAT_SLOPED_LENGTH_INCHES) < .000001);
  assert.deepEqual({ width: bigCheese.width, height: bigCheese.height }, BIG_CHEESE_MAT_SIZE);
  assert.equal(surfaces.find((surface) => surface.role === "top")?.color, "green");
  assert.deepEqual(surfaces.filter((surface) => surface.role === "side").map((surface) => surface.color), ["blue", "yellow", "blue", "yellow"]);
  assert.equal(bigCheeseMatVerticalHeight(), STATION_STACK_STEP * BIG_CHEESE_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(bigCheese, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(bigCheese, aboveBigCheese), false);
});

test("Large Cheese Mats remain distinct 4 by 6-foot, 16-inch green, blue, and yellow folding wedges", () => {
  const large = createStationObject("large-cheese-mat", 1, "large-cheese-mat");
  const surfaces = stationCheeseMatSpriteGeometry("large-cheese-mat", 0, 0);
  const closed = setCheeseMatState(large, "closed");

  assert.deepEqual({ length: LARGE_CHEESE_MAT_LENGTH_INCHES, width: LARGE_CHEESE_MAT_DEPTH_INCHES, height: LARGE_CHEESE_MAT_HEIGHT_INCHES }, { length: 72, width: 48, height: 16 });
  assert.deepEqual({ width: large.width, height: large.height }, LARGE_CHEESE_MAT_SIZE);
  assert.notDeepEqual({ width: large.width, height: large.height }, { width: BIG_CHEESE_MAT_SIZE.width, height: BIG_CHEESE_MAT_SIZE.height });
  assert.equal(surfaces.find((surface) => surface.role === "top")?.color, "green");
  assert.equal(surfaces.find((surface) => surface.role === "end")?.color, "blue");
  assert.deepEqual(surfaces.filter((surface) => surface.role === "side").map((surface) => surface.color), ["blue", "yellow", "blue", "yellow"]);
  assert.equal(isFoldableCheeseMatAsset("large-cheese-mat"), true);
  assert.equal(cheeseMatState(closed), "closed");
  assert.equal(stationAssetFaceCount("large-cheese-mat"), 5);
});

test("Every Cheese Mat except the huge Big Cheese folds lengthwise into a compact double-height storage block", () => {
  const foldable = ["tiny-cheese-mat", "small-cheese-mat", "medium-cheese-mat", "large-cheese-mat", "squishy-cheese-mat"] as const;
  for (const assetId of foldable) {
    const open = createStationObject(assetId, 1, `${assetId}-open`);
    const closed = setCheeseMatState(open, "closed");
    const reopened = setCheeseMatState(closed, "open");
    const openCenter = { x: open.x + open.width / 2, y: open.y + open.height / 2 };
    const dimensions = foldedCheeseMatFaceDimensions(assetId, 0);

    assert.equal(isFoldableCheeseMatAsset(assetId), true);
    assert.equal(cheeseMatState(open), "open");
    assert.equal(cheeseMatState(closed), "closed");
    assert.deepEqual({ width: closed.width, height: closed.height }, { width: dimensions.widthInches * 2, height: dimensions.depthInches * 2 });
    assert.deepEqual({ x: closed.x + closed.width / 2, y: closed.y + closed.height / 2 }, openCenter);
    assert.deepEqual({ width: reopened.width, height: reopened.height, x: reopened.x + reopened.width / 2, y: reopened.y + reopened.height / 2 }, { width: open.width, height: open.height, ...openCenter });
    assert.equal(stationObjectVerticalRange(closed).top, closed.elevation! + dimensions.heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP);
  }

  const huge = createStationObject("big-cheese-mat", 1, "huge-cheese");
  assert.equal(isFoldableCheeseMatAsset(huge.assetId), false);
  assert.equal(setCheeseMatState(huge, "closed"), huge);
  assert.equal(isStationSetup({ ...createStationSetup("bad-cheese-state"), objects: [{ ...huge, cheeseMatState: "half-closed" }] }), false);
});

test("Squishy Cheese Mats share Medium Cheese dimensions with a red slope and blue-to-yellow triangular sides", () => {
  const squishy = createStationObject("squishy-cheese-mat", 1, "squishy-cheese-mat");
  const surfaces = stationCheeseMatSpriteGeometry("squishy-cheese-mat", 0, 0);
  const onePanelHigher = moveStationObjectVertical(squishy, "up");
  const aboveSquishy = Array.from({ length: 11 }).reduce((object) => moveStationObjectVertical(object, "up"), squishy);

  assert.deepEqual({ width: squishy.width, height: squishy.height }, SQUISHY_CHEESE_MAT_SIZE);
  assert.deepEqual(SQUISHY_CHEESE_MAT_SIZE, MEDIUM_CHEESE_MAT_SIZE);
  assert.deepEqual(SQUISHY_CHEESE_MAT_SIDE_SECTIONS, [{ color: "blue", startFraction: 0, endFraction: 1 / 3 }, { color: "yellow", startFraction: 1 / 3, endFraction: 1 }]);
  assert.equal(surfaces.find((surface) => surface.role === "top")?.color, "red");
  assert.deepEqual(surfaces.filter((surface) => surface.role === "side").map((surface) => surface.color), ["blue", "yellow"]);
  assert.equal(stationObjectsOverlap(squishy, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(squishy, aboveSquishy), false);
});

test("Cloud Mats retain their 70 by 46.5 by 8-inch dimensions and stacking clearance", () => {
  const cloud = createStationObject("cloud-mat", 1, "cloud-mat");
  const oneStackStepHigher = moveStationObjectVertical(cloud, "up");
  const aboveCloudMat = Array.from({ length: 6 }).reduce((object) => moveStationObjectVertical(object, "up"), cloud);

  assert.deepEqual({ length: CLOUD_MAT_LENGTH_INCHES, depth: CLOUD_MAT_DEPTH_INCHES, height: CLOUD_MAT_HEIGHT_INCHES }, { length: 70, depth: 46.5, height: 8 });
  assert.equal(CLOUD_MAT_VELCRO_INSET_INCHES, 3);
  assert.deepEqual({ width: cloud.width, height: cloud.height }, CLOUD_MAT_SIZE);
  assert.deepEqual(cloudMatDimensions(), { widthInches: 70, depthInches: 46.5, heightInches: 8 });
  assert.equal(cloudMatVerticalHeight(), STATION_STACK_STEP * CLOUD_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(cloud, oneStackStepHigher), true);
  assert.equal(stationObjectsOverlap(cloud, aboveCloudMat), false);
});

test("Springboards retain their 2-foot by 4-foot top, 8-inch rise, colors, and stacking clearance", () => {
  const springboard = createStationObject("springboard", 1, "springboard");
  const surfaces = springboardSpriteGeometry(0);
  const springs = springboardSpringGeometry(0);
  const onePanelHigher = moveStationObjectVertical(springboard, "up");
  const aboveSpringboard = Array.from({ length: 6 }).reduce((object) => moveStationObjectVertical(object, "up"), springboard);

  assert.deepEqual({ topLength: SPRINGBOARD_TOP_LENGTH_INCHES, topDepth: SPRINGBOARD_TOP_DEPTH_INCHES, height: SPRINGBOARD_HEIGHT_INCHES }, { topLength: 48, topDepth: 24, height: 8 });
  assert.ok(Math.abs(Math.hypot(SPRINGBOARD_FLOOR_LENGTH_INCHES, SPRINGBOARD_HEIGHT_INCHES) - SPRINGBOARD_TOP_LENGTH_INCHES) < .000001);
  assert.deepEqual({ width: springboard.width, height: springboard.height }, SPRINGBOARD_SIZE);
  assert.equal(springboard.color, "white-grey");
  assert.deepEqual(SPRINGBOARD_COLORS, ["white-grey", "burgundy", "red", "orange", "blue-grey"]);
  assert.ok(surfaces.some((surface) => surface.role === "top"));
  assert.ok(surfaces.some((surface) => surface.role === "end"));
  assert.equal(SPRINGBOARD_SPRING_COUNT, 6);
  assert.equal(SPRINGBOARD_SPRING_COILS, 4);
  assert.equal(springs.length, SPRINGBOARD_SPRING_COUNT);
  assert.ok(springs.every((spring) => spring.length === SPRINGBOARD_SPRING_COILS * 4 + 1));
  assert.equal(springboardVerticalHeight(), STATION_STACK_STEP * SPRINGBOARD_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(springboard, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(springboard, aboveSpringboard), false);
});

test("Preschool Springboards retain their 20 by 30-inch red wedge, 6.5-inch rise, purple footprints, and four springs", () => {
  const springboard = createStationObject("preschool-springboard", 1, "preschool-springboard");
  const sprite = preschoolSpringboardSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(springboard, "up");
  const aboveSpringboard = Array.from({ length: 5 }).reduce((object) => moveStationObjectVertical(object, "up"), springboard);

  assert.deepEqual({ topLength: PRESCHOOL_SPRINGBOARD_TOP_LENGTH_INCHES, topDepth: PRESCHOOL_SPRINGBOARD_TOP_DEPTH_INCHES, height: PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES }, { topLength: 30, topDepth: 20, height: 6.5 });
  assert.ok(Math.abs(Math.hypot(PRESCHOOL_SPRINGBOARD_FLOOR_LENGTH_INCHES, PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES) - PRESCHOOL_SPRINGBOARD_TOP_LENGTH_INCHES) < .000001);
  assert.deepEqual({ width: springboard.width, height: springboard.height }, PRESCHOOL_SPRINGBOARD_SIZE);
  assert.ok(sprite.surfaces.some((surface) => surface.role === "top"));
  assert.ok(sprite.surfaces.some((surface) => surface.role === "end"));
  assert.equal(PRESCHOOL_SPRINGBOARD_SPRING_COUNT, 4);
  assert.equal(PRESCHOOL_SPRINGBOARD_SPRING_COILS, 4);
  assert.equal(sprite.springs.length, PRESCHOOL_SPRINGBOARD_SPRING_COUNT);
  assert.ok(sprite.springs.every((spring) => spring.length === PRESCHOOL_SPRINGBOARD_SPRING_COILS * 4 + 1));
  assert.equal(sprite.purpleFootprints.length, 2);
  assert.equal(stationAsset("preschool-springboard").noFlip, true);
  assert.equal(stationAssetFaceCount("preschool-springboard"), 0);
  assert.equal(isStationAssetFlippable("preschool-springboard"), false);
  assert.equal(preschoolSpringboardVerticalHeight(), STATION_STACK_STEP * PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(springboard, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(springboard, aboveSpringboard), false);
});

test("T Trainers retain their blue runway, raised rails, markings, frame, slope, and stacking clearance", () => {
  const trainer = createStationObject("t-trainer", 1, "t-trainer");
  const sprite = tTrainerSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(trainer, "up");
  const aboveTrainer = Array.from({ length: 17 }).reduce((object) => moveStationObjectVertical(object, "up"), trainer);

  assert.deepEqual({ length: T_TRAINER_TRAMPOLINE_LENGTH_INCHES, depth: T_TRAINER_TRAMPOLINE_DEPTH_INCHES, bedDepth: T_TRAINER_BED_DEPTH_INCHES, railWidth: T_TRAINER_RAIL_WIDTH_INCHES, low: T_TRAINER_LOW_HEIGHT_INCHES, high: T_TRAINER_HIGH_HEIGHT_INCHES, railRise: T_TRAINER_RAIL_RISE_INCHES, totalHeight: T_TRAINER_TOTAL_HEIGHT_INCHES }, { length: 50, depth: 35, bedDepth: 25, railWidth: 5, low: 12, high: 20, railRise: 5, totalHeight: 25 });
  assert.ok(Math.abs(Math.hypot(T_TRAINER_FLOOR_LENGTH_INCHES, T_TRAINER_HIGH_HEIGHT_INCHES - T_TRAINER_LOW_HEIGHT_INCHES) - T_TRAINER_TRAMPOLINE_LENGTH_INCHES) < .000001);
  assert.deepEqual({ width: trainer.width, height: trainer.height }, T_TRAINER_SIZE);
  assert.equal(sprite.frameBars.length, 7);
  assert.ok(sprite.railFaces.length >= 2);
  assert.ok(sprite.runwaySides.length > 0);
  assert.equal(sprite.dashes.length, T_TRAINER_DASH_COUNT);
  assert.equal(sprite.crossLine.length, 4);
  assert.equal(T_TRAINER_CROSS_LINE_FROM_HIGH_INCHES, 22);
  assert.equal(tTrainerVerticalHeight(), STATION_STACK_STEP * T_TRAINER_TOTAL_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(trainer, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(trainer, aboveTrainer), false);
});

test("Mail Boxes retain their 34 by 19 by 15-inch arched profile, end caps, and stacking clearance", () => {
  const mailBox = createStationObject("mail-box", 1, "mail-box");
  const sprite = mailBoxSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(mailBox, "up");
  const aboveMailBox = Array.from({ length: 10 }).reduce((object) => moveStationObjectVertical(object, "up"), mailBox);

  assert.deepEqual({ length: MAIL_BOX_LENGTH_INCHES, depth: MAIL_BOX_DEPTH_INCHES, height: MAIL_BOX_HEIGHT_INCHES, base: MAIL_BOX_BASE_HEIGHT_INCHES }, { length: 34, depth: 19, height: 15, base: 5.5 });
  assert.deepEqual({ width: mailBox.width, height: mailBox.height }, MAIL_BOX_SIZE);
  assert.ok(sprite.redFaces.length > 0);
  assert.equal(sprite.yellowEndCaps.length, 1);
  assert.equal(sprite.redEndStraps.length, 1);
  assert.equal(sprite.blackEndLabels.length, 2);
  assert.equal(MAIL_BOX_ROOF_SEGMENTS, 8);
  assert.equal(mailBoxVerticalHeight(), STATION_STACK_STEP * MAIL_BOX_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(mailBox, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(mailBox, aboveMailBox), false);
});

test("Green Mailboxes retain their tall 24 by 17.5 by 33-inch classic profile, colors, and stacking clearance", () => {
  const mailBox = createStationObject("green-mail-box", 1, "green-mail-box");
  const sprite = greenMailBoxSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(mailBox, "up");
  const aboveMailBox = Array.from({ length: 22 }).reduce((object) => moveStationObjectVertical(object, "up"), mailBox);

  assert.deepEqual({ length: GREEN_MAIL_BOX_LENGTH_INCHES, depth: GREEN_MAIL_BOX_DEPTH_INCHES, height: GREEN_MAIL_BOX_HEIGHT_INCHES, base: GREEN_MAIL_BOX_BASE_HEIGHT_INCHES }, { length: 24, depth: 17.5, height: 33, base: 24.25 });
  assert.deepEqual({ width: mailBox.width, height: mailBox.height, color: mailBox.color }, { width: GREEN_MAIL_BOX_SIZE.width, height: GREEN_MAIL_BOX_SIZE.height, color: "green" });
  assert.ok(sprite.redFaces.length > 0);
  assert.equal(sprite.yellowEndCaps.length, 1);
  assert.equal(sprite.redEndStraps.length, 1);
  assert.equal(sprite.blackEndLabels.length, 2);
  assert.equal(greenMailBoxVerticalHeight(), STATION_STACK_STEP * GREEN_MAIL_BOX_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(mailBox, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(mailBox, aboveMailBox), false);
});

test("Colts retain their 31 by 15 by 16-inch portable mini-pommel profile, handles, and stacking clearance", () => {
  const colt = createStationObject("colt", 1, "colt");
  const sprite = coltSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(colt, "up");
  const aboveColt = Array.from({ length: 11 }).reduce((object) => moveStationObjectVertical(object, "up"), colt);

  assert.deepEqual({ length: COLT_LENGTH_INCHES, depth: COLT_DEPTH_INCHES, height: COLT_HEIGHT_INCHES, base: COLT_BASE_HEIGHT_INCHES, roofRadius: COLT_ROOF_RADIUS_INCHES, handleRise: COLT_HANDLE_RISE_INCHES }, { length: 31, depth: 15, height: 16, base: 6, roofRadius: 6, handleRise: 4 });
  assert.deepEqual({ width: colt.width, height: colt.height }, COLT_SIZE);
  assert.equal(COLT_ROOF_SEGMENTS, 8);
  assert.ok(sprite.grayBaseFaces.length > 0);
  assert.ok(sprite.caramelRoofFaces.length > 0);
  assert.equal(sprite.grayEndFaces.length, 1);
  assert.equal(sprite.caramelEndFaces.length, 1);
  assert.equal(sprite.blackHandleBases.length, 4);
  assert.equal(sprite.tanHandleBars.length, 2);
  assert.equal(stationAsset("colt").noFlip, true);
  assert.equal(coltVerticalHeight(), STATION_STACK_STEP * COLT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(colt, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(colt, aboveColt), false);
});

test("Parallettes retain their single 12-inch bar, 8-inch base, angled wooden supports, and 5-inch stacking clearance", () => {
  const parallette = createStationObject("parallette", 1, "parallette");
  const sprite = paralletteSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(parallette, "up");
  const aboveParallette = Array.from({ length: 4 }).reduce((object) => moveStationObjectVertical(object, "up"), parallette);

  assert.deepEqual({ length: PARALLETTE_LENGTH_INCHES, baseDepth: PARALLETTE_BASE_DEPTH_INCHES, height: PARALLETTE_HEIGHT_INCHES }, { length: 12, baseDepth: 8, height: 5 });
  assert.deepEqual({ width: parallette.width, height: parallette.height }, PARALLETTE_SIZE);
  assert.ok(sprite.barFaces.length > 0);
  assert.equal(sprite.supportFaces.length, 2);
  assert.equal(sprite.barEndFaces.length, 1);
  assert.equal(stationAsset("parallette").noFlip, true);
  assert.equal(paralletteVerticalHeight(), STATION_STACK_STEP * PARALLETTE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(parallette, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(parallette, aboveParallette), false);
});

test("Mini Low Bars retain the 51-inch brown rail, 18-inch bases, selectable base colors, and both real heights", () => {
  const miniLowBar = createStationObject("mini-low-bar", 1, "mini-low-bar");
  const tallBlueBar = { ...miniLowBar, miniLowBarBaseColor: "blue" as const, miniLowBarHeightInches: 13 as const, rotation: 30 };
  const sprite = miniLowBarSpriteGeometry(tallBlueBar.rotation, 0, miniLowBarHeight(tallBlueBar), { width: tallBlueBar.width, height: tallBlueBar.height });
  const onePanelHigher = moveStationObjectVertical(tallBlueBar, "up");
  const aboveTallLowBar = Array.from({ length: 9 }).reduce((object) => moveStationObjectVertical(object, "up"), tallBlueBar);

  assert.deepEqual({ length: MINI_LOW_BAR_LENGTH_INCHES, baseDepth: MINI_LOW_BAR_BASE_DEPTH_INCHES, defaultHeight: MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES }, { length: 51, baseDepth: 18, defaultHeight: 7 });
  assert.deepEqual({ width: miniLowBar.width, height: miniLowBar.height }, MINI_LOW_BAR_SIZE);
  assert.deepEqual(MINI_LOW_BAR_BASE_COLORS, ["gray", "red", "blue"]);
  assert.deepEqual(MINI_LOW_BAR_HEIGHTS_INCHES, [7, 13]);
  assert.deepEqual({ baseColor: miniLowBar.miniLowBarBaseColor, height: miniLowBarHeight(miniLowBar) }, { baseColor: "gray", height: 7 });
  assert.equal(stationAsset("mini-low-bar").noFlip, true);
  assert.equal(stationAssetFaceCount("mini-low-bar"), 0);
  assert.equal(isStationAssetFlippable("mini-low-bar"), false);
  assert.ok(sprite.railFaces.length > 0);
  assert.ok(sprite.baseFaces.length > 0);
  assert.ok(sprite.supportFaces.length > 0);
  assert.equal(sprite.railEndFaces.length, 1);
  assert.equal(miniLowBarVerticalHeight(miniLowBarHeight(miniLowBar)), STATION_STACK_STEP * 7 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(miniLowBarVerticalHeight(miniLowBarHeight(tallBlueBar)), STATION_STACK_STEP * 13 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(tallBlueBar, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(tallBlueBar, aboveTallLowBar), false);
  assert.equal(isStationSetup({ ...createStationSetup("mini-low-bar-blue"), objects: [tallBlueBar] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-mini-low-bar-color"), objects: [{ ...miniLowBar, miniLowBarBaseColor: "purple" }] }), false);
  assert.equal(isStationSetup({ ...createStationSetup("bad-mini-low-bar-height"), objects: [{ ...miniLowBar, miniLowBarHeightInches: 10 }] }), false);
});

test("Advanced Mini Bars retain their 69-inch tan rail, 44-inch height, orange T feet, and adjustable upright details", () => {
  const advancedBar = createStationObject("advanced-mini-bar", 1, "advanced-mini-bar");
  const sprite = advancedMiniBarSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(advancedBar, "up");
  const aboveAdvancedBar = Array.from({ length: 30 }).reduce((object) => moveStationObjectVertical(object, "up"), advancedBar);

  assert.deepEqual({ length: ADVANCED_MINI_BAR_LENGTH_INCHES, height: ADVANCED_MINI_BAR_HEIGHT_INCHES, baseDepth: ADVANCED_MINI_BAR_BASE_DEPTH_INCHES, railDiameter: ADVANCED_MINI_BAR_RAIL_DIAMETER_INCHES }, { length: 69, height: 44, baseDepth: 18, railDiameter: 1.5 });
  assert.deepEqual({ width: advancedBar.width, height: advancedBar.height }, ADVANCED_MINI_BAR_SIZE);
  assert.equal(ADVANCED_MINI_BAR_RAIL_SEGMENTS, 6);
  assert.ok(sprite.tanRailFaces.length > 0);
  assert.equal(sprite.tanRailEnds.length, 1);
  assert.equal(sprite.orangeBaseFaces.length, 6);
  assert.ok(sprite.orangePostFaces.length > 0);
  assert.ok(sprite.silverSupportFaces.length > 0);
  assert.ok(sprite.greenMountFaces.length > 0);
  assert.ok(sprite.blackKnobs.length > 0);
  assert.equal(advancedMiniBarFloorFootprints(advancedBar).length, 2);
  assert.equal(stationAsset("advanced-mini-bar").noFlip, true);
  assert.equal(stationAssetFaceCount("advanced-mini-bar"), 0);
  assert.equal(isStationAssetFlippable("advanced-mini-bar"), false);
  assert.equal(advancedMiniBarVerticalHeight(), STATION_STACK_STEP * ADVANCED_MINI_BAR_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(advancedBar, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(advancedBar, aboveAdvancedBar), false);
});

test("Rec Mini Bars retain their 51-inch tan rail, 39-inch height, blue T feet, and unadorned uprights", () => {
  const recBar = createStationObject("rec-mini-bar", 1, "rec-mini-bar");
  const sprite = recMiniBarSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(recBar, "up");
  const aboveRecBar = Array.from({ length: 27 }).reduce((object) => moveStationObjectVertical(object, "up"), recBar);

  assert.deepEqual({ length: REC_MINI_BAR_LENGTH_INCHES, height: REC_MINI_BAR_HEIGHT_INCHES, reportedThirdMeasure: REC_MINI_BAR_REPORTED_THIRD_MEASURE_INCHES, baseDepth: REC_MINI_BAR_BASE_DEPTH_INCHES, railDiameter: REC_MINI_BAR_RAIL_DIAMETER_INCHES }, { length: 51, height: 39, reportedThirdMeasure: 4, baseDepth: 18, railDiameter: 1.5 });
  assert.deepEqual({ width: recBar.width, height: recBar.height }, REC_MINI_BAR_SIZE);
  assert.equal(REC_MINI_BAR_RAIL_SEGMENTS, 6);
  assert.ok(sprite.tanRailFaces.length > 0);
  assert.equal(sprite.tanRailEnds.length, 1);
  assert.equal(sprite.blueBaseFaces.length, 6);
  assert.ok(sprite.bluePostFaces.length > 0);
  assert.ok(sprite.silverUpperFaces.length > 0);
  assert.ok(sprite.blackElbowFaces.length > 0);
  assert.ok(sprite.blackKnobs.length > 0);
  assert.equal(recMiniBarFloorFootprints(recBar).length, 2);
  assert.equal(stationAsset("rec-mini-bar").noFlip, true);
  assert.equal(stationAssetFaceCount("rec-mini-bar"), 0);
  assert.equal(isStationAssetFlippable("rec-mini-bar"), false);
  assert.equal(recMiniBarVerticalHeight(), STATION_STACK_STEP * REC_MINI_BAR_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(recBar, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(recBar, aboveRecBar), false);
});

test("Traffic cones, target markers, and beanbags retain their supplied scale, literal shapes, and stacking clearance", () => {
  const cone = createStationObject("traffic-cone", 1, "traffic-cone");
  const marker = createStationObject("target-marker", 2, "target-marker");
  const beanbag = createStationObject("beanbag", 3, "beanbag");
  const coneSprite = trafficConeSpriteGeometry(0);
  const markerSprite = targetMarkerSpriteGeometry(30);
  const beanbagSprite = beanbagSpriteGeometry(30);
  const onePanelHigherCone = moveStationObjectVertical(cone, "up");
  const aboveCone = Array.from({ length: 5 }).reduce((object) => moveStationObjectVertical(object, "up"), cone);
  const onePanelHigherMarker = moveStationObjectVertical(marker, "up");
  const onePanelHigherBeanbag = moveStationObjectVertical(beanbag, "up");

  assert.deepEqual({ height: TRAFFIC_CONE_HEIGHT_INCHES, base: TRAFFIC_CONE_BASE_SIZE_INCHES, baseHeight: TRAFFIC_CONE_BASE_HEIGHT_INCHES, topDiameter: TRAFFIC_CONE_TOP_DIAMETER_INCHES }, { height: 7, base: 5, baseHeight: .5, topDiameter: 1.25 });
  assert.equal(TRAFFIC_CONE_SEGMENTS, 6);
  assert.deepEqual({ width: cone.width, height: cone.height }, TRAFFIC_CONE_SIZE);
  assert.ok(coneSprite.orangeBaseFaces.length > 0);
  assert.ok(coneSprite.orangeConeFaces.length > 0);
  assert.equal(coneSprite.orangeTip.length, TRAFFIC_CONE_SEGMENTS);
  assert.equal(stationAsset("traffic-cone").noFlip, true);
  assert.equal(stationAssetFaceCount("traffic-cone"), 0);
  assert.equal(trafficConeVerticalHeight(), STATION_STACK_STEP * TRAFFIC_CONE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(cone, onePanelHigherCone), true);
  assert.equal(stationObjectsOverlap(cone, aboveCone), false);

  assert.deepEqual({ diameter: TARGET_MARKER_DIAMETER_INCHES, radius: TARGET_MARKER_RADIUS_INCHES, height: TARGET_MARKER_HEIGHT_INCHES, redRatio: TARGET_MARKER_RED_TARGET_RATIO }, { diameter: 9, radius: 4.5, height: .25, redRatio: .38 });
  assert.equal(TARGET_MARKER_SEGMENTS, 12);
  assert.deepEqual({ width: marker.width, height: marker.height }, TARGET_MARKER_SIZE);
  assert.equal(markerSprite.yellowTop.length, TARGET_MARKER_SEGMENTS);
  assert.ok(markerSprite.yellowSides.length > 0);
  assert.equal(markerSprite.redTarget.length, TARGET_MARKER_SEGMENTS);
  assert.equal(stationObjectFloorFootprint(marker).length, TARGET_MARKER_SEGMENTS);
  assert.equal(stationAsset("target-marker").noFlip, true);
  assert.equal(stationAssetFaceCount("target-marker"), 0);
  assert.equal(targetMarkerVerticalHeight(), STATION_STACK_STEP * TARGET_MARKER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(marker, onePanelHigherMarker), false);

  assert.deepEqual({ square: BEANBAG_SQUARE_SIZE_INCHES, centerSquare: BEANBAG_CENTER_SQUARE_SIZE_INCHES, centerThickness: BEANBAG_CENTER_THICKNESS_INCHES }, { square: 5.5, centerSquare: 2.25, centerThickness: .5 });
  assert.deepEqual({ width: beanbag.width, height: beanbag.height }, BEANBAG_SIZE);
  assert.equal(beanbagSprite.center.length, 4);
  assert.equal(beanbagSprite.slopes.length, 4);
  assert.ok(beanbagSprite.slopes.every((slope) => slope.length === 4));
  assert.equal(stationAsset("beanbag").noFlip, true);
  assert.equal(stationAssetFaceCount("beanbag"), 0);
  assert.equal(beanbagVerticalHeight(), STATION_STACK_STEP * BEANBAG_CENTER_THICKNESS_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(beanbag, onePanelHigherBeanbag), false);
});

test("Rainbow Mats retain their 49-inch blue arch, 24-inch semicircle opening, colored ends, and open tunnel collision", () => {
  const rainbowMat = createStationObject("rainbow-mat", 1, "rainbow-mat");
  const sprite = rainbowMatSpriteGeometry(0);
  const reverseSprite = rainbowMatSpriteGeometry(180);
  const tunnelBeanbag = {
    ...createStationObject("beanbag", 2, "tunnel-beanbag"),
    x: rainbowMat.x + rainbowMat.width / 2 - BEANBAG_SIZE.width / 2,
    y: rainbowMat.y + rainbowMat.height / 2 - BEANBAG_SIZE.height / 2,
  };
  const onePanelHigher = moveStationObjectVertical(rainbowMat, "up");
  const aboveRainbowMat = Array.from({ length: 17 }).reduce((object) => moveStationObjectVertical(object, "up"), rainbowMat);

  assert.deepEqual({ diameter: RAINBOW_MAT_DIAMETER_INCHES, depth: RAINBOW_MAT_DEPTH_INCHES, cutoutDiameter: RAINBOW_MAT_CUTOUT_DIAMETER_INCHES, radius: RAINBOW_MAT_RADIUS_INCHES, cutoutRadius: RAINBOW_MAT_CUTOUT_RADIUS_INCHES }, { diameter: 49, depth: 15.5, cutoutDiameter: 24, radius: 24.5, cutoutRadius: 12 });
  assert.equal(RAINBOW_MAT_ARCH_SEGMENTS, 8);
  assert.deepEqual({ width: rainbowMat.width, height: rainbowMat.height }, RAINBOW_MAT_SIZE);
  assert.ok(sprite.blueOuterFaces.length > 0);
  assert.equal(sprite.cyanEndFaces.length, RAINBOW_MAT_ARCH_SEGMENTS);
  assert.equal(reverseSprite.yellowEndFaces.length, RAINBOW_MAT_ARCH_SEGMENTS);
  assert.ok(sprite.redInnerFaces.length > 0);
  assert.equal(rainbowMatFloorFootprints(rainbowMat).length, 2);
  assert.equal(stationAsset("rainbow-mat").noFlip, true);
  assert.equal(stationAssetFaceCount("rainbow-mat"), 0);
  assert.equal(isStationAssetFlippable("rainbow-mat"), false);
  assert.equal(rainbowMatVerticalHeight(), STATION_STACK_STEP * RAINBOW_MAT_RADIUS_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(rainbowMat, tunnelBeanbag), false);
  assert.equal(stationObjectsOverlap(rainbowMat, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(rainbowMat, aboveRainbowMat), false);
});

test("Pac-Man Blocks retain their 32-inch by 27-inch red-and-yellow profile and an open quarter-circle collision mouth", () => {
  const pacMan = createStationObject("pac-man", 1, "pac-man");
  const sprite = pacManSpriteGeometry(0);
  const mouthBeanbag = {
    ...createStationObject("beanbag", 2, "pac-man-mouth"),
    x: pacMan.x + pacMan.width / 2 + 7,
    y: pacMan.y + pacMan.height / 2 - BEANBAG_SIZE.height / 2,
  };
  const onePanelHigher = moveStationObjectVertical(pacMan, "up");
  const abovePacMan = Array.from({ length: 19 }).reduce((object) => moveStationObjectVertical(object, "up"), pacMan);

  assert.deepEqual({ diameter: PAC_MAN_DIAMETER_INCHES, radius: PAC_MAN_RADIUS_INCHES, height: PAC_MAN_HEIGHT_INCHES }, { diameter: 32, radius: 16, height: 27 });
  assert.equal(PAC_MAN_CURVE_SEGMENTS, 9);
  assert.deepEqual({ width: pacMan.width, height: pacMan.height }, PAC_MAN_SIZE);
  assert.ok(sprite.redCurvedSides.length > 0);
  assert.ok(sprite.redCutoutSides.length > 0);
  assert.equal(sprite.yellowTop.length, PAC_MAN_CURVE_SEGMENTS + 2);
  assert.equal(pacManFloorFootprints(pacMan).length, 3);
  assert.equal(stationAsset("pac-man").noFlip, true);
  assert.equal(stationAssetFaceCount("pac-man"), 0);
  assert.equal(isStationAssetFlippable("pac-man"), false);
  assert.equal(pacManVerticalHeight(), STATION_STACK_STEP * PAC_MAN_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(pacMan, mouthBeanbag), false);
  assert.equal(stationObjectsOverlap(pacMan, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(pacMan, abovePacMan), false);
});

test("Trapezes retain a faceted 21-inch brown bar beneath two 24-inch black straps", () => {
  const trapeze = createStationObject("trapeze", 1, "trapeze");
  const rotated = { ...trapeze, rotation: 30 };
  const sprite = trapezeSpriteGeometry(rotated.rotation, 0, { width: rotated.width, height: rotated.height });
  const onePanelHigher = moveStationObjectVertical(trapeze, "up");
  const aboveTrapeze = Array.from({ length: 17 }).reduce((object) => moveStationObjectVertical(object, "up"), trapeze);
  const floorFootprint = stationObjectFloorFootprint(rotated);

  assert.deepEqual({ length: TRAPEZE_BAR_LENGTH_INCHES, thickness: TRAPEZE_BAR_THICKNESS_INCHES, straps: TRAPEZE_STRAP_LENGTH_INCHES }, { length: 21, thickness: 1.5, straps: 24 });
  assert.deepEqual({ width: trapeze.width, height: trapeze.height }, TRAPEZE_SIZE);
  assert.equal(TRAPEZE_BAR_SEGMENTS, 6);
  assert.ok(sprite.barFaces.length > 0);
  assert.equal(sprite.barEndCaps.length, 1);
  assert.equal(sprite.straps.length, 2);
  assert.equal(floorFootprint.length, 4);
  assert.ok(Math.max(...floorFootprint.map((point) => point.y)) - Math.min(...floorFootprint.map((point) => point.y)) < 20);
  assert.equal(stationAsset("trapeze").noFlip, true);
  assert.equal(stationAssetFaceCount("trapeze"), 0);
  assert.equal(isStationAssetFlippable("trapeze"), false);
  assert.equal(trapezeVerticalHeight(), STATION_STACK_STEP * 25.5 / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(trapeze, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(trapeze, aboveTrapeze), false);
  assert.equal(isStationSetup({ ...createStationSetup("trapeze-setup"), objects: [rotated] }), true);
});

test("PVC Pipes retain their white, 36-inch by 1-inch faceted cylinder profile and stacking clearance", () => {
  const pipe = createStationObject("pvc-pipe", 1, "pvc-pipe");
  const sprite = pvcPipeSpriteGeometry(0);
  const overlappingPipe = { ...pipe, elevation: pvcPipeVerticalHeight() - 1 };
  const onePanelHigher = moveStationObjectVertical(pipe, "up");

  assert.deepEqual({ length: PVC_PIPE_LENGTH_INCHES, diameter: PVC_PIPE_DIAMETER_INCHES, radius: PVC_PIPE_RADIUS_INCHES }, { length: 36, diameter: 1, radius: .5 });
  assert.deepEqual({ width: pipe.width, height: pipe.height }, PVC_PIPE_SIZE);
  assert.equal(PVC_PIPE_SEGMENTS, 6);
  assert.equal(sprite.lateralFaces.length, 3);
  assert.equal(sprite.endCaps.length, 1);
  assert.equal(stationAsset("pvc-pipe").noFlip, true);
  assert.equal(pvcPipeVerticalHeight(), STATION_STACK_STEP * PVC_PIPE_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(pipe, overlappingPipe), true);
  assert.equal(stationObjectsOverlap(pipe, onePanelHigher), false);
});

test("Small Bar Pads retain their red nine-inch by two-inch padded cylinder profile and stacking clearance", () => {
  const pad = createStationObject("small-bar-pad", 1, "small-bar-pad");
  const sprite = smallBarPadSpriteGeometry(0);
  const overlappingPad = { ...pad, elevation: smallBarPadVerticalHeight() - 1 };
  const onePanelHigher = moveStationObjectVertical(pad, "up");

  assert.deepEqual({ length: SMALL_BAR_PAD_LENGTH_INCHES, diameter: SMALL_BAR_PAD_DIAMETER_INCHES, radius: SMALL_BAR_PAD_RADIUS_INCHES }, { length: 9, diameter: 2, radius: 1 });
  assert.deepEqual({ width: pad.width, height: pad.height }, SMALL_BAR_PAD_SIZE);
  assert.equal(SMALL_BAR_PAD_SEGMENTS, 6);
  assert.equal(sprite.lateralFaces.length, 3);
  assert.equal(sprite.endCaps.length, 1);
  assert.equal(stationAsset("small-bar-pad").noFlip, true);
  assert.equal(stationAssetFaceCount("small-bar-pad"), 0);
  assert.equal(isStationAssetFlippable("small-bar-pad"), false);
  assert.equal(smallBarPadVerticalHeight(), STATION_STACK_STEP * SMALL_BAR_PAD_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(pad, overlappingPad), true);
  assert.equal(stationObjectsOverlap(pad, onePanelHigher), true);
});

test("Rolling Bars retain their red 17-inch axle, blue five-inch octagonal wheels, and wheel-height clearance", () => {
  const rollingBar = createStationObject("rolling-bar", 1, "rolling-bar");
  const sprite = rollingBarSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(rollingBar, "up");
  const aboveRollingBar = Array.from({ length: 4 }).reduce((object) => moveStationObjectVertical(object, "up"), rollingBar);

  assert.deepEqual({ axleLength: ROLLING_BAR_AXLE_LENGTH_INCHES, axleDiameter: ROLLING_BAR_AXLE_DIAMETER_INCHES, wheelDiameter: ROLLING_BAR_WHEEL_DIAMETER_INCHES, wheelThickness: ROLLING_BAR_WHEEL_THICKNESS_INCHES, totalLength: ROLLING_BAR_TOTAL_LENGTH_INCHES }, { axleLength: 17, axleDiameter: 1.5, wheelDiameter: 5, wheelThickness: 1.5, totalLength: 20 });
  assert.deepEqual({ width: rollingBar.width, height: rollingBar.height }, ROLLING_BAR_SIZE);
  assert.equal(ROLLING_BAR_WHEEL_SEGMENTS, 8);
  assert.ok(sprite.redBarFaces.length > 0);
  assert.ok(sprite.blueWheelFaces.length > 0);
  assert.equal(sprite.blueWheelEnds.length, 1);
  assert.equal(stationAsset("rolling-bar").noFlip, true);
  assert.equal(stationAssetFaceCount("rolling-bar"), 0);
  assert.equal(isStationAssetFlippable("rolling-bar"), false);
  assert.equal(rollingBarVerticalHeight(), STATION_STACK_STEP * ROLLING_BAR_WHEEL_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(rollingBar, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(rollingBar, aboveRollingBar), false);
});

test("Wooden Climbing Ladders retain open light-wood rails and rungs for visible-gap collision and stacking", () => {
  const ladder = createStationObject("wooden-climbing-ladder", 1, "wooden-climbing-ladder");
  const sprite = woodenClimbingLadderSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(ladder, "up");
  const aboveLadder = Array.from({ length: 3 }).reduce((object) => moveStationObjectVertical(object, "up"), ladder);
  const rungSpacing = (WOODEN_CLIMBING_LADDER_LENGTH_INCHES - 10) / (WOODEN_CLIMBING_LADDER_RUNG_COUNT - 1);
  const gapCenter = -WOODEN_CLIMBING_LADDER_LENGTH_INCHES / 2 + 5 + rungSpacing / 2;
  const rungCenter = -WOODEN_CLIMBING_LADDER_LENGTH_INCHES / 2 + 5;
  const gapProbeBase = createStationObject("small-bar-pad", 2, "ladder-gap-probe");
  const gapProbe = {
    ...gapProbeBase,
    rotation: 90,
    x: ladder.x + ladder.width / 2 + gapCenter * 1.15 - gapProbeBase.width / 2,
    y: ladder.y + ladder.height / 2 - gapProbeBase.height / 2,
  };
  const rungProbe = { ...gapProbe, id: "ladder-rung-probe", x: ladder.x + ladder.width / 2 + rungCenter * 1.15 - gapProbeBase.width / 2 };

  assert.deepEqual({ length: WOODEN_CLIMBING_LADDER_LENGTH_INCHES, width: WOODEN_CLIMBING_LADDER_WIDTH_INCHES, thickness: WOODEN_CLIMBING_LADDER_THICKNESS_INCHES, railWidth: WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES, rungWidth: WOODEN_CLIMBING_LADDER_RUNG_WIDTH_INCHES, rungThickness: WOODEN_CLIMBING_LADDER_RUNG_THICKNESS_INCHES }, { length: 72, width: 19, thickness: 3.5, railWidth: 1.5, rungWidth: 1.25, rungThickness: 1.25 });
  assert.deepEqual({ width: ladder.width, height: ladder.height }, WOODEN_CLIMBING_LADDER_SIZE);
  assert.equal(WOODEN_CLIMBING_LADDER_RUNG_COUNT, 8);
  assert.equal(sprite.railTops.length, 2);
  assert.equal(sprite.rungTops.length, WOODEN_CLIMBING_LADDER_RUNG_COUNT);
  assert.ok(sprite.railSides.length > 0);
  assert.ok(sprite.rungSides.length > 0);
  assert.equal(woodenClimbingLadderFloorFootprints(ladder).length, WOODEN_CLIMBING_LADDER_RUNG_COUNT + 2);
  assert.equal(stationAsset("wooden-climbing-ladder").noFlip, true);
  assert.equal(stationAssetFaceCount("wooden-climbing-ladder"), 0);
  assert.equal(isStationAssetFlippable("wooden-climbing-ladder"), false);
  assert.equal(woodenClimbingLadderVerticalHeight(), STATION_STACK_STEP * WOODEN_CLIMBING_LADDER_THICKNESS_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(ladder, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(ladder, aboveLadder), false);
  assert.equal(stationObjectsOverlap(ladder, gapProbe), false);
  assert.equal(stationObjectsOverlap(ladder, rungProbe), true);
  assert.equal(autoStackStationObject(gapProbe, [ladder])?.elevation, 0);
  assert.equal(autoStackStationObject(rungProbe, [ladder])?.elevation, woodenClimbingLadderVerticalHeight());
});

test("Bose Balls retain their dark-gray 21-inch hemispherical profile, circular collision, and dome clearance", () => {
  const boseBall = createStationObject("bose-ball", 1, "bose-ball");
  const sprite = boseBallSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(boseBall, "up");
  const aboveBoseBall = Array.from({ length: 7 }).reduce((object) => moveStationObjectVertical(object, "up"), boseBall);

  assert.deepEqual({ diameter: BOSE_BALL_DIAMETER_INCHES, radius: BOSE_BALL_RADIUS_INCHES, height: BOSE_BALL_HEIGHT_INCHES }, { diameter: 21, radius: 10.5, height: 10.5 });
  assert.deepEqual({ width: boseBall.width, height: boseBall.height }, BOSE_BALL_SIZE);
  assert.equal(BOSE_BALL_SEGMENTS, 12);
  assert.equal(sprite.rimTopFaces.length, BOSE_BALL_SEGMENTS);
  assert.ok(sprite.rimSideFaces.length > 0);
  assert.ok(sprite.domeFaces.length > 0);
  assert.equal(sprite.gripRibs.length, 4);
  assert.equal(stationAsset("bose-ball").noFlip, true);
  assert.equal(stationObjectFloorFootprint(boseBall).length, BOSE_BALL_SEGMENTS);
  assert.equal(boseBallVerticalHeight(), STATION_STACK_STEP * BOSE_BALL_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(boseBall, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(boseBall, aboveBoseBall), false);
});

test("Foam Rollers retain their gray 18-inch cylinder profile, colored end options, and stacking clearance", () => {
  const foamRoller = createStationObject("foam-roller", 1, "foam-roller");
  const sprite = foamRollerSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(foamRoller, "up");
  const aboveFoamRoller = Array.from({ length: 4 }).reduce((object) => moveStationObjectVertical(object, "up"), foamRoller);

  assert.deepEqual({ length: FOAM_ROLLER_LENGTH_INCHES, diameter: FOAM_ROLLER_DIAMETER_INCHES, radius: FOAM_ROLLER_RADIUS_INCHES }, { length: 18, diameter: 5.5, radius: 2.75 });
  assert.deepEqual({ width: foamRoller.width, height: foamRoller.height }, FOAM_ROLLER_SIZE);
  assert.deepEqual(FOAM_ROLLER_END_COLORS, ["green", "orange", "blue", "gray"]);
  assert.equal(FOAM_ROLLER_SEGMENTS, 8);
  assert.ok(sprite.sideFaces.length > 0);
  assert.equal(sprite.endCaps.length, 1);
  assert.equal(foamRoller.foamRollerEndColor, "green");
  assert.equal(stationAsset("foam-roller").noFlip, true);
  assert.equal(foamRollerVerticalHeight(), STATION_STACK_STEP * FOAM_ROLLER_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(foamRoller, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(foamRoller, aboveFoamRoller), false);
  assert.equal(isStationSetup({ ...createStationSetup("foam-roller-orange"), objects: [{ ...foamRoller, foamRollerEndColor: "orange" }] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-foam-roller"), objects: [{ ...foamRoller, foamRollerEndColor: "purple" }] }), false);
});

test("Yoga Balls retain a full 20-inch spherical profile, circular collision, colors, and clearance", () => {
  const yogaBall = createStationObject("yoga-ball", 1, "yoga-ball");
  const sprite = yogaBallSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(yogaBall, "up");
  const aboveYogaBall = Array.from({ length: 14 }).reduce((object) => moveStationObjectVertical(object, "up"), yogaBall);

  assert.deepEqual({ diameter: YOGA_BALL_DIAMETER_INCHES, radius: YOGA_BALL_RADIUS_INCHES }, { diameter: 20, radius: 10 });
  assert.deepEqual({ width: yogaBall.width, height: yogaBall.height }, YOGA_BALL_SIZE);
  assert.deepEqual(YOGA_BALL_COLORS, ["blue", "yellow", "green", "red", "purple", "black"]);
  assert.equal(YOGA_BALL_SEGMENTS, 12);
  assert.ok(sprite.facets.length > YOGA_BALL_SEGMENTS);
  assert.equal(yogaBall.yogaBallColor, "blue");
  assert.equal(stationAsset("yoga-ball").noFlip, true);
  assert.equal(stationObjectFloorFootprint(yogaBall).length, YOGA_BALL_SEGMENTS);
  assert.equal(yogaBallVerticalHeight(), STATION_STACK_STEP * YOGA_BALL_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(yogaBall, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(yogaBall, aboveYogaBall), false);
  assert.equal(isStationSetup({ ...createStationSetup("yoga-ball-black"), objects: [{ ...yogaBall, yogaBallColor: "black" }] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-yoga-ball"), objects: [{ ...yogaBall, yogaBallColor: "orange" }] }), false);
});

test("Vault Trainers retain their 47 by 38 by 49-inch box profile and single 15-inch rounded edge", () => {
  const vaultTrainer = createStationObject("vault-trainer", 1, "vault-trainer");
  const sprite = vaultTrainerSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(vaultTrainer, "up");
  const aboveVaultTrainer = Array.from({ length: 33 }).reduce((object) => moveStationObjectVertical(object, "up"), vaultTrainer);

  assert.deepEqual({ length: VAULT_TRAINER_LENGTH_INCHES, depth: VAULT_TRAINER_DEPTH_INCHES, height: VAULT_TRAINER_HEIGHT_INCHES, roundEdge: VAULT_TRAINER_ROUND_EDGE_DIAMETER_INCHES }, { length: 47, depth: 38, height: 49, roundEdge: 15 });
  assert.deepEqual({ width: vaultTrainer.width, height: vaultTrainer.height }, VAULT_TRAINER_SIZE);
  assert.equal(VAULT_TRAINER_ROUND_EDGE_SEGMENTS, 4);
  assert.ok(sprite.blueFaces.length > 0);
  assert.ok(sprite.tanTopFaces.length > 1);
  assert.equal(sprite.blackHandles.length, 1);
  assert.equal(stationAsset("vault-trainer").noFlip, true);
  assert.equal(vaultTrainerVerticalHeight(), STATION_STACK_STEP * VAULT_TRAINER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(vaultTrainer, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(vaultTrainer, aboveVaultTrainer), false);
});

test("Big Boulders retain their 34 by 34 by 28-inch arched handspring profile, end face, colors, and stacking clearance", () => {
  const boulder = createStationObject("big-boulder", 1, "big-boulder");
  const sprite = bigBoulderSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(boulder, "up");
  const aboveBoulder = Array.from({ length: 19 }).reduce((object) => moveStationObjectVertical(object, "up"), boulder);

  assert.deepEqual({ length: BIG_BOULDER_LENGTH_INCHES, diameter: BIG_BOULDER_DIAMETER_INCHES, height: BIG_BOULDER_HEIGHT_INCHES, sideHeight: BIG_BOULDER_SIDE_HEIGHT_INCHES }, { length: 34, diameter: 34, height: 28, sideHeight: 10 });
  assert.deepEqual({ width: boulder.width, height: boulder.height }, BIG_BOULDER_SIZE);
  assert.equal(BIG_BOULDER_CURVE_SEGMENTS, 10);
  assert.ok(sprite.redCurvedFaces.length > 0);
  assert.equal(sprite.yellowFlatFaces.length, 1);
  assert.equal(sprite.yellowFlatFaces[0].length, BIG_BOULDER_CURVE_SEGMENTS + 4);
  assert.equal(bigBoulderVerticalHeight(), STATION_STACK_STEP * BIG_BOULDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(boulder, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(boulder, aboveBoulder), false);
});

test("Medium Boulders retain the Big Boulder's arched profile at 30 by 30 by 25 inches with blue curved faces", () => {
  const boulder = createStationObject("medium-boulder", 1, "medium-boulder");
  const sprite = mediumBoulderSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(boulder, "up");
  const aboveBoulder = Array.from({ length: 17 }).reduce((object) => moveStationObjectVertical(object, "up"), boulder);

  assert.deepEqual({ length: MEDIUM_BOULDER_LENGTH_INCHES, diameter: MEDIUM_BOULDER_DIAMETER_INCHES, height: MEDIUM_BOULDER_HEIGHT_INCHES, sideHeight: MEDIUM_BOULDER_SIDE_HEIGHT_INCHES }, { length: 30, diameter: 30, height: 25, sideHeight: 9 });
  assert.deepEqual({ width: boulder.width, height: boulder.height }, MEDIUM_BOULDER_SIZE);
  assert.equal(MEDIUM_BOULDER_CURVE_SEGMENTS, 10);
  assert.ok(sprite.redCurvedFaces.length > 0);
  assert.equal(sprite.yellowFlatFaces.length, 1);
  assert.equal(sprite.yellowFlatFaces[0].length, MEDIUM_BOULDER_CURVE_SEGMENTS + 4);
  assert.equal(mediumBoulderVerticalHeight(), STATION_STACK_STEP * MEDIUM_BOULDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(boulder, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(boulder, aboveBoulder), false);
});

test("Small Boulders retain the same arched profile at 25 by 25 by 21 inches with purple curved faces", () => {
  const boulder = createStationObject("small-boulder", 1, "small-boulder");
  const sprite = smallBoulderSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(boulder, "up");
  const aboveBoulder = Array.from({ length: 15 }).reduce((object) => moveStationObjectVertical(object, "up"), boulder);

  assert.deepEqual({ length: SMALL_BOULDER_LENGTH_INCHES, diameter: SMALL_BOULDER_DIAMETER_INCHES, height: SMALL_BOULDER_HEIGHT_INCHES, sideHeight: SMALL_BOULDER_SIDE_HEIGHT_INCHES }, { length: 25, diameter: 25, height: 21, sideHeight: 8 });
  assert.deepEqual({ width: boulder.width, height: boulder.height }, SMALL_BOULDER_SIZE);
  assert.equal(SMALL_BOULDER_CURVE_SEGMENTS, 10);
  assert.ok(sprite.redCurvedFaces.length > 0);
  assert.equal(sprite.yellowFlatFaces.length, 1);
  assert.equal(sprite.yellowFlatFaces[0].length, SMALL_BOULDER_CURVE_SEGMENTS + 4);
  assert.equal(smallBoulderVerticalHeight(), STATION_STACK_STEP * SMALL_BOULDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(boulder, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(boulder, aboveBoulder), false);
});

test("Small Semicircles retain their 25.5-inch half-cylinder profile with a blue curve, yellow ends, and stacking clearance", () => {
  const semicircle = createStationObject("small-semicircle", 1, "small-semicircle");
  const sprite = smallSemicircleSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(semicircle, "up");
  const aboveSemicircle = Array.from({ length: 9 }).reduce((object) => moveStationObjectVertical(object, "up"), semicircle);

  assert.deepEqual({ diameter: SMALL_SEMICIRCLE_DIAMETER_INCHES, depth: SMALL_SEMICIRCLE_DEPTH_INCHES, height: SMALL_SEMICIRCLE_HEIGHT_INCHES }, { diameter: 25.5, depth: 15, height: 12.75 });
  assert.deepEqual({ width: semicircle.width, height: semicircle.height }, SMALL_SEMICIRCLE_SIZE);
  assert.equal(SMALL_SEMICIRCLE_CURVE_SEGMENTS, 8);
  assert.ok(sprite.blueCurvedFaces.length > 0);
  assert.equal(sprite.yellowFlatFaces.length, 1);
  assert.equal(sprite.yellowFlatFaces[0].length, SMALL_SEMICIRCLE_CURVE_SEGMENTS + 4);
  assert.equal(isStationAssetFlippable("small-semicircle"), false);
  assert.equal(smallSemicircleVerticalHeight(), STATION_STACK_STEP * SMALL_SEMICIRCLE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(semicircle, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(semicircle, aboveSemicircle), false);
});

test("Mini Mushrooms retain their 22-inch circular footprint, 11-inch height, and round collision shape", () => {
  const mushroom = createStationObject("mini-mushroom", 1, "mini-mushroom");
  const sprite = miniMushroomSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(mushroom, "up");
  const aboveMushroom = Array.from({ length: 8 }).reduce((object) => moveStationObjectVertical(object, "up"), mushroom);

  assert.deepEqual({ diameter: MINI_MUSHROOM_DIAMETER_INCHES, height: MINI_MUSHROOM_HEIGHT_INCHES }, { diameter: 22, height: 11 });
  assert.deepEqual({ width: mushroom.width, height: mushroom.height }, MINI_MUSHROOM_SIZE);
  assert.equal(MINI_MUSHROOM_SEGMENTS, 12);
  assert.equal(sprite.top.length, MINI_MUSHROOM_SEGMENTS);
  assert.ok(sprite.blueSides.length > 0);
  assert.equal(stationObjectFloorFootprint(mushroom).length, MINI_MUSHROOM_SEGMENTS);
  assert.equal(miniMushroomVerticalHeight(), STATION_STACK_STEP * MINI_MUSHROOM_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(mushroom, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(mushroom, aboveMushroom), false);
});

test("Floor Mushrooms retain a 22-inch round footprint and a provisional one-inch floor clearance", () => {
  const mushroom = createStationObject("floor-mushroom", 1, "floor-mushroom");
  const sprite = floorMushroomSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(mushroom, "up");

  assert.deepEqual({ diameter: FLOOR_MUSHROOM_DIAMETER_INCHES, height: FLOOR_MUSHROOM_HEIGHT_INCHES }, { diameter: 22, height: 1 });
  assert.deepEqual({ width: mushroom.width, height: mushroom.height }, FLOOR_MUSHROOM_SIZE);
  assert.equal(FLOOR_MUSHROOM_SEGMENTS, 12);
  assert.equal(sprite.top.length, FLOOR_MUSHROOM_SEGMENTS);
  assert.ok(sprite.blueSides.length > 0);
  assert.equal(stationObjectFloorFootprint(mushroom).length, FLOOR_MUSHROOM_SEGMENTS);
  assert.equal(floorMushroomVerticalHeight(), STATION_STACK_STEP * FLOOR_MUSHROOM_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(mushroom, onePanelHigher), false);
});

test("Mushroom Mats retain their 22-inch diameter, 16-inch height, circular collision, and both pictured colorways", () => {
  const mushroom = createStationObject("mushroom-mat", 1, "mushroom-mat");
  const sprite = mushroomMatSpriteGeometry(0);
  const onePanelHigher = moveStationObjectVertical(mushroom, "up");
  const aboveMushroom = Array.from({ length: 11 }).reduce((object) => moveStationObjectVertical(object, "up"), mushroom);

  assert.deepEqual({ diameter: MUSHROOM_MAT_DIAMETER_INCHES, height: MUSHROOM_MAT_HEIGHT_INCHES }, { diameter: 22, height: 16 });
  assert.deepEqual({ width: mushroom.width, height: mushroom.height, color: mushroom.mushroomMatColor }, { ...MUSHROOM_MAT_SIZE, color: "blue-brown" });
  assert.deepEqual(MUSHROOM_MAT_COLORS, ["blue-brown", "gray-red-cross"]);
  assert.equal(MUSHROOM_MAT_RADIUS_INCHES, 11);
  assert.equal(MUSHROOM_MAT_SEGMENTS, 12);
  assert.equal(sprite.top.length, MUSHROOM_MAT_SEGMENTS);
  assert.equal(sprite.flange.length, MUSHROOM_MAT_SEGMENTS);
  assert.equal(sprite.topCross.length, 2);
  assert.ok(sprite.bodySides.length > 0);
  assert.equal(stationAsset("mushroom-mat").noFlip, true);
  assert.equal(stationObjectFloorFootprint(mushroom).length, MUSHROOM_MAT_SEGMENTS);
  assert.equal(mushroomMatVerticalHeight(), STATION_STACK_STEP * MUSHROOM_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(mushroom, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(mushroom, aboveMushroom), false);
  assert.equal(isStationSetup({ ...createStationSetup("mushroom-mat-setup"), objects: [{ ...mushroom, mushroomMatColor: "gray-red-cross" }] }), true);
  assert.equal(isStationSetup({ ...createStationSetup("bad-mushroom-mat-setup"), objects: [{ ...mushroom, mushroomMatColor: "orange" }] }), false);
});

test("Cylinders retain blue curved sides, yellow circular ends, and physically flip upright or sideways", () => {
  const upright = createStationObject("cylinder", 1, "cylinder-upright");
  const sideways = flipStationObjectFace(upright, "next");
  const uprightSprite = cylinderSpriteGeometry(0, 0, 0, { width: upright.width, height: upright.height });
  const sidewaysSprite = cylinderSpriteGeometry(1, 0, 0, { width: sideways.width, height: sideways.height });

  assert.deepEqual({ diameter: CYLINDER_DIAMETER_INCHES, height: CYLINDER_HEIGHT_INCHES }, { diameter: 24, height: 48 });
  assert.deepEqual({ width: upright.width, height: upright.height }, CYLINDER_SIZE);
  assert.equal(CYLINDER_RADIUS_INCHES, 12);
  assert.equal(CYLINDER_SEGMENTS, 12);
  assert.deepEqual(cylinderFaceDimensions(0), { widthInches: 24, depthInches: 24, heightInches: 48 });
  assert.deepEqual(cylinderFaceDimensions(1), { widthInches: 48, depthInches: 24, heightInches: 24 });
  assert.equal(cylinderFaceLabel(0), "YELLOW END DOWN · UPRIGHT");
  assert.equal(cylinderFaceLabel(1), "BLUE CURVE DOWN · ON ITS SIDE");
  assert.equal(stationAssetFaceCount("cylinder"), 2);
  assert.equal(isStationAssetFlippable("cylinder"), true);
  assert.equal(stationObjectFace(upright), 0);
  assert.equal(stationObjectFace(sideways), 1);
  assert.deepEqual({ width: sideways.width, height: sideways.height }, { width: 96, height: 48 });
  assert.ok(uprightSprite.blueCurvedFaces.length > 0);
  assert.equal(uprightSprite.yellowFlatFaces.length, 1);
  assert.ok(sidewaysSprite.blueCurvedFaces.length > 0);
  assert.ok(sidewaysSprite.yellowFlatFaces.length > 0);
  assert.equal(stationObjectFloorFootprint(upright).length, CYLINDER_SEGMENTS);
  assert.equal(stationObjectFloorFootprint(sideways).length, CYLINDER_SEGMENTS + 2);
  assert.equal(cylinderVerticalHeight(0), STATION_STACK_STEP * CYLINDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(cylinderVerticalHeight(1), STATION_STACK_STEP * CYLINDER_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(upright, { ...upright, elevation: cylinderVerticalHeight(0) }), false);
});

test("Trapezoid mats split the documented 4-foot by 35-inch tapered block into red, yellow, and green thirds", () => {
  const green = createStationObject("green-trapezoid", 1, "green-trapezoid");
  const yellow = createStationObject("yellow-trapezoid", 2, "yellow-trapezoid");
  const red = createStationObject("red-trapezoid", 3, "red-trapezoid");
  const greenSprite = trapezoidMatSpriteGeometry("green-trapezoid", 0);
  const onePanelHigher = moveStationObjectVertical(green, "up");
  const aboveGreen = Array.from({ length: 8 }).reduce((object) => moveStationObjectVertical(object, "up"), green);

  assert.deepEqual({ length: TRAPEZOID_MAT_LENGTH_INCHES, bottomDepth: TRAPEZOID_MAT_BOTTOM_DEPTH_INCHES, topDepth: TRAPEZOID_MAT_TOP_DEPTH_INCHES, height: TRAPEZOID_MAT_TOTAL_HEIGHT_INCHES, sliceHeight: TRAPEZOID_MAT_SLICE_HEIGHT_INCHES }, { length: 48, bottomDepth: 28.5, topDepth: 12, height: 35, sliceHeight: 35 / 3 });
  assert.deepEqual(GREEN_TRAPEZOID_DIMENSIONS_INCHES, { length: 48, bottomDepth: 28.5, topDepth: 23, height: 35 / 3 });
  assert.deepEqual(YELLOW_TRAPEZOID_DIMENSIONS_INCHES, { length: 48, bottomDepth: 23, topDepth: 17.5, height: 35 / 3 });
  assert.deepEqual(RED_TRAPEZOID_DIMENSIONS_INCHES, { length: 48, bottomDepth: 17.5, topDepth: 12, height: 35 / 3 });
  assert.deepEqual(trapezoidMatDimensions("red-trapezoid"), RED_TRAPEZOID_DIMENSIONS_INCHES);
  assert.deepEqual(trapezoidMatFaceDimensions("green-trapezoid", 2), { widthInches: 28.5, depthInches: 35 / 3, heightInches: 48 });
  assert.equal(stationAssetFaceCount("green-trapezoid"), 6);
  assert.equal(green.width, 96);
  assert.equal(green.height, 57);
  assert.equal(yellow.height, 46);
  assert.equal(red.height, 35);
  assert.ok(greenSprite.some((surface) => surface.role === "top"));
  assert.ok(greenSprite.some((surface) => surface.role === "side"));
  assert.equal(trapezoidMatVerticalHeight("green-trapezoid"), STATION_STACK_STEP * TRAPEZOID_MAT_SLICE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
  assert.equal(stationObjectsOverlap(green, onePanelHigher), true);
  assert.equal(stationObjectsOverlap(green, aboveGreen), false);
});

test("all pixel equipment shares one real-inch visual scale", () => {
  const bounds = (object: ReturnType<typeof createStationObject>) => {
    const footprint = stationObjectFootprint({ ...object, x: 0, y: 100 });
    return { width: Math.max(...footprint.map((point) => point.x)) - Math.min(...footprint.map((point) => point.x)), height: Math.max(...footprint.map((point) => point.y)) - Math.min(...footprint.map((point) => point.y)) };
  };
  const panel = bounds(setPanelMatState(createStationObject("panel", 1, "scale-panel"), "open"));
  const block = bounds(createStationObject("big-block", 1, "scale-block"));
  const bigOctagon = bounds(createStationObject("big-octagon", 1, "scale-big-octagon"));
  const mediumOctagon = bounds(createStationObject("medium-octagon", 1, "scale-medium-octagon"));

  assert.ok(Math.abs(panel.width / block.width - 2) < .1, "the 8-foot Panel Mat should render twice the Big Block's 4-foot side");
  assert.ok(Math.abs(block.height / bigOctagon.height - 36 / 30) < .1, "the 3-foot Big Block should render taller than the 30-inch Big Octagon");
  assert.ok(mediumOctagon.width >= 30 && mediumOctagon.height >= 50, "the 2-foot by 30-inch Medium Octagon should occupy its true upright footprint");
});

test("station previews can crop to their visible content without changing the editable board", () => {
  const setup = { ...createStationSetup("cropped"), objects: [{ ...createStationObject("panel", 1, "cropped-panel"), x: 640, y: 384 }] };
  const cropped = cropStationSetupToContent(setup);
  const bounds = stationSetupCropBounds(cropped);
  const footprint = stationObjectFootprint(setup.objects[0]);

  assert.equal(cropped.objects, setup.objects);
  assert.ok(bounds.width < STATION_CANVAS.width && bounds.height < STATION_CANVAS.height);
  assert.equal(bounds.width / bounds.height, STATION_CANVAS.width / STATION_CANVAS.height);
  assert.ok(Math.min(...footprint.map((point) => point.x)) >= bounds.x);
  assert.ok(Math.max(...footprint.map((point) => point.x)) <= bounds.x + bounds.width);
  assert.deepEqual(stationSetupCropBounds(clearStationSetupCrop(cropped)), { x: 0, y: 0, width: STATION_CANVAS.width, height: STATION_CANVAS.height });
});

test("station validation rejects incomplete or incompatible stored layouts", () => {
  assert.equal(isStationSetup(null), false);
  assert.equal(isStationSetup({ id: "bad", version: 1, objects: [{}] }), false);
  assert.equal(isStationSetup({ ...createStationSetup("future"), version: 3 }), false);
  assert.equal(isStationSetup({ ...createStationSetup("bad-panel-mode"), objects: [{ ...createStationObject("panel", 1), panelState: "half-open" }] }), false);
  assert.equal(isStationSetup({ ...createStationSetup("bad-crop"), crop: { x: 0, y: 0, width: 1000, height: 640 } }), false);
  assert.equal(isStationSetup({ ...createStationSetup("null-crop"), crop: null }), false);
});

test("station objects stay inside the canvas when a resize would push them past an edge", () => {
  const bounded = constrainStationObjectToCanvas({
    ...createStationObject("panel", 1, "edge-panel"),
    x: 880,
    y: 600,
    width: 320,
    height: 160,
  });
  const footprint = stationObjectFootprint(bounded);
  assert.deepEqual({ width: bounded.width, height: bounded.height }, { width: 320, height: 160 });
  assert.ok(Math.min(...footprint.map((point) => point.x)) >= 0);
  assert.ok(Math.max(...footprint.map((point) => point.x)) <= STATION_CANVAS.width);
  assert.ok(Math.min(...footprint.map((point) => point.y)) >= 0);
  assert.ok(Math.max(...footprint.map((point) => point.y)) <= STATION_CANVAS.height);
});

test("station objects nudge one saved canvas pixel in each cardinal direction", () => {
  const panel = createStationObject("panel", 1, "nudge-panel");
  assert.deepEqual({ x: nudgeStationObject(panel, "north").x, y: nudgeStationObject(panel, "north").y }, { x: 96, y: 95 });
  assert.deepEqual({ x: nudgeStationObject(panel, "east").x, y: nudgeStationObject(panel, "east").y }, { x: 97, y: 96 });
  assert.deepEqual({ x: nudgeStationObject(panel, "south").x, y: nudgeStationObject(panel, "south").y }, { x: 96, y: 97 });
  assert.deepEqual({ x: nudgeStationObject(panel, "west").x, y: nudgeStationObject(panel, "west").y }, { x: 95, y: 96 });
  const atNorthWestEdge = { ...panel, x: 0, y: 0 };
  assert.deepEqual({ x: nudgeStationObject(atNorthWestEdge, "north").x, y: nudgeStationObject(atNorthWestEdge, "west").y }, { x: 0, y: 0 });
});

test("station objects rotate and nudge along their own local compass", () => {
  const panel = createStationObject("panel", 1, "local-panel");
  assert.equal(rotateStationObject(panel, "clockwise").rotation, 30);
  assert.equal(rotateStationObject(panel, "counterclockwise").rotation, 330);
  const facingThirty = { ...panel, rotation: 30 };
  assert.deepEqual({ x: nudgeStationObject(facingThirty, "north").x, y: nudgeStationObject(facingThirty, "north").y }, { x: 96.5, y: 95.133975 });
  assert.deepEqual({ x: nudgeStationObject(facingThirty, "east").x, y: nudgeStationObject(facingThirty, "east").y }, { x: 96.866025, y: 96.5 });
  assert.equal(rotateStationObject({ ...panel, rotation: 16 }, "clockwise").rotation, 60);
  assert.equal(nudgeStationObject({ ...panel, rotation: 16 }, "north").rotation, 30);
});

test("station objects use physical floor footprints for board collisions", () => {
  const panel = { ...setPanelMatState(createStationObject("panel", 1, "collision-panel"), "open"), x: 96, y: 96, rotation: 30 };
  const overlapping = { ...setPanelMatState(createStationObject("panel", 2, "overlapping-panel"), "open"), x: 192, y: 96, rotation: 30 };
  const separated = { ...setPanelMatState(createStationObject("panel", 2, "separated-panel"), "open"), x: 480, y: 96, rotation: 30 };
  assert.equal(stationObjectsOverlap(panel, overlapping), true);
  assert.equal(canPlaceStationObject(panel, [overlapping]), false);
  assert.equal(canPlaceStationObject(panel, [separated]), true);
  assert.equal(canPlaceStationObject({ ...panel, x: -41 }, []), false);
});

test("tall blocks can sit side by side when only their raised 2.5D pixels overlap", () => {
  const first = { ...createStationObject("big-block", 1, "first-block"), x: 256, y: 256 };
  const second = { ...createStationObject("big-block", 2, "second-block"), x: 320, y: 256 };
  const firstVisible = stationObjectFootprint(first);
  const secondVisible = stationObjectFootprint(second);

  assert.notDeepEqual(stationObjectFloorFootprint(first), firstVisible);
  assert.ok(Math.max(...firstVisible.map((point) => point.x)) > Math.min(...secondVisible.map((point) => point.x)));
  assert.equal(stationObjectsOverlap(first, second), false);
  assert.equal(canPlaceStationObject(second, [first]), true);
});

test("Panel Mat collision ignores the empty space around its pixel sprite", () => {
  const first = { ...setPanelMatState(createStationObject("panel", 1, "first-panel"), "open"), x: 0, y: 0 };
  const second = { ...setPanelMatState(createStationObject("panel", 2, "second-panel"), "open"), x: 164, y: 0 };
  const footprint = stationObjectFootprint(first);

  assert.deepEqual(
    { minX: Math.min(...footprint.map((point) => point.x)), maxX: Math.max(...footprint.map((point) => point.x)), minY: Math.min(...footprint.map((point) => point.y)), maxY: Math.max(...footprint.map((point) => point.y)) },
    { minX: 29, maxX: 163, minY: 24, maxY: 70 },
  );
  assert.equal(stationObjectsOverlap(first, second), false);
  assert.equal(canPlaceStationObject({ ...first, x: -29, y: -24 }, []), true);
  assert.equal(canPlaceStationObject({ ...first, x: -30, y: -24 }, []), false);
});

test("mats stack one Panel Mat thickness above each other", () => {
  const lower = { ...setPanelMatState(createStationObject("panel", 1, "lower-panel"), "open"), x: 192, y: 192 };
  const raised = moveStationObjectVertical({ ...setPanelMatState(createStationObject("panel", 2, "raised-panel"), "open"), x: 192, y: 192 }, "up");

  assert.equal(raised.elevation, STATION_STACK_STEP);
  assert.equal(stationObjectsOverlap(lower, raised), false);
  assert.equal(canPlaceStationObject(raised, [lower]), true);
  assert.equal(moveStationObjectVertical(raised, "down").elevation, 0);
});

test("an empty station draft cannot be saved", async () => {
  const empty = createStationSetup("empty-station");
  assert.equal(isStationSetupSaveable(empty), false);
  assert.equal(isStationSetupSaveable({ ...empty, objects: [createStationObject("panel", 1)] }), true);
  await assert.rejects(saveStationSetup(empty), /Add at least one station object/);
});
