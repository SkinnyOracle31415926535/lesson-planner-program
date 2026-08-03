/** Browser-local, editable pixel station layouts. */
/** Version 2 corrects the formerly mislabeled 6 Panel Mat and adds the true 6 Panel Mat. */
export const STATION_SETUP_VERSION = 2;
export const LEGACY_STATION_SETUP_VERSION = 1;
export type StationSetupVersion = typeof STATION_SETUP_VERSION | typeof LEGACY_STATION_SETUP_VERSION;
export const STATION_CANVAS = { width: 960, height: 640, grid: 32 } as const;
/** Retained for backups made by the prior Pages Station Maker. */
export const LEGACY_STATION_CANVAS = STATION_CANVAS;
export const STATION_ROTATION_STEP = 30;
export const STATION_STACK_STEP = 24;
export const PANEL_MAT_PANEL_HEIGHT_INCHES = 1.5;
/** Shared sprite height scale: the original 1.5-inch Panel Mat is 24 vertical units. */
export const STATION_VERTICAL_UNITS_PER_INCH = STATION_STACK_STEP / PANEL_MAT_PANEL_HEIGHT_INCHES;
export const PANEL_MAT_FOLDED_HEIGHT_INCHES = PANEL_MAT_PANEL_HEIGHT_INCHES * 4;
export const PANEL_MAT_FOLDED_HEIGHT = STATION_STACK_STEP * (PANEL_MAT_FOLDED_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES);
export const PANEL_MAT_OPEN_SIZE = { width: 192, height: 96 } as const;
export const PANEL_MAT_CLOSED_SIZE = { width: 96, height: 48 } as const;
/** The formerly labeled 6 Panel Mat is a five-panel mat: each panel is 5 feet by 2 feet. */
export const FIVE_PANEL_MAT_PANEL_COUNT = 5;
export const FIVE_PANEL_MAT_PANEL_LENGTH_FEET = 5;
export const FIVE_PANEL_MAT_PANEL_DEPTH_FEET = 2;
export const FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES = 1.1;
export const FIVE_PANEL_MAT_OPEN_SIZE = { width: FIVE_PANEL_MAT_PANEL_COUNT * FIVE_PANEL_MAT_PANEL_DEPTH_FEET * 24, height: FIVE_PANEL_MAT_PANEL_LENGTH_FEET * 24 } as const;
export const FIVE_PANEL_MAT_CLOSED_SIZE = { width: FIVE_PANEL_MAT_PANEL_LENGTH_FEET * 24, height: FIVE_PANEL_MAT_PANEL_DEPTH_FEET * 24 } as const;
export const FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES = Number((FIVE_PANEL_MAT_PANEL_COUNT * FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES).toFixed(1));
export const FIVE_PANEL_MAT_PANEL_HEIGHT = Number((STATION_STACK_STEP * (FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES)).toFixed(6));
export const FIVE_PANEL_MAT_FOLDED_HEIGHT = Number((FIVE_PANEL_MAT_PANEL_COUNT * FIVE_PANEL_MAT_PANEL_HEIGHT).toFixed(6));
/** True 6 Panel Mat: six 6-foot by 2-foot panels at the same 1.1-inch panel thickness. */
export const SIX_PANEL_MAT_PANEL_COUNT = 6;
export const SIX_PANEL_MAT_PANEL_LENGTH_FEET = 6;
export const SIX_PANEL_MAT_PANEL_DEPTH_FEET = 2;
export const SIX_PANEL_MAT_PANEL_HEIGHT_INCHES = FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES;
export const SIX_PANEL_MAT_OPEN_SIZE = { width: SIX_PANEL_MAT_PANEL_COUNT * SIX_PANEL_MAT_PANEL_DEPTH_FEET * 24, height: SIX_PANEL_MAT_PANEL_LENGTH_FEET * 24 } as const;
export const SIX_PANEL_MAT_CLOSED_SIZE = { width: SIX_PANEL_MAT_PANEL_LENGTH_FEET * 24, height: SIX_PANEL_MAT_PANEL_DEPTH_FEET * 24 } as const;
export const SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES = Number((SIX_PANEL_MAT_PANEL_COUNT * SIX_PANEL_MAT_PANEL_HEIGHT_INCHES).toFixed(1));
export const SIX_PANEL_MAT_PANEL_HEIGHT = Number((STATION_STACK_STEP * (SIX_PANEL_MAT_PANEL_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES)).toFixed(6));
export const SIX_PANEL_MAT_FOLDED_HEIGHT = Number((SIX_PANEL_MAT_PANEL_COUNT * SIX_PANEL_MAT_PANEL_HEIGHT).toFixed(6));
export const BIG_OCTAGON_DIAMETER_INCHES = 30;
export const BIG_OCTAGON_LENGTH_FEET = 3;
export const BIG_OCTAGON_SIZE = { width: BIG_OCTAGON_LENGTH_FEET * 24, height: BIG_OCTAGON_DIAMETER_INCHES * 2 } as const;
export const MEDIUM_OCTAGON_DIAMETER_INCHES = 24;
export const MEDIUM_OCTAGON_HEIGHT_INCHES = 30;
export const MEDIUM_OCTAGON_SIZE = { width: MEDIUM_OCTAGON_DIAMETER_INCHES * 2, height: MEDIUM_OCTAGON_DIAMETER_INCHES * 2 } as const;
export const SMALL_OCTAGON_DIAMETER_INCHES = 21;
export const SMALL_OCTAGON_LENGTH_INCHES = 27;
export const SMALL_OCTAGON_SIZE = { width: SMALL_OCTAGON_LENGTH_INCHES * 2, height: SMALL_OCTAGON_DIAMETER_INCHES * 2 } as const;
/** Small Cheese Mat: 4 feet long × 2 feet wide × 16 inches tall. */
export const SMALL_CHEESE_MAT_LENGTH_INCHES = 48;
export const SMALL_CHEESE_MAT_DEPTH_INCHES = 24;
export const SMALL_CHEESE_MAT_HEIGHT_INCHES = 16;
export const SMALL_CHEESE_MAT_SIZE = { width: SMALL_CHEESE_MAT_LENGTH_INCHES * 2, height: SMALL_CHEESE_MAT_DEPTH_INCHES * 2 } as const;
/** Tiny Cheese Mat: a red 4-foot wedge, assumed 2 feet deep, rising from zero to 5 inches. */
export const TINY_CHEESE_MAT_LENGTH_INCHES = 48;
export const TINY_CHEESE_MAT_DEPTH_INCHES = 24;
export const TINY_CHEESE_MAT_HEIGHT_INCHES = 5;
export const TINY_CHEESE_MAT_SIZE = { width: TINY_CHEESE_MAT_LENGTH_INCHES * 2, height: TINY_CHEESE_MAT_DEPTH_INCHES * 2 } as const;
export const MEDIUM_CHEESE_MAT_LENGTH_INCHES = 72;
export const MEDIUM_CHEESE_MAT_DEPTH_INCHES = 36;
export const MEDIUM_CHEESE_MAT_HEIGHT_INCHES = 15.5;
export const MEDIUM_CHEESE_MAT_SIZE = { width: MEDIUM_CHEESE_MAT_LENGTH_INCHES * 2, height: MEDIUM_CHEESE_MAT_DEPTH_INCHES * 2 } as const;
export const SQUISHY_CHEESE_MAT_SIZE = MEDIUM_CHEESE_MAT_SIZE;
/** Large Cheese Mat: 6 feet long × 4 feet wide × 16 inches tall. */
export const LARGE_CHEESE_MAT_LENGTH_INCHES = 72;
export const LARGE_CHEESE_MAT_DEPTH_INCHES = 48;
export const LARGE_CHEESE_MAT_HEIGHT_INCHES = 16;
export const LARGE_CHEESE_MAT_SIZE = { width: LARGE_CHEESE_MAT_LENGTH_INCHES * 2, height: LARGE_CHEESE_MAT_DEPTH_INCHES * 2 } as const;
/** Huge Cheese Mat: 7 feet long × 5 feet wide × 17 inches tall. */
export const BIG_CHEESE_MAT_LENGTH_INCHES = 84;
export const BIG_CHEESE_MAT_DEPTH_INCHES = 60;
export const BIG_CHEESE_MAT_HEIGHT_INCHES = 17;
/** The diagonal cover length implied by the Huge Cheese's measured floor length and rise. */
export const BIG_CHEESE_MAT_SLOPED_LENGTH_INCHES = Math.hypot(BIG_CHEESE_MAT_LENGTH_INCHES, BIG_CHEESE_MAT_HEIGHT_INCHES);
export const BIG_CHEESE_MAT_SIZE = { width: BIG_CHEESE_MAT_LENGTH_INCHES * 2, height: BIG_CHEESE_MAT_DEPTH_INCHES * 2 } as const;
export const CLOUD_MAT_LENGTH_INCHES = 70;
export const CLOUD_MAT_DEPTH_INCHES = 46.5;
export const CLOUD_MAT_HEIGHT_INCHES = 8;
/** Dark Velcro outline inset from every edge of the Cloud Mat's top face. */
export const CLOUD_MAT_VELCRO_INSET_INCHES = 3;
export const CLOUD_MAT_SIZE = { width: CLOUD_MAT_LENGTH_INCHES * 2, height: CLOUD_MAT_DEPTH_INCHES * 2 } as const;
/** A 4-foot Springboard top rises 8 inches from its low edge. */
export const SPRINGBOARD_TOP_LENGTH_INCHES = 48;
export const SPRINGBOARD_TOP_DEPTH_INCHES = 24;
export const SPRINGBOARD_HEIGHT_INCHES = 8;
export const SPRINGBOARD_FLOOR_LENGTH_INCHES = Math.sqrt(SPRINGBOARD_TOP_LENGTH_INCHES ** 2 - SPRINGBOARD_HEIGHT_INCHES ** 2);
export const SPRINGBOARD_SIZE = { width: SPRINGBOARD_FLOOR_LENGTH_INCHES * 2, height: SPRINGBOARD_TOP_DEPTH_INCHES * 2 } as const;
export const SPRINGBOARD_COLORS = ["white-grey", "burgundy", "red", "orange", "blue-grey"] as const;
export type SpringboardColor = (typeof SPRINGBOARD_COLORS)[number];
/** Preschool Springboard: a red 30 by 20-inch wedge rising from zero to 6.5 inches. */
export const PRESCHOOL_SPRINGBOARD_TOP_LENGTH_INCHES = 30;
export const PRESCHOOL_SPRINGBOARD_TOP_DEPTH_INCHES = 20;
export const PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES = 6.5;
export const PRESCHOOL_SPRINGBOARD_FLOOR_LENGTH_INCHES = Math.sqrt(PRESCHOOL_SPRINGBOARD_TOP_LENGTH_INCHES ** 2 - PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES ** 2);
export const PRESCHOOL_SPRINGBOARD_SIZE = { width: PRESCHOOL_SPRINGBOARD_FLOOR_LENGTH_INCHES * 2, height: PRESCHOOL_SPRINGBOARD_TOP_DEPTH_INCHES * 2 } as const;
export const PRESCHOOL_SPRINGBOARD_SPRING_COUNT = 4;
export const PRESCHOOL_SPRINGBOARD_SPRING_COILS = 4;
/** The T Trainer has a 50-inch blue runway inside a 35-inch-wide pair of padded red rails. */
export const T_TRAINER_TRAMPOLINE_LENGTH_INCHES = 50;
export const T_TRAINER_TRAMPOLINE_DEPTH_INCHES = 35;
export const T_TRAINER_RAIL_WIDTH_INCHES = 5;
export const T_TRAINER_BED_DEPTH_INCHES = T_TRAINER_TRAMPOLINE_DEPTH_INCHES - T_TRAINER_RAIL_WIDTH_INCHES * 2;
export const T_TRAINER_LOW_HEIGHT_INCHES = 12;
export const T_TRAINER_HIGH_HEIGHT_INCHES = 20;
export const T_TRAINER_RAIL_RISE_INCHES = 5;
export const T_TRAINER_TOTAL_HEIGHT_INCHES = T_TRAINER_HIGH_HEIGHT_INCHES + T_TRAINER_RAIL_RISE_INCHES;
export const T_TRAINER_RISE_INCHES = T_TRAINER_HIGH_HEIGHT_INCHES - T_TRAINER_LOW_HEIGHT_INCHES;
export const T_TRAINER_FLOOR_LENGTH_INCHES = Math.sqrt(T_TRAINER_TRAMPOLINE_LENGTH_INCHES ** 2 - T_TRAINER_RISE_INCHES ** 2);
export const T_TRAINER_DASH_COUNT = 3;
export const T_TRAINER_CROSS_LINE_FROM_HIGH_INCHES = 22;
export const T_TRAINER_SIZE = { width: T_TRAINER_FLOOR_LENGTH_INCHES * 2, height: T_TRAINER_TRAMPOLINE_DEPTH_INCHES * 2 } as const;
/** A 34 by 19 by 15-inch Mail Box has a half-cylinder roof over its rectangular base. */
export const MAIL_BOX_LENGTH_INCHES = 34;
export const MAIL_BOX_DEPTH_INCHES = 19;
export const MAIL_BOX_HEIGHT_INCHES = 15;
export const MAIL_BOX_ROOF_RADIUS_INCHES = MAIL_BOX_DEPTH_INCHES / 2;
export const MAIL_BOX_BASE_HEIGHT_INCHES = MAIL_BOX_HEIGHT_INCHES - MAIL_BOX_ROOF_RADIUS_INCHES;
export const MAIL_BOX_ROOF_SEGMENTS = 8;
export const MAIL_BOX_SIZE = { width: MAIL_BOX_LENGTH_INCHES * 2, height: MAIL_BOX_DEPTH_INCHES * 2 } as const;
/** A tall green classic mailbox: 24 inches long by 17.5 inches deep by 33 inches tall. */
export const GREEN_MAIL_BOX_LENGTH_INCHES = 24;
export const GREEN_MAIL_BOX_DEPTH_INCHES = 17.5;
export const GREEN_MAIL_BOX_HEIGHT_INCHES = 33;
export const GREEN_MAIL_BOX_ROOF_RADIUS_INCHES = GREEN_MAIL_BOX_DEPTH_INCHES / 2;
export const GREEN_MAIL_BOX_BASE_HEIGHT_INCHES = GREEN_MAIL_BOX_HEIGHT_INCHES - GREEN_MAIL_BOX_ROOF_RADIUS_INCHES;
export const GREEN_MAIL_BOX_SIZE = { width: GREEN_MAIL_BOX_LENGTH_INCHES * 2, height: GREEN_MAIL_BOX_DEPTH_INCHES * 2 } as const;
/** Colt: portable mini pommel horse, 31 by 15 by 16 inches including its handles. */
export const COLT_LENGTH_INCHES = 31;
export const COLT_DEPTH_INCHES = 15;
export const COLT_HEIGHT_INCHES = 16;
export const COLT_BASE_HEIGHT_INCHES = 6;
export const COLT_ROOF_RADIUS_INCHES = 6;
export const COLT_ROOF_SEGMENTS = 8;
export const COLT_HANDLE_RISE_INCHES = COLT_HEIGHT_INCHES - (COLT_BASE_HEIGHT_INCHES + COLT_ROOF_RADIUS_INCHES);
export const COLT_SIZE = { width: COLT_LENGTH_INCHES * 2, height: COLT_DEPTH_INCHES * 2 } as const;
/** One portable wooden mini-parallel bar. A pair is made by placing two of these. */
export const PARALLETTE_LENGTH_INCHES = 12;
export const PARALLETTE_BASE_DEPTH_INCHES = 8;
export const PARALLETTE_HEIGHT_INCHES = 5;
export const PARALLETTE_SIZE = { width: PARALLETTE_LENGTH_INCHES * 2, height: PARALLETTE_BASE_DEPTH_INCHES * 2 } as const;
/** Mini Low Bar: a 51-inch brown rail on two 18-inch-wide bases, adjustable between 7 and 13 inches high. */
export const MINI_LOW_BAR_LENGTH_INCHES = 51;
export const MINI_LOW_BAR_BASE_DEPTH_INCHES = 18;
export const MINI_LOW_BAR_HEIGHTS_INCHES = [7, 13] as const;
export const MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES = MINI_LOW_BAR_HEIGHTS_INCHES[0];
export const MINI_LOW_BAR_SIZE = { width: MINI_LOW_BAR_LENGTH_INCHES * 2, height: MINI_LOW_BAR_BASE_DEPTH_INCHES * 2 } as const;
export const MINI_LOW_BAR_BASE_COLORS = ["gray", "red", "blue"] as const;
export type MiniLowBarBaseColor = (typeof MINI_LOW_BAR_BASE_COLORS)[number];
export type MiniLowBarHeightInches = (typeof MINI_LOW_BAR_HEIGHTS_INCHES)[number];
/** Trapeze: a 21-inch brown wooden bar, 1.5 inches thick, suspended on two 24-inch black straps. */
export const TRAPEZE_BAR_LENGTH_INCHES = 21;
export const TRAPEZE_BAR_THICKNESS_INCHES = 1.5;
export const TRAPEZE_STRAP_LENGTH_INCHES = 24;
export const TRAPEZE_BAR_SEGMENTS = 6;
/** The frame includes the straps while collision stays at the bar's real floor projection. */
export const TRAPEZE_SIZE = { width: TRAPEZE_BAR_LENGTH_INCHES * 2, height: (TRAPEZE_STRAP_LENGTH_INCHES + TRAPEZE_BAR_THICKNESS_INCHES) * 2 } as const;
/** White PVC pipe used as a lightweight gymnastics station marker. */
export const PVC_PIPE_LENGTH_INCHES = 36;
export const PVC_PIPE_DIAMETER_INCHES = 1;
export const PVC_PIPE_RADIUS_INCHES = PVC_PIPE_DIAMETER_INCHES / 2;
export const PVC_PIPE_SEGMENTS = 6;
export const PVC_PIPE_SIZE = { width: PVC_PIPE_LENGTH_INCHES * 2, height: PVC_PIPE_DIAMETER_INCHES * 2 } as const;
/** Small Bar Pad: a red padded cylinder, 9 inches long and 2 inches thick. */
export const SMALL_BAR_PAD_LENGTH_INCHES = 9;
export const SMALL_BAR_PAD_DIAMETER_INCHES = 2;
export const SMALL_BAR_PAD_RADIUS_INCHES = SMALL_BAR_PAD_DIAMETER_INCHES / 2;
export const SMALL_BAR_PAD_SEGMENTS = 6;
export const SMALL_BAR_PAD_SIZE = { width: SMALL_BAR_PAD_LENGTH_INCHES * 2, height: SMALL_BAR_PAD_DIAMETER_INCHES * 2 } as const;
/** Rolling Bar: 17-inch red axle between blue, five-inch octagonal wheels. */
export const ROLLING_BAR_AXLE_LENGTH_INCHES = 17;
export const ROLLING_BAR_AXLE_DIAMETER_INCHES = 1.5;
export const ROLLING_BAR_AXLE_RADIUS_INCHES = ROLLING_BAR_AXLE_DIAMETER_INCHES / 2;
export const ROLLING_BAR_WHEEL_DIAMETER_INCHES = 5;
export const ROLLING_BAR_WHEEL_THICKNESS_INCHES = 1.5;
export const ROLLING_BAR_WHEEL_SEGMENTS = 8;
export const ROLLING_BAR_TOTAL_LENGTH_INCHES = ROLLING_BAR_AXLE_LENGTH_INCHES + ROLLING_BAR_WHEEL_THICKNESS_INCHES * 2;
export const ROLLING_BAR_SIZE = { width: ROLLING_BAR_TOTAL_LENGTH_INCHES * 2, height: ROLLING_BAR_WHEEL_DIAMETER_INCHES * 2 } as const;
/** Wooden Climbing Ladder: 6 feet long × 19 inches wide × 3.5 inches thick. */
export const WOODEN_CLIMBING_LADDER_LENGTH_INCHES = 72;
export const WOODEN_CLIMBING_LADDER_WIDTH_INCHES = 19;
export const WOODEN_CLIMBING_LADDER_THICKNESS_INCHES = 3.5;
export const WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES = 1.5;
export const WOODEN_CLIMBING_LADDER_RUNG_WIDTH_INCHES = 1.25;
export const WOODEN_CLIMBING_LADDER_RUNG_THICKNESS_INCHES = 1.25;
export const WOODEN_CLIMBING_LADDER_RUNG_COUNT = 8;
export const WOODEN_CLIMBING_LADDER_SIZE = { width: WOODEN_CLIMBING_LADDER_LENGTH_INCHES * 2, height: WOODEN_CLIMBING_LADDER_WIDTH_INCHES * 2 } as const;
/** Advanced Mini Bar: 69-inch tan rail set 44 inches above its orange freestanding bases. */
export const ADVANCED_MINI_BAR_LENGTH_INCHES = 69;
export const ADVANCED_MINI_BAR_HEIGHT_INCHES = 44;
/** The freestanding T feet match the gym's existing Mini Low Bar base depth. */
export const ADVANCED_MINI_BAR_BASE_DEPTH_INCHES = 18;
export const ADVANCED_MINI_BAR_RAIL_DIAMETER_INCHES = 1.5;
export const ADVANCED_MINI_BAR_RAIL_SEGMENTS = 6;
export const ADVANCED_MINI_BAR_SIZE = { width: ADVANCED_MINI_BAR_LENGTH_INCHES * 2, height: ADVANCED_MINI_BAR_BASE_DEPTH_INCHES * 2 } as const;
/** Rec Mini Bar: a 51-inch tan rail, 39 inches high, on blue freestanding bases. */
export const REC_MINI_BAR_LENGTH_INCHES = 51;
export const REC_MINI_BAR_HEIGHT_INCHES = 39;
/** The third reported measurement was 4 inches; its exact feature remains unconfirmed, so it does not alter the rendered rail or base. */
export const REC_MINI_BAR_REPORTED_THIRD_MEASURE_INCHES = 4;
export const REC_MINI_BAR_BASE_DEPTH_INCHES = 18;
export const REC_MINI_BAR_RAIL_DIAMETER_INCHES = 1.5;
export const REC_MINI_BAR_RAIL_SEGMENTS = 6;
export const REC_MINI_BAR_SIZE = { width: REC_MINI_BAR_LENGTH_INCHES * 2, height: REC_MINI_BAR_BASE_DEPTH_INCHES * 2 } as const;
/** Traffic Cone: a small orange traffic cone standing seven inches tall. */
export const TRAFFIC_CONE_HEIGHT_INCHES = 7;
export const TRAFFIC_CONE_BASE_SIZE_INCHES = 5;
export const TRAFFIC_CONE_BASE_HEIGHT_INCHES = .5;
export const TRAFFIC_CONE_TOP_DIAMETER_INCHES = 1.25;
export const TRAFFIC_CONE_SEGMENTS = 6;
export const TRAFFIC_CONE_SIZE = { width: TRAFFIC_CONE_BASE_SIZE_INCHES * 2, height: TRAFFIC_CONE_BASE_SIZE_INCHES * 2 } as const;
/** Flat target marker: nine inches across, yellow with a centered red target. */
export const TARGET_MARKER_DIAMETER_INCHES = 9;
export const TARGET_MARKER_RADIUS_INCHES = TARGET_MARKER_DIAMETER_INCHES / 2;
export const TARGET_MARKER_HEIGHT_INCHES = .25;
export const TARGET_MARKER_SEGMENTS = 12;
export const TARGET_MARKER_RED_TARGET_RATIO = .38;
export const TARGET_MARKER_SIZE = { width: TARGET_MARKER_DIAMETER_INCHES * 2, height: TARGET_MARKER_DIAMETER_INCHES * 2 } as const;
/** Beanbag: a 5.5-inch square, padded to half an inch at its center and tapering to its edges. */
export const BEANBAG_SQUARE_SIZE_INCHES = 5.5;
export const BEANBAG_CENTER_THICKNESS_INCHES = .5;
export const BEANBAG_CENTER_SQUARE_SIZE_INCHES = 2.25;
export const BEANBAG_SIZE = { width: BEANBAG_SQUARE_SIZE_INCHES * 2, height: BEANBAG_SQUARE_SIZE_INCHES * 2 } as const;
/** Rainbow Mat: a 49-inch outside semicircle, 15.5 inches deep, with a two-foot semicircle passage. */
export const RAINBOW_MAT_DIAMETER_INCHES = 49;
export const RAINBOW_MAT_DEPTH_INCHES = 15.5;
export const RAINBOW_MAT_CUTOUT_DIAMETER_INCHES = 24;
export const RAINBOW_MAT_RADIUS_INCHES = RAINBOW_MAT_DIAMETER_INCHES / 2;
export const RAINBOW_MAT_CUTOUT_RADIUS_INCHES = RAINBOW_MAT_CUTOUT_DIAMETER_INCHES / 2;
export const RAINBOW_MAT_ARCH_SEGMENTS = 8;
export const RAINBOW_MAT_SIZE = { width: RAINBOW_MAT_DEPTH_INCHES * 2, height: RAINBOW_MAT_DIAMETER_INCHES * 2 } as const;
/** Pac-Man Block: a 32-inch upright cylinder with one quarter removed, 27 inches tall. */
export const PAC_MAN_DIAMETER_INCHES = 32;
export const PAC_MAN_RADIUS_INCHES = PAC_MAN_DIAMETER_INCHES / 2;
export const PAC_MAN_HEIGHT_INCHES = 27;
/** Nine hard edges make the remaining three quarters of the circular wall. */
export const PAC_MAN_CURVE_SEGMENTS = 9;
export const PAC_MAN_SIZE = { width: PAC_MAN_DIAMETER_INCHES * 2, height: PAC_MAN_DIAMETER_INCHES * 2 } as const;
/** Dark-gray half-sphere balance trainer, called the Bose Ball in the gym. */
export const BOSE_BALL_DIAMETER_INCHES = 21;
export const BOSE_BALL_RADIUS_INCHES = BOSE_BALL_DIAMETER_INCHES / 2;
export const BOSE_BALL_HEIGHT_INCHES = BOSE_BALL_RADIUS_INCHES;
export const BOSE_BALL_SEGMENTS = 12;
export const BOSE_BALL_SIZE = { width: BOSE_BALL_DIAMETER_INCHES * 2, height: BOSE_BALL_DIAMETER_INCHES * 2 } as const;
/** A floor foam roller: an 18-inch cylinder with gray sides and colored round ends. */
export const FOAM_ROLLER_LENGTH_INCHES = 18;
export const FOAM_ROLLER_DIAMETER_INCHES = 5.5;
export const FOAM_ROLLER_RADIUS_INCHES = FOAM_ROLLER_DIAMETER_INCHES / 2;
export const FOAM_ROLLER_SEGMENTS = 8;
export const FOAM_ROLLER_SIZE = { width: FOAM_ROLLER_LENGTH_INCHES * 2, height: FOAM_ROLLER_DIAMETER_INCHES * 2 } as const;
export const FOAM_ROLLER_END_COLORS = ["green", "orange", "blue", "gray"] as const;
export type FoamRollerEndColor = (typeof FOAM_ROLLER_END_COLORS)[number];
/** Yoga Ball: a full, floor-resting 20-inch exercise sphere. */
export const YOGA_BALL_DIAMETER_INCHES = 20;
export const YOGA_BALL_RADIUS_INCHES = YOGA_BALL_DIAMETER_INCHES / 2;
export const YOGA_BALL_SEGMENTS = 12;
export const YOGA_BALL_SIZE = { width: YOGA_BALL_DIAMETER_INCHES * 2, height: YOGA_BALL_DIAMETER_INCHES * 2 } as const;
export const YOGA_BALL_COLORS = ["blue", "yellow", "green", "red", "purple", "black"] as const;
export type YogaBallColor = (typeof YOGA_BALL_COLORS)[number];
/** Vault Trainer: 47 by 38 inch footprint, 49 inches tall, with a 15-inch rounded top edge. */
export const VAULT_TRAINER_LENGTH_INCHES = 47;
export const VAULT_TRAINER_DEPTH_INCHES = 38;
export const VAULT_TRAINER_HEIGHT_INCHES = 49;
export const VAULT_TRAINER_ROUND_EDGE_DIAMETER_INCHES = 15;
export const VAULT_TRAINER_ROUND_EDGE_RADIUS_INCHES = VAULT_TRAINER_ROUND_EDGE_DIAMETER_INCHES / 2;
export const VAULT_TRAINER_ROUND_EDGE_SEGMENTS = 4;
export const VAULT_TRAINER_SIZE = { width: VAULT_TRAINER_LENGTH_INCHES * 2, height: VAULT_TRAINER_DEPTH_INCHES * 2 } as const;
/** The Big Boulder is a 34-inch handspring trainer with a flat base, upright sides, and a rounded arch. */
export const BIG_BOULDER_LENGTH_INCHES = 34;
export const BIG_BOULDER_DIAMETER_INCHES = 34;
export const BIG_BOULDER_HEIGHT_INCHES = 28;
export const BIG_BOULDER_SIDE_HEIGHT_INCHES = 10;
export const BIG_BOULDER_CURVE_SEGMENTS = 10;
export const BIG_BOULDER_SIZE = { width: BIG_BOULDER_LENGTH_INCHES * 2, height: BIG_BOULDER_DIAMETER_INCHES * 2 } as const;
/** The Medium Boulder shares the Big Boulder's arched handspring profile at 30 by 30 by 25 inches. */
export const MEDIUM_BOULDER_LENGTH_INCHES = 30;
export const MEDIUM_BOULDER_DIAMETER_INCHES = 30;
export const MEDIUM_BOULDER_HEIGHT_INCHES = 25;
export const MEDIUM_BOULDER_SIDE_HEIGHT_INCHES = 9;
export const MEDIUM_BOULDER_CURVE_SEGMENTS = BIG_BOULDER_CURVE_SEGMENTS;
export const MEDIUM_BOULDER_SIZE = { width: MEDIUM_BOULDER_LENGTH_INCHES * 2, height: MEDIUM_BOULDER_DIAMETER_INCHES * 2 } as const;
/** The Small Boulder shares the arched handspring profile at 25 by 25 by 21 inches. */
export const SMALL_BOULDER_LENGTH_INCHES = 25;
export const SMALL_BOULDER_DIAMETER_INCHES = 25;
export const SMALL_BOULDER_HEIGHT_INCHES = 21;
export const SMALL_BOULDER_SIDE_HEIGHT_INCHES = 8;
export const SMALL_BOULDER_CURVE_SEGMENTS = BIG_BOULDER_CURVE_SEGMENTS;
export const SMALL_BOULDER_SIZE = { width: SMALL_BOULDER_LENGTH_INCHES * 2, height: SMALL_BOULDER_DIAMETER_INCHES * 2 } as const;
/** Small Semicircle: a 25.5-inch-diameter half-cylinder, 15 inches deep, with a blue curve and yellow flat ends. */
export const SMALL_SEMICIRCLE_DIAMETER_INCHES = 25.5;
export const SMALL_SEMICIRCLE_DEPTH_INCHES = 15;
export const SMALL_SEMICIRCLE_HEIGHT_INCHES = SMALL_SEMICIRCLE_DIAMETER_INCHES / 2;
export const SMALL_SEMICIRCLE_CURVE_SEGMENTS = 8;
export const SMALL_SEMICIRCLE_SIZE = { width: SMALL_SEMICIRCLE_DEPTH_INCHES * 2, height: SMALL_SEMICIRCLE_DIAMETER_INCHES * 2 } as const;
/** Mini Mushroom: short circular trainer with a worn white/gray top and blue base. */
export const MINI_MUSHROOM_DIAMETER_INCHES = 22;
export const MINI_MUSHROOM_HEIGHT_INCHES = 11;
export const MINI_MUSHROOM_RADIUS_INCHES = MINI_MUSHROOM_DIAMETER_INCHES / 2;
export const MINI_MUSHROOM_SEGMENTS = 12;
export const MINI_MUSHROOM_SIZE = { width: MINI_MUSHROOM_DIAMETER_INCHES * 2, height: MINI_MUSHROOM_DIAMETER_INCHES * 2 } as const;
/** Floor Mushroom: 22-inch round floor disk with a worn brown/gray top. Thickness is provisional until measured. */
export const FLOOR_MUSHROOM_DIAMETER_INCHES = 22;
export const FLOOR_MUSHROOM_HEIGHT_INCHES = 1;
export const FLOOR_MUSHROOM_RADIUS_INCHES = FLOOR_MUSHROOM_DIAMETER_INCHES / 2;
export const FLOOR_MUSHROOM_SEGMENTS = MINI_MUSHROOM_SEGMENTS;
export const FLOOR_MUSHROOM_SIZE = { width: FLOOR_MUSHROOM_DIAMETER_INCHES * 2, height: FLOOR_MUSHROOM_DIAMETER_INCHES * 2 } as const;
/** Mushroom Mat: 22-inch diameter, 16 inches tall, with a padded top over a low circular base. */
export const MUSHROOM_MAT_DIAMETER_INCHES = 22;
export const MUSHROOM_MAT_HEIGHT_INCHES = 16;
export const MUSHROOM_MAT_RADIUS_INCHES = MUSHROOM_MAT_DIAMETER_INCHES / 2;
export const MUSHROOM_MAT_BODY_RADIUS_INCHES = 9.25;
export const MUSHROOM_MAT_SEGMENTS = MINI_MUSHROOM_SEGMENTS;
export const MUSHROOM_MAT_SIZE = { width: MUSHROOM_MAT_DIAMETER_INCHES * 2, height: MUSHROOM_MAT_DIAMETER_INCHES * 2 } as const;
export const MUSHROOM_MAT_COLORS = ["blue-brown", "gray-red-cross"] as const;
export type MushroomMatColor = (typeof MUSHROOM_MAT_COLORS)[number];
/** Cylinder: 24 inches in diameter and 48 inches tall, with a blue curved cover and yellow circular ends. */
export const CYLINDER_DIAMETER_INCHES = 24;
export const CYLINDER_HEIGHT_INCHES = 48;
export const CYLINDER_RADIUS_INCHES = CYLINDER_DIAMETER_INCHES / 2;
export const CYLINDER_SEGMENTS = 12;
export const CYLINDER_SIZE = { width: CYLINDER_DIAMETER_INCHES * 2, height: CYLINDER_DIAMETER_INCHES * 2 } as const;
/** Three 4-foot trapezoid mats assemble into one 35-inch-tall tapered block. */
export const TRAPEZOID_MAT_LENGTH_INCHES = 48;
export const TRAPEZOID_MAT_BOTTOM_DEPTH_INCHES = 28.5;
export const TRAPEZOID_MAT_TOP_DEPTH_INCHES = 12;
export const TRAPEZOID_MAT_TOTAL_HEIGHT_INCHES = 35;
export const TRAPEZOID_MAT_SLICE_HEIGHT_INCHES = TRAPEZOID_MAT_TOTAL_HEIGHT_INCHES / 3;
export const GREEN_TRAPEZOID_DIMENSIONS_INCHES = { length: TRAPEZOID_MAT_LENGTH_INCHES, bottomDepth: 28.5, topDepth: 23, height: TRAPEZOID_MAT_SLICE_HEIGHT_INCHES } as const;
export const YELLOW_TRAPEZOID_DIMENSIONS_INCHES = { length: TRAPEZOID_MAT_LENGTH_INCHES, bottomDepth: 23, topDepth: 17.5, height: TRAPEZOID_MAT_SLICE_HEIGHT_INCHES } as const;
export const RED_TRAPEZOID_DIMENSIONS_INCHES = { length: TRAPEZOID_MAT_LENGTH_INCHES, bottomDepth: 17.5, topDepth: TRAPEZOID_MAT_TOP_DEPTH_INCHES, height: TRAPEZOID_MAT_SLICE_HEIGHT_INCHES } as const;
export const PBAR_BLOCK_DIMENSIONS_INCHES = { long: 50.5, medium: 38.5, short: 26 } as const;
export const HALF_BLOCK_DIMENSIONS_INCHES = { long: 50.5, medium: 19.25, short: 26 } as const;
/** Blue Resi: 94 in long × 59 in wide × 32 in tall when laid flat. */
export const BLUE_RESI_DIMENSIONS_INCHES = { long: 94, medium: 59, short: 32 } as const;
/** Mini Resi: 8 feet long × 4 feet wide × 16 inches tall when laid flat. */
export const MINI_RESI_DIMENSIONS_INCHES = { long: 96, medium: 48, short: 16 } as const;
/** 4-inch Resi: 10 feet long × 5 feet wide × 4 inches thick, with a yellow cross-stripe near one end. */
export const FOUR_INCH_RESI_DIMENSIONS_INCHES = { long: 120, medium: 60, short: 4 } as const;
/** The regular 4-inch Resi is available in these cover colors, all with the yellow cross-stripe. */
export const FOUR_INCH_RESI_COLORS = ["blue", "green", "purple"] as const;
export type FourInchResiColor = (typeof FOUR_INCH_RESI_COLORS)[number];
/** Big 4-inch Resi: 10 feet long × 82.5 inches wide × 4 inches thick. */
export const BIG_FOUR_INCH_RESI_DIMENSIONS_INCHES = { long: 120, medium: 82.5, short: 4 } as const;
/** 8-inch Resi: 10 feet long × 5 feet wide × 8 inches thick, with the same yellow cross-stripe placement. */
export const EIGHT_INCH_RESI_DIMENSIONS_INCHES = { long: 120, medium: 60, short: 8 } as const;
/** 16-inch Resi: 10 feet long × 5 feet wide × 16 inches thick, blue with a yellow cross-stripe near one end. */
export const SIXTEEN_INCH_RESI_DIMENSIONS_INCHES = { long: 120, medium: 60, short: 16 } as const;
/** The observed 16-inch Resi stripe is a four-inch-wide cross-stripe, 20 inches from one short end. */
export const RESI_CROSS_STRIPE_WIDTH_INCHES = 4;
export const RESI_CROSS_STRIPE_CENTER_FROM_END_INCHES = 20;
/** Pink Beam Mat: 54 by 36 inches and about 0.35 inches thick. */
export const PINK_BEAM_MAT_DIMENSIONS_INCHES = { long: 54, medium: 36, short: .35 } as const;
/** Cartwheel Mat: 6 feet long by 2 feet wide and half an inch thick, with a centered white line. */
export const CARTWHEEL_MAT_DIMENSIONS_INCHES = { long: 72, medium: 24, short: .5 } as const;
export const CARTWHEEL_MAT_COLORS = ["blue", "pink", "light-blue", "dark-blue", "purple"] as const;
export type CartwheelMatColor = (typeof CARTWHEEL_MAT_COLORS)[number];
/** Two-step foam Stairs: 2 feet wide by 2 feet deep by 18 inches tall, with 9-inch rises. */
export const STAIRS_WIDTH_INCHES = 24;
export const STAIRS_DEPTH_INCHES = 24;
export const STAIRS_HEIGHT_INCHES = 18;
export const STAIRS_STEP_DEPTH_INCHES = 12;
export const STAIRS_LOW_STEP_HEIGHT_INCHES = 9;
export const STAIRS_SIZE = { width: STAIRS_WIDTH_INCHES * 2, height: STAIRS_DEPTH_INCHES * 2 } as const;
/** Velcro Beam: 8 feet long by 4 inches wide. The 0.5-inch thickness is provisional until measured. */
export const VELCRO_BEAM_DIMENSIONS_INCHES = { long: 96, medium: 4, short: .5 } as const;
export const VELCRO_BEAM_COLORS = ["red", "orange", "yellow", "green", "blue"] as const;
export type VelcroBeamColor = (typeof VELCRO_BEAM_COLORS)[number];
/** Sting Mat: 76 by 55 inches and 1.5 inches thick. */
export const STING_MAT_DIMENSIONS_INCHES = { long: 76, medium: 55, short: 1.5 } as const;
/** Gym Nova Mat: 59 by 35 inches and 8 inches tall when laid flat. */
export const GYM_NOVA_MAT_DIMENSIONS_INCHES = { long: 59, medium: 35, short: 8 } as const;
/** Teddy Mat: a dark brown, thin padded mat measuring 43 by 35 inches by 2 inches tall. */
export const TEDDY_MAT_DIMENSIONS_INCHES = { long: 43, medium: 35, short: 2 } as const;
/** Hand Mat: a burgundy 52 by 49-inch mat with a faint white four-section cross. */
export const HAND_MAT_DIMENSIONS_INCHES = { long: 52, medium: 49, short: 1 } as const;
/** Red Norbert Block: 36 by 24 by 12 inches. */
export const RED_NORBERT_BLOCK_DIMENSIONS_INCHES = { long: 36, medium: 24, short: 12 } as const;
/** Blue Norbert Block: 42 by 24 by 8 inches. */
export const BLUE_NORBERT_BLOCK_DIMENSIONS_INCHES = { long: 42, medium: 24, short: 8 } as const;
/** Green Norbert Block: 36 by 24 by 17 inches. */
export const GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES = { long: 36, medium: 24, short: 17 } as const;
/** Mini Red Norbert Block: 24 by 14 by 8 inches. */
export const MINI_RED_NORBERT_BLOCK_DIMENSIONS_INCHES = { long: 24, medium: 14, short: 8 } as const;
/** Squishy Norbert Block: 3 feet long by 2 feet wide by 21 inches tall. */
export const SQUISHY_NORBERT_BLOCK_DIMENSIONS_INCHES = { long: 36, medium: 24, short: 21 } as const;
export const SQUISHY_NORBERT_BLOCK_COLORS = ["blue", "green"] as const;
export type SquishyNorbertBlockColor = (typeof SQUISHY_NORBERT_BLOCK_COLORS)[number];
/** Small Green Norbert Block: 2 feet long by 21 inches wide by 8.5 inches tall. */
export const SMALL_GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES = { long: 24, medium: 21, short: 8.5 } as const;
/** Standard continuous exercise loop: 41 inches laid flat (82-inch circumference), 3/16 inch material thickness. */
export const BUNGEE_LOOP_LAY_FLAT_LENGTH_INCHES = 41;
export const BUNGEE_LOOP_CIRCUMFERENCE_INCHES = BUNGEE_LOOP_LAY_FLAT_LENGTH_INCHES * 2;
export const BUNGEE_LOOP_THICKNESS_INCHES = 3 / 16;
/** Resting opening used for the loose loop illustration; its source band width is not yet measured. */
export const BUNGEE_LOOP_RESTING_WIDTH_INCHES = 16;
export const BUNGEE_LOOP_SIZE = { width: BUNGEE_LOOP_RESTING_WIDTH_INCHES * 2, height: BUNGEE_LOOP_LAY_FLAT_LENGTH_INCHES * 2 } as const;
export const BUNGEE_COLORS = ["green", "purple", "black", "orange", "blue"] as const;
export type BungeeColor = (typeof BUNGEE_COLORS)[number];
/** Chalk Bucket: a 12-inch-wide, 15-inch-tall Home Depot-style pail. */
export const CHALK_BUCKET_DIAMETER_INCHES = 12;
export const CHALK_BUCKET_HEIGHT_INCHES = 15;
export const CHALK_BUCKET_RADIUS_INCHES = CHALK_BUCKET_DIAMETER_INCHES / 2;
export const CHALK_BUCKET_BOTTOM_RADIUS_INCHES = 5.25;
export const CHALK_BUCKET_SEGMENTS = 10;
export const CHALK_BUCKET_HANDLE_RISE_INCHES = 3;
export const CHALK_BUCKET_SIZE = { width: CHALK_BUCKET_DIAMETER_INCHES * 2, height: CHALK_BUCKET_DIAMETER_INCHES * 2 } as const;
export const CHALK_BUCKET_COLORS = ["orange", "pink"] as const;
export type ChalkBucketColor = (typeof CHALK_BUCKET_COLORS)[number];
/** A symbolic stand-in while a requested mat still needs its real sprite and dimensions. */
export const MAT_PLACEHOLDER_SHAPES = ["rectangle", "square", "round", "wedge"] as const;
export type MatPlaceholderShape = (typeof MAT_PLACEHOLDER_SHAPES)[number];
export const MAT_PLACEHOLDER_SIZES: Record<MatPlaceholderShape, { width: number; height: number }> = {
  rectangle: { width: 96, height: 64 },
  square: { width: 72, height: 72 },
  round: { width: 72, height: 72 },
  wedge: { width: 96, height: 64 },
};

export type StationAssetId = "panel" | "five-panel" | "six-panel" | "big-block" | "blue-resi" | "mini-resi" | "four-inch-resi" | "big-four-inch-resi" | "eight-inch-resi" | "sixteen-inch-resi" | "pink-beam-mat" | "cartwheel-mat" | "stairs" | "velcro-beam" | "sting-mat" | "gym-nova-mat" | "teddy-mat" | "hand-mat" | "red-norbert-block" | "blue-norbert-block" | "green-norbert-block" | "mini-red-norbert-block" | "squishy-norbert-block" | "small-green-norbert-block" | "pbar-block" | "half-block" | "big-octagon" | "medium-octagon" | "small-octagon" | "tiny-cheese-mat" | "small-cheese-mat" | "medium-cheese-mat" | "large-cheese-mat" | "big-cheese-mat" | "squishy-cheese-mat" | "cloud-mat" | "springboard" | "preschool-springboard" | "t-trainer" | "mail-box" | "green-mail-box" | "colt" | "parallette" | "mini-low-bar" | "rec-mini-bar" | "advanced-mini-bar" | "traffic-cone" | "target-marker" | "beanbag" | "rainbow-mat" | "trapeze" | "pvc-pipe" | "small-bar-pad" | "rolling-bar" | "wooden-climbing-ladder" | "bose-ball" | "foam-roller" | "yoga-ball" | "vault-trainer" | "big-boulder" | "medium-boulder" | "small-boulder" | "small-semicircle" | "mini-mushroom" | "floor-mushroom" | "mushroom-mat" | "cylinder" | "red-trapezoid" | "yellow-trapezoid" | "green-trapezoid" | "bungee" | "chalk-bucket" | "mat-placeholder" | "folded-panel" | "wedge" | "block" | "landing" | "strip" | "barrel" | "beam";
export type StationColor = "blue" | "pink" | "yellow" | "green" | "purple" | "light-blue" | "dark-blue" | "red" | "orange" | "brown" | "gray" | "cream" | SpringboardColor;
export type StationObjectKind = "equipment" | "label" | "arrow";
export type StationNudgeDirection = "north" | "east" | "south" | "west";
export type StationRotationDirection = "counterclockwise" | "clockwise";
export type StationElevationDirection = "up" | "down";
export type StationPanelState = "closed" | "open";
export type StationFlipDirection = "previous" | "next";
export type StationPoint = { x: number; y: number };
export type StationCrop = { x: number; y: number; width: number; height: number };
export const PANEL_MAT_COLORS = ["red", "green", "blue", "yellow"] as const;
export type PanelMatColor = (typeof PANEL_MAT_COLORS)[number];
export type FoldingPanelMatColor = PanelMatColor | "purple" | "light-blue" | "dark-blue";
export const FOUR_PANEL_MAT_COLORWAYS = ["rainbow", "purple", "blue-green"] as const;
export const FIVE_PANEL_MAT_COLORWAYS = ["blue", "purple", "blue-green"] as const;
export const SIX_PANEL_MAT_COLORWAYS = ["light-blue", "dark-blue", "rainbow"] as const;
export type FourPanelMatColorway = (typeof FOUR_PANEL_MAT_COLORWAYS)[number];
export type FivePanelMatColorway = (typeof FIVE_PANEL_MAT_COLORWAYS)[number];
export type SixPanelMatColorway = (typeof SIX_PANEL_MAT_COLORWAYS)[number];
export type PanelMatColorway = FourPanelMatColorway | FivePanelMatColorway | SixPanelMatColorway;
const FOUR_PANEL_MAT_COLORWAY_COLORS: Record<FourPanelMatColorway, readonly FoldingPanelMatColor[]> = {
  rainbow: PANEL_MAT_COLORS,
  purple: ["purple", "purple", "purple", "purple"],
  "blue-green": ["blue", "green", "blue", "green"],
};
const FIVE_PANEL_MAT_COLORWAY_COLORS: Record<FivePanelMatColorway, readonly FoldingPanelMatColor[]> = {
  blue: ["blue", "blue", "blue", "blue", "blue"],
  purple: ["purple", "purple", "purple", "purple", "purple"],
  "blue-green": ["blue", "green", "blue", "green", "blue"],
};
const SIX_PANEL_MAT_COLORWAY_COLORS: Record<SixPanelMatColorway, readonly FoldingPanelMatColor[]> = {
  "light-blue": ["light-blue", "light-blue", "light-blue", "light-blue", "light-blue", "light-blue"],
  "dark-blue": ["dark-blue", "dark-blue", "dark-blue", "dark-blue", "dark-blue", "dark-blue"],
  rainbow: ["dark-blue", "red", "green", "yellow", "light-blue", "yellow"],
};
export type FoldingPanelMatAssetId = "panel" | "five-panel" | "six-panel";

export function isFoldingPanelMatAsset(assetId: StationAssetId | undefined): assetId is FoldingPanelMatAssetId {
  return assetId === "panel" || assetId === "five-panel" || assetId === "six-panel";
}

export function panelMatColors(assetId: FoldingPanelMatAssetId, colorway?: PanelMatColorway): readonly FoldingPanelMatColor[] {
  if (assetId === "panel") return FOUR_PANEL_MAT_COLORWAY_COLORS[FOUR_PANEL_MAT_COLORWAYS.includes(colorway as FourPanelMatColorway) ? colorway as FourPanelMatColorway : "rainbow"];
  if (assetId === "five-panel") return FIVE_PANEL_MAT_COLORWAY_COLORS[FIVE_PANEL_MAT_COLORWAYS.includes(colorway as FivePanelMatColorway) ? colorway as FivePanelMatColorway : "blue"];
  return SIX_PANEL_MAT_COLORWAY_COLORS[SIX_PANEL_MAT_COLORWAYS.includes(colorway as SixPanelMatColorway) ? colorway as SixPanelMatColorway : "light-blue"];
}

export function isPanelMatColorwayAllowed(assetId: StationAssetId | undefined, colorway: PanelMatColorway | undefined): boolean {
  if (colorway === undefined) return true;
  return assetId === "panel" ? FOUR_PANEL_MAT_COLORWAYS.includes(colorway as FourPanelMatColorway)
    : assetId === "five-panel" ? FIVE_PANEL_MAT_COLORWAYS.includes(colorway as FivePanelMatColorway)
      : assetId === "six-panel" ? SIX_PANEL_MAT_COLORWAYS.includes(colorway as SixPanelMatColorway) : false;
}
export const BIG_BLOCK_COLORS = ["orange", "blue", "green", "purple", "black"] as const;
export type BigBlockColor = (typeof BIG_BLOCK_COLORS)[number];
export const HALF_BLOCK_COLORS = ["green-yellow", "blue"] as const;
export type HalfBlockColor = (typeof HALF_BLOCK_COLORS)[number];
export const HALF_BLOCK_COLOR_LABELS: Record<HalfBlockColor, string> = { "green-yellow": "GREEN/YELLOW", blue: "BLUE" };
export const SMALL_CHEESE_MAT_COLORS = ["orange-purple", "green", "red"] as const;
export type SmallCheeseMatColor = (typeof SMALL_CHEESE_MAT_COLORS)[number];
export const SMALL_CHEESE_MAT_COLOR_LABELS: Record<SmallCheeseMatColor, string> = { "orange-purple": "ORANGE / PURPLE", green: "GREEN / BLUE / YELLOW", red: "RED / NAVY / YELLOW" };
export const MEDIUM_CHEESE_MAT_STRIPE_COLORS = ["blue", "yellow", "blue", "yellow"] as const;
/** The sharp one-third is blue; the remaining two-thirds are yellow. */
export const SQUISHY_CHEESE_MAT_SIDE_SECTIONS = [
  { color: "blue", startFraction: 0, endFraction: 1 / 3 },
  { color: "yellow", startFraction: 1 / 3, endFraction: 1 },
] as const;
export type CheeseMatAssetId = "tiny-cheese-mat" | "small-cheese-mat" | "medium-cheese-mat" | "large-cheese-mat" | "big-cheese-mat" | "squishy-cheese-mat";
/** Every Cheese Mat except the huge Big Cheese folds in half lengthwise for storage. */
export type FoldableCheeseMatAssetId = Exclude<CheeseMatAssetId, "big-cheese-mat">;
export type StationCheeseMatState = "closed" | "open";

export function isFoldableCheeseMatAsset(assetId: StationAssetId | undefined): assetId is FoldableCheeseMatAssetId {
  return assetId === "tiny-cheese-mat" || assetId === "small-cheese-mat" || assetId === "medium-cheese-mat" || assetId === "large-cheese-mat" || assetId === "squishy-cheese-mat";
}
export type TrapezoidMatAssetId = "red-trapezoid" | "yellow-trapezoid" | "green-trapezoid";
const BIG_BLOCK_SIDES = [
  { widthFeet: 4, depthFeet: 2, heightFeet: 3 },
  { widthFeet: 4, depthFeet: 3, heightFeet: 2 },
  { widthFeet: 2, depthFeet: 3, heightFeet: 4 },
  { widthFeet: 4, depthFeet: 2, heightFeet: 3 },
  { widthFeet: 4, depthFeet: 3, heightFeet: 2 },
  { widthFeet: 2, depthFeet: 3, heightFeet: 4 },
] as const;
export type BigBlockFlipDirection = "previous" | "next";

type CuboidDimensions = { widthInches: number; depthInches: number; heightInches: number };

function cuboidFaceDimensions(dimensions: { long: number; medium: number; short: number }, face: number): CuboidDimensions {
  const orientations: readonly CuboidDimensions[] = [
    { widthInches: dimensions.long, depthInches: dimensions.short, heightInches: dimensions.medium },
    { widthInches: dimensions.long, depthInches: dimensions.short, heightInches: dimensions.medium },
    { widthInches: dimensions.long, depthInches: dimensions.medium, heightInches: dimensions.short },
    { widthInches: dimensions.long, depthInches: dimensions.medium, heightInches: dimensions.short },
    { widthInches: dimensions.medium, depthInches: dimensions.short, heightInches: dimensions.long },
    { widthInches: dimensions.medium, depthInches: dimensions.short, heightInches: dimensions.long },
  ];
  return orientations[((Math.trunc(face) % orientations.length) + orientations.length) % orientations.length];
}

export function pbarBlockDimensions(face = 0): CuboidDimensions {
  return cuboidFaceDimensions(PBAR_BLOCK_DIMENSIONS_INCHES, face);
}

export function halfBlockDimensions(face = 0): CuboidDimensions {
  return cuboidFaceDimensions(HALF_BLOCK_DIMENSIONS_INCHES, face);
}

export function blueResiDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(BLUE_RESI_DIMENSIONS_INCHES, face);
}

export function miniResiDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(MINI_RESI_DIMENSIONS_INCHES, face);
}

export const STRIPED_RESI_ASSET_IDS = ["four-inch-resi", "big-four-inch-resi", "eight-inch-resi", "sixteen-inch-resi"] as const;
export type StripedResiAssetId = (typeof STRIPED_RESI_ASSET_IDS)[number];

export function isStripedResiAsset(assetId: StationAssetId | undefined): assetId is StripedResiAssetId {
  return STRIPED_RESI_ASSET_IDS.includes(assetId as StripedResiAssetId);
}

export function stripedResiDimensions(assetId: StripedResiAssetId, face = 2): CuboidDimensions {
  const dimensions = assetId === "four-inch-resi" ? FOUR_INCH_RESI_DIMENSIONS_INCHES
    : assetId === "big-four-inch-resi" ? BIG_FOUR_INCH_RESI_DIMENSIONS_INCHES
      : assetId === "eight-inch-resi" ? EIGHT_INCH_RESI_DIMENSIONS_INCHES
        : SIXTEEN_INCH_RESI_DIMENSIONS_INCHES;
  return cuboidFaceDimensions(dimensions, face);
}

export function redNorbertBlockDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(RED_NORBERT_BLOCK_DIMENSIONS_INCHES, face);
}

export function blueNorbertBlockDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(BLUE_NORBERT_BLOCK_DIMENSIONS_INCHES, face);
}

export function greenNorbertBlockDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES, face);
}

export function miniRedNorbertBlockDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(MINI_RED_NORBERT_BLOCK_DIMENSIONS_INCHES, face);
}

export function squishyNorbertBlockDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(SQUISHY_NORBERT_BLOCK_DIMENSIONS_INCHES, face);
}

export function smallGreenNorbertBlockDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(SMALL_GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES, face);
}

export function pinkBeamMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(PINK_BEAM_MAT_DIMENSIONS_INCHES, face);
}

export function cartwheelMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(CARTWHEEL_MAT_DIMENSIONS_INCHES, face);
}

export function velcroBeamDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(VELCRO_BEAM_DIMENSIONS_INCHES, face);
}

export function stingMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(STING_MAT_DIMENSIONS_INCHES, face);
}

export function gymNovaMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(GYM_NOVA_MAT_DIMENSIONS_INCHES, face);
}

export function teddyMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(TEDDY_MAT_DIMENSIONS_INCHES, face);
}

export function handMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions(HAND_MAT_DIMENSIONS_INCHES, face);
}

export function cloudMatDimensions(face = 2): CuboidDimensions {
  return cuboidFaceDimensions({ long: CLOUD_MAT_LENGTH_INCHES, medium: CLOUD_MAT_DEPTH_INCHES, short: CLOUD_MAT_HEIGHT_INCHES }, face);
}

/** A Cylinder rests either on one yellow circular end or across its blue curved side. */
export function cylinderFaceDimensions(face = 0): CuboidDimensions {
  return ((Math.trunc(face) % 2) + 2) % 2 === 0
    ? { widthInches: CYLINDER_DIAMETER_INCHES, depthInches: CYLINDER_DIAMETER_INCHES, heightInches: CYLINDER_HEIGHT_INCHES }
    : { widthInches: CYLINDER_HEIGHT_INCHES, depthInches: CYLINDER_DIAMETER_INCHES, heightInches: CYLINDER_DIAMETER_INCHES };
}

export function cylinderFaceLabel(face = 0): string {
  return ((Math.trunc(face) % 2) + 2) % 2 === 0 ? "YELLOW END DOWN · UPRIGHT" : "BLUE CURVE DOWN · ON ITS SIDE";
}

function cuboidCanvasSize(dimensions: CuboidDimensions) {
  return { width: dimensions.widthInches * 2, height: dimensions.depthInches * 2 };
}

export function stationAssetFaceCount(assetId: StationAssetId | undefined): number {
  if (!assetId || stationAsset(assetId).noFlip) return 0;
  if (assetId === "cylinder") return 2;
  if (assetId === "big-block" || assetId === "blue-resi" || assetId === "mini-resi" || isStripedResiAsset(assetId) || assetId === "red-norbert-block" || assetId === "blue-norbert-block" || assetId === "green-norbert-block" || assetId === "mini-red-norbert-block" || assetId === "squishy-norbert-block" || assetId === "small-green-norbert-block" || assetId === "pbar-block" || assetId === "half-block") return 6;
  if (assetId === "pink-beam-mat" || assetId === "cartwheel-mat" || assetId === "velcro-beam" || assetId === "sting-mat" || assetId === "gym-nova-mat" || assetId === "teddy-mat" || assetId === "hand-mat" || assetId === "cloud-mat") return 6;
  if (assetId === "big-octagon" || assetId === "medium-octagon" || assetId === "small-octagon") return 10;
  if (assetId === "tiny-cheese-mat" || assetId === "small-cheese-mat" || assetId === "medium-cheese-mat" || assetId === "large-cheese-mat" || assetId === "big-cheese-mat" || assetId === "squishy-cheese-mat") return 5;
  if (assetId === "red-trapezoid" || assetId === "yellow-trapezoid" || assetId === "green-trapezoid") return 6;
  return 0;
}

function defaultStationAssetFace(assetId: StationAssetId | undefined): number {
  if (assetId === "blue-resi" || assetId === "mini-resi" || isStripedResiAsset(assetId) || assetId === "pink-beam-mat" || assetId === "cartwheel-mat" || assetId === "velcro-beam" || assetId === "sting-mat" || assetId === "gym-nova-mat" || assetId === "teddy-mat" || assetId === "hand-mat" || assetId === "cloud-mat" || assetId === "red-norbert-block" || assetId === "blue-norbert-block" || assetId === "green-norbert-block" || assetId === "mini-red-norbert-block" || assetId === "squishy-norbert-block" || assetId === "small-green-norbert-block" || assetId === "big-octagon" || assetId === "small-octagon") return 2;
  return 0;
}

export function stationObjectFace(object: StationObject): number {
  if (object.assetId === "big-block") return bigBlockSide(object);
  const count = stationAssetFaceCount(object.assetId);
  if (!count) return 0;
  return Number.isInteger(object.face) && object.face! >= 0 && object.face! < count ? object.face! : defaultStationAssetFace(object.assetId);
}

export function isStationAssetFlippable(assetId: StationAssetId | undefined): boolean {
  return stationAssetFaceCount(assetId) > 0;
}

export type StationObject = {
  id: string;
  kind: StationObjectKind;
  assetId?: StationAssetId;
  color?: StationColor;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  elevation?: number;
  /** Missing on an older saved layout means its original open Panel Mat. */
  panelState?: StationPanelState;
  /** The documented color treatment of a folding 4, 5, or 6 Panel Mat. */
  panelMatColorway?: PanelMatColorway;
  /** The Big Block face resting on the floor, from 0 through 5. */
  bigBlockSide?: number;
  /** Assigned once when a Big Block is added. */
  bigBlockColor?: BigBlockColor;
  /** The Half Block's selectable color treatment. */
  halfBlockColor?: HalfBlockColor;
  /** The Small Cheese Mat's documented color treatment. */
  smallCheeseMatColor?: SmallCheeseMatColor;
  /** Open wedges fold in half lengthwise into their documented compact storage block. */
  cheeseMatState?: StationCheeseMatState;
  /** The Squishy Norbert Block's documented blue or green cover. */
  squishyNorbertBlockColor?: SquishyNorbertBlockColor;
  /** The Cartwheel Mat's documented cover color. */
  cartwheelMatColor?: CartwheelMatColor;
  /** The selected documented cover color of a regular 4-inch Resi. */
  fourInchResiColor?: FourInchResiColor;
  /** The documented single-color cover of a Velcro Beam. */
  velcroBeamColor?: VelcroBeamColor;
  /** The selected color of the continuous exercise loop. */
  bungeeColor?: BungeeColor;
  /** The selected color of a Home Depot-style chalk bucket. */
  chalkBucketColor?: ChalkBucketColor;
  /** The selected color of the Mini Low Bar's feet and supports. */
  miniLowBarBaseColor?: MiniLowBarBaseColor;
  /** The selected real rail height of a Mini Low Bar. */
  miniLowBarHeightInches?: MiniLowBarHeightInches;
  /** The selected documented Mushroom Mat colorway. */
  mushroomMatColor?: MushroomMatColor;
  /** The selected color of a Foam Roller's circular end caps. */
  foamRollerEndColor?: FoamRollerEndColor;
  /** The selected color of a Yoga Ball. */
  yogaBallColor?: YogaBallColor;
  /** A named stand-in for a mat that has not yet been modeled in the collection. */
  missingMatLabel?: string;
  /** The visible placeholder outline used until the real mat is added. */
  matPlaceholderShape?: MatPlaceholderShape;
  /** The physical face resting on the board for equipment that can be flipped. */
  face?: number;
  zIndex: number;
};

export type StationSetup = {
  id: string;
  version: StationSetupVersion;
  canvas: typeof STATION_CANVAS;
  objects: StationObject[];
  /** Optional saved preview frame; the editable board remains full size. */
  crop?: StationCrop;
  createdAt: string;
  updatedAt: string;
};

export type StationAsset = {
  id: StationAssetId;
  name: string;
  width: number;
  height: number;
  heightCue: "flat" | "raised" | "tall";
  /** Equipment without a meaningful physical face turn keeps its dedicated control instead. */
  noFlip?: boolean;
};

export const stationAssets: readonly StationAsset[] = [
  { id: "panel", name: "4 PANEL MAT", width: 192, height: 96, heightCue: "flat", noFlip: true },
  { id: "five-panel", name: "5 PANEL MAT", width: FIVE_PANEL_MAT_OPEN_SIZE.width, height: FIVE_PANEL_MAT_OPEN_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "six-panel", name: "6 PANEL MAT", width: SIX_PANEL_MAT_OPEN_SIZE.width, height: SIX_PANEL_MAT_OPEN_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "big-block", name: "BIG BLOCK", width: 96, height: 48, heightCue: "tall" },
  { id: "blue-resi", name: "BLUE RESI", width: BLUE_RESI_DIMENSIONS_INCHES.long * 2, height: BLUE_RESI_DIMENSIONS_INCHES.medium * 2, heightCue: "tall" },
  { id: "mini-resi", name: "MINI RESI", width: MINI_RESI_DIMENSIONS_INCHES.long * 2, height: MINI_RESI_DIMENSIONS_INCHES.medium * 2, heightCue: "tall" },
  { id: "four-inch-resi", name: "4 INCH RESI", width: FOUR_INCH_RESI_DIMENSIONS_INCHES.long * 2, height: FOUR_INCH_RESI_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "big-four-inch-resi", name: "BIG 4 INCH RESI", width: BIG_FOUR_INCH_RESI_DIMENSIONS_INCHES.long * 2, height: BIG_FOUR_INCH_RESI_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "eight-inch-resi", name: "8 INCH RESI", width: EIGHT_INCH_RESI_DIMENSIONS_INCHES.long * 2, height: EIGHT_INCH_RESI_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "sixteen-inch-resi", name: "16 INCH RESI", width: SIXTEEN_INCH_RESI_DIMENSIONS_INCHES.long * 2, height: SIXTEEN_INCH_RESI_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "pink-beam-mat", name: "PINK BEAM MAT", width: PINK_BEAM_MAT_DIMENSIONS_INCHES.long * 2, height: PINK_BEAM_MAT_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "cartwheel-mat", name: "CARTWHEEL MAT", width: CARTWHEEL_MAT_DIMENSIONS_INCHES.long * 2, height: CARTWHEEL_MAT_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "stairs", name: "STAIRS", width: STAIRS_SIZE.width, height: STAIRS_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "velcro-beam", name: "VELCRO BEAM", width: VELCRO_BEAM_DIMENSIONS_INCHES.long * 2, height: VELCRO_BEAM_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "sting-mat", name: "STING MAT", width: STING_MAT_DIMENSIONS_INCHES.long * 2, height: STING_MAT_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "gym-nova-mat", name: "GYM NOVA MAT", width: GYM_NOVA_MAT_DIMENSIONS_INCHES.long * 2, height: GYM_NOVA_MAT_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "teddy-mat", name: "TEDDY MAT", width: TEDDY_MAT_DIMENSIONS_INCHES.long * 2, height: TEDDY_MAT_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "hand-mat", name: "HAND MAT", width: HAND_MAT_DIMENSIONS_INCHES.long * 2, height: HAND_MAT_DIMENSIONS_INCHES.medium * 2, heightCue: "flat" },
  { id: "red-norbert-block", name: "RED NORBERT BLOCK", width: RED_NORBERT_BLOCK_DIMENSIONS_INCHES.long * 2, height: RED_NORBERT_BLOCK_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "blue-norbert-block", name: "BLUE NORBERT BLOCK", width: BLUE_NORBERT_BLOCK_DIMENSIONS_INCHES.long * 2, height: BLUE_NORBERT_BLOCK_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "green-norbert-block", name: "GREEN NORBERT BLOCK", width: GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES.long * 2, height: GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES.medium * 2, heightCue: "tall" },
  { id: "mini-red-norbert-block", name: "MINI RED NORBERT BLOCK", width: MINI_RED_NORBERT_BLOCK_DIMENSIONS_INCHES.long * 2, height: MINI_RED_NORBERT_BLOCK_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "squishy-norbert-block", name: "SQUISHY NORBERT BLOCK", width: SQUISHY_NORBERT_BLOCK_DIMENSIONS_INCHES.long * 2, height: SQUISHY_NORBERT_BLOCK_DIMENSIONS_INCHES.medium * 2, heightCue: "tall" },
  { id: "small-green-norbert-block", name: "SMALL GREEN NORBERT BLOCK", width: SMALL_GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES.long * 2, height: SMALL_GREEN_NORBERT_BLOCK_DIMENSIONS_INCHES.medium * 2, heightCue: "raised" },
  { id: "pbar-block", name: "PBAR BLOCK", width: PBAR_BLOCK_DIMENSIONS_INCHES.long * 2, height: PBAR_BLOCK_DIMENSIONS_INCHES.short * 2, heightCue: "tall" },
  { id: "half-block", name: "HALF BLOCK", width: HALF_BLOCK_DIMENSIONS_INCHES.long * 2, height: HALF_BLOCK_DIMENSIONS_INCHES.short * 2, heightCue: "raised" },
  { id: "big-octagon", name: "BIG OCTAGON", width: BIG_OCTAGON_SIZE.width, height: BIG_OCTAGON_SIZE.height, heightCue: "tall" },
  { id: "medium-octagon", name: "MEDIUM OCTAGON", width: MEDIUM_OCTAGON_SIZE.width, height: MEDIUM_OCTAGON_SIZE.height, heightCue: "tall" },
  { id: "small-octagon", name: "SMALL OCTAGON", width: SMALL_OCTAGON_SIZE.width, height: SMALL_OCTAGON_SIZE.height, heightCue: "raised" },
  { id: "tiny-cheese-mat", name: "TINY CHEESE MAT", width: TINY_CHEESE_MAT_SIZE.width, height: TINY_CHEESE_MAT_SIZE.height, heightCue: "raised" },
  { id: "small-cheese-mat", name: "SMALL CHEESE MAT", width: SMALL_CHEESE_MAT_SIZE.width, height: SMALL_CHEESE_MAT_SIZE.height, heightCue: "raised" },
  { id: "medium-cheese-mat", name: "MEDIUM CHEESE MAT", width: MEDIUM_CHEESE_MAT_SIZE.width, height: MEDIUM_CHEESE_MAT_SIZE.height, heightCue: "raised" },
  { id: "large-cheese-mat", name: "LARGE CHEESE MAT", width: LARGE_CHEESE_MAT_SIZE.width, height: LARGE_CHEESE_MAT_SIZE.height, heightCue: "raised" },
  { id: "big-cheese-mat", name: "HUGE CHEESE MAT", width: BIG_CHEESE_MAT_SIZE.width, height: BIG_CHEESE_MAT_SIZE.height, heightCue: "raised" },
  { id: "squishy-cheese-mat", name: "SQUISHY CHEESE MAT", width: SQUISHY_CHEESE_MAT_SIZE.width, height: SQUISHY_CHEESE_MAT_SIZE.height, heightCue: "raised" },
  { id: "cloud-mat", name: "CLOUD MAT", width: CLOUD_MAT_SIZE.width, height: CLOUD_MAT_SIZE.height, heightCue: "raised" },
  { id: "springboard", name: "SPRINGBOARD", width: SPRINGBOARD_SIZE.width, height: SPRINGBOARD_SIZE.height, heightCue: "raised" },
  { id: "preschool-springboard", name: "PRESCHOOL SPRINGBOARD", width: PRESCHOOL_SPRINGBOARD_SIZE.width, height: PRESCHOOL_SPRINGBOARD_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "t-trainer", name: "T TRAINER", width: T_TRAINER_SIZE.width, height: T_TRAINER_SIZE.height, heightCue: "raised" },
  { id: "mail-box", name: "MAIL BOX", width: MAIL_BOX_SIZE.width, height: MAIL_BOX_SIZE.height, heightCue: "raised" },
  { id: "green-mail-box", name: "GREEN MAILBOX", width: GREEN_MAIL_BOX_SIZE.width, height: GREEN_MAIL_BOX_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "colt", name: "COLT", width: COLT_SIZE.width, height: COLT_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "parallette", name: "PARALLETTE", width: PARALLETTE_SIZE.width, height: PARALLETTE_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "mini-low-bar", name: "MINI LOW BAR", width: MINI_LOW_BAR_SIZE.width, height: MINI_LOW_BAR_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "rec-mini-bar", name: "REC MINI BAR", width: REC_MINI_BAR_SIZE.width, height: REC_MINI_BAR_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "advanced-mini-bar", name: "ADVANCED MINI BAR", width: ADVANCED_MINI_BAR_SIZE.width, height: ADVANCED_MINI_BAR_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "traffic-cone", name: "TRAFFIC CONE", width: TRAFFIC_CONE_SIZE.width, height: TRAFFIC_CONE_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "target-marker", name: "TARGET MARKER", width: TARGET_MARKER_SIZE.width, height: TARGET_MARKER_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "beanbag", name: "BEANBAG", width: BEANBAG_SIZE.width, height: BEANBAG_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "rainbow-mat", name: "RAINBOW MAT", width: RAINBOW_MAT_SIZE.width, height: RAINBOW_MAT_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "pac-man", name: "PAC-MAN", width: PAC_MAN_SIZE.width, height: PAC_MAN_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "trapeze", name: "TRAPEZE", width: TRAPEZE_SIZE.width, height: TRAPEZE_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "pvc-pipe", name: "PVC PIPE", width: PVC_PIPE_SIZE.width, height: PVC_PIPE_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "small-bar-pad", name: "SMALL BAR PAD", width: SMALL_BAR_PAD_SIZE.width, height: SMALL_BAR_PAD_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "rolling-bar", name: "ROLLING BAR", width: ROLLING_BAR_SIZE.width, height: ROLLING_BAR_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "wooden-climbing-ladder", name: "WOODEN CLIMBING LADDER", width: WOODEN_CLIMBING_LADDER_SIZE.width, height: WOODEN_CLIMBING_LADDER_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "bose-ball", name: "BOSE BALL", width: BOSE_BALL_SIZE.width, height: BOSE_BALL_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "foam-roller", name: "FOAM ROLLER", width: FOAM_ROLLER_SIZE.width, height: FOAM_ROLLER_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "yoga-ball", name: "YOGA BALL", width: YOGA_BALL_SIZE.width, height: YOGA_BALL_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "vault-trainer", name: "VAULT TRAINER", width: VAULT_TRAINER_SIZE.width, height: VAULT_TRAINER_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "big-boulder", name: "BIG BOULDER", width: BIG_BOULDER_SIZE.width, height: BIG_BOULDER_SIZE.height, heightCue: "raised" },
  { id: "medium-boulder", name: "MEDIUM BOULDER", width: MEDIUM_BOULDER_SIZE.width, height: MEDIUM_BOULDER_SIZE.height, heightCue: "raised" },
  { id: "small-boulder", name: "SMALL BOULDER", width: SMALL_BOULDER_SIZE.width, height: SMALL_BOULDER_SIZE.height, heightCue: "raised" },
  { id: "small-semicircle", name: "SMALL SEMICIRCLE", width: SMALL_SEMICIRCLE_SIZE.width, height: SMALL_SEMICIRCLE_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "mini-mushroom", name: "MINI MUSHROOM", width: MINI_MUSHROOM_SIZE.width, height: MINI_MUSHROOM_SIZE.height, heightCue: "raised" },
  { id: "floor-mushroom", name: "FLOOR MUSHROOM", width: FLOOR_MUSHROOM_SIZE.width, height: FLOOR_MUSHROOM_SIZE.height, heightCue: "flat" },
  { id: "mushroom-mat", name: "MUSHROOM MAT", width: MUSHROOM_MAT_SIZE.width, height: MUSHROOM_MAT_SIZE.height, heightCue: "tall", noFlip: true },
  { id: "cylinder", name: "CYLINDER", width: CYLINDER_SIZE.width, height: CYLINDER_SIZE.height, heightCue: "tall" },
  { id: "red-trapezoid", name: "RED TRAPEZOID", width: RED_TRAPEZOID_DIMENSIONS_INCHES.length * 2, height: RED_TRAPEZOID_DIMENSIONS_INCHES.bottomDepth * 2, heightCue: "raised" },
  { id: "yellow-trapezoid", name: "YELLOW TRAPEZOID", width: YELLOW_TRAPEZOID_DIMENSIONS_INCHES.length * 2, height: YELLOW_TRAPEZOID_DIMENSIONS_INCHES.bottomDepth * 2, heightCue: "raised" },
  { id: "green-trapezoid", name: "GREEN TRAPEZOID", width: GREEN_TRAPEZOID_DIMENSIONS_INCHES.length * 2, height: GREEN_TRAPEZOID_DIMENSIONS_INCHES.bottomDepth * 2, heightCue: "raised" },
  { id: "bungee", name: "BUNGEE LOOP", width: BUNGEE_LOOP_SIZE.width, height: BUNGEE_LOOP_SIZE.height, heightCue: "flat", noFlip: true },
  { id: "chalk-bucket", name: "CHALK BUCKET", width: CHALK_BUCKET_SIZE.width, height: CHALK_BUCKET_SIZE.height, heightCue: "raised", noFlip: true },
  { id: "mat-placeholder", name: "NEW MAT PLACEHOLDER", width: MAT_PLACEHOLDER_SIZES.rectangle.width, height: MAT_PLACEHOLDER_SIZES.rectangle.height, heightCue: "flat", noFlip: true },
  { id: "folded-panel", name: "FOLDED PANEL", width: 96, height: 96, heightCue: "raised" },
  { id: "wedge", name: "WEDGE", width: 160, height: 112, heightCue: "raised" },
  { id: "block", name: "TALL BLOCK", width: 112, height: 112, heightCue: "tall" },
  { id: "landing", name: "LANDING MAT", width: 224, height: 128, heightCue: "raised" },
  { id: "strip", name: "LONG STRIP", width: 320, height: 64, heightCue: "flat" },
  { id: "barrel", name: "BARREL", width: 112, height: 96, heightCue: "tall" },
  { id: "beam", name: "BALANCE BEAM", width: 288, height: 48, heightCue: "raised" },
] as const;

/** New Station Maker layouts expose only equipment with a pixel-sprite renderer. */
export const stationMakerAssets = stationAssets.filter((asset) => asset.id === "panel" || asset.id === "five-panel" || asset.id === "six-panel" || asset.id === "big-block" || asset.id === "blue-resi" || asset.id === "mini-resi" || isStripedResiAsset(asset.id) || asset.id === "pink-beam-mat" || asset.id === "cartwheel-mat" || asset.id === "stairs" || asset.id === "velcro-beam" || asset.id === "sting-mat" || asset.id === "gym-nova-mat" || asset.id === "teddy-mat" || asset.id === "hand-mat" || asset.id === "red-norbert-block" || asset.id === "blue-norbert-block" || asset.id === "green-norbert-block" || asset.id === "mini-red-norbert-block" || asset.id === "squishy-norbert-block" || asset.id === "small-green-norbert-block" || asset.id === "pbar-block" || asset.id === "half-block" || asset.id === "big-octagon" || asset.id === "medium-octagon" || asset.id === "small-octagon" || asset.id === "tiny-cheese-mat" || asset.id === "small-cheese-mat" || asset.id === "medium-cheese-mat" || asset.id === "large-cheese-mat" || asset.id === "big-cheese-mat" || asset.id === "squishy-cheese-mat" || asset.id === "cloud-mat" || asset.id === "springboard" || asset.id === "preschool-springboard" || asset.id === "t-trainer" || asset.id === "mail-box" || asset.id === "green-mail-box" || asset.id === "colt" || asset.id === "parallette" || asset.id === "mini-low-bar" || asset.id === "rec-mini-bar" || asset.id === "advanced-mini-bar" || asset.id === "traffic-cone" || asset.id === "target-marker" || asset.id === "beanbag" || asset.id === "rainbow-mat" || asset.id === "pac-man" || asset.id === "trapeze" || asset.id === "pvc-pipe" || asset.id === "small-bar-pad" || asset.id === "rolling-bar" || asset.id === "wooden-climbing-ladder" || asset.id === "bose-ball" || asset.id === "foam-roller" || asset.id === "yoga-ball" || asset.id === "vault-trainer" || asset.id === "big-boulder" || asset.id === "medium-boulder" || asset.id === "small-boulder" || asset.id === "small-semicircle" || asset.id === "mini-mushroom" || asset.id === "floor-mushroom" || asset.id === "mushroom-mat" || asset.id === "cylinder" || asset.id === "red-trapezoid" || asset.id === "yellow-trapezoid" || asset.id === "green-trapezoid" || asset.id === "bungee" || asset.id === "chalk-bucket" || asset.id === "mat-placeholder");

type PanelMatPoint = readonly [number, number, number];
type PanelMatFace = { normal: PanelMatPoint; points: readonly PanelMatPoint[] };
type StationSpriteFrame = { width: number; height: number };

const PANEL_MAT_TOP: PanelMatFace = {
  normal: [0, 0, 1],
  points: [[-48, -24, PANEL_MAT_PANEL_HEIGHT_INCHES], [48, -24, PANEL_MAT_PANEL_HEIGHT_INCHES], [48, 24, PANEL_MAT_PANEL_HEIGHT_INCHES], [-48, 24, PANEL_MAT_PANEL_HEIGHT_INCHES]],
};
const PANEL_MAT_SIDES: readonly PanelMatFace[] = [
  { normal: [1, 0, 0], points: [[48, -24, 0], [48, 24, 0], [48, 24, PANEL_MAT_PANEL_HEIGHT_INCHES], [48, -24, PANEL_MAT_PANEL_HEIGHT_INCHES]] },
  { normal: [0, 1, 0], points: [[48, 24, 0], [-48, 24, 0], [-48, 24, PANEL_MAT_PANEL_HEIGHT_INCHES], [48, 24, PANEL_MAT_PANEL_HEIGHT_INCHES]] },
  { normal: [-1, 0, 0], points: [[-48, 24, 0], [-48, -24, 0], [-48, -24, PANEL_MAT_PANEL_HEIGHT_INCHES], [-48, 24, PANEL_MAT_PANEL_HEIGHT_INCHES]] },
  { normal: [0, -1, 0], points: [[-48, -24, 0], [48, -24, 0], [48, -24, PANEL_MAT_PANEL_HEIGHT_INCHES], [-48, -24, PANEL_MAT_PANEL_HEIGHT_INCHES]] },
];
function panelMatSideSegment(face: PanelMatFace, bottom: number, top: number): PanelMatPoint[] {
  return face.points.map(([x, y, z]) => [x, y, z === 0 ? bottom : top]);
}

function cuboidFaces(halfWidth: number, halfDepth: number, height: number): { top: PanelMatFace; sides: readonly PanelMatFace[] } {
  const top: PanelMatFace = { normal: [0, 0, 1], points: [[-halfWidth, -halfDepth, height], [halfWidth, -halfDepth, height], [halfWidth, halfDepth, height], [-halfWidth, halfDepth, height]] };
  const sides: readonly PanelMatFace[] = [
    { normal: [1, 0, 0], points: [[halfWidth, -halfDepth, 0], [halfWidth, halfDepth, 0], [halfWidth, halfDepth, height], [halfWidth, -halfDepth, height]] },
    { normal: [0, 1, 0], points: [[halfWidth, halfDepth, 0], [-halfWidth, halfDepth, 0], [-halfWidth, halfDepth, height], [halfWidth, halfDepth, height]] },
    { normal: [-1, 0, 0], points: [[-halfWidth, halfDepth, 0], [-halfWidth, -halfDepth, 0], [-halfWidth, -halfDepth, height], [-halfWidth, halfDepth, height]] },
    { normal: [0, -1, 0], points: [[-halfWidth, -halfDepth, 0], [halfWidth, -halfDepth, 0], [halfWidth, -halfDepth, height], [-halfWidth, -halfDepth, height]] },
  ];
  return { top, sides };
}

function visibleCuboidSides(rotation: number, sides: readonly PanelMatFace[]): readonly PanelMatFace[] {
  const radians = snapStationRotation(rotation) * Math.PI / 180;
  const rotateNormal = ([x, y]: PanelMatPoint): readonly [number, number] => [x * Math.cos(radians) - y * Math.sin(radians), x * Math.sin(radians) + y * Math.cos(radians)];
  return sides.filter((face) => {
    const [x, y] = rotateNormal(face.normal);
    return x * .44 + y > .001;
  });
}

function visiblePanelMatSides(rotation: number, sides = PANEL_MAT_SIDES): readonly PanelMatFace[] {
  return visibleCuboidSides(rotation, sides);
}

function foldingPanelMatFaces(panelCount: number, panelLengthFeet: number, panelDepthFeet: number, panelHeightInches: number) {
  return cuboidFaces(panelCount * panelDepthFeet * 6, panelLengthFeet * 6, panelHeightInches);
}

function visibleFoldingPanelMatSides(rotation: number, sides: readonly PanelMatFace[]): readonly PanelMatFace[] {
  return visibleCuboidSides(rotation, sides);
}

/** Shared screen axes for every hard-edged 2.5D station sprite and the floor grid beneath it. */
export const STATION_2P5D_PROJECTION = { x: 1.15, depthX: -.48, depthY: .92 } as const;

/** Projects real inches onto the pixel board, leaving a little overhead perspective. */
function panelMatProjection(rotation: number, elevation: number, frame: StationSpriteFrame = PANEL_MAT_OPEN_SIZE) {
  const radians = snapStationRotation(rotation) * Math.PI / 180;
  const rotate = ([x, y, z]: PanelMatPoint): PanelMatPoint => [x * Math.cos(radians) - y * Math.sin(radians), x * Math.sin(radians) + y * Math.cos(radians), z];
  const project = (point: PanelMatPoint): StationPoint => {
    const [x, y, z] = rotate(point);
    return { x: Math.round(frame.width / 2 + x * STATION_2P5D_PROJECTION.x + y * STATION_2P5D_PROJECTION.depthX), y: Math.round(frame.height / 2 + y * STATION_2P5D_PROJECTION.depthY - z - elevation / STATION_VERTICAL_UNITS_PER_INCH) };
  };
  return { rotate, project };
}

/** A deliberately faceted, loose continuous exercise loop rather than a smooth generic oval. */
export function bungeeLoopSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = BUNGEE_LOOP_SIZE): { loop: StationPoint[] } {
  const halfWidth = BUNGEE_LOOP_RESTING_WIDTH_INCHES / 2;
  const halfLength = BUNGEE_LOOP_LAY_FLAT_LENGTH_INCHES / 2;
  const loop: PanelMatPoint[] = [
    [0, -halfLength, 0], [halfWidth * .7, -halfLength * .94, 0], [halfWidth, -halfLength * .58, 0], [halfWidth, halfLength * .58, 0],
    [halfWidth * .7, halfLength * .94, 0], [0, halfLength, 0], [-halfWidth * .7, halfLength * .94, 0], [-halfWidth, halfLength * .58, 0],
    [-halfWidth, -halfLength * .58, 0], [-halfWidth * .7, -halfLength * .94, 0], [0, -halfLength, 0],
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  return { loop: loop.map(project) };
}

export type StairsSurfaceColor = "red-top" | "red-riser" | "blue" | "yellow";
export type StairsSpriteSurface = { color: StairsSurfaceColor; points: StationPoint[] };

/** Literal two-step foam trainer: red treads, a blue tall step, and a yellow lower step. */
export function stairsSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = STAIRS_SIZE): { surfaces: StairsSpriteSurface[] } {
  const halfWidth = STAIRS_WIDTH_INCHES / 2;
  const halfDepth = STAIRS_DEPTH_INCHES / 2;
  const seam = -halfDepth + STAIRS_STEP_DEPTH_INCHES;
  const lowHeight = STAIRS_LOW_STEP_HEIGHT_INCHES;
  const highHeight = STAIRS_HEIGHT_INCHES;
  const surfaces: { color: StairsSurfaceColor; normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { color: "red-top", normal: [0, 0, 1], points: [[-halfWidth, -halfDepth, lowHeight], [halfWidth, -halfDepth, lowHeight], [halfWidth, seam, lowHeight], [-halfWidth, seam, lowHeight]] },
    { color: "red-top", normal: [0, 0, 1], points: [[-halfWidth, seam, highHeight], [halfWidth, seam, highHeight], [halfWidth, halfDepth, highHeight], [-halfWidth, halfDepth, highHeight]] },
    { color: "yellow", normal: [0, -1, 0], points: [[-halfWidth, -halfDepth, 0], [halfWidth, -halfDepth, 0], [halfWidth, -halfDepth, lowHeight], [-halfWidth, -halfDepth, lowHeight]] },
    { color: "yellow", normal: [1, 0, 0], points: [[halfWidth, -halfDepth, 0], [halfWidth, seam, 0], [halfWidth, seam, lowHeight], [halfWidth, -halfDepth, lowHeight]] },
    { color: "yellow", normal: [-1, 0, 0], points: [[-halfWidth, seam, 0], [-halfWidth, -halfDepth, 0], [-halfWidth, -halfDepth, lowHeight], [-halfWidth, seam, lowHeight]] },
    { color: "blue", normal: [0, 1, 0], points: [[halfWidth, halfDepth, 0], [-halfWidth, halfDepth, 0], [-halfWidth, halfDepth, highHeight], [halfWidth, halfDepth, highHeight]] },
    { color: "blue", normal: [1, 0, 0], points: [[halfWidth, seam, 0], [halfWidth, halfDepth, 0], [halfWidth, halfDepth, highHeight], [halfWidth, seam, highHeight]] },
    { color: "blue", normal: [-1, 0, 0], points: [[-halfWidth, halfDepth, 0], [-halfWidth, seam, 0], [-halfWidth, seam, highHeight], [-halfWidth, halfDepth, highHeight]] },
    { color: "red-riser", normal: [0, -1, 0], points: [[-halfWidth, seam, lowHeight], [halfWidth, seam, lowHeight], [halfWidth, seam, highHeight], [-halfWidth, seam, highHeight]] },
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  return {
    surfaces: surfaces
      .filter((surface) => cheeseFaceVisible(surface.normal, rotation))
      .map((surface) => ({ color: surface.color, points: surface.points.map(project) }))
      .sort((first, second) => second.points.reduce((total, point) => total + point.y, 0) / second.points.length - first.points.reduce((total, point) => total + point.y, 0) / first.points.length),
  };
}

type SpringboardSurface = { role: "top" | "bottom" | "end" | "side"; points: StationPoint[] };
export const SPRINGBOARD_SPRING_COUNT = 6;
export const SPRINGBOARD_SPRING_COILS = 4;

/** Hard-edged 2.5D geometry for a 2-foot by 4-foot Springboard with an 8-inch tall edge. */
export function springboardSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = SPRINGBOARD_SIZE): SpringboardSurface[] {
  const halfLength = SPRINGBOARD_FLOOR_LENGTH_INCHES / 2;
  const halfDepth = SPRINGBOARD_TOP_DEPTH_INCHES / 2;
  const height = SPRINGBOARD_HEIGHT_INCHES;
  const lowFront: PanelMatPoint = [-halfLength, -halfDepth, 0]; const highFrontBase: PanelMatPoint = [halfLength, -halfDepth, 0];
  const highBackBase: PanelMatPoint = [halfLength, halfDepth, 0]; const lowBack: PanelMatPoint = [-halfLength, halfDepth, 0];
  const highFront: PanelMatPoint = [halfLength, -halfDepth, height]; const highBack: PanelMatPoint = [halfLength, halfDepth, height];
  const slopeNormal = normalizeVector([-height, 0, SPRINGBOARD_FLOOR_LENGTH_INCHES]);
  const surfaces: { role: SpringboardSurface["role"]; normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { role: "bottom", normal: [0, 0, -1], points: [lowFront, lowBack, highBackBase, highFrontBase] },
    { role: "top", normal: slopeNormal, points: [lowFront, highFront, highBack, lowBack] },
    { role: "end", normal: [1, 0, 0], points: [highFrontBase, highBackBase, highBack, highFront] },
    { role: "side", normal: [0, -1, 0], points: [lowFront, highFrontBase, highFront] },
    { role: "side", normal: [0, 1, 0], points: [lowBack, highBack, highBackBase] },
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  return surfaces
    .filter((surface) => cheeseFaceVisible(surface.normal, rotation))
    .map((surface) => ({ role: surface.role, points: surface.points.map(project) }))
    .sort((first, second) => second.points.reduce((total, point) => total + point.y, 0) / second.points.length - first.points.reduce((total, point) => total + point.y, 0) / first.points.length);
}

/** Six visible coiled springs beneath the Springboard's padded wedge. */
export function springboardSpringGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = SPRINGBOARD_SIZE): StationPoint[][] {
  const halfLength = SPRINGBOARD_FLOOR_LENGTH_INCHES / 2;
  const halfDepth = SPRINGBOARD_TOP_DEPTH_INCHES / 2;
  const heightAt = (x: number) => SPRINGBOARD_HEIGHT_INCHES * (x + halfLength) / (halfLength * 2);
  // Keep every coil below a part of the rising board with usable clearance.
  const springXs = [-halfLength * .34, halfLength * .1, halfLength * .54];
  const springYs = [-halfDepth * .62, halfDepth * .62];
  const coilSteps = SPRINGBOARD_SPRING_COILS * 4;
  const { project } = panelMatProjection(rotation, elevation, frame);
  return springYs.flatMap((centerY) => springXs.map((centerX) => Array.from({ length: coilSteps + 1 }, (_, index) => {
    const progress = index / coilSteps;
    const angle = progress * Math.PI * 2 * SPRINGBOARD_SPRING_COILS;
    const radius = 2.1;
    return project([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * .45, .35 + (heightAt(centerX) - .7) * progress]);
  })));
}

export type PreschoolSpringboardSurface = { role: "top" | "bottom" | "end" | "side"; points: StationPoint[] };
export type PreschoolSpringboardSpriteGeometry = { surfaces: PreschoolSpringboardSurface[]; springs: StationPoint[][]; purpleFootprints: StationPoint[][] };

/** Smaller red springboard with its two purple footprint decals and four visible red coil springs. */
export function preschoolSpringboardSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = PRESCHOOL_SPRINGBOARD_SIZE): PreschoolSpringboardSpriteGeometry {
  const halfLength = PRESCHOOL_SPRINGBOARD_FLOOR_LENGTH_INCHES / 2;
  const halfDepth = PRESCHOOL_SPRINGBOARD_TOP_DEPTH_INCHES / 2;
  const height = PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES;
  const lowFront: PanelMatPoint = [-halfLength, -halfDepth, 0]; const highFrontBase: PanelMatPoint = [halfLength, -halfDepth, 0];
  const highBackBase: PanelMatPoint = [halfLength, halfDepth, 0]; const lowBack: PanelMatPoint = [-halfLength, halfDepth, 0];
  const highFront: PanelMatPoint = [halfLength, -halfDepth, height]; const highBack: PanelMatPoint = [halfLength, halfDepth, height];
  const slopeNormal = normalizeVector([-height, 0, PRESCHOOL_SPRINGBOARD_FLOOR_LENGTH_INCHES]);
  const surfaces: { role: PreschoolSpringboardSurface["role"]; normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { role: "bottom", normal: [0, 0, -1], points: [lowFront, lowBack, highBackBase, highFrontBase] },
    { role: "top", normal: slopeNormal, points: [lowFront, highFront, highBack, lowBack] },
    { role: "end", normal: [1, 0, 0], points: [highFrontBase, highBackBase, highBack, highFront] },
    { role: "side", normal: [0, -1, 0], points: [lowFront, highFrontBase, highFront] },
    { role: "side", normal: [0, 1, 0], points: [lowBack, highBack, highBackBase] },
  ];
  const heightAt = (x: number) => height * (x + halfLength) / (halfLength * 2);
  const coilSteps = PRESCHOOL_SPRINGBOARD_SPRING_COILS * 4;
  const { project } = panelMatProjection(rotation, elevation, frame);
  const springs = [-halfDepth * .55, halfDepth * .55].flatMap((centerY) => [-halfLength * .05, halfLength * .52].map((centerX) => Array.from({ length: coilSteps + 1 }, (_, index) => {
    const progress = index / coilSteps;
    const angle = progress * Math.PI * 2 * PRESCHOOL_SPRINGBOARD_SPRING_COILS;
    const radius = 1.7;
    return project([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * .45, .25 + (heightAt(centerX) - .55) * progress]);
  })));
  const footprint = (centerX: number, centerY: number) => [[-1.3, -1.8], [1.15, -1.35], [1.5, .65], [.45, 2.4], [-.75, 2.55], [-1.45, .8]].map(([x, y]) => project([centerX + x, centerY + y, heightAt(centerX + x) + .04]));
  const purpleFootprints = [footprint(-halfLength * .18, -halfDepth * .27), footprint(-halfLength * .02, halfDepth * .27)];
  const visibleSurfaces = surfaces
    .filter((surface) => cheeseFaceVisible(surface.normal, rotation))
    .map((surface) => ({ role: surface.role, points: surface.points.map(project) }))
    .sort((first, second) => second.points.reduce((total, point) => total + point.y, 0) / second.points.length - first.points.reduce((total, point) => total + point.y, 0) / first.points.length);
  return { surfaces: visibleSurfaces, springs, purpleFootprints };
}

export type TTrainerSpriteGeometry = {
  frameBars: StationPoint[][];
  railFaces: StationPoint[][];
  runwaySides: StationPoint[][];
  trampoline: StationPoint[];
  dashes: StationPoint[][];
  crossLine: StationPoint[];
};

/** Hard-edged 2.5D geometry for the T Trainer's blue runway, raised red rails, and gray frame. */
export function tTrainerSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = T_TRAINER_SIZE): TTrainerSpriteGeometry {
  const halfLength = T_TRAINER_FLOOR_LENGTH_INCHES / 2;
  const halfDepth = T_TRAINER_TRAMPOLINE_DEPTH_INCHES / 2;
  const halfBedDepth = T_TRAINER_BED_DEPTH_INCHES / 2;
  const lowHeight = T_TRAINER_LOW_HEIGHT_INCHES;
  const highHeight = T_TRAINER_HIGH_HEIGHT_INCHES;
  const heightAt = (x: number) => lowHeight + (x + halfLength) / T_TRAINER_FLOOR_LENGTH_INCHES * T_TRAINER_RISE_INCHES;
  const lowFrontBase: PanelMatPoint = [-halfLength, -halfBedDepth, 0]; const highFrontBase: PanelMatPoint = [halfLength, -halfBedDepth, 0];
  const highBackBase: PanelMatPoint = [halfLength, halfBedDepth, 0]; const lowBackBase: PanelMatPoint = [-halfLength, halfBedDepth, 0];
  const lowFrontTop: PanelMatPoint = [-halfLength, -halfBedDepth, lowHeight]; const lowBackTop: PanelMatPoint = [-halfLength, halfBedDepth, lowHeight];
  const highFrontTop: PanelMatPoint = [halfLength, -halfBedDepth, highHeight]; const highBackTop: PanelMatPoint = [halfLength, halfBedDepth, highHeight];
  const slopeNormal = normalizeVector([-T_TRAINER_RISE_INCHES, 0, T_TRAINER_FLOOR_LENGTH_INCHES]);
  const runwayFaces: readonly PanelMatFace[] = [
    { normal: [1, 0, 0], points: [highFrontBase, highBackBase, highBackTop, highFrontTop] },
    { normal: [-1, 0, 0], points: [lowBackBase, lowFrontBase, lowFrontTop, lowBackTop] },
    { normal: [0, -1, 0], points: [lowFrontBase, highFrontBase, highFrontTop, lowFrontTop] },
    { normal: [0, 1, 0], points: [highBackBase, lowBackBase, lowBackTop, highBackTop] },
  ];
  const runway: readonly PanelMatPoint[] = [lowFrontTop, highFrontTop, highBackTop, lowBackTop];
  const railFaces: readonly PanelMatFace[] = [-1, 1].flatMap((side) => {
    const outerY = side * halfDepth; const innerY = side * halfBedDepth;
    const lowOuter: PanelMatPoint = [-halfLength, outerY, 0]; const highOuter: PanelMatPoint = [halfLength, outerY, 0];
    const lowInner: PanelMatPoint = [-halfLength, innerY, 0]; const highInner: PanelMatPoint = [halfLength, innerY, 0];
    const lowOuterTop: PanelMatPoint = [-halfLength, outerY, lowHeight + T_TRAINER_RAIL_RISE_INCHES]; const highOuterTop: PanelMatPoint = [halfLength, outerY, highHeight + T_TRAINER_RAIL_RISE_INCHES];
    const lowInnerTop: PanelMatPoint = [-halfLength, innerY, lowHeight + T_TRAINER_RAIL_RISE_INCHES]; const highInnerTop: PanelMatPoint = [halfLength, innerY, highHeight + T_TRAINER_RAIL_RISE_INCHES];
    return [
      { normal: [0, 0, 1] as PanelMatPoint, points: [lowOuterTop, highOuterTop, highInnerTop, lowInnerTop] },
      { normal: [0, side, 0] as PanelMatPoint, points: [lowOuter, highOuter, highOuterTop, lowOuterTop] },
      { normal: [0, -side, 0] as PanelMatPoint, points: [highInner, lowInner, lowInnerTop, highInnerTop] },
      { normal: [-1, 0, 0] as PanelMatPoint, points: [lowInner, lowOuter, lowOuterTop, lowInnerTop] },
      { normal: [1, 0, 0] as PanelMatPoint, points: [highOuter, highInner, highInnerTop, highOuterTop] },
    ];
  });
  const dashLength = 4;
  const dashCenters = [-halfLength * .42, 0, halfLength * .42];
  const halfDashWidth = 1;
  const dashes = dashCenters.map((center) => {
    const start = center - dashLength / 2; const end = center + dashLength / 2;
    return [[start, -halfDashWidth, heightAt(start)], [end, -halfDashWidth, heightAt(end)], [end, halfDashWidth, heightAt(end)], [start, halfDashWidth, heightAt(start)]] as const;
  });
  const crossCenter = halfLength - T_TRAINER_CROSS_LINE_FROM_HIGH_INCHES * T_TRAINER_FLOOR_LENGTH_INCHES / T_TRAINER_TRAMPOLINE_LENGTH_INCHES;
  const crossHalfWidth = .7;
  const crossLine: readonly PanelMatPoint[] = [[crossCenter - crossHalfWidth, -halfBedDepth + 1, heightAt(crossCenter - crossHalfWidth)], [crossCenter + crossHalfWidth, -halfBedDepth + 1, heightAt(crossCenter + crossHalfWidth)], [crossCenter + crossHalfWidth, halfBedDepth - 1, heightAt(crossCenter + crossHalfWidth)], [crossCenter - crossHalfWidth, halfBedDepth - 1, heightAt(crossCenter - crossHalfWidth)]];
  const frameSegments: readonly (readonly [PanelMatPoint, PanelMatPoint])[] = [
    [[-halfLength * .75, -halfDepth, 1], [-halfLength * .75, halfDepth, 1]],
    [[halfLength * .35, -halfDepth, 1], [halfLength * .35, halfDepth, 1]],
    [[-halfLength * .75, -halfBedDepth, 1], [-halfLength * .75, -halfBedDepth, heightAt(-halfLength * .75) - 2]],
    [[-halfLength * .75, halfBedDepth, 1], [-halfLength * .75, halfBedDepth, heightAt(-halfLength * .75) - 2]],
    [[halfLength * .35, -halfBedDepth, 1], [halfLength * .35, -halfBedDepth, heightAt(halfLength * .35) - 2]],
    [[halfLength * .35, halfBedDepth, 1], [halfLength * .35, halfBedDepth, heightAt(halfLength * .35) - 2]],
    [[-halfLength * .75, -halfBedDepth, 1], [halfLength * .35, -halfBedDepth, heightAt(halfLength * .35) - 2]],
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  return {
    frameBars: frameSegments.map((segment) => segment.map(project)),
    railFaces: railFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project)),
    runwaySides: visibleCuboidSides(rotation, runwayFaces).map((face) => face.points.map(project)),
    trampoline: runway.map(project),
    dashes: dashes.map((dash) => dash.map(project)),
    crossLine: crossLine.map(project),
  };
}

export type MailBoxSpriteGeometry = { redFaces: StationPoint[][]; yellowEndCaps: StationPoint[][]; redEndStraps: StationPoint[][]; blackEndLabels: StationPoint[][] };

/** Pixel-segmented 2.5D classic mailbox geometry with a half-cylinder roof and contrasting end caps. */
function classicMailBoxSpriteGeometry({ length, depth, baseHeight }: { length: number; depth: number; baseHeight: number }, rotation: number, elevation: number, frame: StationSpriteFrame): MailBoxSpriteGeometry {
  const halfLength = length / 2;
  const radius = depth / 2;
  const roofHeight = (y: number) => baseHeight + Math.sqrt(Math.max(0, radius ** 2 - y ** 2));
  const roofPoints = Array.from({ length: MAIL_BOX_ROOF_SEGMENTS + 1 }, (_, index) => {
    const y = -radius + index * (radius * 2 / MAIL_BOX_ROOF_SEGMENTS);
    return [y, roofHeight(y)] as const;
  });
  const endProfile: readonly PanelMatPoint[] = [[-radius, 0], [radius, 0], [radius, baseHeight], ...roofPoints.slice(1, -1).reverse(), [-radius, baseHeight]].map(([y, z]) => [halfLength, y, z] as PanelMatPoint);
  const redFaces: { normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { normal: [0, 0, -1], points: [[-halfLength, -radius, 0], [halfLength, -radius, 0], [halfLength, radius, 0], [-halfLength, radius, 0]] },
    { normal: [0, -1, 0], points: [[-halfLength, -radius, 0], [halfLength, -radius, 0], [halfLength, -radius, baseHeight], [-halfLength, -radius, baseHeight]] },
    { normal: [0, 1, 0], points: [[halfLength, radius, 0], [-halfLength, radius, 0], [-halfLength, radius, baseHeight], [halfLength, radius, baseHeight]] },
    ...roofPoints.slice(0, -1).map(([firstY, firstZ], index) => {
      const [secondY, secondZ] = roofPoints[index + 1];
      return {
        normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - baseHeight] as PanelMatPoint,
        points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
      };
    }),
  ];
  const yellowEnds: readonly PanelMatFace[] = [
    { normal: [1, 0, 0], points: endProfile },
    { normal: [-1, 0, 0], points: endProfile.slice().reverse().map(([, y, z]) => [-halfLength, y, z] as PanelMatPoint) },
  ];
  const endDetails = [-1, 1].filter((direction) => cheeseFaceVisible([direction, 0, 0], rotation)).map((direction) => {
    const x = direction * halfLength;
    const rectangle = (yStart: number, yEnd: number, zStart: number, zEnd: number): PanelMatPoint[] => [
      [x, yStart, zStart], [x, yEnd, zStart], [x, yEnd, zEnd], [x, yStart, zEnd],
    ];
    return {
      strap: rectangle(-radius * .62, radius * .62, baseHeight + radius * .28, baseHeight + radius * .48),
      labels: [
        rectangle(-radius * .47, radius * .47, baseHeight * .55, baseHeight * .78),
        rectangle(-radius * .38, radius * .38, baseHeight * .18, baseHeight * .36),
      ],
    };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    redFaces: order(redFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    yellowEndCaps: order(yellowEnds.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    redEndStraps: endDetails.map((detail) => detail.strap.map(project)),
    blackEndLabels: endDetails.flatMap((detail) => detail.labels.map((label) => label.map(project))),
  };
}

export function mailBoxSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = MAIL_BOX_SIZE): MailBoxSpriteGeometry {
  return classicMailBoxSpriteGeometry({ length: MAIL_BOX_LENGTH_INCHES, depth: MAIL_BOX_DEPTH_INCHES, baseHeight: MAIL_BOX_BASE_HEIGHT_INCHES }, rotation, elevation, frame);
}

export function greenMailBoxSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = GREEN_MAIL_BOX_SIZE): MailBoxSpriteGeometry {
  return classicMailBoxSpriteGeometry({ length: GREEN_MAIL_BOX_LENGTH_INCHES, depth: GREEN_MAIL_BOX_DEPTH_INCHES, baseHeight: GREEN_MAIL_BOX_BASE_HEIGHT_INCHES }, rotation, elevation, frame);
}

export type ColtSpriteGeometry = { grayBaseFaces: StationPoint[][]; caramelRoofFaces: StationPoint[][]; grayEndFaces: StationPoint[][]; caramelEndFaces: StationPoint[][]; blackHandleBases: StationPoint[][]; tanHandleBars: StationPoint[][] };

/** Pixel-segmented portable Colt with a caramel pommel top, gray base, and two handholds. */
export function coltSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = COLT_SIZE): ColtSpriteGeometry {
  const halfLength = COLT_LENGTH_INCHES / 2;
  const halfDepth = COLT_DEPTH_INCHES / 2;
  const radius = COLT_ROOF_RADIUS_INCHES;
  const baseHeight = COLT_BASE_HEIGHT_INCHES;
  const roofHeight = (y: number) => baseHeight + Math.sqrt(Math.max(0, radius ** 2 - y ** 2));
  const roofPoints = Array.from({ length: COLT_ROOF_SEGMENTS + 1 }, (_, index) => {
    const y = -radius + index * (radius * 2 / COLT_ROOF_SEGMENTS);
    return [y, roofHeight(y)] as const;
  });
  const grayBaseFaces: { normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { normal: [0, 0, -1], points: [[-halfLength, -halfDepth, 0], [halfLength, -halfDepth, 0], [halfLength, halfDepth, 0], [-halfLength, halfDepth, 0]] },
    { normal: [0, -1, 0], points: [[-halfLength, -halfDepth, 0], [halfLength, -halfDepth, 0], [halfLength, -halfDepth, baseHeight], [-halfLength, -halfDepth, baseHeight]] },
    { normal: [0, 1, 0], points: [[halfLength, halfDepth, 0], [-halfLength, halfDepth, 0], [-halfLength, halfDepth, baseHeight], [halfLength, halfDepth, baseHeight]] },
    { normal: [0, 0, 1], points: [[-halfLength, -halfDepth, baseHeight], [halfLength, -halfDepth, baseHeight], [halfLength, -radius, baseHeight], [-halfLength, -radius, baseHeight]] },
    { normal: [0, 0, 1], points: [[-halfLength, radius, baseHeight], [halfLength, radius, baseHeight], [halfLength, halfDepth, baseHeight], [-halfLength, halfDepth, baseHeight]] },
  ];
  const caramelRoofFaces = roofPoints.slice(0, -1).map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = roofPoints[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - baseHeight] as PanelMatPoint,
      points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const endFaces = [-1, 1].map((direction) => {
    const x = direction * halfLength;
    const reverse = direction < 0;
    const base = [[x, -halfDepth, 0], [x, halfDepth, 0], [x, halfDepth, baseHeight], [x, -halfDepth, baseHeight]] as PanelMatPoint[];
    const roof = [[x, -radius, baseHeight], ...roofPoints.slice(1, -1).map(([y, z]) => [x, y, z] as PanelMatPoint), [x, radius, baseHeight]] as PanelMatPoint[];
    return { direction, base: reverse ? base.slice().reverse() : base, roof: reverse ? roof.slice().reverse() : roof };
  });
  const handleCenters = [-halfLength * .42, halfLength * .42];
  const handleY = radius * .58;
  const handleBases = handleCenters.flatMap((x) => [-handleY, handleY].map((y) => {
    const halfX = 1.2; const halfY = .75; const z = roofHeight(y) + .08;
    return [[x - halfX, y - halfY, z], [x + halfX, y - halfY, z], [x + halfX, y + halfY, z], [x - halfX, y + halfY, z]] as PanelMatPoint[];
  }));
  const handleBars = handleCenters.map((x) => [
    [x, -handleY, roofHeight(-handleY) + .2], [x, -handleY, COLT_HEIGHT_INCHES], [x, handleY, COLT_HEIGHT_INCHES], [x, handleY, roofHeight(handleY) + .2],
  ] as PanelMatPoint[]);
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    grayBaseFaces: order(grayBaseFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    caramelRoofFaces: order(caramelRoofFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    grayEndFaces: order(endFaces.filter(({ direction }) => cheeseFaceVisible([direction, 0, 0], rotation)).map(({ base }) => base.map(project))),
    caramelEndFaces: order(endFaces.filter(({ direction }) => cheeseFaceVisible([direction, 0, 0], rotation)).map(({ roof }) => roof.map(project))),
    blackHandleBases: handleBases.map((base) => base.map(project)),
    tanHandleBars: handleBars.map((bar) => bar.map(project)),
  };
}

export type ParalletteSpriteGeometry = { barFaces: StationPoint[][]; supportFaces: StationPoint[][]; barEndFaces: StationPoint[][] };

/** One hard-edged wooden mini-parallel bar with two angled supports. */
export function paralletteSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = PARALLETTE_SIZE): ParalletteSpriteGeometry {
  const halfLength = PARALLETTE_LENGTH_INCHES / 2;
  const halfDepth = PARALLETTE_BASE_DEPTH_INCHES / 2;
  const barHalfDepth = .55;
  const barBottom = PARALLETTE_HEIGHT_INCHES - 1.15;
  const barTop = PARALLETTE_HEIGHT_INCHES;
  const barFaces: { normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { normal: [0, 0, 1], points: [[-halfLength, -barHalfDepth, barTop], [halfLength, -barHalfDepth, barTop], [halfLength, barHalfDepth, barTop], [-halfLength, barHalfDepth, barTop]] },
    { normal: [0, -1, 0], points: [[-halfLength, -barHalfDepth, barBottom], [halfLength, -barHalfDepth, barBottom], [halfLength, -barHalfDepth, barTop], [-halfLength, -barHalfDepth, barTop]] },
    { normal: [0, 1, 0], points: [[halfLength, barHalfDepth, barBottom], [-halfLength, barHalfDepth, barBottom], [-halfLength, barHalfDepth, barTop], [halfLength, barHalfDepth, barTop]] },
  ];
  const supportFaces: { normal: PanelMatPoint; points: PanelMatPoint[] }[] = [-halfLength * .72, halfLength * .72].flatMap((centerX) => {
    const halfSupportWidth = .72;
    const topY = .72;
    return [
      { normal: [0, -1, 0] as PanelMatPoint, points: [[centerX - halfSupportWidth, -halfDepth, 0], [centerX + halfSupportWidth, -halfDepth, 0], [centerX + halfSupportWidth, -topY, barBottom], [centerX - halfSupportWidth, -topY, barBottom]] as PanelMatPoint[] },
      { normal: [0, 1, 0] as PanelMatPoint, points: [[centerX - halfSupportWidth, halfDepth, 0], [centerX - halfSupportWidth, topY, barBottom], [centerX + halfSupportWidth, topY, barBottom], [centerX + halfSupportWidth, halfDepth, 0]] as PanelMatPoint[] },
    ];
  });
  const barEnds: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const x = direction * halfLength;
    const face: PanelMatPoint[] = [[x, -barHalfDepth, barBottom], [x, barHalfDepth, barBottom], [x, barHalfDepth, barTop], [x, -barHalfDepth, barTop]];
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? face.slice().reverse() : face };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    barFaces: order(barFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    supportFaces: order(supportFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    barEndFaces: order(barEnds.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

export type MiniLowBarSpriteGeometry = { railFaces: StationPoint[][]; baseFaces: StationPoint[][]; supportFaces: StationPoint[][]; railEndFaces: StationPoint[][] };

/** Pixel-built low bar with a brown 51-inch rail, two T feet, and inward-braced supports. */
export function miniLowBarSpriteGeometry(rotation: number, elevation = 0, heightInches: MiniLowBarHeightInches = MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES, frame: StationSpriteFrame = MINI_LOW_BAR_SIZE): MiniLowBarSpriteGeometry {
  const railHeight = MINI_LOW_BAR_HEIGHTS_INCHES.includes(heightInches) ? heightInches : MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES;
  const halfLength = MINI_LOW_BAR_LENGTH_INCHES / 2;
  const halfDepth = MINI_LOW_BAR_BASE_DEPTH_INCHES / 2;
  const railHalfDepth = .65;
  const railBottom = railHeight - 1.25;
  const footHeight = .75;
  const footHalfWidth = 1.2;
  const supportCenters = [-halfLength * .82, halfLength * .82];
  const railFaces: readonly PanelMatFace[] = [
    { normal: [0, 0, 1], points: [[-halfLength, -railHalfDepth, railHeight], [halfLength, -railHalfDepth, railHeight], [halfLength, railHalfDepth, railHeight], [-halfLength, railHalfDepth, railHeight]] },
    { normal: [0, -1, 0], points: [[-halfLength, -railHalfDepth, railBottom], [halfLength, -railHalfDepth, railBottom], [halfLength, -railHalfDepth, railHeight], [-halfLength, -railHalfDepth, railHeight]] },
    { normal: [0, 1, 0], points: [[halfLength, railHalfDepth, railBottom], [-halfLength, railHalfDepth, railBottom], [-halfLength, railHalfDepth, railHeight], [halfLength, railHalfDepth, railHeight]] },
  ];
  const railEndFaces: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const face: PanelMatPoint[] = [[direction * halfLength, -railHalfDepth, railBottom], [direction * halfLength, railHalfDepth, railBottom], [direction * halfLength, railHalfDepth, railHeight], [direction * halfLength, -railHalfDepth, railHeight]];
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? face.slice().reverse() : face };
  });
  const baseFaces: PanelMatFace[] = supportCenters.flatMap((centerX) => [
    { normal: [0, 0, 1] as PanelMatPoint, points: [[centerX - footHalfWidth, -halfDepth, footHeight], [centerX + footHalfWidth, -halfDepth, footHeight], [centerX + footHalfWidth, halfDepth, footHeight], [centerX - footHalfWidth, halfDepth, footHeight]] as PanelMatPoint[] },
    { normal: [0, -1, 0] as PanelMatPoint, points: [[centerX - footHalfWidth, -halfDepth, 0], [centerX + footHalfWidth, -halfDepth, 0], [centerX + footHalfWidth, -halfDepth, footHeight], [centerX - footHalfWidth, -halfDepth, footHeight]] as PanelMatPoint[] },
    { normal: [0, 1, 0] as PanelMatPoint, points: [[centerX + footHalfWidth, halfDepth, 0], [centerX - footHalfWidth, halfDepth, 0], [centerX - footHalfWidth, halfDepth, footHeight], [centerX + footHalfWidth, halfDepth, footHeight]] as PanelMatPoint[] },
  ]);
  const supportFaces: PanelMatFace[] = supportCenters.flatMap((centerX) => {
    const halfWidth = .7;
    return [
      { normal: [0, -1, 0] as PanelMatPoint, points: [[centerX - halfWidth, -halfDepth * .48, footHeight], [centerX + halfWidth, -halfDepth * .48, footHeight], [centerX + halfWidth, -railHalfDepth, railBottom], [centerX - halfWidth, -railHalfDepth, railBottom]] as PanelMatPoint[] },
      { normal: [0, 1, 0] as PanelMatPoint, points: [[centerX + halfWidth, halfDepth * .48, footHeight], [centerX - halfWidth, halfDepth * .48, footHeight], [centerX - halfWidth, railHalfDepth, railBottom], [centerX + halfWidth, railHalfDepth, railBottom]] as PanelMatPoint[] },
    ];
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return { railFaces: order(railFaces), baseFaces: order(baseFaces), supportFaces: order(supportFaces), railEndFaces: order(railEndFaces) };
}

export type AdvancedMiniBarSpriteGeometry = { tanRailFaces: StationPoint[][]; tanRailEnds: StationPoint[][]; orangeBaseFaces: StationPoint[][]; orangePostFaces: StationPoint[][]; silverSupportFaces: StationPoint[][]; greenMountFaces: StationPoint[][]; blackKnobs: StationPoint[][] };

/** Taller freestanding AAI-style Mini Bar with orange bases, silver adjustable uprights, green rail mounts, and a tan rail. */
export function advancedMiniBarSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = ADVANCED_MINI_BAR_SIZE): AdvancedMiniBarSpriteGeometry {
  const halfLength = ADVANCED_MINI_BAR_LENGTH_INCHES / 2;
  const halfDepth = ADVANCED_MINI_BAR_BASE_DEPTH_INCHES / 2;
  const railRadius = ADVANCED_MINI_BAR_RAIL_DIAMETER_INCHES / 2;
  const railCenterZ = ADVANCED_MINI_BAR_HEIGHT_INCHES - railRadius;
  const supportCenters = [-halfLength * .86, halfLength * .86];
  const shiftFace = (face: PanelMatFace, xOffset: number, yOffset: number, zOffset = 0): PanelMatFace => ({
    normal: face.normal,
    points: face.points.map(([x, y, z]) => [x + xOffset, y + yOffset, z + zOffset] as PanelMatPoint),
  });
  const cuboidAt = (x: number, y: number, z: number, width: number, depth: number, height: number) => {
    const faces = cuboidFaces(width / 2, depth / 2, height);
    return { top: shiftFace(faces.top, x, y, z), sides: faces.sides.map((face) => shiftFace(face, x, y, z)) };
  };
  const railRing: readonly [number, number][] = Array.from({ length: ADVANCED_MINI_BAR_RAIL_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / ADVANCED_MINI_BAR_RAIL_SEGMENTS;
    return [railRadius * Math.cos(angle), railCenterZ + railRadius * Math.sin(angle)] as const;
  });
  const railFaces: readonly PanelMatFace[] = railRing.slice(0, -1).map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = railRing[index + 1];
    return { normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - railCenterZ] as PanelMatPoint, points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[] };
  });
  const railEnds: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = railRing.slice(0, -1).map(([y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const feet = supportCenters.map((x) => cuboidAt(x, 0, 0, 4, ADVANCED_MINI_BAR_BASE_DEPTH_INCHES, 1));
  const orangePosts = supportCenters.map((x) => cuboidAt(x, 0, 1, 2.4, 2.4, 22));
  const silverSupports = supportCenters.map((x) => cuboidAt(x, 0, 22, 1.65, 1.65, 19));
  const greenMounts = supportCenters.map((x) => cuboidAt(x, 0, 40.5, 3.2, 2.8, 3));
  const blackKnobs = supportCenters.map((x) => cuboidAt(x, -2.1, 20, 2.5, 1.5, 2.5));
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  const cuboidSurfaces = (pieces: readonly { top: PanelMatFace; sides: readonly PanelMatFace[] }[]) => order(pieces.flatMap(({ top, sides }) => [top, ...visibleCuboidSides(rotation, sides)]));
  return {
    tanRailFaces: order(railFaces),
    tanRailEnds: order(railEnds),
    orangeBaseFaces: cuboidSurfaces(feet),
    orangePostFaces: cuboidSurfaces(orangePosts),
    silverSupportFaces: cuboidSurfaces(silverSupports),
    greenMountFaces: cuboidSurfaces(greenMounts),
    blackKnobs: cuboidSurfaces(blackKnobs),
  };
}

export type RecMiniBarSpriteGeometry = { tanRailFaces: StationPoint[][]; tanRailEnds: StationPoint[][]; blueBaseFaces: StationPoint[][]; bluePostFaces: StationPoint[][]; silverUpperFaces: StationPoint[][]; blackElbowFaces: StationPoint[][]; blackKnobs: StationPoint[][] };

/** Rec Mini Bar with a tan rail, blue uprights/T feet, dark elbow connectors, and no decorative tie. */
export function recMiniBarSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = REC_MINI_BAR_SIZE): RecMiniBarSpriteGeometry {
  const halfLength = REC_MINI_BAR_LENGTH_INCHES / 2;
  const railRadius = REC_MINI_BAR_RAIL_DIAMETER_INCHES / 2;
  const railCenterZ = REC_MINI_BAR_HEIGHT_INCHES - railRadius;
  const supportCenters = [-halfLength * .86, halfLength * .86];
  const shiftFace = (face: PanelMatFace, xOffset: number, yOffset: number, zOffset = 0): PanelMatFace => ({
    normal: face.normal,
    points: face.points.map(([x, y, z]) => [x + xOffset, y + yOffset, z + zOffset] as PanelMatPoint),
  });
  const cuboidAt = (x: number, y: number, z: number, width: number, depth: number, height: number) => {
    const faces = cuboidFaces(width / 2, depth / 2, height);
    return { top: shiftFace(faces.top, x, y, z), sides: faces.sides.map((face) => shiftFace(face, x, y, z)) };
  };
  const railRing: readonly [number, number][] = Array.from({ length: REC_MINI_BAR_RAIL_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / REC_MINI_BAR_RAIL_SEGMENTS;
    return [railRadius * Math.cos(angle), railCenterZ + railRadius * Math.sin(angle)] as const;
  });
  const railFaces: readonly PanelMatFace[] = railRing.slice(0, -1).map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = railRing[index + 1];
    return { normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - railCenterZ] as PanelMatPoint, points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[] };
  });
  const railEnds: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = railRing.slice(0, -1).map(([y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const blueFeet = supportCenters.map((x) => cuboidAt(x, 0, 0, 4, REC_MINI_BAR_BASE_DEPTH_INCHES, 1));
  const bluePosts = supportCenters.map((x) => cuboidAt(x, 0, 1, 2.3, 2.3, 29));
  const silverUppers = supportCenters.map((x) => cuboidAt(x, 0, 30, 1.75, 1.75, 6));
  const blackElbows = supportCenters.map((x) => cuboidAt(x, 0, 35, 3.4, 2.7, 3.25));
  const blackKnobs = supportCenters.map((x) => cuboidAt(x, -2.05, 22, 2.5, 1.5, 2.5));
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  const cuboidSurfaces = (pieces: readonly { top: PanelMatFace; sides: readonly PanelMatFace[] }[]) => order(pieces.flatMap(({ top, sides }) => [top, ...visibleCuboidSides(rotation, sides)]));
  return {
    tanRailFaces: order(railFaces),
    tanRailEnds: order(railEnds),
    blueBaseFaces: cuboidSurfaces(blueFeet),
    bluePostFaces: cuboidSurfaces(bluePosts),
    silverUpperFaces: cuboidSurfaces(silverUppers),
    blackElbowFaces: cuboidSurfaces(blackElbows),
    blackKnobs: cuboidSurfaces(blackKnobs),
  };
}

export type TrafficConeSpriteGeometry = { orangeBaseFaces: StationPoint[][]; orangeConeFaces: StationPoint[][]; orangeTip: StationPoint[] };

/** A hard-edged seven-inch orange traffic cone with a flat square footing. */
export function trafficConeSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = TRAFFIC_CONE_SIZE): TrafficConeSpriteGeometry {
  const base = cuboidFaces(TRAFFIC_CONE_BASE_SIZE_INCHES / 2, TRAFFIC_CONE_BASE_SIZE_INCHES / 2, TRAFFIC_CONE_BASE_HEIGHT_INCHES);
  const baseRadius = TRAFFIC_CONE_BASE_SIZE_INCHES * .36;
  const topRadius = TRAFFIC_CONE_TOP_DIAMETER_INCHES / 2;
  const ring = (radius: number, z: number) => Array.from({ length: TRAFFIC_CONE_SEGMENTS }, (_, index) => {
    const angle = Math.PI * 2 * index / TRAFFIC_CONE_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle), z] as PanelMatPoint;
  });
  const bottom = ring(baseRadius, TRAFFIC_CONE_BASE_HEIGHT_INCHES);
  const top = ring(topRadius, TRAFFIC_CONE_HEIGHT_INCHES);
  const coneFaces: readonly PanelMatFace[] = bottom.map((point, index) => {
    const next = bottom[(index + 1) % bottom.length]; const topPoint = top[index]; const nextTop = top[(index + 1) % top.length];
    return { normal: [point[0] + next[0], point[1] + next[1], 1] as PanelMatPoint, points: [point, next, nextTop, topPoint] };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return { orangeBaseFaces: order([base.top, ...visibleCuboidSides(rotation, base.sides)]), orangeConeFaces: order(coneFaces), orangeTip: top.map(project) };
}

export type TargetMarkerSpriteGeometry = { yellowTop: StationPoint[]; yellowSides: StationPoint[][]; redTarget: StationPoint[] };

/** A thin, circular nine-inch yellow target marker with a centered red bullseye. */
export function targetMarkerSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = TARGET_MARKER_SIZE): TargetMarkerSpriteGeometry {
  const ring = (radius: number, z: number) => Array.from({ length: TARGET_MARKER_SEGMENTS }, (_, index) => {
    const angle = Math.PI * 2 * index / TARGET_MARKER_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle), z] as PanelMatPoint;
  });
  const outerBottom = ring(TARGET_MARKER_RADIUS_INCHES, 0);
  const outerTop = ring(TARGET_MARKER_RADIUS_INCHES, TARGET_MARKER_HEIGHT_INCHES);
  const sideFaces: readonly PanelMatFace[] = outerBottom.map((point, index) => {
    const next = outerBottom[(index + 1) % outerBottom.length]; const topPoint = outerTop[index]; const nextTop = outerTop[(index + 1) % outerTop.length];
    return { normal: [point[0] + next[0], point[1] + next[1], 0] as PanelMatPoint, points: [point, next, nextTop, topPoint] };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  return {
    yellowTop: outerTop.map(project),
    yellowSides: sideFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project)),
    redTarget: ring(TARGET_MARKER_RADIUS_INCHES * TARGET_MARKER_RED_TARGET_RATIO, TARGET_MARKER_HEIGHT_INCHES + .01).map(project),
  };
}

export type BeanbagSpriteGeometry = { center: StationPoint[]; slopes: StationPoint[][] };

/** A small square beanbag with a half-inch padded center that tapers to a zero-height edge. */
export function beanbagSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = BEANBAG_SIZE): BeanbagSpriteGeometry {
  const half = BEANBAG_SQUARE_SIZE_INCHES / 2;
  const centerHalf = BEANBAG_CENTER_SQUARE_SIZE_INCHES / 2;
  const top = [
    [-centerHalf, -centerHalf, BEANBAG_CENTER_THICKNESS_INCHES], [centerHalf, -centerHalf, BEANBAG_CENTER_THICKNESS_INCHES],
    [centerHalf, centerHalf, BEANBAG_CENTER_THICKNESS_INCHES], [-centerHalf, centerHalf, BEANBAG_CENTER_THICKNESS_INCHES],
  ] as PanelMatPoint[];
  const corners = [[-half, -half, 0], [half, -half, 0], [half, half, 0], [-half, half, 0]] as PanelMatPoint[];
  const slopes = corners.map((corner, index) => {
    const nextCorner = corners[(index + 1) % corners.length]; const nextTop = top[(index + 1) % top.length]; const topPoint = top[index];
    return [corner, nextCorner, nextTop, topPoint] as PanelMatPoint[];
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  return { center: top.map(project), slopes: slopes.map((slope) => slope.map(project)) };
}

export type RainbowMatSpriteGeometry = { blueOuterFaces: StationPoint[][]; cyanEndFaces: StationPoint[][]; yellowEndFaces: StationPoint[][]; redInnerFaces: StationPoint[][] };

/** A pixel-faceted half-annulus: dark blue outer arch, red tunnel, and cyan/yellow opposing ends. */
export function rainbowMatSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = RAINBOW_MAT_SIZE): RainbowMatSpriteGeometry {
  const halfDepth = RAINBOW_MAT_DEPTH_INCHES / 2;
  const arch = (radius: number) => Array.from({ length: RAINBOW_MAT_ARCH_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * index / RAINBOW_MAT_ARCH_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle)] as const;
  });
  const outerArc = arch(RAINBOW_MAT_RADIUS_INCHES);
  const innerArc = arch(RAINBOW_MAT_CUTOUT_RADIUS_INCHES);
  const outerFaces: readonly PanelMatFace[] = outerArc.slice(0, -1).map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = outerArc[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2] as PanelMatPoint,
      points: [[-halfDepth, firstY, firstZ], [halfDepth, firstY, firstZ], [halfDepth, secondY, secondZ], [-halfDepth, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const innerFaces: readonly PanelMatFace[] = innerArc.slice(0, -1).map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = innerArc[index + 1];
    return {
      normal: [0, -(firstY + secondY) / 2, -(firstZ + secondZ) / 2] as PanelMatPoint,
      points: [[halfDepth, firstY, firstZ], [-halfDepth, firstY, firstZ], [-halfDepth, secondY, secondZ], [halfDepth, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const endFaces = (direction: -1 | 1): readonly PanelMatFace[] => outerArc.slice(0, -1).map(([outerFirstY, outerFirstZ], index) => {
    const [outerSecondY, outerSecondZ] = outerArc[index + 1];
    const [innerFirstY, innerFirstZ] = innerArc[index];
    const [innerSecondY, innerSecondZ] = innerArc[index + 1];
    const points: PanelMatPoint[] = [[direction * halfDepth, outerFirstY, outerFirstZ], [direction * halfDepth, outerSecondY, outerSecondZ], [direction * halfDepth, innerSecondY, innerSecondZ], [direction * halfDepth, innerFirstY, innerFirstZ]];
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction > 0 ? points : points.slice().reverse() };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return { blueOuterFaces: order(outerFaces), cyanEndFaces: order(endFaces(1)), yellowEndFaces: order(endFaces(-1)), redInnerFaces: order(innerFaces) };
}

export type PacManSpriteGeometry = { redCurvedSides: StationPoint[][]; redCutoutSides: StationPoint[][]; yellowTop: StationPoint[] };

/**
 * The Pac-Man Block is a faceted upright 270-degree cylinder. Its open quarter
 * remains truly absent from both the visible geometry and the floor collision
 * footprint, rather than being approximated by a rectangular hitbox.
 */
export function pacManSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = PAC_MAN_SIZE): PacManSpriteGeometry {
  const startAngle = Math.PI / 4;
  const arcAngle = Math.PI * 1.5;
  const arc = Array.from({ length: PAC_MAN_CURVE_SEGMENTS + 1 }, (_, index) => {
    const angle = startAngle + arcAngle * index / PAC_MAN_CURVE_SEGMENTS;
    return [PAC_MAN_RADIUS_INCHES * Math.cos(angle), PAC_MAN_RADIUS_INCHES * Math.sin(angle)] as const;
  });
  const curvedFaces: readonly PanelMatFace[] = arc.slice(0, -1).map(([firstX, firstY], index) => {
    const [secondX, secondY] = arc[index + 1];
    return {
      normal: normalizeVector([firstX + secondX, firstY + secondY, 0]),
      points: [[firstX, firstY, 0], [secondX, secondY, 0], [secondX, secondY, PAC_MAN_HEIGHT_INCHES], [firstX, firstY, PAC_MAN_HEIGHT_INCHES]] as PanelMatPoint[],
    };
  });
  const mouthSides: readonly PanelMatFace[] = [
    {
      normal: normalizeVector([Math.SQRT1_2, -Math.SQRT1_2, 0]),
      points: [[0, 0, 0], [arc[0][0], arc[0][1], 0], [arc[0][0], arc[0][1], PAC_MAN_HEIGHT_INCHES], [0, 0, PAC_MAN_HEIGHT_INCHES]],
    },
    {
      normal: normalizeVector([Math.SQRT1_2, Math.SQRT1_2, 0]),
      points: [[arc[arc.length - 1][0], arc[arc.length - 1][1], 0], [0, 0, 0], [0, 0, PAC_MAN_HEIGHT_INCHES], [arc[arc.length - 1][0], arc[arc.length - 1][1], PAC_MAN_HEIGHT_INCHES]],
    },
  ];
  const top: PanelMatPoint[] = [[0, 0, PAC_MAN_HEIGHT_INCHES], ...arc.map(([x, y]) => [x, y, PAC_MAN_HEIGHT_INCHES] as PanelMatPoint)];
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return { redCurvedSides: order(curvedFaces), redCutoutSides: order(mouthSides), yellowTop: top.map(project) };
}

export type TrapezeSpriteGeometry = { barFaces: StationPoint[][]; barEndCaps: StationPoint[][]; straps: StationPoint[][] };

/** A hard-edged hanging trapeze: faceted brown bar below two long, black strap surfaces. */
export function trapezeSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = TRAPEZE_SIZE): TrapezeSpriteGeometry {
  const halfLength = TRAPEZE_BAR_LENGTH_INCHES / 2;
  const radius = TRAPEZE_BAR_THICKNESS_INCHES / 2;
  const ring: PanelMatPoint[] = Array.from({ length: TRAPEZE_BAR_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / TRAPEZE_BAR_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle) + radius] as const;
  }).map(([y, z]) => [0, y, z] as PanelMatPoint);
  const barFaces: readonly PanelMatFace[] = ring.slice(0, -1).map(([_, firstY, firstZ], index) => {
    const [, secondY, secondZ] = ring[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - radius] as PanelMatPoint,
      points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const barEndCaps: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = ring.slice(0, -1).map(([, y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const strapFaces: PanelMatPoint[][] = [-halfLength * .82, halfLength * .82].map((centerX) => [
    [centerX - .42, .24, TRAPEZE_BAR_THICKNESS_INCHES], [centerX + .42, .24, TRAPEZE_BAR_THICKNESS_INCHES],
    [centerX + .42, .24, TRAPEZE_BAR_THICKNESS_INCHES + TRAPEZE_STRAP_LENGTH_INCHES], [centerX - .42, .24, TRAPEZE_BAR_THICKNESS_INCHES + TRAPEZE_STRAP_LENGTH_INCHES],
  ] as PanelMatPoint[]);
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: readonly PanelMatFace[]) => faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project))
    .sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return { barFaces: order(barFaces), barEndCaps: order(barEndCaps), straps: strapFaces.map((face) => face.map(project)) };
}

export type PvcPipeSpriteGeometry = { lateralFaces: StationPoint[][]; endCaps: StationPoint[][] };

/** A deliberately faceted, white one-inch PVC cylinder so it reads as a real pipe rather than a flat line. */
export function pvcPipeSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = PVC_PIPE_SIZE): PvcPipeSpriteGeometry {
  const halfLength = PVC_PIPE_LENGTH_INCHES / 2;
  const ring: PanelMatPoint[] = Array.from({ length: PVC_PIPE_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / PVC_PIPE_SEGMENTS;
    return [PVC_PIPE_RADIUS_INCHES * Math.cos(angle), PVC_PIPE_RADIUS_INCHES * Math.sin(angle) + PVC_PIPE_RADIUS_INCHES, 0] as PanelMatPoint;
  }).map(([y, z]) => [0, y, z] as PanelMatPoint);
  const lateralFaces: readonly PanelMatFace[] = ring.slice(0, -1).map(([_, firstY, firstZ], index) => {
    const [, secondY, secondZ] = ring[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - PVC_PIPE_RADIUS_INCHES] as PanelMatPoint,
      points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const endCaps: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = ring.slice(0, -1).map(([, y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    lateralFaces: order(lateralFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    endCaps: order(endCaps.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

export type SmallBarPadSpriteGeometry = { lateralFaces: StationPoint[][]; endCaps: StationPoint[][] };

/** A short, six-facet red padded cylinder, matching the Small Bar Pad's real 9-inch by 2-inch profile. */
export function smallBarPadSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = SMALL_BAR_PAD_SIZE): SmallBarPadSpriteGeometry {
  const halfLength = SMALL_BAR_PAD_LENGTH_INCHES / 2;
  const ring: PanelMatPoint[] = Array.from({ length: SMALL_BAR_PAD_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / SMALL_BAR_PAD_SEGMENTS;
    return [SMALL_BAR_PAD_RADIUS_INCHES * Math.cos(angle), SMALL_BAR_PAD_RADIUS_INCHES * Math.sin(angle) + SMALL_BAR_PAD_RADIUS_INCHES, 0] as PanelMatPoint;
  }).map(([y, z]) => [0, y, z] as PanelMatPoint);
  const lateralFaces: readonly PanelMatFace[] = ring.slice(0, -1).map(([_, firstY, firstZ], index) => {
    const [, secondY, secondZ] = ring[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - SMALL_BAR_PAD_RADIUS_INCHES] as PanelMatPoint,
      points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const endCaps: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = ring.slice(0, -1).map(([, y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    lateralFaces: order(lateralFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    endCaps: order(endCaps.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

export type RollingBarSpriteGeometry = { redBarFaces: StationPoint[][]; blueWheelFaces: StationPoint[][]; blueWheelEnds: StationPoint[][] };

/** A red axle fixed between two blue eight-sided rolling wheels. */
export function rollingBarSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = ROLLING_BAR_SIZE): RollingBarSpriteGeometry {
  const wheelRadius = ROLLING_BAR_WHEEL_DIAMETER_INCHES / 2;
  const axleRadius = ROLLING_BAR_AXLE_RADIUS_INCHES;
  const wheelCenterZ = wheelRadius;
  const corner = Math.SQRT1_2;
  const wheelRing: readonly [number, number][] = [[-corner * wheelRadius, 0], [corner * wheelRadius, 0], [wheelRadius, wheelRadius * (1 - corner)], [wheelRadius, wheelRadius * (1 + corner)], [corner * wheelRadius, wheelRadius * 2], [-corner * wheelRadius, wheelRadius * 2], [-wheelRadius, wheelRadius * (1 + corner)], [-wheelRadius, wheelRadius * (1 - corner)]];
  const totalHalfLength = ROLLING_BAR_TOTAL_LENGTH_INCHES / 2;
  const wheelFaces: PanelMatFace[] = [-1, 1].flatMap((direction) => {
    const outerX = direction * totalHalfLength;
    const innerX = direction * (totalHalfLength - ROLLING_BAR_WHEEL_THICKNESS_INCHES);
    return wheelRing.map(([firstY, firstZ], index) => {
      const [secondY, secondZ] = wheelRing[(index + 1) % wheelRing.length];
      return { normal: [0, firstY + secondY, firstZ + secondZ - wheelCenterZ * 2] as PanelMatPoint, points: [[outerX, firstY, firstZ], [innerX, firstY, firstZ], [innerX, secondY, secondZ], [outerX, secondY, secondZ]] as PanelMatPoint[] };
    });
  });
  const wheelEnds: PanelMatFace[] = [-1, 1].map((direction) => {
    const outerX = direction * totalHalfLength;
    const points = wheelRing.map(([y, z]) => [outerX, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const axleRing: readonly [number, number][] = Array.from({ length: ROLLING_BAR_WHEEL_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / ROLLING_BAR_WHEEL_SEGMENTS;
    return [axleRadius * Math.cos(angle), wheelCenterZ + axleRadius * Math.sin(angle)] as const;
  });
  const axleFaces: PanelMatFace[] = axleRing.slice(0, -1).map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = axleRing[index + 1];
    return { normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - wheelCenterZ] as PanelMatPoint, points: [[-ROLLING_BAR_AXLE_LENGTH_INCHES / 2, firstY, firstZ], [ROLLING_BAR_AXLE_LENGTH_INCHES / 2, firstY, firstZ], [ROLLING_BAR_AXLE_LENGTH_INCHES / 2, secondY, secondZ], [-ROLLING_BAR_AXLE_LENGTH_INCHES / 2, secondY, secondZ]] as PanelMatPoint[] };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    redBarFaces: order(axleFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    blueWheelFaces: order(wheelFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    blueWheelEnds: order(wheelEnds.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

export type WoodenClimbingLadderSpriteGeometry = { railTops: StationPoint[][]; railSides: StationPoint[][]; rungTops: StationPoint[][]; rungSides: StationPoint[][] };

function woodenClimbingLadderRungCenters(): number[] {
  const rungInset = 5;
  const spacing = (WOODEN_CLIMBING_LADDER_LENGTH_INCHES - rungInset * 2) / (WOODEN_CLIMBING_LADDER_RUNG_COUNT - 1);
  return Array.from({ length: WOODEN_CLIMBING_LADDER_RUNG_COUNT }, (_, index) => -WOODEN_CLIMBING_LADDER_LENGTH_INCHES / 2 + rungInset + index * spacing);
}

/** Two light-wood rails and eight open rungs, kept separate so the sprite remains a real ladder instead of a filled board. */
export function woodenClimbingLadderSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = WOODEN_CLIMBING_LADDER_SIZE): WoodenClimbingLadderSpriteGeometry {
  const halfWidth = WOODEN_CLIMBING_LADDER_WIDTH_INCHES / 2;
  const railCenter = halfWidth - WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES / 2;
  const innerWidth = WOODEN_CLIMBING_LADDER_WIDTH_INCHES - WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES * 2;
  const shiftFace = (face: PanelMatFace, xOffset: number, yOffset: number): PanelMatFace => ({
    normal: face.normal,
    points: face.points.map(([x, y, z]) => [x + xOffset, y + yOffset, z] as PanelMatPoint),
  });
  const makePiece = (x: number, y: number, width: number, depth: number, height: number) => {
    const faces = cuboidFaces(width / 2, depth / 2, height);
    return { top: shiftFace(faces.top, x, y), sides: faces.sides.map((face) => shiftFace(face, x, y)) };
  };
  const rails = [-1, 1].map((side) => makePiece(0, side * railCenter, WOODEN_CLIMBING_LADDER_LENGTH_INCHES, WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES, WOODEN_CLIMBING_LADDER_THICKNESS_INCHES));
  const rungs = woodenClimbingLadderRungCenters().map((x) => makePiece(x, 0, WOODEN_CLIMBING_LADDER_RUNG_WIDTH_INCHES, innerWidth, WOODEN_CLIMBING_LADDER_RUNG_THICKNESS_INCHES));
  const { project } = panelMatProjection(rotation, elevation, frame);
  return {
    railTops: rails.map(({ top }) => top.points.map(project)),
    railSides: rails.flatMap(({ sides }) => visibleCuboidSides(rotation, sides).map((face) => face.points.map(project))),
    rungTops: rungs.map(({ top }) => top.points.map(project)),
    rungSides: rungs.flatMap(({ sides }) => visibleCuboidSides(rotation, sides).map((face) => face.points.map(project))),
  };
}

export type BoseBallSpriteGeometry = { rimTopFaces: StationPoint[][]; rimSideFaces: StationPoint[][]; domeFaces: StationPoint[][]; gripRibs: StationPoint[][] };

/** A hard-edged dark-gray hemispherical balance bowl with a thick floor rim and textured grip ribs. */
export function boseBallSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = BOSE_BALL_SIZE): BoseBallSpriteGeometry {
  const ring = (radius: number, height: number): PanelMatPoint[] => Array.from({ length: BOSE_BALL_SEGMENTS }, (_, index) => {
    const angle = Math.PI * 2 * index / BOSE_BALL_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle), height] as PanelMatPoint;
  });
  const rimHeight = .6;
  const outerRadius = BOSE_BALL_RADIUS_INCHES * 1.06;
  const domeHeights = [rimHeight, BOSE_BALL_RADIUS_INCHES * .38, BOSE_BALL_RADIUS_INCHES * .65, BOSE_BALL_RADIUS_INCHES * .86, BOSE_BALL_HEIGHT_INCHES];
  const domeRings = domeHeights.map((height) => ring(Math.sqrt(Math.max(0, BOSE_BALL_RADIUS_INCHES ** 2 - height ** 2)), height));
  const rimBottom = ring(outerRadius, 0);
  const rimTop = ring(outerRadius, rimHeight);
  const rimTopFaces: readonly PanelMatFace[] = rimTop.map((point, index) => {
    const next = rimTop[(index + 1) % BOSE_BALL_SEGMENTS]; const inside = domeRings[0][index]; const nextInside = domeRings[0][(index + 1) % BOSE_BALL_SEGMENTS];
    return { normal: [0, 0, 1] as PanelMatPoint, points: [point, next, nextInside, inside] };
  });
  const rimSideFaces: readonly PanelMatFace[] = rimBottom.map((point, index) => {
    const next = rimBottom[(index + 1) % BOSE_BALL_SEGMENTS]; const nextTop = rimTop[(index + 1) % BOSE_BALL_SEGMENTS]; const top = rimTop[index];
    return { normal: [point[0] + next[0], point[1] + next[1], 0] as PanelMatPoint, points: [point, next, nextTop, top] };
  });
  const domeFaces: readonly PanelMatFace[] = domeRings.slice(0, -1).flatMap((lowerRing, layer) => lowerRing.map((point, index) => {
    const next = lowerRing[(index + 1) % BOSE_BALL_SEGMENTS]; const upperRing = domeRings[layer + 1]; const upper = upperRing[index]; const nextUpper = upperRing[(index + 1) % BOSE_BALL_SEGMENTS];
    return {
      normal: [(point[0] + next[0] + upper[0] + nextUpper[0]) / 4, (point[1] + next[1] + upper[1] + nextUpper[1]) / 4, (point[2] + next[2] + upper[2] + nextUpper[2]) / 4] as PanelMatPoint,
      points: [point, next, nextUpper, upper],
    };
  }));
  const gripRibs = [-.72, -.05, .62, 1.29].map((angle) => domeRings.map((ringPoints) => {
    const radius = Math.hypot(ringPoints[0][0], ringPoints[0][1]); const height = ringPoints[0][2];
    return [radius * Math.cos(angle), radius * Math.sin(angle), height + .06] as PanelMatPoint;
  }));
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    rimTopFaces: order(rimTopFaces.map((face) => face.points.map(project))),
    rimSideFaces: order(rimSideFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    domeFaces: order(domeFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    gripRibs: gripRibs.map((rib) => rib.map(project)),
  };
}

export type YogaBallSpriteGeometry = { facets: StationPoint[][] };

/** A full, deliberately faceted 20-inch exercise sphere resting directly on the floor. */
export function yogaBallSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = YOGA_BALL_SIZE): YogaBallSpriteGeometry {
  const ring = (height: number): PanelMatPoint[] => {
    const radius = Math.sqrt(Math.max(0, YOGA_BALL_RADIUS_INCHES ** 2 - (height - YOGA_BALL_RADIUS_INCHES) ** 2));
    return Array.from({ length: YOGA_BALL_SEGMENTS }, (_, index) => {
      const angle = Math.PI * 2 * index / YOGA_BALL_SEGMENTS;
      return [radius * Math.cos(angle), radius * Math.sin(angle), height] as PanelMatPoint;
    });
  };
  const rings = [YOGA_BALL_DIAMETER_INCHES * .16, YOGA_BALL_DIAMETER_INCHES * .39, YOGA_BALL_DIAMETER_INCHES * .61, YOGA_BALL_DIAMETER_INCHES * .84].map(ring);
  const bottom: PanelMatPoint = [0, 0, 0]; const top: PanelMatPoint = [0, 0, YOGA_BALL_DIAMETER_INCHES];
  const faces: PanelMatFace[] = [
    ...rings[0].map((point, index) => ({ normal: [point[0], point[1], point[2] - YOGA_BALL_RADIUS_INCHES] as PanelMatPoint, points: [bottom, rings[0][(index + 1) % YOGA_BALL_SEGMENTS], point] })),
    ...rings.slice(0, -1).flatMap((lower, layer) => lower.map((point, index) => {
      const next = lower[(index + 1) % YOGA_BALL_SEGMENTS]; const upper = rings[layer + 1][index]; const nextUpper = rings[layer + 1][(index + 1) % YOGA_BALL_SEGMENTS];
      return { normal: [(point[0] + next[0] + upper[0] + nextUpper[0]) / 4, (point[1] + next[1] + upper[1] + nextUpper[1]) / 4, (point[2] + next[2] + upper[2] + nextUpper[2]) / 4 - YOGA_BALL_RADIUS_INCHES] as PanelMatPoint, points: [point, next, nextUpper, upper] };
    })),
    ...rings.at(-1)!.map((point, index) => ({ normal: [point[0], point[1], point[2] - YOGA_BALL_RADIUS_INCHES] as PanelMatPoint, points: [point, rings.at(-1)![(index + 1) % YOGA_BALL_SEGMENTS], top] })),
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  const facets = faces
    .filter((face) => cheeseFaceVisible(face.normal, rotation))
    .map((face) => face.points.map(project));
  return { facets: facets.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length) };
}

export type VaultTrainerSpriteGeometry = { blueFaces: StationPoint[][]; tanTopFaces: StationPoint[][]; blackHandles: StationPoint[][] };

/** A hard-edged Vault Trainer: a blue rectangular body with a single 15-inch faceted rounded top edge. */
export function vaultTrainerSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = VAULT_TRAINER_SIZE): VaultTrainerSpriteGeometry {
  const halfLength = VAULT_TRAINER_LENGTH_INCHES / 2;
  const halfDepth = VAULT_TRAINER_DEPTH_INCHES / 2;
  const height = VAULT_TRAINER_HEIGHT_INCHES;
  const radius = VAULT_TRAINER_ROUND_EDGE_RADIUS_INCHES;
  const roundedBaseHeight = height - radius;
  const curveStart = halfDepth - radius;
  const roundEdge = Array.from({ length: VAULT_TRAINER_ROUND_EDGE_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI / 2 * index / VAULT_TRAINER_ROUND_EDGE_SEGMENTS;
    return [curveStart + radius * Math.sin(angle), roundedBaseHeight + radius * Math.cos(angle)] as const;
  });
  const blueFaces: readonly PanelMatFace[] = [
    { normal: [0, 0, -1], points: [[-halfLength, -halfDepth, 0], [halfLength, -halfDepth, 0], [halfLength, halfDepth, 0], [-halfLength, halfDepth, 0]] },
    { normal: [0, -1, 0], points: [[-halfLength, -halfDepth, 0], [halfLength, -halfDepth, 0], [halfLength, -halfDepth, height], [-halfLength, -halfDepth, height]] },
    { normal: [0, 1, 0], points: [[halfLength, halfDepth, 0], [-halfLength, halfDepth, 0], [-halfLength, halfDepth, roundedBaseHeight], [halfLength, halfDepth, roundedBaseHeight]] },
    ...[-1, 1].map((direction) => {
      const x = direction * halfLength;
      const profile = [[-halfDepth, 0], [halfDepth, 0], [halfDepth, roundedBaseHeight], ...roundEdge.slice(0, -1).reverse(), [-halfDepth, height]] as const;
      const points = profile.map(([y, z]) => [x, y, z] as PanelMatPoint);
      return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
    }),
  ];
  const tanTopFaces: readonly PanelMatFace[] = [
    { normal: [0, 0, 1], points: [[-halfLength, -halfDepth, height], [halfLength, -halfDepth, height], [halfLength, curveStart, height], [-halfLength, curveStart, height]] },
    ...roundEdge.slice(0, -1).map(([firstY, firstZ], index) => {
      const [secondY, secondZ] = roundEdge[index + 1];
      return {
        normal: [0, (firstY + secondY) / 2 - curveStart, (firstZ + secondZ) / 2 - roundedBaseHeight] as PanelMatPoint,
        points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
      };
    }),
  ];
  const blackHandles: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const x = direction * (halfLength + .02);
    const points: PanelMatPoint[] = [[x, -5, height * .48], [x, 5, height * .48], [x, 5, height * .58], [x, -5, height * .58]];
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    blueFaces: order(blueFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    tanTopFaces: order(tanTopFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    blackHandles: order(blackHandles.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

export type FoamRollerSpriteGeometry = { sideFaces: StationPoint[][]; endCaps: StationPoint[][] };

/** A hard-edged floor cylinder: gray foam sides with colored circular ends. */
export function foamRollerSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = FOAM_ROLLER_SIZE): FoamRollerSpriteGeometry {
  const halfLength = FOAM_ROLLER_LENGTH_INCHES / 2;
  const ring: PanelMatPoint[] = Array.from({ length: FOAM_ROLLER_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / FOAM_ROLLER_SEGMENTS;
    return [0, FOAM_ROLLER_RADIUS_INCHES * Math.cos(angle), FOAM_ROLLER_RADIUS_INCHES * Math.sin(angle) + FOAM_ROLLER_RADIUS_INCHES] as PanelMatPoint;
  });
  const sideFaces: readonly PanelMatFace[] = ring.slice(0, -1).map(([_, firstY, firstZ], index) => {
    const [, secondY, secondZ] = ring[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - FOAM_ROLLER_RADIUS_INCHES] as PanelMatPoint,
      points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const endCaps: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = ring.slice(0, -1).map(([, y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    sideFaces: order(sideFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    endCaps: order(endCaps.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

export type BigBoulderSpriteGeometry = { redCurvedFaces: StationPoint[][]; yellowFlatFaces: StationPoint[][] };

type BoulderDimensions = { length: number; diameter: number; height: number; sideHeight: number; curveSegments: number };

/** Pixel-segmented 2.5D geometry for a flat-bottomed, upright-sided Boulder handspring trainer. */
function boulderSpriteGeometry({ length, diameter, height, sideHeight, curveSegments }: BoulderDimensions, rotation: number, elevation: number, frame: StationSpriteFrame): BigBoulderSpriteGeometry {
  const halfLength = length / 2;
  const halfDepth = diameter / 2;
  const arch = Array.from({ length: curveSegments + 1 }, (_, index) => {
    const angle = Math.PI * index / curveSegments;
    return [halfDepth * Math.cos(angle), sideHeight + (height - sideHeight) * Math.sin(angle)] as const;
  });
  const outerFaces: { normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { normal: [0, 0, -1], points: [[-halfLength, -halfDepth, 0], [halfLength, -halfDepth, 0], [halfLength, halfDepth, 0], [-halfLength, halfDepth, 0]] },
    { normal: [0, -1, 0], points: [[-halfLength, -halfDepth, 0], [halfLength, -halfDepth, 0], [halfLength, -halfDepth, sideHeight], [-halfLength, -halfDepth, sideHeight]] },
    { normal: [0, 1, 0], points: [[halfLength, halfDepth, 0], [-halfLength, halfDepth, 0], [-halfLength, halfDepth, sideHeight], [halfLength, halfDepth, sideHeight]] },
    ...arch.slice(0, -1).map(([firstY, firstZ], index) => {
      const [secondY, secondZ] = arch[index + 1];
      return {
        normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - sideHeight] as PanelMatPoint,
        points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
      };
    }),
  ];
  const endProfile: PanelMatPoint[] = [[-halfDepth, 0], [halfDepth, 0], [halfDepth, sideHeight], ...arch.slice(1), [-halfDepth, 0]].map(([y, z]) => [halfLength, y, z] as PanelMatPoint);
  const yellowEnds: readonly PanelMatFace[] = [
    { normal: [1, 0, 0], points: endProfile },
    { normal: [-1, 0, 0], points: endProfile.slice().reverse().map(([, y, z]) => [-halfLength, y, z] as PanelMatPoint) },
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    redCurvedFaces: order(outerFaces.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
    yellowFlatFaces: order(yellowEnds.filter((face) => cheeseFaceVisible(face.normal, rotation)).map((face) => face.points.map(project))),
  };
}

/** Pixel-segmented 2.5D geometry for the Big Boulder, shaped as an arched handspring trainer. */
export function bigBoulderSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = BIG_BOULDER_SIZE): BigBoulderSpriteGeometry {
  return boulderSpriteGeometry({ length: BIG_BOULDER_LENGTH_INCHES, diameter: BIG_BOULDER_DIAMETER_INCHES, height: BIG_BOULDER_HEIGHT_INCHES, sideHeight: BIG_BOULDER_SIDE_HEIGHT_INCHES, curveSegments: BIG_BOULDER_CURVE_SEGMENTS }, rotation, elevation, frame);
}

/** Pixel-segmented 2.5D geometry for the Medium Boulder, shaped as an arched handspring trainer. */
export function mediumBoulderSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = MEDIUM_BOULDER_SIZE): BigBoulderSpriteGeometry {
  return boulderSpriteGeometry({ length: MEDIUM_BOULDER_LENGTH_INCHES, diameter: MEDIUM_BOULDER_DIAMETER_INCHES, height: MEDIUM_BOULDER_HEIGHT_INCHES, sideHeight: MEDIUM_BOULDER_SIDE_HEIGHT_INCHES, curveSegments: MEDIUM_BOULDER_CURVE_SEGMENTS }, rotation, elevation, frame);
}

/** Pixel-segmented 2.5D geometry for the Small Boulder, shaped as an arched handspring trainer. */
export function smallBoulderSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = SMALL_BOULDER_SIZE): BigBoulderSpriteGeometry {
  return boulderSpriteGeometry({ length: SMALL_BOULDER_LENGTH_INCHES, diameter: SMALL_BOULDER_DIAMETER_INCHES, height: SMALL_BOULDER_HEIGHT_INCHES, sideHeight: SMALL_BOULDER_SIDE_HEIGHT_INCHES, curveSegments: SMALL_BOULDER_CURVE_SEGMENTS }, rotation, elevation, frame);
}

export type SmallSemicircleSpriteGeometry = { blueCurvedFaces: StationPoint[][]; yellowFlatFaces: StationPoint[][] };

/** Pixel-segmented 2.5D geometry for the Small Semicircle's half-cylinder. */
export function smallSemicircleSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = SMALL_SEMICIRCLE_SIZE): SmallSemicircleSpriteGeometry {
  const sprite = boulderSpriteGeometry({ length: SMALL_SEMICIRCLE_DEPTH_INCHES, diameter: SMALL_SEMICIRCLE_DIAMETER_INCHES, height: SMALL_SEMICIRCLE_HEIGHT_INCHES, sideHeight: 0, curveSegments: SMALL_SEMICIRCLE_CURVE_SEGMENTS }, rotation, elevation, frame);
  return { blueCurvedFaces: sprite.redCurvedFaces, yellowFlatFaces: sprite.yellowFlatFaces };
}

export type MiniMushroomSpriteGeometry = { top: StationPoint[]; blueSides: StationPoint[][] };

function roundMushroomSpriteGeometry(radius: number, height: number, segments: number, rotation: number, elevation: number, frame: StationSpriteFrame): MiniMushroomSpriteGeometry {
  const ring = Array.from({ length: segments }, (_, index) => {
    const angle = Math.PI * 2 * index / segments;
    return [radius * Math.cos(angle), radius * Math.sin(angle)] as const;
  });
  const sides = ring.map(([x, y], index) => {
    const [nextX, nextY] = ring[(index + 1) % ring.length];
    return {
      normal: [x + nextX, y + nextY, 0] as PanelMatPoint,
      points: [[x, y, 0], [nextX, nextY, 0], [nextX, nextY, height], [x, y, height]] as PanelMatPoint[],
    };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    top: ring.map(([x, y]) => [x, y, height] as PanelMatPoint).map(project),
    blueSides: order(sides.filter((side) => cheeseFaceVisible(side.normal, rotation)).map((side) => side.points.map(project))),
  };
}

export type CylinderSpriteGeometry = { blueCurvedFaces: StationPoint[][]; yellowFlatFaces: StationPoint[][] };

/** A hard-edged Cylinder can stand on a yellow end or rest across its blue curve. */
export function cylinderSpriteGeometry(face: number, rotation: number, elevation = 0, frame: StationSpriteFrame = CYLINDER_SIZE): CylinderSpriteGeometry {
  const orientation = ((Math.trunc(face) % 2) + 2) % 2;
  if (orientation === 0) {
    const upright = roundMushroomSpriteGeometry(CYLINDER_RADIUS_INCHES, CYLINDER_HEIGHT_INCHES, CYLINDER_SEGMENTS, rotation, elevation, frame);
    return { blueCurvedFaces: upright.blueSides, yellowFlatFaces: [upright.top] };
  }
  const halfLength = CYLINDER_HEIGHT_INCHES / 2;
  const ring: PanelMatPoint[] = Array.from({ length: CYLINDER_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI * 2 * index / CYLINDER_SEGMENTS;
    return [0, CYLINDER_RADIUS_INCHES * Math.cos(angle), CYLINDER_RADIUS_INCHES * Math.sin(angle) + CYLINDER_RADIUS_INCHES] as PanelMatPoint;
  });
  const sideFaces: readonly PanelMatFace[] = ring.slice(0, -1).map(([_, firstY, firstZ], index) => {
    const [, secondY, secondZ] = ring[index + 1];
    return {
      normal: [0, (firstY + secondY) / 2, (firstZ + secondZ) / 2 - CYLINDER_RADIUS_INCHES] as PanelMatPoint,
      points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[],
    };
  });
  const endCaps: readonly PanelMatFace[] = [-1, 1].map((direction) => {
    const points = ring.slice(0, -1).map(([, y, z]) => [direction * halfLength, y, z] as PanelMatPoint);
    return { normal: [direction, 0, 0] as PanelMatPoint, points: direction < 0 ? points.slice().reverse() : points };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    blueCurvedFaces: order(sideFaces.filter((side) => cheeseFaceVisible(side.normal, rotation)).map((side) => side.points.map(project))),
    yellowFlatFaces: order(endCaps.filter((cap) => cheeseFaceVisible(cap.normal, rotation)).map((cap) => cap.points.map(project))),
  };
}

/** Hard-edged low cylinder for the 22-inch Mini Mushroom. */
export function miniMushroomSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = MINI_MUSHROOM_SIZE): MiniMushroomSpriteGeometry {
  return roundMushroomSpriteGeometry(MINI_MUSHROOM_RADIUS_INCHES, MINI_MUSHROOM_HEIGHT_INCHES, MINI_MUSHROOM_SEGMENTS, rotation, elevation, frame);
}

/** Hard-edged low disk for the 22-inch brown-and-gray Floor Mushroom. */
export function floorMushroomSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = FLOOR_MUSHROOM_SIZE): MiniMushroomSpriteGeometry {
  return roundMushroomSpriteGeometry(FLOOR_MUSHROOM_RADIUS_INCHES, FLOOR_MUSHROOM_HEIGHT_INCHES, FLOOR_MUSHROOM_SEGMENTS, rotation, elevation, frame);
}

export type ChalkBucketSpriteGeometry = { chalkTop: StationPoint[]; coloredSides: StationPoint[][]; rimSides: StationPoint[][]; handle: StationPoint[] };

/** Pixel-segmented open pail with chalk inside, a colored tapered body, rim, and raised carry handle. */
export function chalkBucketSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = CHALK_BUCKET_SIZE): ChalkBucketSpriteGeometry {
  const ring = (radius: number, height: number) => Array.from({ length: CHALK_BUCKET_SEGMENTS }, (_, index) => {
    const angle = Math.PI * 2 * index / CHALK_BUCKET_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle), height] as PanelMatPoint;
  });
  const bottomRing = ring(CHALK_BUCKET_BOTTOM_RADIUS_INCHES, 0);
  const bodyTopRing = ring(CHALK_BUCKET_RADIUS_INCHES, CHALK_BUCKET_HEIGHT_INCHES - .55);
  const rimTopRing = ring(CHALK_BUCKET_RADIUS_INCHES + .3, CHALK_BUCKET_HEIGHT_INCHES);
  const sides = bottomRing.map((point, index) => {
    const next = bottomRing[(index + 1) % bottomRing.length];
    const top = bodyTopRing[index]; const nextTop = bodyTopRing[(index + 1) % bodyTopRing.length];
    return { normal: [point[0] + next[0], point[1] + next[1], 0] as PanelMatPoint, points: [point, next, nextTop, top] };
  });
  const rimSides = bodyTopRing.map((point, index) => {
    const next = bodyTopRing[(index + 1) % bodyTopRing.length];
    const top = rimTopRing[index]; const nextTop = rimTopRing[(index + 1) % rimTopRing.length];
    return { normal: [point[0] + next[0], point[1] + next[1], 0] as PanelMatPoint, points: [point, next, nextTop, top] };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  const handle: PanelMatPoint[] = [
    [-4.4, -CHALK_BUCKET_RADIUS_INCHES, CHALK_BUCKET_HEIGHT_INCHES - .4], [4.4, -CHALK_BUCKET_RADIUS_INCHES, CHALK_BUCKET_HEIGHT_INCHES - .4],
    [4.4, -CHALK_BUCKET_RADIUS_INCHES, CHALK_BUCKET_HEIGHT_INCHES + CHALK_BUCKET_HANDLE_RISE_INCHES], [-4.4, -CHALK_BUCKET_RADIUS_INCHES, CHALK_BUCKET_HEIGHT_INCHES + CHALK_BUCKET_HANDLE_RISE_INCHES],
  ];
  return {
    chalkTop: ring(CHALK_BUCKET_RADIUS_INCHES - .75, CHALK_BUCKET_HEIGHT_INCHES - .18).map(project),
    coloredSides: order(sides.filter((side) => cheeseFaceVisible(side.normal, rotation)).map((side) => side.points.map(project))),
    rimSides: order(rimSides.filter((side) => cheeseFaceVisible(side.normal, rotation)).map((side) => side.points.map(project))),
    handle: handle.map(project),
  };
}

export type MushroomMatSpriteGeometry = { flange: StationPoint[]; top: StationPoint[]; bodySides: StationPoint[][]; topCross: StationPoint[][] };

/** Pixel-segmented Mushroom Mat: round padded top, inset cylindrical body, and visible low flange. */
export function mushroomMatSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = MUSHROOM_MAT_SIZE): MushroomMatSpriteGeometry {
  const ring = (radius: number, height: number) => Array.from({ length: MUSHROOM_MAT_SEGMENTS }, (_, index) => {
    const angle = Math.PI * 2 * index / MUSHROOM_MAT_SEGMENTS;
    return [radius * Math.cos(angle), radius * Math.sin(angle), height] as PanelMatPoint;
  });
  const baseRing = ring(MUSHROOM_MAT_BODY_RADIUS_INCHES, .7);
  const bodyTopRing = ring(MUSHROOM_MAT_BODY_RADIUS_INCHES, MUSHROOM_MAT_HEIGHT_INCHES);
  const sideFaces = baseRing.map((point, index) => {
    const next = baseRing[(index + 1) % baseRing.length];
    const top = bodyTopRing[index]; const nextTop = bodyTopRing[(index + 1) % bodyTopRing.length];
    return { normal: [point[0] + next[0], point[1] + next[1], 0] as PanelMatPoint, points: [point, next, nextTop, top] };
  });
  const crossHalfLength = 7.5; const crossHalfWidth = .85; const crossHeight = MUSHROOM_MAT_HEIGHT_INCHES + .1;
  const topCross: PanelMatPoint[][] = [
    [[-crossHalfWidth, -crossHalfLength, crossHeight], [crossHalfWidth, -crossHalfLength, crossHeight], [crossHalfWidth, crossHalfLength, crossHeight], [-crossHalfWidth, crossHalfLength, crossHeight]],
    [[-crossHalfLength, -crossHalfWidth, crossHeight], [crossHalfLength, -crossHalfWidth, crossHeight], [crossHalfLength, crossHalfWidth, crossHeight], [-crossHalfLength, crossHalfWidth, crossHeight]],
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  const order = (faces: StationPoint[][]) => faces.sort((first, second) => second.reduce((sum, point) => sum + point.y, 0) / second.length - first.reduce((sum, point) => sum + point.y, 0) / first.length);
  return {
    flange: ring(MUSHROOM_MAT_RADIUS_INCHES, .35).map(project),
    top: ring(MUSHROOM_MAT_RADIUS_INCHES, MUSHROOM_MAT_HEIGHT_INCHES).map(project),
    bodySides: order(sideFaces.filter((side) => cheeseFaceVisible(side.normal, rotation)).map((side) => side.points.map(project))),
    topCross: topCross.map((face) => face.map(project)),
  };
}

export function trapezoidMatDimensions(assetId: TrapezoidMatAssetId) {
  if (assetId === "red-trapezoid") return RED_TRAPEZOID_DIMENSIONS_INCHES;
  if (assetId === "yellow-trapezoid") return YELLOW_TRAPEZOID_DIMENSIONS_INCHES;
  return GREEN_TRAPEZOID_DIMENSIONS_INCHES;
}

/** The six stable orientations of a trapezoid slice: bottom, top, two ends, and two sloped sides. */
export function trapezoidMatFaceDimensions(assetId: TrapezoidMatAssetId, face = 0): CuboidDimensions {
  const { length, bottomDepth, topDepth, height } = trapezoidMatDimensions(assetId);
  const orientation = ((Math.trunc(face) % 6) + 6) % 6;
  const slopedSideLength = Math.hypot((bottomDepth - topDepth) / 2, height);
  if (orientation === 1) return { widthInches: length, depthInches: topDepth, heightInches: height };
  if (orientation === 2 || orientation === 3) return { widthInches: bottomDepth, depthInches: height, heightInches: length };
  if (orientation === 4 || orientation === 5) return { widthInches: length, depthInches: slopedSideLength, heightInches: bottomDepth };
  return { widthInches: length, depthInches: bottomDepth, heightInches: height };
}

function trapezoidMatCanvasSize(assetId: TrapezoidMatAssetId, face = 0) {
  return cuboidCanvasSize(trapezoidMatFaceDimensions(assetId, face));
}

export type TrapezoidMatSurface = { role: "top" | "side" | "end" | "bottom"; points: StationPoint[] };

/** Hard-edged 2.5D geometry for one trapezoid slice resting on any physical face. */
export function trapezoidMatSpriteGeometry(assetId: TrapezoidMatAssetId, face = 0, rotation = 0, elevation = 0, frame: StationSpriteFrame = trapezoidMatCanvasSize(assetId, face)): TrapezoidMatSurface[] {
  const { length, bottomDepth, topDepth, height } = trapezoidMatDimensions(assetId);
  const halfLength = length / 2; const halfBottomDepth = bottomDepth / 2; const halfTopDepth = topDepth / 2;
  const slopeDepth = halfBottomDepth - halfTopDepth;
  const faces: { role: TrapezoidMatSurface["role"]; normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { role: "bottom", normal: [0, 0, -1], points: [[-halfLength, -halfBottomDepth, 0], [halfLength, -halfBottomDepth, 0], [halfLength, halfBottomDepth, 0], [-halfLength, halfBottomDepth, 0]] },
    { role: "top", normal: [0, 0, 1], points: [[-halfLength, -halfTopDepth, height], [halfLength, -halfTopDepth, height], [halfLength, halfTopDepth, height], [-halfLength, halfTopDepth, height]] },
    { role: "end", normal: [1, 0, 0], points: [[halfLength, -halfBottomDepth, 0], [halfLength, halfBottomDepth, 0], [halfLength, halfTopDepth, height], [halfLength, -halfTopDepth, height]] },
    { role: "end", normal: [-1, 0, 0], points: [[-halfLength, halfBottomDepth, 0], [-halfLength, -halfBottomDepth, 0], [-halfLength, -halfTopDepth, height], [-halfLength, halfTopDepth, height]] },
    { role: "side", normal: [0, -height, slopeDepth], points: [[-halfLength, -halfBottomDepth, 0], [halfLength, -halfBottomDepth, 0], [halfLength, -halfTopDepth, height], [-halfLength, -halfTopDepth, height]] },
    { role: "side", normal: [0, height, slopeDepth], points: [[halfLength, halfBottomDepth, 0], [-halfLength, halfBottomDepth, 0], [-halfLength, halfTopDepth, height], [halfLength, halfTopDepth, height]] },
  ];
  const selectedFace = ((Math.trunc(face) % faces.length) + faces.length) % faces.length;
  const groundNormal = normalizeVector(faces[selectedFace].normal);
  const allPoints = faces.flatMap((surface) => surface.points).map((point) => rotateCheesePointToGround(point, groundNormal));
  const floor = Math.min(...allPoints.map((point) => point[2]));
  const { project } = panelMatProjection(rotation, elevation, frame);
  return faces
    .map((surface) => ({ ...surface, normal: rotateCheesePointToGround(normalizeVector(surface.normal), groundNormal), points: surface.points.map((point) => {
      const rotated = rotateCheesePointToGround(point, groundNormal);
      return [rotated[0], rotated[1], rotated[2] - floor] as PanelMatPoint;
    }) }))
    .filter((surface) => cheeseFaceVisible(surface.normal, rotation))
    .map((surface) => ({ role: surface.role, points: surface.points.map(project) }))
    .sort((first, second) => second.points.reduce((total, point) => total + point.y, 0) / second.points.length - first.points.reduce((total, point) => total + point.y, 0) / first.points.length);
}

/** The exact hard-edged faces used by the Panel Mat sprite and its collision shape. */
export function panelMatSpriteGeometry(rotation: number, elevation = 0, matHeight = PANEL_MAT_PANEL_HEIGHT_INCHES, frame: StationSpriteFrame = PANEL_MAT_OPEN_SIZE): { top: StationPoint[]; sides: StationPoint[][] } {
  const closed = matHeight > PANEL_MAT_PANEL_HEIGHT_INCHES;
  const faces = closed ? cuboidFaces(24, 12, PANEL_MAT_FOLDED_HEIGHT_INCHES) : { top: PANEL_MAT_TOP, sides: PANEL_MAT_SIDES };
  const { project } = panelMatProjection(rotation, elevation, frame);
  return {
    top: faces.top.points.map(project),
    sides: visiblePanelMatSides(rotation, faces.sides).map((face) => face.points.map(project)),
  };
}

/** Four physical panels, arranged along the long edge as red, green, blue, then yellow. */
export function panelMatOpenTopPanels(rotation: number, elevation = 0, frame: StationSpriteFrame = PANEL_MAT_OPEN_SIZE): StationPoint[][] {
  const { project } = panelMatProjection(rotation, elevation, frame);
  return Array.from({ length: 4 }, (_, index) => {
    const left = -48 + index * 24; const right = left + 24;
    return [[left, -24, PANEL_MAT_PANEL_HEIGHT_INCHES], [right, -24, PANEL_MAT_PANEL_HEIGHT_INCHES], [right, 24, PANEL_MAT_PANEL_HEIGHT_INCHES], [left, 24, PANEL_MAT_PANEL_HEIGHT_INCHES]] as PanelMatPoint[];
  }).map((face) => face.map(project));
}

/** Visible Panel Mat side faces, split so their colors continue from their matching top panels. */
export function panelMatOpenSidePanels(rotation: number, elevation = 0, frame: StationSpriteFrame = PANEL_MAT_OPEN_SIZE, colors = panelMatColors("panel")): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  const { project } = panelMatProjection(rotation, elevation, frame);
  return visiblePanelMatSides(rotation).flatMap((face) => {
    if (face.normal[1] !== 0) return Array.from({ length: 4 }, (_, index) => {
      const left = -48 + index * 24; const right = left + 24; const y = face.normal[1] > 0 ? 24 : -24;
      const points: PanelMatPoint[] = face.normal[1] > 0
        ? [[right, y, 0], [left, y, 0], [left, y, PANEL_MAT_PANEL_HEIGHT_INCHES], [right, y, PANEL_MAT_PANEL_HEIGHT_INCHES]]
        : [[left, y, 0], [right, y, 0], [right, y, PANEL_MAT_PANEL_HEIGHT_INCHES], [left, y, PANEL_MAT_PANEL_HEIGHT_INCHES]];
      return { color: colors[index], points: points.map(project) };
    });
    return [{ color: face.normal[0] > 0 ? colors.at(-1)! : colors[0], points: face.points.map(project) }];
  });
}

/** Four folded layers: red on top, then green, blue, and yellow at the bottom. */
export function panelMatFoldedSidePanels(rotation: number, elevation = 0, frame: StationSpriteFrame = PANEL_MAT_CLOSED_SIZE, colors = panelMatColors("panel")): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  const { project } = panelMatProjection(rotation, elevation, frame);
  const folded = cuboidFaces(24, 12, PANEL_MAT_FOLDED_HEIGHT_INCHES);
  return visiblePanelMatSides(rotation, folded.sides).flatMap((face) => colors.map((color, index) => {
    const top = PANEL_MAT_FOLDED_HEIGHT_INCHES - index * PANEL_MAT_PANEL_HEIGHT_INCHES;
    return { color, points: panelMatSideSegment(face, top - PANEL_MAT_PANEL_HEIGHT_INCHES, top).map(project) };
  }));
}

function foldingPanelMatSpriteGeometry(panelCount: number, panelLengthFeet: number, panelDepthFeet: number, panelHeightInches: number, foldedHeightInches: number, rotation: number, elevation: number, matHeight: number, frame: StationSpriteFrame): { top: StationPoint[]; sides: StationPoint[][] } {
  const closed = matHeight > panelHeightInches;
  const faces = closed
    ? cuboidFaces(panelLengthFeet * 6, panelDepthFeet * 6, foldedHeightInches)
    : foldingPanelMatFaces(panelCount, panelLengthFeet, panelDepthFeet, panelHeightInches);
  const { project } = panelMatProjection(rotation, elevation, frame);
  return { top: faces.top.points.map(project), sides: visibleFoldingPanelMatSides(rotation, faces.sides).map((face) => face.points.map(project)) };
}

function foldingPanelMatOpenTopPanels(panelCount: number, panelLengthFeet: number, panelDepthFeet: number, panelHeightInches: number, rotation: number, elevation: number, frame: StationSpriteFrame): StationPoint[][] {
  const { project } = panelMatProjection(rotation, elevation, frame);
  const panelWidthInches = panelDepthFeet * 12;
  const halfWidth = panelCount * panelWidthInches / 2;
  const halfLength = panelLengthFeet * 6;
  return Array.from({ length: panelCount }, (_, index) => {
    const left = -halfWidth + index * panelWidthInches; const right = left + panelWidthInches;
    return [[left, -halfLength, panelHeightInches], [right, -halfLength, panelHeightInches], [right, halfLength, panelHeightInches], [left, halfLength, panelHeightInches]] as PanelMatPoint[];
  }).map((face) => face.map(project));
}

function foldingPanelMatOpenSidePanels(panelCount: number, panelLengthFeet: number, panelDepthFeet: number, panelHeightInches: number, colors: readonly FoldingPanelMatColor[], rotation: number, elevation: number, frame: StationSpriteFrame): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  const { project } = panelMatProjection(rotation, elevation, frame);
  const panelWidthInches = panelDepthFeet * 12;
  const halfWidth = panelCount * panelWidthInches / 2;
  const halfLength = panelLengthFeet * 6;
  const faces = foldingPanelMatFaces(panelCount, panelLengthFeet, panelDepthFeet, panelHeightInches);
  return visibleFoldingPanelMatSides(rotation, faces.sides).flatMap((face) => {
    if (face.normal[1] !== 0) return Array.from({ length: panelCount }, (_, index) => {
      const left = -halfWidth + index * panelWidthInches; const right = left + panelWidthInches; const y = face.normal[1] > 0 ? halfLength : -halfLength;
      const points: PanelMatPoint[] = face.normal[1] > 0
        ? [[right, y, 0], [left, y, 0], [left, y, panelHeightInches], [right, y, panelHeightInches]]
        : [[left, y, 0], [right, y, 0], [right, y, panelHeightInches], [left, y, panelHeightInches]];
      return { color: colors[index], points: points.map(project) };
    });
    return [{ color: face.normal[0] > 0 ? colors.at(-1)! : colors[0], points: face.points.map(project) }];
  });
}

function foldingPanelMatFoldedSidePanels(panelCount: number, panelLengthFeet: number, panelDepthFeet: number, panelHeightInches: number, foldedHeightInches: number, colors: readonly FoldingPanelMatColor[], rotation: number, elevation: number, frame: StationSpriteFrame): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  const { project } = panelMatProjection(rotation, elevation, frame);
  const folded = cuboidFaces(panelLengthFeet * 6, panelDepthFeet * 6, foldedHeightInches);
  return visibleFoldingPanelMatSides(rotation, folded.sides).flatMap((face) => colors.map((color, index) => {
    const top = foldedHeightInches - index * panelHeightInches;
    return { color, points: panelMatSideSegment(face, top - panelHeightInches, top).map(project) };
  }));
}

/** The corrected 5 Panel Mat uses five 5-foot by 2-foot panels. */
export function fivePanelMatSpriteGeometry(rotation: number, elevation = 0, matHeight = FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, frame: StationSpriteFrame = FIVE_PANEL_MAT_OPEN_SIZE): { top: StationPoint[]; sides: StationPoint[][] } {
  return foldingPanelMatSpriteGeometry(FIVE_PANEL_MAT_PANEL_COUNT, FIVE_PANEL_MAT_PANEL_LENGTH_FEET, FIVE_PANEL_MAT_PANEL_DEPTH_FEET, FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES, rotation, elevation, matHeight, frame);
}

export function fivePanelMatOpenTopPanels(rotation: number, elevation = 0, frame: StationSpriteFrame = FIVE_PANEL_MAT_OPEN_SIZE): StationPoint[][] {
  return foldingPanelMatOpenTopPanels(FIVE_PANEL_MAT_PANEL_COUNT, FIVE_PANEL_MAT_PANEL_LENGTH_FEET, FIVE_PANEL_MAT_PANEL_DEPTH_FEET, FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, rotation, elevation, frame);
}

export function fivePanelMatOpenSidePanels(rotation: number, elevation = 0, frame: StationSpriteFrame = FIVE_PANEL_MAT_OPEN_SIZE, colors = panelMatColors("five-panel")): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  return foldingPanelMatOpenSidePanels(FIVE_PANEL_MAT_PANEL_COUNT, FIVE_PANEL_MAT_PANEL_LENGTH_FEET, FIVE_PANEL_MAT_PANEL_DEPTH_FEET, FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, colors, rotation, elevation, frame);
}

export function fivePanelMatFoldedSidePanels(rotation: number, elevation = 0, frame: StationSpriteFrame = FIVE_PANEL_MAT_CLOSED_SIZE, colors = panelMatColors("five-panel")): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  return foldingPanelMatFoldedSidePanels(FIVE_PANEL_MAT_PANEL_COUNT, FIVE_PANEL_MAT_PANEL_LENGTH_FEET, FIVE_PANEL_MAT_PANEL_DEPTH_FEET, FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES, colors, rotation, elevation, frame);
}

/** The true 6 Panel Mat uses six 6-foot by 2-foot panels. */
export function sixPanelMatSpriteGeometry(rotation: number, elevation = 0, matHeight = SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, frame: StationSpriteFrame = SIX_PANEL_MAT_OPEN_SIZE): { top: StationPoint[]; sides: StationPoint[][] } {
  return foldingPanelMatSpriteGeometry(SIX_PANEL_MAT_PANEL_COUNT, SIX_PANEL_MAT_PANEL_LENGTH_FEET, SIX_PANEL_MAT_PANEL_DEPTH_FEET, SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES, rotation, elevation, matHeight, frame);
}

export function sixPanelMatOpenTopPanels(rotation: number, elevation = 0, frame: StationSpriteFrame = SIX_PANEL_MAT_OPEN_SIZE): StationPoint[][] {
  return foldingPanelMatOpenTopPanels(SIX_PANEL_MAT_PANEL_COUNT, SIX_PANEL_MAT_PANEL_LENGTH_FEET, SIX_PANEL_MAT_PANEL_DEPTH_FEET, SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, rotation, elevation, frame);
}

export function sixPanelMatOpenSidePanels(rotation: number, elevation = 0, frame: StationSpriteFrame = SIX_PANEL_MAT_OPEN_SIZE, colors = panelMatColors("six-panel")): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  return foldingPanelMatOpenSidePanels(SIX_PANEL_MAT_PANEL_COUNT, SIX_PANEL_MAT_PANEL_LENGTH_FEET, SIX_PANEL_MAT_PANEL_DEPTH_FEET, SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, colors, rotation, elevation, frame);
}

export function sixPanelMatFoldedSidePanels(rotation: number, elevation = 0, frame: StationSpriteFrame = SIX_PANEL_MAT_CLOSED_SIZE, colors = panelMatColors("six-panel")): { color: FoldingPanelMatColor; points: StationPoint[] }[] {
  return foldingPanelMatFoldedSidePanels(SIX_PANEL_MAT_PANEL_COUNT, SIX_PANEL_MAT_PANEL_LENGTH_FEET, SIX_PANEL_MAT_PANEL_DEPTH_FEET, SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES, colors, rotation, elevation, frame);
}

export function bigBlockSide(object: StationObject): number {
  return Number.isInteger(object.bigBlockSide) && object.bigBlockSide! >= 0 && object.bigBlockSide! < BIG_BLOCK_SIDES.length ? object.bigBlockSide! : 0;
}

export function bigBlockDimensions(side: number): (typeof BIG_BLOCK_SIDES)[number] {
  return BIG_BLOCK_SIDES[((Math.trunc(side) % BIG_BLOCK_SIDES.length) + BIG_BLOCK_SIDES.length) % BIG_BLOCK_SIDES.length];
}

function bigBlockCanvasSize(side: number) {
  const dimensions = bigBlockDimensions(side);
  return { width: dimensions.widthFeet * 24, height: dimensions.depthFeet * 24 };
}

/** The Big Block's vertical clearance uses the same 1.5-inch stack unit as the Panel Mat. */
export function bigBlockVerticalHeight(side: number): number {
  return bigBlockDimensions(side).heightFeet * 12 / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** Pixel-cuboid faces for the Big Block's visible silhouette and collision shape. */
export function bigBlockSpriteGeometry(rotation: number, elevation = 0, side = 0, frame: StationSpriteFrame = bigBlockCanvasSize(side)): { top: StationPoint[]; sides: StationPoint[][] } {
  const dimensions = bigBlockDimensions(side);
  const faces = cuboidFaces(dimensions.widthFeet * 6, dimensions.depthFeet * 6, dimensions.heightFeet * 12);
  const { project } = panelMatProjection(rotation, elevation, frame);
  return { top: faces.top.points.map(project), sides: visibleCuboidSides(rotation, faces.sides).map((face) => face.points.map(project)) };
}

/** Hard-edged cuboid geometry for the rectangular blocks, using their current physical face. */
export function stationCuboidSpriteGeometry(rotation: number, elevation: number, dimensions: CuboidDimensions, frame: StationSpriteFrame): { top: StationPoint[]; sides: StationPoint[][]; sideIndices: number[] } {
  const faces = cuboidFaces(dimensions.widthInches / 2, dimensions.depthInches / 2, dimensions.heightInches);
  const visible = faces.sides.map((face, index) => ({ face, index })).filter(({ face }) => visibleCuboidSides(rotation, faces.sides).includes(face));
  const { project } = panelMatProjection(rotation, elevation, frame);
  return { top: faces.top.points.map(project), sides: visible.map(({ face }) => face.points.map(project)), sideIndices: visible.map(({ index }) => index) };
}

function pbarFaceColor(first: number, second: number): StationColor {
  const pair = [first, second].sort((a, b) => a - b);
  if (pair[0] === PBAR_BLOCK_DIMENSIONS_INCHES.short && pair[1] === PBAR_BLOCK_DIMENSIONS_INCHES.long) return "blue";
  if (pair[0] === PBAR_BLOCK_DIMENSIONS_INCHES.medium && pair[1] === PBAR_BLOCK_DIMENSIONS_INCHES.long) return "green";
  return "yellow";
}

/** The PBar Block's colors follow the two physical dimensions on each visible rectangle. */
export function pbarBlockFaceColors(face = 0): { top: StationColor; sides: StationColor[] } {
  const dimensions = pbarBlockDimensions(face);
  const xSide = pbarFaceColor(dimensions.depthInches, dimensions.heightInches);
  const ySide = pbarFaceColor(dimensions.widthInches, dimensions.heightInches);
  return { top: pbarFaceColor(dimensions.widthInches, dimensions.depthInches), sides: [xSide, ySide, xSide, ySide] };
}

function halfBlockFaceColor(first: number, second: number): StationColor {
  const pair = [first, second].sort((a, b) => a - b);
  if (pair[0] === HALF_BLOCK_DIMENSIONS_INCHES.short && pair[1] === HALF_BLOCK_DIMENSIONS_INCHES.long) return "blue";
  if (pair[0] === HALF_BLOCK_DIMENSIONS_INCHES.medium && pair[1] === HALF_BLOCK_DIMENSIONS_INCHES.long) return "green";
  return "yellow";
}

/** The green/yellow option keeps the PBar Block's blue, green, and yellow face assignments at half height. */
export function halfBlockFaceColors(face = 0, color: HalfBlockColor = "green-yellow"): { top: StationColor; sides: StationColor[] } {
  if (color === "blue") return { top: "blue", sides: ["blue", "blue", "blue", "blue"] };
  const dimensions = halfBlockDimensions(face);
  const xSide = halfBlockFaceColor(dimensions.depthInches, dimensions.heightInches);
  const ySide = halfBlockFaceColor(dimensions.widthInches, dimensions.heightInches);
  return { top: halfBlockFaceColor(dimensions.widthInches, dimensions.depthInches), sides: [xSide, ySide, xSide, ySide] };
}

function cuboidVerticalHeight(dimensions: CuboidDimensions): number {
  return dimensions.heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

export function miniResiVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(miniResiDimensions(face));
}

export function redNorbertBlockVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(redNorbertBlockDimensions(face));
}

export function blueNorbertBlockVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(blueNorbertBlockDimensions(face));
}

export function greenNorbertBlockVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(greenNorbertBlockDimensions(face));
}

export function miniRedNorbertBlockVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(miniRedNorbertBlockDimensions(face));
}

export function squishyNorbertBlockVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(squishyNorbertBlockDimensions(face));
}

export function smallGreenNorbertBlockVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(smallGreenNorbertBlockDimensions(face));
}

export function pinkBeamMatVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(pinkBeamMatDimensions(face));
}

export function cartwheelMatVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(cartwheelMatDimensions(face));
}

export function stairsVerticalHeight(): number {
  return STAIRS_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Velcro Beam keeps its exact current physical face height for automatic stacking. */
export function velcroBeamVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(velcroBeamDimensions(face));
}

export function stingMatVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(stingMatDimensions(face));
}

export function gymNovaMatVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(gymNovaMatDimensions(face));
}

export function teddyMatVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(teddyMatDimensions(face));
}

export function handMatVerticalHeight(face = 2): number {
  return cuboidVerticalHeight(handMatDimensions(face));
}

/** Flips a Big Block to the previous or next physical face while preserving its center. */
export function flipBigBlockSide(object: StationObject, direction: BigBlockFlipDirection): StationObject {
  if (object.kind !== "equipment" || object.assetId !== "big-block") return object;
  const nextSide = (bigBlockSide(object) + (direction === "next" ? 1 : -1) + BIG_BLOCK_SIDES.length) % BIG_BLOCK_SIDES.length;
  const size = bigBlockCanvasSize(nextSide);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return { ...object, bigBlockSide: nextSide, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

export function randomBigBlockColor(random = Math.random): BigBlockColor {
  return BIG_BLOCK_COLORS[Math.min(BIG_BLOCK_COLORS.length - 1, Math.floor(random() * BIG_BLOCK_COLORS.length))];
}

type OctagonSpec = { diameterInches: number; lengthInches: number; outerColor: "red" | "green"; endColor: "green" | "yellow" };

function octagonSpec(assetId: "big-octagon" | "medium-octagon" | "small-octagon"): OctagonSpec {
  if (assetId === "big-octagon") return { diameterInches: BIG_OCTAGON_DIAMETER_INCHES, lengthInches: BIG_OCTAGON_LENGTH_FEET * 12, outerColor: "red", endColor: "green" };
  if (assetId === "small-octagon") return { diameterInches: SMALL_OCTAGON_DIAMETER_INCHES, lengthInches: SMALL_OCTAGON_LENGTH_INCHES, outerColor: "red", endColor: "yellow" };
  return { diameterInches: MEDIUM_OCTAGON_DIAMETER_INCHES, lengthInches: MEDIUM_OCTAGON_HEIGHT_INCHES, outerColor: "green", endColor: "yellow" };
}

export function octagonFaceDimensions(assetId: "big-octagon" | "medium-octagon" | "small-octagon", face = defaultStationAssetFace(assetId)): CuboidDimensions {
  const spec = octagonSpec(assetId);
  return face < 2
    ? { widthInches: spec.diameterInches, depthInches: spec.diameterInches, heightInches: spec.lengthInches }
    : { widthInches: spec.lengthInches, depthInches: spec.diameterInches, heightInches: spec.diameterInches };
}

export function octagonFaceLabel(assetId: "big-octagon" | "medium-octagon" | "small-octagon", face: number): string {
  const spec = octagonSpec(assetId);
  return face < 2 ? `OCTAGON END · ${spec.lengthInches} IN TALL` : `OUTER FACE · ${spec.diameterInches} IN TALL`;
}

function octagonCanvasSize(assetId: "big-octagon" | "medium-octagon" | "small-octagon", face = defaultStationAssetFace(assetId)) {
  return cuboidCanvasSize(octagonFaceDimensions(assetId, face));
}

/** The Big Octagon's 30-inch vertical clearance in 1.5-inch stack units. */
export function bigOctagonVerticalHeight(): number {
  return BIG_OCTAGON_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

function lyingOctagonSpriteGeometry(rotation: number, elevation: number, diameterInches: number, lengthInches: number, frame: StationSpriteFrame): { outerFaces: StationPoint[][]; endFaces: StationPoint[][] } {
  const halfLength = lengthInches / 2;
  const radiusY = diameterInches / 2;
  const radiusZ = diameterInches / 2;
  const centerZ = radiusZ;
  const corner = Math.SQRT1_2;
  const ring: readonly [number, number][] = [[-corner * radiusY, 0], [corner * radiusY, 0], [radiusY, radiusZ * (1 - corner)], [radiusY, radiusZ * (1 + corner)], [corner * radiusY, radiusZ * 2], [-corner * radiusY, radiusZ * 2], [-radiusY, radiusZ * (1 + corner)], [-radiusY, radiusZ * (1 - corner)]];
  const faces = ring.map(([firstY, firstZ], index) => {
    const [secondY, secondZ] = ring[(index + 1) % ring.length];
    return { normal: [0, firstY + secondY, firstZ + secondZ - centerZ * 2] as PanelMatPoint, points: [[-halfLength, firstY, firstZ], [halfLength, firstY, firstZ], [halfLength, secondY, secondZ], [-halfLength, secondY, secondZ]] as PanelMatPoint[] };
  });
  const ends: readonly PanelMatFace[] = [
    { normal: [1, 0, 0], points: ring.map(([y, z]) => [halfLength, y, z] as PanelMatPoint) },
    { normal: [-1, 0, 0], points: ring.slice().reverse().map(([y, z]) => [-halfLength, y, z] as PanelMatPoint) },
  ];
  const isVisible = (normal: PanelMatPoint) => {
    const radians = snapStationRotation(rotation) * Math.PI / 180;
    const rotatedX = normal[0] * Math.cos(radians) - normal[1] * Math.sin(radians);
    const rotatedY = normal[0] * Math.sin(radians) + normal[1] * Math.cos(radians);
    return rotatedX * .44 + rotatedY + normal[2] * .55 > .001;
  };
  const { project } = panelMatProjection(rotation, elevation, frame);
  return { outerFaces: faces.filter((face) => isVisible(face.normal)).map((face) => face.points.map(project)), endFaces: ends.filter((face) => isVisible(face.normal)).map((face) => face.points.map(project)) };
}

/** Red outer faces and green octagonal ends for the 30-inch by 3-foot Big Octagon. */
export function bigOctagonSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = BIG_OCTAGON_SIZE): { outerFaces: StationPoint[][]; endFaces: StationPoint[][] } {
  return lyingOctagonSpriteGeometry(rotation, elevation, BIG_OCTAGON_DIAMETER_INCHES, BIG_OCTAGON_LENGTH_FEET * 12, frame);
}

/** The Medium Octagon's 30-inch upright clearance in 1.5-inch stack units. */
export function mediumOctagonVerticalHeight(): number {
  return MEDIUM_OCTAGON_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

function uprightOctagonSpriteGeometry(rotation: number, elevation: number, diameterInches: number, lengthInches: number, frame: StationSpriteFrame): { top: StationPoint[]; bottom: StationPoint[]; outerFaces: StationPoint[][] } {
  const radius = diameterInches / 2;
  const corner = Math.SQRT1_2 * radius;
  const ring: readonly [number, number][] = [[-corner, -radius], [corner, -radius], [radius, -corner], [radius, corner], [corner, radius], [-corner, radius], [-radius, corner], [-radius, -corner]];
  const outerFaces: readonly PanelMatFace[] = ring.map(([firstX, firstY], index) => {
    const [secondX, secondY] = ring[(index + 1) % ring.length];
    return { normal: [firstX + secondX, firstY + secondY, 0], points: [[firstX, firstY, 0], [secondX, secondY, 0], [secondX, secondY, lengthInches], [firstX, firstY, lengthInches]] };
  });
  const { project } = panelMatProjection(rotation, elevation, frame);
  return {
    top: ring.map(([x, y]) => project([x, y, lengthInches])),
    bottom: ring.slice().reverse().map(([x, y]) => project([x, y, 0])),
    outerFaces: visibleCuboidSides(rotation, outerFaces).map((face) => face.points.map(project)),
  };
}

/** Green outer faces with yellow octagonal top and bottom faces for the upright Medium Octagon. */
export function mediumOctagonSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = MEDIUM_OCTAGON_SIZE): { top: StationPoint[]; bottom: StationPoint[]; outerFaces: StationPoint[][] } {
  return uprightOctagonSpriteGeometry(rotation, elevation, MEDIUM_OCTAGON_DIAMETER_INCHES, MEDIUM_OCTAGON_HEIGHT_INCHES, frame);
}

/** Exact octagon faces for any of the three documented octagons resting on any physical face. */
export function stationOctagonSpriteGeometry(assetId: "big-octagon" | "medium-octagon" | "small-octagon", face: number, rotation: number, elevation = 0, frame: StationSpriteFrame = octagonCanvasSize(assetId, face)): { outerFaces: StationPoint[][]; endFaces: StationPoint[][] } {
  const spec = octagonSpec(assetId);
  if (face < 2) {
    const upright = uprightOctagonSpriteGeometry(rotation, elevation, spec.diameterInches, spec.lengthInches, frame);
    return { outerFaces: upright.outerFaces, endFaces: [upright.top] };
  }
  return lyingOctagonSpriteGeometry(rotation, elevation, spec.diameterInches, spec.lengthInches, frame);
}

/** The medium Cheese Mat's true clearance, measured in 1.5-inch stack units. */
export function mediumCheeseMatVerticalHeight(): number {
  return cheeseMatVerticalHeight("medium-cheese-mat");
}

/** The Big Cheese Mat's 17-inch clearance in the same stack units as every other mat. */
export function bigCheeseMatVerticalHeight(): number {
  return cheeseMatVerticalHeight("big-cheese-mat");
}

/** The Small Cheese Mat's 16-inch clearance in the shared stack scale. */
export function smallCheeseMatVerticalHeight(): number {
  return cheeseMatVerticalHeight("small-cheese-mat");
}

/** The Tiny Cheese Mat's five-inch clearance in the shared stack scale. */
export function tinyCheeseMatVerticalHeight(): number {
  return cheeseMatVerticalHeight("tiny-cheese-mat");
}

/** The Cloud Mat's 8-inch clearance in the same stack units as every other mat. */
export function cloudMatVerticalHeight(): number {
  return CLOUD_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Springboard's 8-inch clearance in the same stack units as every other raised piece. */
export function springboardVerticalHeight(): number {
  return SPRINGBOARD_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Preschool Springboard's documented 6.5-inch high edge sets its clearance. */
export function preschoolSpringboardVerticalHeight(): number {
  return PRESCHOOL_SPRINGBOARD_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The T Trainer's 25-inch tall padded rail in the shared stack scale. */
export function tTrainerVerticalHeight(): number {
  return T_TRAINER_TOTAL_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Mail Box's 15-inch roof peak in the shared stack scale. */
export function mailBoxVerticalHeight(): number {
  return MAIL_BOX_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Green Mailbox's 33-inch roof peak in the shared stack scale. */
export function greenMailBoxVerticalHeight(): number {
  return GREEN_MAIL_BOX_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Colt's documented 16-inch overall height, including its handles. */
export function coltVerticalHeight(): number {
  return COLT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Parallette's documented five-inch clearance in the shared stack scale. */
export function paralletteVerticalHeight(): number {
  return PARALLETTE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** Uses the standard 7-inch rail whenever an older saved Mini Low Bar has no height choice. */
export function miniLowBarHeight(object: Pick<StationObject, "miniLowBarHeightInches">): MiniLowBarHeightInches {
  return MINI_LOW_BAR_HEIGHTS_INCHES.includes(object.miniLowBarHeightInches as MiniLowBarHeightInches) ? object.miniLowBarHeightInches as MiniLowBarHeightInches : MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES;
}

/** The selected rail height is the Mini Low Bar's usable stacking clearance. */
export function miniLowBarVerticalHeight(heightInches: MiniLowBarHeightInches = MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES): number {
  const height = MINI_LOW_BAR_HEIGHTS_INCHES.includes(heightInches) ? heightInches : MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES;
  return height / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Advanced Mini Bar's documented 44-inch rail sets its stacking clearance. */
export function advancedMiniBarVerticalHeight(): number {
  return ADVANCED_MINI_BAR_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Rec Mini Bar's documented 39-inch rail sets its stacking clearance. */
export function recMiniBarVerticalHeight(): number {
  return REC_MINI_BAR_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

export function trafficConeVerticalHeight(): number {
  return TRAFFIC_CONE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

export function targetMarkerVerticalHeight(): number {
  return TARGET_MARKER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

export function beanbagVerticalHeight(): number {
  return BEANBAG_CENTER_THICKNESS_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Rainbow Mat reaches half of its documented 49-inch outside diameter. */
export function rainbowMatVerticalHeight(): number {
  return RAINBOW_MAT_RADIUS_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Pac-Man Block's 27-inch upright body defines its stacking clearance. */
export function pacManVerticalHeight(): number {
  return PAC_MAN_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The two 24-inch straps plus the 1.5-inch bar define the hanging Trapeze's full clearance. */
export function trapezeVerticalHeight(): number {
  return (TRAPEZE_STRAP_LENGTH_INCHES + TRAPEZE_BAR_THICKNESS_INCHES) / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The PVC Pipe's one-inch diameter sets its stacking clearance. */
export function pvcPipeVerticalHeight(): number {
  return PVC_PIPE_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Small Bar Pad's two-inch diameter sets its stacking clearance. */
export function smallBarPadVerticalHeight(): number {
  return SMALL_BAR_PAD_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The five-inch blue wheels set the Rolling Bar's clearance. */
export function rollingBarVerticalHeight(): number {
  return ROLLING_BAR_WHEEL_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The ladder's 3.5-inch rail thickness sets the maximum stacking clearance. */
export function woodenClimbingLadderVerticalHeight(): number {
  return WOODEN_CLIMBING_LADDER_THICKNESS_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Bose Ball's 10.5-inch dome clearance in the shared stack scale. */
export function boseBallVerticalHeight(): number {
  return BOSE_BALL_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Foam Roller's documented 5.5-inch diameter sets its clearance. */
export function foamRollerVerticalHeight(): number {
  return FOAM_ROLLER_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The chalk bucket's 15-inch pail height sets its stacking clearance; the handle is non-load-bearing. */
export function chalkBucketVerticalHeight(): number {
  return CHALK_BUCKET_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The full 20-inch Yoga Ball clearance in the shared stack scale. */
export function yogaBallVerticalHeight(): number {
  return YOGA_BALL_DIAMETER_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Vault Trainer's documented 49-inch height sets its stacking clearance. */
export function vaultTrainerVerticalHeight(): number {
  return VAULT_TRAINER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Big Boulder's 28-inch clearance in the shared stack scale. */
export function bigBoulderVerticalHeight(): number {
  return BIG_BOULDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Medium Boulder's 25-inch clearance in the shared stack scale. */
export function mediumBoulderVerticalHeight(): number {
  return MEDIUM_BOULDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Small Boulder's 21-inch clearance in the shared stack scale. */
export function smallBoulderVerticalHeight(): number {
  return SMALL_BOULDER_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Small Semicircle rises 12.75 inches above its support surface. */
export function smallSemicircleVerticalHeight(): number {
  return SMALL_SEMICIRCLE_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Mini Mushroom's 11-inch clearance in the shared stack scale. */
export function miniMushroomVerticalHeight(): number {
  return MINI_MUSHROOM_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Floor Mushroom's provisional 1-inch clearance in the shared stack scale. */
export function floorMushroomVerticalHeight(): number {
  return FLOOR_MUSHROOM_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** The Mushroom Mat's documented 16-inch clearance in the shared stack scale. */
export function mushroomMatVerticalHeight(): number {
  return MUSHROOM_MAT_HEIGHT_INCHES / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** Cylinder clearance follows the physical orientation: 48 inches upright or 24 inches on its side. */
export function cylinderVerticalHeight(face = 0): number {
  return cylinderFaceDimensions(face).heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

/** Every trapezoid slice is one third of the 35-inch set. */
export function trapezoidMatVerticalHeight(assetId: TrapezoidMatAssetId, face = 0): number {
  return trapezoidMatFaceDimensions(assetId, face).heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

function cheeseMatSpec(assetId: CheeseMatAssetId) {
  return assetId === "tiny-cheese-mat"
    ? { lengthInches: TINY_CHEESE_MAT_LENGTH_INCHES, depthInches: TINY_CHEESE_MAT_DEPTH_INCHES, heightInches: TINY_CHEESE_MAT_HEIGHT_INCHES, size: TINY_CHEESE_MAT_SIZE }
    : assetId === "small-cheese-mat"
    ? { lengthInches: SMALL_CHEESE_MAT_LENGTH_INCHES, depthInches: SMALL_CHEESE_MAT_DEPTH_INCHES, heightInches: SMALL_CHEESE_MAT_HEIGHT_INCHES, size: SMALL_CHEESE_MAT_SIZE }
    : assetId === "large-cheese-mat"
    ? { lengthInches: LARGE_CHEESE_MAT_LENGTH_INCHES, depthInches: LARGE_CHEESE_MAT_DEPTH_INCHES, heightInches: LARGE_CHEESE_MAT_HEIGHT_INCHES, size: LARGE_CHEESE_MAT_SIZE }
    : assetId === "big-cheese-mat"
    ? { lengthInches: BIG_CHEESE_MAT_LENGTH_INCHES, depthInches: BIG_CHEESE_MAT_DEPTH_INCHES, heightInches: BIG_CHEESE_MAT_HEIGHT_INCHES, size: BIG_CHEESE_MAT_SIZE }
    : { lengthInches: MEDIUM_CHEESE_MAT_LENGTH_INCHES, depthInches: MEDIUM_CHEESE_MAT_DEPTH_INCHES, heightInches: MEDIUM_CHEESE_MAT_HEIGHT_INCHES, size: MEDIUM_CHEESE_MAT_SIZE };
}

export function cheeseMatVerticalHeight(assetId: CheeseMatAssetId): number {
  return cheeseMatSpec(assetId).heightInches / PANEL_MAT_PANEL_HEIGHT_INCHES * STATION_STACK_STEP;
}

export function cheeseMatFaceDimensions(assetId: CheeseMatAssetId, face = 0): CuboidDimensions {
  const spec = cheeseMatSpec(assetId);
  const orientation = ((Math.trunc(face) % 5) + 5) % 5;
  if (orientation === 2) return { widthInches: spec.depthInches, depthInches: spec.heightInches, heightInches: spec.lengthInches };
  if (orientation === 3 || orientation === 4) return { widthInches: spec.lengthInches, depthInches: spec.heightInches, heightInches: spec.depthInches };
  return { widthInches: spec.lengthInches, depthInches: spec.depthInches, heightInches: spec.heightInches };
}

/** A folded Cheese Mat halves its floor length and doubles its height, retaining a compact square-ish storage block. */
export function foldedCheeseMatFaceDimensions(assetId: FoldableCheeseMatAssetId, face = 0): CuboidDimensions {
  const spec = cheeseMatSpec(assetId);
  const folded = { long: spec.lengthInches / 2, medium: spec.depthInches, short: spec.heightInches * 2 } as const;
  return cuboidFaceDimensions(folded, face);
}

export function mediumCheeseMatFaceDimensions(face = 0): CuboidDimensions {
  return cheeseMatFaceDimensions("medium-cheese-mat", face);
}

export function mediumCheeseMatFaceLabel(face: number): string {
  return cheeseMatFaceLabel("medium-cheese-mat", face);
}

export function cheeseMatFaceLabel(assetId: CheeseMatAssetId, face: number, smallCheeseMatColor: SmallCheeseMatColor = "orange-purple"): string {
  const triangleLabel = assetId === "tiny-cheese-mat"
    ? "RED TRIANGLE"
    : assetId !== "small-cheese-mat"
    ? "BLUE/YELLOW TRIANGLE"
    : smallCheeseMatColor === "orange-purple" ? "PURPLE TRIANGLE"
      : smallCheeseMatColor === "red" ? "NAVY/YELLOW TRIANGLE"
        : "BLUE/YELLOW TRIANGLE";
  const endLabel = assetId === "tiny-cheese-mat"
    ? "TALL RED END"
    : assetId === "small-cheese-mat"
    ? `TALL ${smallCheeseMatColor === "orange-purple" ? "PURPLE" : smallCheeseMatColor === "red" ? "NAVY" : "BLUE"} END`
    : "TALL BLUE END";
  const labels = ["BOTTOM", "SLOPED TOP", endLabel, triangleLabel, triangleLabel] as const;
  return labels[((Math.trunc(face) % labels.length) + labels.length) % labels.length];
}

/** Pixel wedge faces for the 72 by 36 by 15.5 inch Medium Cheese Mat. */
export function mediumCheeseMatSpriteGeometry(rotation: number, elevation = 0, frame: StationSpriteFrame = MEDIUM_CHEESE_MAT_SIZE): { top: StationPoint[]; bottom: StationPoint[]; end: StationPoint[] | null; sideStripes: { color: (typeof MEDIUM_CHEESE_MAT_STRIPE_COLORS)[number]; points: StationPoint[] }[] } {
  const halfLength = MEDIUM_CHEESE_MAT_LENGTH_INCHES / 2;
  const halfDepth = MEDIUM_CHEESE_MAT_DEPTH_INCHES / 2;
  const visualHeight = MEDIUM_CHEESE_MAT_HEIGHT_INCHES;
  const highEnd = halfLength; const lowEnd = -halfLength;
  const top: PanelMatPoint[] = [[lowEnd, -halfDepth, 0], [highEnd, -halfDepth, visualHeight], [highEnd, halfDepth, visualHeight], [lowEnd, halfDepth, 0]];
  const bottom: PanelMatPoint[] = [[lowEnd, -halfDepth, 0], [lowEnd, halfDepth, 0], [highEnd, halfDepth, 0], [highEnd, -halfDepth, 0]];
  const endFace: PanelMatFace = { normal: [1, 0, 0], points: [[highEnd, -halfDepth, 0], [highEnd, halfDepth, 0], [highEnd, halfDepth, visualHeight], [highEnd, -halfDepth, visualHeight]] };
  const triangleFaces: readonly PanelMatFace[] = [
    { normal: [0, 1, 0], points: [[lowEnd, halfDepth, 0], [highEnd, halfDepth, 0], [highEnd, halfDepth, visualHeight]] },
    { normal: [0, -1, 0], points: [[highEnd, -halfDepth, 0], [lowEnd, -halfDepth, 0], [highEnd, -halfDepth, visualHeight]] },
  ];
  const { project } = panelMatProjection(rotation, elevation, frame);
  const sideStripes = visibleCuboidSides(rotation, triangleFaces).flatMap((face) => MEDIUM_CHEESE_MAT_STRIPE_COLORS.map((color, index) => {
    const start = lowEnd + (highEnd - lowEnd) * index / MEDIUM_CHEESE_MAT_STRIPE_COLORS.length;
    const finish = lowEnd + (highEnd - lowEnd) * (index + 1) / MEDIUM_CHEESE_MAT_STRIPE_COLORS.length;
    const startHeight = (start - lowEnd) / (highEnd - lowEnd) * visualHeight;
    const finishHeight = (finish - lowEnd) / (highEnd - lowEnd) * visualHeight;
    const y = face.normal[1] * halfDepth;
    const points: PanelMatPoint[] = face.normal[1] > 0
      ? [[start, y, 0], [finish, y, 0], [finish, y, finishHeight], [start, y, startHeight]]
      : [[finish, y, 0], [start, y, 0], [start, y, startHeight], [finish, y, finishHeight]];
    return { color, points: points.map(project) };
  }));
  const visibleEnd = visibleCuboidSides(rotation, [endFace])[0];
  return { top: top.map(project), bottom: bottom.map(project), end: visibleEnd ? visibleEnd.points.map(project) : null, sideStripes };
}

export type CheeseSurfaceColor = "red" | "green" | "blue" | "yellow" | "orange" | "purple" | "navy";
type CheeseSurface = { role: "top" | "bottom" | "end" | "side"; color: CheeseSurfaceColor; points: StationPoint[] };
type CheeseMatSideSection = { color: CheeseSurfaceColor; startFraction: number; endFraction: number };
type CheeseMatColors = { bottom: CheeseSurfaceColor; top: CheeseSurfaceColor; end: CheeseSurfaceColor };

function cheeseMatColors(assetId: CheeseMatAssetId, smallCheeseMatColor: SmallCheeseMatColor): CheeseMatColors {
  if (assetId === "tiny-cheese-mat") return { bottom: "red", top: "red", end: "red" };
  if (assetId === "small-cheese-mat") {
    if (smallCheeseMatColor === "orange-purple") return { bottom: "purple", top: "orange", end: "purple" };
    if (smallCheeseMatColor === "red") return { bottom: "navy", top: "red", end: "navy" };
  }
  return { bottom: "green", top: assetId === "squishy-cheese-mat" ? "red" : "green", end: "blue" };
}

function cheeseMatSideSections(assetId: CheeseMatAssetId, smallCheeseMatColor: SmallCheeseMatColor): readonly CheeseMatSideSection[] {
  if (assetId === "tiny-cheese-mat") return [{ color: "red", startFraction: 0, endFraction: 1 }];
  if (assetId === "small-cheese-mat") {
    if (smallCheeseMatColor === "orange-purple") return [{ color: "purple", startFraction: 0, endFraction: 1 }];
    if (smallCheeseMatColor === "red") return MEDIUM_CHEESE_MAT_STRIPE_COLORS.map((color, index) => ({ color, startFraction: index / MEDIUM_CHEESE_MAT_STRIPE_COLORS.length, endFraction: (index + 1) / MEDIUM_CHEESE_MAT_STRIPE_COLORS.length }));
  }
  return assetId === "squishy-cheese-mat"
    ? SQUISHY_CHEESE_MAT_SIDE_SECTIONS
    : MEDIUM_CHEESE_MAT_STRIPE_COLORS.map((color, index) => ({ color, startFraction: index / MEDIUM_CHEESE_MAT_STRIPE_COLORS.length, endFraction: (index + 1) / MEDIUM_CHEESE_MAT_STRIPE_COLORS.length }));
}

/** Visible cover treatment of a Cheese Mat after it is folded into its storage block. */
export function foldedCheeseMatColorScheme(assetId: FoldableCheeseMatAssetId, smallCheeseMatColor: SmallCheeseMatColor = "orange-purple"): { top: CheeseSurfaceColor; sides: readonly CheeseSurfaceColor[] } {
  const colors = cheeseMatColors(assetId, smallCheeseMatColor);
  return { top: colors.top, sides: cheeseMatSideSections(assetId, smallCheeseMatColor).map((section) => section.color) };
}

function isCheeseMatAsset(assetId: StationAssetId | undefined): assetId is CheeseMatAssetId {
  return assetId === "tiny-cheese-mat" || assetId === "small-cheese-mat" || assetId === "medium-cheese-mat" || assetId === "large-cheese-mat" || assetId === "big-cheese-mat" || assetId === "squishy-cheese-mat";
}

function normalizeVector([x, y, z]: PanelMatPoint): PanelMatPoint {
  const magnitude = Math.hypot(x, y, z) || 1;
  return [x / magnitude, y / magnitude, z / magnitude];
}

function crossProduct([ax, ay, az]: PanelMatPoint, [bx, by, bz]: PanelMatPoint): PanelMatPoint {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

function dotProduct([ax, ay, az]: PanelMatPoint, [bx, by, bz]: PanelMatPoint): number {
  return ax * bx + ay * by + az * bz;
}

function rotateCheesePointToGround(point: PanelMatPoint, normal: PanelMatPoint): PanelMatPoint {
  const source = normalizeVector(normal);
  const target: PanelMatPoint = [0, 0, -1];
  const cosine = Math.max(-1, Math.min(1, dotProduct(source, target)));
  if (cosine > .999999) return point;
  const axis = cosine < -.999999 ? [1, 0, 0] as PanelMatPoint : normalizeVector(crossProduct(source, target));
  const sine = cosine < -.999999 ? 0 : Math.sqrt(Math.max(0, 1 - cosine ** 2));
  const crossed = crossProduct(axis, point);
  const axisDotPoint = dotProduct(axis, point);
  return [
    point[0] * cosine + crossed[0] * sine + axis[0] * axisDotPoint * (1 - cosine),
    point[1] * cosine + crossed[1] * sine + axis[1] * axisDotPoint * (1 - cosine),
    point[2] * cosine + crossed[2] * sine + axis[2] * axisDotPoint * (1 - cosine),
  ];
}

function cheeseFaceVisible(normal: PanelMatPoint, rotation: number): boolean {
  const radians = snapStationRotation(rotation) * Math.PI / 180;
  const x = normal[0] * Math.cos(radians) - normal[1] * Math.sin(radians);
  const y = normal[0] * Math.sin(radians) + normal[1] * Math.cos(radians);
  return x * .44 + y + normal[2] * .55 > .001;
}

/** Projects either Cheese Mat after it has been laid on any of its five physical faces. */
export function stationCheeseMatSpriteGeometry(assetId: CheeseMatAssetId, face: number, rotation: number, elevation = 0, frame: StationSpriteFrame = cheeseMatSpec(assetId).size, smallCheeseMatColor: SmallCheeseMatColor = "orange-purple"): CheeseSurface[] {
  const spec = cheeseMatSpec(assetId);
  const halfLength = spec.lengthInches / 2;
  const halfDepth = spec.depthInches / 2;
  const height = spec.heightInches;
  const lowFront: PanelMatPoint = [-halfLength, -halfDepth, 0]; const highFrontBase: PanelMatPoint = [halfLength, -halfDepth, 0];
  const highBackBase: PanelMatPoint = [halfLength, halfDepth, 0]; const lowBack: PanelMatPoint = [-halfLength, halfDepth, 0];
  const highFront: PanelMatPoint = [halfLength, -halfDepth, height]; const highBack: PanelMatPoint = [halfLength, halfDepth, height];
  const slopeNormal = normalizeVector([-height, 0, spec.lengthInches]);
  const faceNormals: readonly PanelMatPoint[] = [[0, 0, -1], slopeNormal, [1, 0, 0], [0, -1, 0], [0, 1, 0]];
  const selectedFace = ((Math.trunc(face) % faceNormals.length) + faceNormals.length) % faceNormals.length;
  const groundNormal = faceNormals[selectedFace];
  const colors = cheeseMatColors(assetId, smallCheeseMatColor);
  const rawSurfaces: { role: CheeseSurface["role"]; color: CheeseSurface["color"]; normal: PanelMatPoint; points: PanelMatPoint[] }[] = [
    { role: "bottom", color: colors.bottom, normal: faceNormals[0], points: [lowFront, lowBack, highBackBase, highFrontBase] },
    { role: "top", color: colors.top, normal: faceNormals[1], points: [lowFront, highFront, highBack, lowBack] },
    { role: "end", color: colors.end, normal: faceNormals[2], points: [highFrontBase, highBackBase, highBack, highFront] },
  ];
  const stripeSurfaces = ([{ normal: faceNormals[3], y: -halfDepth, reverse: false }, { normal: faceNormals[4], y: halfDepth, reverse: true }] as const).flatMap(({ normal, y, reverse }) => cheeseMatSideSections(assetId, smallCheeseMatColor).map(({ color, startFraction, endFraction }) => {
    const start = -halfLength + spec.lengthInches * startFraction;
    const end = -halfLength + spec.lengthInches * endFraction;
    const startHeight = (start + halfLength) / spec.lengthInches * height;
    const endHeight = (end + halfLength) / spec.lengthInches * height;
    const points: PanelMatPoint[] = reverse
      ? [[end, y, 0], [start, y, 0], [start, y, startHeight], [end, y, endHeight]]
      : [[start, y, 0], [end, y, 0], [end, y, endHeight], [start, y, startHeight]];
    return { role: "side" as const, color, normal, points };
  }));
  const allPoints = [...rawSurfaces, ...stripeSurfaces].flatMap((surface) => surface.points).map((point) => rotateCheesePointToGround(point, groundNormal));
  const floor = Math.min(...allPoints.map((point) => point[2]));
  const { project } = panelMatProjection(rotation, elevation, frame);
  return [...rawSurfaces, ...stripeSurfaces]
    .map((surface) => ({ ...surface, normal: rotateCheesePointToGround(surface.normal, groundNormal), points: surface.points.map((point) => {
      const rotated = rotateCheesePointToGround(point, groundNormal);
      return [rotated[0], rotated[1], rotated[2] - floor] as PanelMatPoint;
    }) }))
    .filter((surface) => cheeseFaceVisible(surface.normal, rotation))
    .map((surface) => ({ role: surface.role, color: surface.color, points: surface.points.map(project) }))
    .sort((first, second) => second.points.reduce((total, point) => total + point.y, 0) / second.points.length - first.points.reduce((total, point) => total + point.y, 0) / first.points.length);
}

/** Flips a supported object onto the next or previous physical face while preserving its board center. */
export function flipStationObjectFace(object: StationObject, direction: StationFlipDirection): StationObject {
  if (object.kind !== "equipment" || !isStationAssetFlippable(object.assetId)) return object;
  if (object.assetId === "big-block") return flipBigBlockSide(object, direction);
  const assetId = object.assetId;
  const count = stationAssetFaceCount(assetId);
  const face = (stationObjectFace(object) + (direction === "next" ? 1 : -1) + count) % count;
  const dimensions = assetId === "pbar-block" ? pbarBlockDimensions(face)
    : assetId === "half-block" ? halfBlockDimensions(face)
      : assetId === "blue-resi" ? blueResiDimensions(face)
        : assetId === "mini-resi" ? miniResiDimensions(face)
          : isStripedResiAsset(assetId) ? stripedResiDimensions(assetId, face)
          : assetId === "red-norbert-block" ? redNorbertBlockDimensions(face)
            : assetId === "blue-norbert-block" ? blueNorbertBlockDimensions(face)
              : assetId === "green-norbert-block" ? greenNorbertBlockDimensions(face)
                : assetId === "mini-red-norbert-block" ? miniRedNorbertBlockDimensions(face)
                  : assetId === "squishy-norbert-block" ? squishyNorbertBlockDimensions(face)
                    : assetId === "small-green-norbert-block" ? smallGreenNorbertBlockDimensions(face)
                      : assetId === "pink-beam-mat" ? pinkBeamMatDimensions(face)
                : assetId === "cartwheel-mat" ? cartwheelMatDimensions(face)
                : assetId === "velcro-beam" ? velcroBeamDimensions(face)
                : assetId === "sting-mat" ? stingMatDimensions(face)
                : assetId === "gym-nova-mat" ? gymNovaMatDimensions(face)
                  : assetId === "teddy-mat" ? teddyMatDimensions(face)
                    : assetId === "hand-mat" ? handMatDimensions(face)
                    : assetId === "cloud-mat" ? cloudMatDimensions(face)
                    : assetId === "cylinder" ? cylinderFaceDimensions(face)
                    : assetId === "red-trapezoid" || assetId === "yellow-trapezoid" || assetId === "green-trapezoid" ? trapezoidMatFaceDimensions(assetId, face)
                      : assetId === "big-octagon" || assetId === "medium-octagon" || assetId === "small-octagon" ? octagonFaceDimensions(assetId, face)
                        : isCheeseMatAsset(assetId) ? isFoldableCheeseMatAsset(assetId) && cheeseMatState(object) === "closed" ? foldedCheeseMatFaceDimensions(assetId, face) : cheeseMatFaceDimensions(assetId, face) : mediumCheeseMatFaceDimensions(face);
  const size = cuboidCanvasSize(dimensions);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return { ...object, face, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

/** Older saved Panel Mats were open before the folded state was introduced. */
export function panelMatState(object: StationObject): StationPanelState {
  return object.panelState ?? "open";
}

/** Changes only a Panel Mat's real board footprint while keeping its center in place. */
export function setPanelMatState(object: StationObject, panelState: StationPanelState): StationObject {
  if (object.kind !== "equipment" || !isFoldingPanelMatAsset(object.assetId)) return object;
  const size = object.assetId === "five-panel"
    ? panelState === "open" ? FIVE_PANEL_MAT_OPEN_SIZE : FIVE_PANEL_MAT_CLOSED_SIZE
    : object.assetId === "six-panel"
      ? panelState === "open" ? SIX_PANEL_MAT_OPEN_SIZE : SIX_PANEL_MAT_CLOSED_SIZE
      : panelState === "open" ? PANEL_MAT_OPEN_SIZE : PANEL_MAT_CLOSED_SIZE;
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return { ...object, panelState, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

/** Older saved Cheese Mats were open before their storage-fold state was introduced. */
export function cheeseMatState(object: StationObject): StationCheeseMatState {
  return object.cheeseMatState ?? "open";
}

/** Changes a foldable Cheese Mat's physical footprint while keeping its center in place. */
export function setCheeseMatState(object: StationObject, cheeseMatState: StationCheeseMatState): StationObject {
  if (object.kind !== "equipment" || !isFoldableCheeseMatAsset(object.assetId)) return object;
  const dimensions = cheeseMatState === "closed"
    ? foldedCheeseMatFaceDimensions(object.assetId, stationObjectFace(object))
    : cheeseMatFaceDimensions(object.assetId, stationObjectFace(object));
  const size = cuboidCanvasSize(dimensions);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return { ...object, cheeseMatState, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

export function stationAsset(assetId: StationAssetId): StationAsset {
  return stationAssets.find((asset) => asset.id === assetId) ?? stationAssets[0];
}

export function createStationSetup(id = `station-${typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`): StationSetup {
  const now = new Date().toISOString();
  return { id, version: STATION_SETUP_VERSION, canvas: STATION_CANVAS, objects: [], createdAt: now, updatedAt: now };
}

export function createStationObject(assetId: StationAssetId, zIndex: number, id = `station-object-${Date.now()}-${Math.random().toString(36).slice(2)}`): StationObject {
  const asset = stationAsset(assetId);
  const isPanelMat = isFoldingPanelMatAsset(assetId);
  const isBigBlock = assetId === "big-block";
  const isBlueResi = assetId === "blue-resi";
  const isMiniResi = assetId === "mini-resi";
  const isStripedResi = isStripedResiAsset(assetId);
  const isRedNorbertBlock = assetId === "red-norbert-block";
  const isBlueNorbertBlock = assetId === "blue-norbert-block";
  const isGreenNorbertBlock = assetId === "green-norbert-block";
  const isMiniRedNorbertBlock = assetId === "mini-red-norbert-block";
  const isSquishyNorbertBlock = assetId === "squishy-norbert-block";
  const isSmallGreenNorbertBlock = assetId === "small-green-norbert-block";
  const isCartwheelMat = assetId === "cartwheel-mat";
  const isVelcroBeam = assetId === "velcro-beam";
  const isPbarBlock = assetId === "pbar-block";
  const isHalfBlock = assetId === "half-block";
  const isSmallCheeseMat = assetId === "small-cheese-mat";
  const isOctagon = assetId === "big-octagon" || assetId === "medium-octagon" || assetId === "small-octagon";
  const isCheeseMat = isCheeseMatAsset(assetId);
  const isFoldableCheeseMat = isFoldableCheeseMatAsset(assetId);
  const isTrapezoidMat = assetId === "red-trapezoid" || assetId === "yellow-trapezoid" || assetId === "green-trapezoid";
  const isSpringboard = assetId === "springboard";
  const isBungee = assetId === "bungee";
  const isChalkBucket = assetId === "chalk-bucket";
  const isMiniLowBar = assetId === "mini-low-bar";
  const isMushroomMat = assetId === "mushroom-mat";
  const isFoamRoller = assetId === "foam-roller";
  const isYogaBall = assetId === "yoga-ball";
  const isCylinder = assetId === "cylinder";
  const isMatPlaceholder = assetId === "mat-placeholder";
  const initialFace = defaultStationAssetFace(assetId);
  const size = assetId === "panel" ? PANEL_MAT_CLOSED_SIZE
    : assetId === "five-panel" ? FIVE_PANEL_MAT_CLOSED_SIZE
      : assetId === "six-panel" ? SIX_PANEL_MAT_CLOSED_SIZE
      : isBigBlock ? bigBlockCanvasSize(0)
        : isBlueResi ? cuboidCanvasSize(blueResiDimensions(initialFace))
          : isMiniResi ? cuboidCanvasSize(miniResiDimensions(initialFace))
            : isStripedResi ? cuboidCanvasSize(stripedResiDimensions(assetId, initialFace))
            : isRedNorbertBlock ? cuboidCanvasSize(redNorbertBlockDimensions(initialFace))
              : isBlueNorbertBlock ? cuboidCanvasSize(blueNorbertBlockDimensions(initialFace))
                : isGreenNorbertBlock ? cuboidCanvasSize(greenNorbertBlockDimensions(initialFace))
                  : isMiniRedNorbertBlock ? cuboidCanvasSize(miniRedNorbertBlockDimensions(initialFace))
                    : isSquishyNorbertBlock ? cuboidCanvasSize(squishyNorbertBlockDimensions(initialFace))
                      : isSmallGreenNorbertBlock ? cuboidCanvasSize(smallGreenNorbertBlockDimensions(initialFace))
                        : assetId === "pink-beam-mat" ? cuboidCanvasSize(pinkBeamMatDimensions(initialFace))
                  : isCartwheelMat ? cuboidCanvasSize(cartwheelMatDimensions(initialFace))
                  : isVelcroBeam ? cuboidCanvasSize(velcroBeamDimensions(initialFace))
                  : assetId === "sting-mat" ? cuboidCanvasSize(stingMatDimensions(initialFace))
                  : assetId === "gym-nova-mat" ? cuboidCanvasSize(gymNovaMatDimensions(initialFace))
                    : assetId === "teddy-mat" ? cuboidCanvasSize(teddyMatDimensions(initialFace))
                      : assetId === "hand-mat" ? cuboidCanvasSize(handMatDimensions(initialFace))
                      : assetId === "cloud-mat" ? cuboidCanvasSize(cloudMatDimensions(initialFace))
                      : isPbarBlock ? cuboidCanvasSize(pbarBlockDimensions(initialFace))
                        : isHalfBlock ? cuboidCanvasSize(halfBlockDimensions(initialFace))
                          : isOctagon ? octagonCanvasSize(assetId, initialFace)
                          : isCheeseMat ? cuboidCanvasSize(cheeseMatFaceDimensions(assetId, initialFace))
                            : isTrapezoidMat ? trapezoidMatCanvasSize(assetId, initialFace)
                              : isCylinder ? cuboidCanvasSize(cylinderFaceDimensions(initialFace))
                                : isMatPlaceholder ? MAT_PLACEHOLDER_SIZES.rectangle
                                : asset;
  const color: StationColor = isSpringboard ? "white-grey"
    : assetId === "pink-beam-mat" ? "pink"
      : assetId === "sting-mat" ? "brown"
        : assetId === "gym-nova-mat" ? "gray"
          : assetId === "teddy-mat" ? "brown"
            : assetId === "hand-mat" ? "burgundy"
            : assetId === "green-mail-box" ? "green"
            : isGreenNorbertBlock || isSmallGreenNorbertBlock ? "green"
              : assetId === "red-norbert-block" || isMiniRedNorbertBlock ? "red" : "blue";
  const panelMatColorway: PanelMatColorway | undefined = assetId === "panel" ? "rainbow" : assetId === "five-panel" ? "blue" : assetId === "six-panel" ? "light-blue" : undefined;
  return { id, kind: "equipment", assetId, color, x: 96, y: 96, width: size.width, height: size.height, rotation: 0, elevation: 0, ...(isPanelMat ? { panelState: "closed" as const, panelMatColorway } : {}), ...(isBigBlock ? { bigBlockSide: 0, bigBlockColor: randomBigBlockColor() } : {}), ...(isHalfBlock ? { halfBlockColor: "green-yellow" as const } : {}), ...(isSmallCheeseMat ? { smallCheeseMatColor: "orange-purple" as const } : {}), ...(isFoldableCheeseMat ? { cheeseMatState: "open" as const } : {}), ...(isSquishyNorbertBlock ? { squishyNorbertBlockColor: "blue" as const } : {}), ...(isCartwheelMat ? { cartwheelMatColor: "blue" as const } : {}), ...(assetId === "four-inch-resi" ? { fourInchResiColor: "blue" as const } : {}), ...(isVelcroBeam ? { velcroBeamColor: "red" as const } : {}), ...(isBungee ? { bungeeColor: "black" as const } : {}), ...(isChalkBucket ? { chalkBucketColor: "orange" as const } : {}), ...(isMiniLowBar ? { miniLowBarBaseColor: "gray" as const, miniLowBarHeightInches: MINI_LOW_BAR_DEFAULT_HEIGHT_INCHES } : {}), ...(isMushroomMat ? { mushroomMatColor: "blue-brown" as const } : {}), ...(isFoamRoller ? { foamRollerEndColor: "green" as const } : {}), ...(isYogaBall ? { yogaBallColor: "blue" as const } : {}), ...(isMatPlaceholder ? { missingMatLabel: "NEW MAT", matPlaceholderShape: "rectangle" as const } : {}), ...(!isBigBlock && isStationAssetFlippable(assetId) ? { face: initialFace } : {}), zIndex };
}

/** Compatibility constructor used when importing a legacy pixel-station backup. */
export function createLegacyStationObject(assetId: StationAssetId, zIndex: number, id?: string): StationObject {
  return createStationObject(assetId, zIndex, id);
}

export function matPlaceholderShape(shape: MatPlaceholderShape | undefined): MatPlaceholderShape {
  return MAT_PLACEHOLDER_SHAPES.includes(shape as MatPlaceholderShape) ? shape as MatPlaceholderShape : "rectangle";
}

/** Keeps a placeholder's center in place when a teacher chooses its best stand-in shape. */
export function setMatPlaceholderShape(object: StationObject, shape: MatPlaceholderShape): StationObject {
  if (object.kind !== "equipment" || object.assetId !== "mat-placeholder") return object;
  const currentShape = matPlaceholderShape(shape);
  const size = MAT_PLACEHOLDER_SIZES[currentShape];
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return { ...object, matPlaceholderShape: currentShape, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

function normalizeStationObjectDimensions(object: StationObject, migrateLegacySixPanel = false): StationObject {
  const legacyBlueHalfBlock = object.kind === "equipment" && (object.assetId as string | undefined) === "blue-half-block";
  const legacySixPanel = migrateLegacySixPanel && object.kind === "equipment" && object.assetId === "six-panel";
  const current = legacySixPanel
    ? (() => {
      const panelState = panelMatState(object);
      const size = panelState === "open" ? FIVE_PANEL_MAT_OPEN_SIZE : FIVE_PANEL_MAT_CLOSED_SIZE;
      const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
      return { ...object, assetId: "five-panel" as const, panelMatColorway: "blue" as const, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
    })()
    : legacyBlueHalfBlock
    ? (() => {
      const face = Number.isInteger(object.face) && object.face! >= 0 && object.face! < 6 ? object.face! : 0;
      const size = cuboidCanvasSize(halfBlockDimensions(face));
      const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
      return { ...object, assetId: "half-block" as const, halfBlockColor: "blue" as const, face, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
    })()
    : object;
  if (current.kind !== "equipment" || current.assetId !== "medium-octagon") return current;
  const face = stationObjectFace(current);
  const legacySize = face < 2 ? { width: 4, height: 4 } : { width: 60, height: 4 };
  if (current.width !== legacySize.width || current.height !== legacySize.height) return current;
  const size = octagonCanvasSize("medium-octagon", face);
  const center = { x: current.x + current.width / 2, y: current.y + current.height / 2 };
  return { ...current, width: size.width, height: size.height, x: center.x - size.width / 2, y: center.y - size.height / 2 };
}

/** Corrects the original 2-inch Medium Octagon records while preserving their board center. */
export function normalizeStationSetupDimensions(setup: StationSetup): StationSetup {
  let changed = false;
  const objects = setup.objects.map((object) => {
    const current = normalizeStationObjectDimensions(object, setup.version === LEGACY_STATION_SETUP_VERSION);
    changed ||= current !== object;
    return current;
  });
  const version = setup.version === LEGACY_STATION_SETUP_VERSION ? STATION_SETUP_VERSION : setup.version;
  return changed || version !== setup.version ? { ...setup, version, objects } : setup;
}

/** Keeps the saved visible pixels on the editable station canvas after a resize. */
export function constrainStationObjectToCanvas(object: StationObject): StationObject {
  const current = normalizeStationObjectDimensions(object);
  const width = Math.min(STATION_CANVAS.width, Math.max(STATION_CANVAS.grid, current.width));
  const height = Math.min(STATION_CANVAS.height, Math.max(STATION_CANVAS.grid, current.height));
  const constrained = {
    ...current,
    width,
    height,
  };
  const footprint = stationObjectFootprint(constrained);
  const minX = Math.min(...footprint.map((point) => point.x)); const maxX = Math.max(...footprint.map((point) => point.x));
  const minY = Math.min(...footprint.map((point) => point.y)); const maxY = Math.max(...footprint.map((point) => point.y));
  return {
    ...constrained,
    x: Number((constrained.x + (minX < 0 ? -minX + .000001 : maxX > STATION_CANVAS.width ? STATION_CANVAS.width - maxX - .000001 : 0)).toFixed(6)),
    y: Number((constrained.y + (minY < 0 ? -minY + .000001 : maxY > STATION_CANVAS.height ? STATION_CANVAS.height - maxY - .000001 : 0)).toFixed(6)),
  };
}

/** Snaps a station object's orientation to a supported board-facing angle. */
export function snapStationRotation(rotation: number): number {
  return ((Math.round(rotation / STATION_ROTATION_STEP) * STATION_ROTATION_STEP) % 360 + 360) % 360;
}

/** Turns a station object by one object-local 30-degree step. */
export function rotateStationObject(object: StationObject, direction: StationRotationDirection): StationObject {
  const change = direction === "clockwise" ? STATION_ROTATION_STEP : -STATION_ROTATION_STEP;
  return { ...object, rotation: (snapStationRotation(object.rotation) + change + 360) % 360 };
}

/** Raises or lowers a station object by one Panel Mat thickness for real stacking. */
export function moveStationObjectVertical(object: StationObject, direction: StationElevationDirection): StationObject {
  return { ...object, elevation: Math.max(0, (object.elevation ?? 0) + (direction === "up" ? STATION_STACK_STEP : -STATION_STACK_STEP)) };
}

/** Moves a station object one saved canvas pixel along its own facing directions. */
export function nudgeStationObject(object: StationObject, direction: StationNudgeDirection): StationObject {
  const localOffset = direction === "north" ? { x: 0, y: -1 }
    : direction === "east" ? { x: 1, y: 0 }
      : direction === "south" ? { x: 0, y: 1 }
        : { x: -1, y: 0 };
  const rotation = snapStationRotation(object.rotation);
  const radians = rotation * Math.PI / 180;
  const offset = {
    x: localOffset.x * Math.cos(radians) - localOffset.y * Math.sin(radians),
    y: localOffset.x * Math.sin(radians) + localOffset.y * Math.cos(radians),
  };
  return constrainStationObjectToCanvas({
    ...object,
    rotation,
    x: Number((object.x + offset.x).toFixed(6)),
    y: Number((object.y + offset.y).toFixed(6)),
  });
}

function stationObjectCorners(object: StationObject): StationPoint[] {
  const radians = object.rotation * Math.PI / 180;
  const cos = Math.cos(radians); const sin = Math.sin(radians);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
    const local = { x: x * object.width / 2, y: y * object.height / 2 };
    return { x: center.x + local.x * cos - local.y * sin, y: center.y + local.x * sin + local.y * cos };
  });
}

/** Pixel-hard local outlines for a not-yet-modeled mat. */
export function matPlaceholderShapePoints(shape: MatPlaceholderShape | undefined, frame: { width: number; height: number }): StationPoint[] {
  const currentShape = matPlaceholderShape(shape);
  const { width, height } = frame;
  if (currentShape === "round") return [
    { x: width * .25, y: 0 }, { x: width * .75, y: 0 }, { x: width, y: height * .25 }, { x: width, y: height * .75 },
    { x: width * .75, y: height }, { x: width * .25, y: height }, { x: 0, y: height * .75 }, { x: 0, y: height * .25 },
  ];
  if (currentShape === "wedge") return [{ x: 0, y: height }, { x: 0, y: height * .35 }, { x: width, y: 0 }, { x: width, y: height }];
  return [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }];
}

function matPlaceholderFootprint(object: StationObject): StationPoint[] {
  const radians = snapStationRotation(object.rotation) * Math.PI / 180;
  const cos = Math.cos(radians); const sin = Math.sin(radians);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return matPlaceholderShapePoints(object.matPlaceholderShape, object).map((point) => {
    const local = { x: point.x - object.width / 2, y: point.y - object.height / 2 };
    return { x: center.x + local.x * cos - local.y * sin, y: center.y + local.x * sin + local.y * cos };
  });
}

function convexHull(points: readonly StationPoint[]): StationPoint[] {
  const ordered = [...points].sort((first, second) => first.x - second.x || first.y - second.y);
  const cross = (origin: StationPoint, first: StationPoint, second: StationPoint) => (first.x - origin.x) * (second.y - origin.y) - (first.y - origin.y) * (second.x - origin.x);
  const append = (hull: StationPoint[], point: StationPoint) => {
    while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop();
    hull.push(point);
  };
  const lower: StationPoint[] = []; const upper: StationPoint[] = [];
  ordered.forEach((point) => append(lower, point));
  ordered.slice().reverse().forEach((point) => append(upper, point));
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** The visible sprite silhouette used for board edges and preview cropping. */
export function stationObjectFootprint(object: StationObject): StationPoint[] {
  const current = normalizeStationObjectDimensions(object);
  if (current !== object) return stationObjectFootprint(current);
  if (object.kind === "equipment" && object.assetId === "mat-placeholder") return matPlaceholderFootprint(object);
  if (object.kind === "equipment" && isFoldingPanelMatAsset(object.assetId)) {
    const frame = { width: object.width, height: object.height };
    const sprite = object.assetId === "five-panel"
      ? fivePanelMatSpriteGeometry(object.rotation, object.elevation ?? 0, panelMatState(object) === "closed" ? FIVE_PANEL_MAT_FOLDED_HEIGHT_INCHES : FIVE_PANEL_MAT_PANEL_HEIGHT_INCHES, frame)
      : object.assetId === "six-panel"
        ? sixPanelMatSpriteGeometry(object.rotation, object.elevation ?? 0, panelMatState(object) === "closed" ? SIX_PANEL_MAT_FOLDED_HEIGHT_INCHES : SIX_PANEL_MAT_PANEL_HEIGHT_INCHES, frame)
        : panelMatSpriteGeometry(object.rotation, object.elevation ?? 0, panelMatState(object) === "closed" ? PANEL_MAT_FOLDED_HEIGHT_INCHES : PANEL_MAT_PANEL_HEIGHT_INCHES, frame);
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "big-block") {
    const sprite = bigBlockSpriteGeometry(object.rotation, object.elevation ?? 0, bigBlockSide(object), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && (object.assetId === "blue-resi" || object.assetId === "mini-resi" || isStripedResiAsset(object.assetId) || object.assetId === "red-norbert-block" || object.assetId === "blue-norbert-block" || object.assetId === "green-norbert-block" || object.assetId === "mini-red-norbert-block" || object.assetId === "squishy-norbert-block" || object.assetId === "small-green-norbert-block" || object.assetId === "pbar-block" || object.assetId === "half-block")) {
    const dimensions = object.assetId === "blue-resi" ? blueResiDimensions(stationObjectFace(object))
      : object.assetId === "mini-resi" ? miniResiDimensions(stationObjectFace(object))
        : isStripedResiAsset(object.assetId) ? stripedResiDimensions(object.assetId, stationObjectFace(object))
        : object.assetId === "red-norbert-block" ? redNorbertBlockDimensions(stationObjectFace(object))
          : object.assetId === "blue-norbert-block" ? blueNorbertBlockDimensions(stationObjectFace(object))
            : object.assetId === "green-norbert-block" ? greenNorbertBlockDimensions(stationObjectFace(object))
              : object.assetId === "mini-red-norbert-block" ? miniRedNorbertBlockDimensions(stationObjectFace(object))
                : object.assetId === "squishy-norbert-block" ? squishyNorbertBlockDimensions(stationObjectFace(object))
                  : object.assetId === "small-green-norbert-block" ? smallGreenNorbertBlockDimensions(stationObjectFace(object))
                    : object.assetId === "pbar-block" ? pbarBlockDimensions(stationObjectFace(object))
            : halfBlockDimensions(stationObjectFace(object));
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, dimensions, { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "pink-beam-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, pinkBeamMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "cartwheel-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, cartwheelMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "stairs") {
    const sprite = stairsSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull(sprite.surfaces.flatMap((surface) => surface.points)).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "velcro-beam") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, velcroBeamDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "sting-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, stingMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "gym-nova-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, gymNovaMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "teddy-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, teddyMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "hand-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, handMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "cloud-mat") {
    const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, cloudMatDimensions(stationObjectFace(object)), { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "springboard") {
    const sprite = springboardSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull(sprite.flatMap((surface) => surface.points)).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "preschool-springboard") {
    const sprite = preschoolSpringboardSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.surfaces.flatMap((surface) => surface.points), ...sprite.springs.flat(), ...sprite.purpleFootprints.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "t-trainer") {
    const sprite = tTrainerSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.railFaces.flat(), ...sprite.runwaySides.flat(), ...sprite.trampoline]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && (object.assetId === "mail-box" || object.assetId === "green-mail-box")) {
    const sprite = object.assetId === "green-mail-box"
      ? greenMailBoxSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height })
      : mailBoxSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.redFaces.flat(), ...sprite.yellowEndCaps.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "colt") {
    const sprite = coltSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.grayBaseFaces.flat(), ...sprite.caramelRoofFaces.flat(), ...sprite.grayEndFaces.flat(), ...sprite.caramelEndFaces.flat(), ...sprite.blackHandleBases.flat(), ...sprite.tanHandleBars.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "parallette") {
    const sprite = paralletteSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.barFaces.flat(), ...sprite.supportFaces.flat(), ...sprite.barEndFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "mini-low-bar") {
    const sprite = miniLowBarSpriteGeometry(object.rotation, object.elevation ?? 0, miniLowBarHeight(object), { width: object.width, height: object.height });
    return convexHull([...sprite.railFaces.flat(), ...sprite.baseFaces.flat(), ...sprite.supportFaces.flat(), ...sprite.railEndFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "rec-mini-bar") {
    const sprite = recMiniBarSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.tanRailFaces.flat(), ...sprite.tanRailEnds.flat(), ...sprite.blueBaseFaces.flat(), ...sprite.bluePostFaces.flat(), ...sprite.silverUpperFaces.flat(), ...sprite.blackElbowFaces.flat(), ...sprite.blackKnobs.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "advanced-mini-bar") {
    const sprite = advancedMiniBarSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.tanRailFaces.flat(), ...sprite.tanRailEnds.flat(), ...sprite.orangeBaseFaces.flat(), ...sprite.orangePostFaces.flat(), ...sprite.silverSupportFaces.flat(), ...sprite.greenMountFaces.flat(), ...sprite.blackKnobs.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "traffic-cone") {
    const sprite = trafficConeSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.orangeBaseFaces.flat(), ...sprite.orangeConeFaces.flat(), ...sprite.orangeTip]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "target-marker") {
    const sprite = targetMarkerSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.yellowTop, ...sprite.yellowSides.flat(), ...sprite.redTarget]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "beanbag") {
    const sprite = beanbagSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.center, ...sprite.slopes.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "rainbow-mat") {
    const sprite = rainbowMatSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.blueOuterFaces.flat(), ...sprite.cyanEndFaces.flat(), ...sprite.yellowEndFaces.flat(), ...sprite.redInnerFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "pac-man") {
    const sprite = pacManSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return [...sprite.redCurvedSides.flat(), ...sprite.redCutoutSides.flat(), ...sprite.yellowTop].map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "trapeze") {
    const sprite = trapezeSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.barFaces.flat(), ...sprite.barEndCaps.flat(), ...sprite.straps.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "pvc-pipe") {
    const sprite = pvcPipeSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.lateralFaces.flat(), ...sprite.endCaps.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "small-bar-pad") {
    const sprite = smallBarPadSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.lateralFaces.flat(), ...sprite.endCaps.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "rolling-bar") {
    const sprite = rollingBarSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.redBarFaces.flat(), ...sprite.blueWheelFaces.flat(), ...sprite.blueWheelEnds.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "wooden-climbing-ladder") {
    const sprite = woodenClimbingLadderSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.railTops.flat(), ...sprite.railSides.flat(), ...sprite.rungTops.flat(), ...sprite.rungSides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "bose-ball") {
    const sprite = boseBallSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.rimTopFaces.flat(), ...sprite.rimSideFaces.flat(), ...sprite.domeFaces.flat(), ...sprite.gripRibs.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "foam-roller") {
    const sprite = foamRollerSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.sideFaces.flat(), ...sprite.endCaps.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "chalk-bucket") {
    const sprite = chalkBucketSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.chalkTop, ...sprite.coloredSides.flat(), ...sprite.rimSides.flat(), ...sprite.handle]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "yoga-ball") {
    const sprite = yogaBallSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull(sprite.facets.flat()).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "vault-trainer") {
    const sprite = vaultTrainerSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.blueFaces.flat(), ...sprite.tanTopFaces.flat(), ...sprite.blackHandles.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "big-boulder") {
    const sprite = bigBoulderSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.redCurvedFaces.flat(), ...sprite.yellowFlatFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "medium-boulder") {
    const sprite = mediumBoulderSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.redCurvedFaces.flat(), ...sprite.yellowFlatFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "small-boulder") {
    const sprite = smallBoulderSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.redCurvedFaces.flat(), ...sprite.yellowFlatFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "small-semicircle") {
    const sprite = smallSemicircleSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.blueCurvedFaces.flat(), ...sprite.yellowFlatFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "mini-mushroom") {
    const sprite = miniMushroomSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.blueSides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "floor-mushroom") {
    const sprite = floorMushroomSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.top, ...sprite.blueSides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "mushroom-mat") {
    const sprite = mushroomMatSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.flange, ...sprite.top, ...sprite.bodySides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "cylinder") {
    const sprite = cylinderSpriteGeometry(stationObjectFace(object), object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.blueCurvedFaces.flat(), ...sprite.yellowFlatFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && (object.assetId === "red-trapezoid" || object.assetId === "yellow-trapezoid" || object.assetId === "green-trapezoid")) {
    const sprite = trapezoidMatSpriteGeometry(object.assetId, stationObjectFace(object), object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull(sprite.flatMap((surface) => surface.points)).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && (object.assetId === "big-octagon" || object.assetId === "medium-octagon" || object.assetId === "small-octagon")) {
    const sprite = stationOctagonSpriteGeometry(object.assetId, stationObjectFace(object), object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull([...sprite.outerFaces.flat(), ...sprite.endFaces.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && isCheeseMatAsset(object.assetId)) {
    if (isFoldableCheeseMatAsset(object.assetId) && cheeseMatState(object) === "closed") {
      const sprite = stationCuboidSpriteGeometry(object.rotation, object.elevation ?? 0, foldedCheeseMatFaceDimensions(object.assetId, stationObjectFace(object)), { width: object.width, height: object.height });
      return convexHull([...sprite.top, ...sprite.sides.flat()]).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
    }
    const sprite = stationCheeseMatSpriteGeometry(object.assetId, stationObjectFace(object), object.rotation, object.elevation ?? 0, { width: object.width, height: object.height }, object.smallCheeseMatColor ?? "orange-purple");
    return convexHull(sprite.flatMap((surface) => surface.points)).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  if (object.kind === "equipment" && object.assetId === "bungee") {
    const sprite = bungeeLoopSpriteGeometry(object.rotation, object.elevation ?? 0, { width: object.width, height: object.height });
    return convexHull(sprite.loop).map((point) => ({ x: object.x + point.x, y: object.y + point.y }));
  }
  return stationObjectCorners(object);
}

/** The real on-floor support footprint; raised 2.5D faces and shadows do not block nearby equipment. */
export function stationObjectFloorFootprint(object: StationObject): StationPoint[] {
  const current = normalizeStationObjectDimensions(object);
  if (current !== object) return stationObjectFloorFootprint(current);
  if (object.kind !== "equipment") return stationObjectCorners(object);
  if (isFoldableCheeseMatAsset(object.assetId) && cheeseMatState(object) === "closed") {
    const dimensions = foldedCheeseMatFaceDimensions(object.assetId, stationObjectFace(object));
    return stationFloorRectangle(object, 0, 0, dimensions.widthInches, dimensions.depthInches);
  }
  if (object.assetId === "mat-placeholder") return matPlaceholderFootprint(object);
  if (object.assetId === "wooden-climbing-ladder") return convexHull(woodenClimbingLadderFloorFootprints(object).flat());
  if (object.assetId === "rec-mini-bar") return convexHull(recMiniBarFloorFootprints(object).flat());
  if (object.assetId === "advanced-mini-bar") return convexHull(advancedMiniBarFloorFootprints(object).flat());
  if (object.assetId === "rainbow-mat") return convexHull(rainbowMatFloorFootprints(object).flat());
  if (object.assetId === "pac-man") return pacManFloorOutline(object);
  if (object.assetId === "trapeze") {
    const radians = snapStationRotation(object.rotation) * Math.PI / 180;
    const cos = Math.cos(radians); const sin = Math.sin(radians);
    const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
      const localX = x * TRAPEZE_BAR_LENGTH_INCHES / 2; const localY = y * TRAPEZE_BAR_THICKNESS_INCHES / 2;
      const rotatedX = localX * cos - localY * sin; const rotatedY = localX * sin + localY * cos;
      return { x: center.x + rotatedX * 1.15 - rotatedY * .48, y: center.y + rotatedY * .92 };
    });
  }
  if (object.assetId === "cylinder") return cylinderFloorFootprint(object);
  if (object.assetId === "mini-mushroom" || object.assetId === "floor-mushroom" || object.assetId === "mushroom-mat" || object.assetId === "bose-ball" || object.assetId === "chalk-bucket" || object.assetId === "yoga-ball" || object.assetId === "target-marker") {
    const radius = object.assetId === "mini-mushroom" ? MINI_MUSHROOM_RADIUS_INCHES : object.assetId === "floor-mushroom" ? FLOOR_MUSHROOM_RADIUS_INCHES : object.assetId === "mushroom-mat" ? MUSHROOM_MAT_RADIUS_INCHES : object.assetId === "bose-ball" ? BOSE_BALL_RADIUS_INCHES : object.assetId === "chalk-bucket" ? CHALK_BUCKET_RADIUS_INCHES : object.assetId === "target-marker" ? TARGET_MARKER_RADIUS_INCHES : YOGA_BALL_RADIUS_INCHES;
    const segments = object.assetId === "mini-mushroom" ? MINI_MUSHROOM_SEGMENTS : object.assetId === "floor-mushroom" ? FLOOR_MUSHROOM_SEGMENTS : object.assetId === "mushroom-mat" ? MUSHROOM_MAT_SEGMENTS : object.assetId === "bose-ball" ? BOSE_BALL_SEGMENTS : object.assetId === "chalk-bucket" ? CHALK_BUCKET_SEGMENTS : object.assetId === "target-marker" ? TARGET_MARKER_SEGMENTS : YOGA_BALL_SEGMENTS;
    const radians = snapStationRotation(object.rotation) * Math.PI / 180;
    const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
    return Array.from({ length: segments }, (_, index) => {
      const angle = Math.PI * 2 * index / segments;
      const localX = radius * Math.cos(angle);
      const localY = radius * Math.sin(angle);
      const rotatedX = localX * Math.cos(radians) - localY * Math.sin(radians);
      const rotatedY = localX * Math.sin(radians) + localY * Math.cos(radians);
      return { x: center.x + rotatedX * 1.15 - rotatedY * .48, y: center.y + rotatedY * .92 };
    });
  }
  const radians = snapStationRotation(object.rotation) * Math.PI / 180;
  const cos = Math.cos(radians); const sin = Math.sin(radians);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
    const localX = x * object.width / 4; const localY = y * object.height / 4;
    const rotatedX = localX * cos - localY * sin; const rotatedY = localX * sin + localY * cos;
    return { x: center.x + rotatedX * 1.15 - rotatedY * .48, y: center.y + rotatedY * .92 };
  });
}

function stationFloorRectangle(object: StationObject, centerX: number, centerY: number, widthInches: number, depthInches: number): StationPoint[] {
  const radians = snapStationRotation(object.rotation) * Math.PI / 180;
  const cos = Math.cos(radians); const sin = Math.sin(radians);
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
    const localX = centerX + x * widthInches / 2; const localY = centerY + y * depthInches / 2;
    const rotatedX = localX * cos - localY * sin; const rotatedY = localX * sin + localY * cos;
    return { x: center.x + rotatedX * 1.15 - rotatedY * .48, y: center.y + rotatedY * .92 };
  });
}

/** A solid Cylinder uses a circular upright support and a capsule-shaped side support. */
function cylinderFloorFootprint(object: StationObject): StationPoint[] {
  const face = stationObjectFace(object);
  const localPoints: readonly [number, number][] = face === 0
    ? Array.from({ length: CYLINDER_SEGMENTS }, (_, index) => {
      const angle = Math.PI * 2 * index / CYLINDER_SEGMENTS;
      return [CYLINDER_RADIUS_INCHES * Math.cos(angle), CYLINDER_RADIUS_INCHES * Math.sin(angle)] as const;
    })
    : [
      ...Array.from({ length: CYLINDER_SEGMENTS / 2 + 1 }, (_, index) => {
        const angle = -Math.PI / 2 + Math.PI * index / (CYLINDER_SEGMENTS / 2);
        return [CYLINDER_HEIGHT_INCHES / 2 - CYLINDER_RADIUS_INCHES + CYLINDER_RADIUS_INCHES * Math.cos(angle), CYLINDER_RADIUS_INCHES * Math.sin(angle)] as const;
      }),
      ...Array.from({ length: CYLINDER_SEGMENTS / 2 + 1 }, (_, index) => {
        const angle = Math.PI / 2 + Math.PI * index / (CYLINDER_SEGMENTS / 2);
        return [-CYLINDER_HEIGHT_INCHES / 2 + CYLINDER_RADIUS_INCHES + CYLINDER_RADIUS_INCHES * Math.cos(angle), CYLINDER_RADIUS_INCHES * Math.sin(angle)] as const;
      }),
    ];
  const radians = snapStationRotation(object.rotation) * Math.PI / 180;
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  return localPoints.map(([localX, localY]) => {
    const rotatedX = localX * Math.cos(radians) - localY * Math.sin(radians);
    const rotatedY = localX * Math.sin(radians) + localY * Math.cos(radians);
    return { x: center.x + rotatedX * 1.15 - rotatedY * .48, y: center.y + rotatedY * .92 };
  });
}

/** Separate support polygons keep the ladder's eight open spaces free for placement and collision. */
export function woodenClimbingLadderFloorFootprints(object: StationObject): StationPoint[][] {
  if (object.kind !== "equipment" || object.assetId !== "wooden-climbing-ladder") return [];
  const railCenter = WOODEN_CLIMBING_LADDER_WIDTH_INCHES / 2 - WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES / 2;
  const innerWidth = WOODEN_CLIMBING_LADDER_WIDTH_INCHES - WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES * 2;
  return [
    ...[-1, 1].map((side) => stationFloorRectangle(object, 0, side * railCenter, WOODEN_CLIMBING_LADDER_LENGTH_INCHES, WOODEN_CLIMBING_LADDER_RAIL_WIDTH_INCHES)),
    ...woodenClimbingLadderRungCenters().map((x) => stationFloorRectangle(object, x, 0, WOODEN_CLIMBING_LADDER_RUNG_WIDTH_INCHES, innerWidth)),
  ];
}

/** The two freestanding T feet are the Advanced Mini Bar's only floor contact points. */
export function advancedMiniBarFloorFootprints(object: StationObject): StationPoint[][] {
  if (object.kind !== "equipment" || object.assetId !== "advanced-mini-bar") return [];
  const supportOffset = ADVANCED_MINI_BAR_LENGTH_INCHES / 2 * .86;
  return [-supportOffset, supportOffset].map((x) => stationFloorRectangle(object, x, 0, 4, ADVANCED_MINI_BAR_BASE_DEPTH_INCHES));
}

/** The Rec Mini Bar's two blue T feet preserve its open under-bar floor space. */
export function recMiniBarFloorFootprints(object: StationObject): StationPoint[][] {
  if (object.kind !== "equipment" || object.assetId !== "rec-mini-bar") return [];
  const supportOffset = REC_MINI_BAR_LENGTH_INCHES / 2 * .86;
  return [-supportOffset, supportOffset].map((x) => stationFloorRectangle(object, x, 0, 4, REC_MINI_BAR_BASE_DEPTH_INCHES));
}

/** Two flat foot strips retain the Rainbow Mat's two-foot arch opening for collision. */
export function rainbowMatFloorFootprints(object: StationObject): StationPoint[][] {
  if (object.kind !== "equipment" || object.assetId !== "rainbow-mat") return [];
  const footDepth = RAINBOW_MAT_RADIUS_INCHES - RAINBOW_MAT_CUTOUT_RADIUS_INCHES;
  const footCenter = RAINBOW_MAT_CUTOUT_RADIUS_INCHES + footDepth / 2;
  return [-footCenter, footCenter].map((y) => stationFloorRectangle(object, 0, y, RAINBOW_MAT_DEPTH_INCHES, footDepth));
}

function pacManArcPoint(index: number): readonly [number, number] {
  const angle = Math.PI / 4 + Math.PI * 1.5 * index / PAC_MAN_CURVE_SEGMENTS;
  return [PAC_MAN_RADIUS_INCHES * Math.cos(angle), PAC_MAN_RADIUS_INCHES * Math.sin(angle)];
}

function pacManFloorPoint(object: StationObject, localX: number, localY: number): StationPoint {
  const radians = snapStationRotation(object.rotation) * Math.PI / 180;
  const center = { x: object.x + object.width / 2, y: object.y + object.height / 2 };
  const rotatedX = localX * Math.cos(radians) - localY * Math.sin(radians);
  const rotatedY = localX * Math.sin(radians) + localY * Math.cos(radians);
  return { x: center.x + rotatedX * 1.15 - rotatedY * .48, y: center.y + rotatedY * .92 };
}

/** The concave visual outline of the upright 270-degree cylinder. */
function pacManFloorOutline(object: StationObject): StationPoint[] {
  return [pacManFloorPoint(object, 0, 0), ...Array.from({ length: PAC_MAN_CURVE_SEGMENTS + 1 }, (_, index) => {
    const [x, y] = pacManArcPoint(index);
    return pacManFloorPoint(object, x, y);
  })];
}

/** Three convex 90-degree sectors keep the Pac-Man mouth completely open for collision. */
export function pacManFloorFootprints(object: StationObject): StationPoint[][] {
  if (object.kind !== "equipment" || object.assetId !== "pac-man") return [];
  const segmentCount = PAC_MAN_CURVE_SEGMENTS / 3;
  return Array.from({ length: 3 }, (_, sector) => [
    pacManFloorPoint(object, 0, 0),
    ...Array.from({ length: segmentCount + 1 }, (_, index) => {
      const [x, y] = pacManArcPoint(sector * segmentCount + index);
      return pacManFloorPoint(object, x, y);
    }),
  ]);
}

/** The real support polygons beneath an object. Most equipment is solid; ladders and bars preserve their open spaces. */
export function stationObjectFloorFootprints(object: StationObject): StationPoint[][] {
  const current = normalizeStationObjectDimensions(object);
  if (current !== object) return stationObjectFloorFootprints(current);
  if (current.kind !== "equipment") return [stationObjectFloorFootprint(current)];
  if (current.assetId === "wooden-climbing-ladder") return woodenClimbingLadderFloorFootprints(current);
  if (current.assetId === "rec-mini-bar") return recMiniBarFloorFootprints(current);
  if (current.assetId === "advanced-mini-bar") return advancedMiniBarFloorFootprints(current);
  if (current.assetId === "rainbow-mat") return rainbowMatFloorFootprints(current);
  if (current.assetId === "pac-man") return pacManFloorFootprints(current);
  return [stationObjectFloorFootprint(current)];
}

function projectionsOverlap(first: readonly StationPoint[], second: readonly StationPoint[], axis: StationPoint): boolean {
  const project = (points: readonly StationPoint[]) => points.map((point) => point.x * axis.x + point.y * axis.y);
  const firstProjection = project(first); const secondProjection = project(second);
  return Math.max(...firstProjection) > Math.min(...secondProjection) + .000001 && Math.max(...secondProjection) > Math.min(...firstProjection) + .000001;
}

function polygonAxes(points: readonly StationPoint[]): StationPoint[] {
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return { x: -(next.y - point.y), y: next.x - point.x };
  });
}

export function stationObjectVerticalRange(object: StationObject) {
  const current = normalizeStationObjectDimensions(object);
  if (current !== object) return stationObjectVerticalRange(current);
  const base = object.elevation ?? 0;
  const height = object.kind === "equipment" && object.assetId === "panel"
    ? panelMatState(object) === "closed" ? PANEL_MAT_FOLDED_HEIGHT : STATION_STACK_STEP
    : object.kind === "equipment" && object.assetId === "five-panel"
      ? panelMatState(object) === "closed" ? FIVE_PANEL_MAT_FOLDED_HEIGHT : FIVE_PANEL_MAT_PANEL_HEIGHT
      : object.kind === "equipment" && object.assetId === "six-panel"
        ? panelMatState(object) === "closed" ? SIX_PANEL_MAT_FOLDED_HEIGHT : SIX_PANEL_MAT_PANEL_HEIGHT
      : object.kind === "equipment" && object.assetId === "big-block"
      ? bigBlockVerticalHeight(bigBlockSide(object))
      : object.kind === "equipment" && object.assetId === "blue-resi"
        ? cuboidVerticalHeight(blueResiDimensions(stationObjectFace(object)))
      : object.kind === "equipment" && object.assetId === "mini-resi"
        ? cuboidVerticalHeight(miniResiDimensions(stationObjectFace(object)))
      : object.kind === "equipment" && isStripedResiAsset(object.assetId)
        ? cuboidVerticalHeight(stripedResiDimensions(object.assetId, stationObjectFace(object)))
      : object.kind === "equipment" && object.assetId === "red-norbert-block"
        ? cuboidVerticalHeight(redNorbertBlockDimensions(stationObjectFace(object)))
      : object.kind === "equipment" && object.assetId === "blue-norbert-block"
        ? blueNorbertBlockVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "green-norbert-block"
        ? greenNorbertBlockVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "mini-red-norbert-block"
        ? miniRedNorbertBlockVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "squishy-norbert-block"
        ? squishyNorbertBlockVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "small-green-norbert-block"
        ? smallGreenNorbertBlockVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "pink-beam-mat"
        ? pinkBeamMatVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "cartwheel-mat"
        ? cartwheelMatVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "stairs"
        ? stairsVerticalHeight()
      : object.kind === "equipment" && object.assetId === "velcro-beam"
        ? velcroBeamVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "sting-mat"
        ? stingMatVerticalHeight(stationObjectFace(object))
      : object.kind === "equipment" && object.assetId === "gym-nova-mat"
        ? gymNovaMatVerticalHeight(stationObjectFace(object))
        : object.kind === "equipment" && object.assetId === "teddy-mat"
          ? teddyMatVerticalHeight(stationObjectFace(object))
        : object.kind === "equipment" && object.assetId === "hand-mat"
          ? handMatVerticalHeight(stationObjectFace(object))
        : object.kind === "equipment" && object.assetId === "pbar-block"
          ? cuboidVerticalHeight(pbarBlockDimensions(stationObjectFace(object)))
          : object.kind === "equipment" && object.assetId === "half-block"
            ? cuboidVerticalHeight(halfBlockDimensions(stationObjectFace(object)))
            : object.kind === "equipment" && object.assetId === "cloud-mat"
              ? cuboidVerticalHeight(cloudMatDimensions(stationObjectFace(object)))
            : object.kind === "equipment" && object.assetId === "springboard"
              ? springboardVerticalHeight()
              : object.kind === "equipment" && object.assetId === "preschool-springboard"
                ? preschoolSpringboardVerticalHeight()
              : object.kind === "equipment" && object.assetId === "t-trainer"
                ? tTrainerVerticalHeight()
                : object.kind === "equipment" && object.assetId === "mail-box"
                  ? mailBoxVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "green-mail-box"
                    ? greenMailBoxVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "colt"
                    ? coltVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "parallette"
                    ? paralletteVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "mini-low-bar"
                    ? miniLowBarVerticalHeight(miniLowBarHeight(object))
                  : object.kind === "equipment" && object.assetId === "rec-mini-bar"
                    ? recMiniBarVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "advanced-mini-bar"
                    ? advancedMiniBarVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "traffic-cone"
                    ? trafficConeVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "target-marker"
                    ? targetMarkerVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "beanbag"
                    ? beanbagVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "rainbow-mat"
                    ? rainbowMatVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "pac-man"
                    ? pacManVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "trapeze"
                    ? trapezeVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "pvc-pipe"
                    ? pvcPipeVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "small-bar-pad"
                    ? smallBarPadVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "rolling-bar"
                    ? rollingBarVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "wooden-climbing-ladder"
                    ? woodenClimbingLadderVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "bose-ball"
                    ? boseBallVerticalHeight()
                  : object.kind === "equipment" && object.assetId === "foam-roller"
                    ? foamRollerVerticalHeight()
                    : object.kind === "equipment" && object.assetId === "chalk-bucket"
                      ? chalkBucketVerticalHeight()
                    : object.kind === "equipment" && object.assetId === "yoga-ball"
                      ? yogaBallVerticalHeight()
                    : object.kind === "equipment" && object.assetId === "vault-trainer"
                      ? vaultTrainerVerticalHeight()
                      : object.kind === "equipment" && object.assetId === "big-boulder"
                        ? bigBoulderVerticalHeight()
                        : object.kind === "equipment" && object.assetId === "medium-boulder"
                          ? mediumBoulderVerticalHeight()
                          : object.kind === "equipment" && object.assetId === "small-boulder"
                            ? smallBoulderVerticalHeight()
                            : object.kind === "equipment" && object.assetId === "small-semicircle"
                              ? smallSemicircleVerticalHeight()
                            : object.kind === "equipment" && object.assetId === "mini-mushroom"
                              ? miniMushroomVerticalHeight()
                              : object.kind === "equipment" && object.assetId === "floor-mushroom"
                                ? floorMushroomVerticalHeight()
                              : object.kind === "equipment" && object.assetId === "mushroom-mat"
                                ? mushroomMatVerticalHeight()
                                : object.kind === "equipment" && object.assetId === "cylinder"
                                  ? cylinderVerticalHeight(stationObjectFace(object))
                      : object.kind === "equipment" && (object.assetId === "red-trapezoid" || object.assetId === "yellow-trapezoid" || object.assetId === "green-trapezoid")
                        ? trapezoidMatVerticalHeight(object.assetId, stationObjectFace(object))
                  : object.kind === "equipment" && (object.assetId === "big-octagon" || object.assetId === "medium-octagon" || object.assetId === "small-octagon")
                ? cuboidVerticalHeight(octagonFaceDimensions(object.assetId, stationObjectFace(object)))
                : object.kind === "equipment" && isCheeseMatAsset(object.assetId)
                  ? cuboidVerticalHeight(isFoldableCheeseMatAsset(object.assetId) && cheeseMatState(object) === "closed" ? foldedCheeseMatFaceDimensions(object.assetId, stationObjectFace(object)) : cheeseMatFaceDimensions(object.assetId, stationObjectFace(object)))
                  : STATION_STACK_STEP;
  return { base, top: base + height };
}

/** True when two physical floor footprints overlap at the same height; edge-to-edge contact is allowed. */
export function stationObjectsOverlap(first: StationObject, second: StationObject): boolean {
  const firstHeight = stationObjectVerticalRange(first); const secondHeight = stationObjectVerticalRange(second);
  const overlapVertically = firstHeight.top > secondHeight.base + .000001 && secondHeight.top > firstHeight.base + .000001;
  if (!overlapVertically) return false;
  return stationObjectFloorFootprints(first).some((firstFootprint) => stationObjectFloorFootprints(second).some((secondFootprint) =>
    [...polygonAxes(firstFootprint), ...polygonAxes(secondFootprint)].every((axis) => projectionsOverlap(firstFootprint, secondFootprint, axis))
  ));
}

/** Keeps visible pixels inside the board while checking each piece's real floor footprint against occupied equipment. */
export function canPlaceStationObject(object: StationObject, occupied: readonly StationObject[]): boolean {
  const insideBoard = stationObjectFootprint(object).every((point) => point.x >= 0 && point.y >= 0 && point.x <= STATION_CANVAS.width && point.y <= STATION_CANVAS.height);
  return insideBoard && !occupied.some((other) => stationObjectsOverlap(object, other));
}

/**
 * Places an equipment piece at its requested board position, lifting it onto
 * the highest overlapping support when that position is already occupied.
 * A move that cannot fit on the board or clear the stack remains rejected.
 */
export function autoStackStationObject(object: StationObject, occupied: readonly StationObject[]): StationObject | null {
  if (object.kind !== "equipment") return canPlaceStationObject(object, occupied) ? object : null;
  let candidate = object;
  for (let level = 0; level <= occupied.length; level += 1) {
    const collisions = occupied.filter((other) => stationObjectsOverlap(candidate, other));
    if (!collisions.length) return canPlaceStationObject(candidate, occupied) ? candidate : null;
    const nextElevation = Math.max(candidate.elevation ?? 0, ...collisions.map((other) => stationObjectVerticalRange(other).top));
    if (nextElevation <= (candidate.elevation ?? 0) + .000001) return null;
    candidate = { ...candidate, elevation: nextElevation };
  }
  return null;
}

export function stationSetupCropBounds(setup: StationSetup): StationCrop {
  return setup.crop ?? { x: 0, y: 0, width: STATION_CANVAS.width, height: STATION_CANVAS.height };
}

/** Tightens the saved 3:2 preview frame around visible station pieces with one grid square of breathing room. */
export function cropStationSetupToContent(setup: StationSetup): StationSetup {
  const footprint = setup.objects.flatMap(stationObjectFootprint);
  if (!footprint.length) return setup;
  const padding = STATION_CANVAS.grid;
  const minX = Math.min(...footprint.map((point) => point.x)); const maxX = Math.max(...footprint.map((point) => point.x));
  const minY = Math.min(...footprint.map((point) => point.y)); const maxY = Math.max(...footprint.map((point) => point.y));
  const scale = Math.min(1, Math.max((maxX - minX + padding * 2) / STATION_CANVAS.width, (maxY - minY + padding * 2) / STATION_CANVAS.height));
  const width = Number((STATION_CANVAS.width * scale).toFixed(6)); const height = Number((STATION_CANVAS.height * scale).toFixed(6));
  const x = Number(Math.max(0, Math.min(STATION_CANVAS.width - width, (minX + maxX) / 2 - width / 2)).toFixed(6));
  const y = Number(Math.max(0, Math.min(STATION_CANVAS.height - height, (minY + maxY) / 2 - height / 2)).toFixed(6));
  return { ...setup, crop: { x, y, width, height } };
}

export function clearStationSetupCrop(setup: StationSetup): StationSetup {
  if (!setup.crop) return setup;
  const { crop: _crop, ...uncropped } = setup;
  return uncropped;
}

export function isStationSetup(value: unknown): value is StationSetup {
  if (!value || typeof value !== "object") return false;
  const setup = value as Partial<StationSetup>;
  return typeof setup.id === "string" && (setup.version === STATION_SETUP_VERSION || setup.version === LEGACY_STATION_SETUP_VERSION)
    && Array.isArray(setup.objects)
    && (setup.crop === undefined || (typeof setup.crop === "object" && setup.crop !== null && Number.isFinite(setup.crop.x) && Number.isFinite(setup.crop.y) && Number.isFinite(setup.crop.width) && Number.isFinite(setup.crop.height)
      && setup.crop.x >= 0 && setup.crop.y >= 0 && setup.crop.width > 0 && setup.crop.height > 0 && setup.crop.x + setup.crop.width <= STATION_CANVAS.width && setup.crop.y + setup.crop.height <= STATION_CANVAS.height))
    && setup.objects.every((object) => object && typeof object.id === "string" && typeof object.kind === "string"
      && Number.isFinite(object.x) && Number.isFinite(object.y) && Number.isFinite(object.width) && Number.isFinite(object.height)
      && Number.isFinite(object.rotation) && (object.elevation === undefined || Number.isFinite(object.elevation))
      && (object.panelState === undefined || object.panelState === "open" || object.panelState === "closed")
      && (object.cheeseMatState === undefined || object.cheeseMatState === "open" || object.cheeseMatState === "closed")
      && isPanelMatColorwayAllowed(object.assetId as StationAssetId | undefined, object.panelMatColorway as PanelMatColorway | undefined)
      && (object.bigBlockSide === undefined || Number.isInteger(object.bigBlockSide) && object.bigBlockSide >= 0 && object.bigBlockSide < BIG_BLOCK_SIDES.length)
      && (object.bigBlockColor === undefined || BIG_BLOCK_COLORS.includes(object.bigBlockColor as BigBlockColor))
      && (object.halfBlockColor === undefined || HALF_BLOCK_COLORS.includes(object.halfBlockColor as HalfBlockColor))
      && (object.smallCheeseMatColor === undefined || SMALL_CHEESE_MAT_COLORS.includes(object.smallCheeseMatColor as SmallCheeseMatColor))
      && (object.squishyNorbertBlockColor === undefined || SQUISHY_NORBERT_BLOCK_COLORS.includes(object.squishyNorbertBlockColor as SquishyNorbertBlockColor))
      && (object.cartwheelMatColor === undefined || CARTWHEEL_MAT_COLORS.includes(object.cartwheelMatColor as CartwheelMatColor))
      && (object.fourInchResiColor === undefined || FOUR_INCH_RESI_COLORS.includes(object.fourInchResiColor as FourInchResiColor))
      && (object.velcroBeamColor === undefined || VELCRO_BEAM_COLORS.includes(object.velcroBeamColor as VelcroBeamColor))
      && (object.bungeeColor === undefined || BUNGEE_COLORS.includes(object.bungeeColor as BungeeColor))
      && (object.chalkBucketColor === undefined || CHALK_BUCKET_COLORS.includes(object.chalkBucketColor as ChalkBucketColor))
      && (object.miniLowBarBaseColor === undefined || MINI_LOW_BAR_BASE_COLORS.includes(object.miniLowBarBaseColor as MiniLowBarBaseColor))
      && (object.miniLowBarHeightInches === undefined || MINI_LOW_BAR_HEIGHTS_INCHES.includes(object.miniLowBarHeightInches as MiniLowBarHeightInches))
      && (object.mushroomMatColor === undefined || MUSHROOM_MAT_COLORS.includes(object.mushroomMatColor as MushroomMatColor))
      && (object.foamRollerEndColor === undefined || FOAM_ROLLER_END_COLORS.includes(object.foamRollerEndColor as FoamRollerEndColor))
      && (object.yogaBallColor === undefined || YOGA_BALL_COLORS.includes(object.yogaBallColor as YogaBallColor))
      && (object.missingMatLabel === undefined || typeof object.missingMatLabel === "string" && object.missingMatLabel.length <= 40)
      && (object.matPlaceholderShape === undefined || MAT_PLACEHOLDER_SHAPES.includes(object.matPlaceholderShape as MatPlaceholderShape))
      && (object.face === undefined || Number.isInteger(object.face) && object.face >= 0 && object.face < ((object.assetId as string | undefined) === "blue-half-block" ? 6 : stationAssetFaceCount(object.assetId as StationAssetId | undefined)))
      && Number.isFinite(object.zIndex));
}

export function isStationSetupSaveable(setup: StationSetup): boolean {
  return setup.objects.length > 0 && isStationSetup(setup);
}

const DATABASE_NAME = "gym-lesson-planner-local-stations";
const STORE_NAME = "stationSetups";

/** Creates a detached snapshot for exports, edits, and local persistence. */
export function copyStationSetup(setup: StationSetup): StationSetup {
  return JSON.parse(JSON.stringify(setup)) as StationSetup;
}

/** Accepts the current pixel-station document format used by this release. */
export function migrateStationSetup(value: unknown): StationSetup | null {
  if (!isStationSetup(value)) return null;
  // Public-library and planner backups retain their original v1 coordinates;
  // the editor normalizes a legacy station only when it opens one.
  return value.version === LEGACY_STATION_SETUP_VERSION ? copyStationSetup(value) : normalizeStationSetupDimensions(value);
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error("Station storage failed.")); });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error ?? new Error("Station storage failed.")); transaction.onabort = () => reject(transaction.error ?? new Error("Station storage stopped.")); });
}

async function database(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") throw new Error("This browser does not support local station storage.");
  // Keep the existing v2 store accessible for Pages users who have already
  // saved a station in their browser.
  const request = indexedDB.open(DATABASE_NAME, 2);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" }); };
  return requestResult(request);
}

export async function saveStationSetup(setup: StationSetup): Promise<void> {
  const current = normalizeStationSetupDimensions(setup);
  if (!isStationSetupSaveable(current)) throw new Error("Add at least one station object before saving.");
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).put(current); await transactionDone(tx); } finally { db.close(); }
}

export async function loadStationSetup(id: string): Promise<StationSetup | null> {
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readonly"); const value = await requestResult(tx.objectStore(STORE_NAME).get(id)); await transactionDone(tx); return migrateStationSetup(value); } finally { db.close(); }
}

/** Reads every valid local station for planner backup and export. */
export async function listStationSetups(): Promise<StationSetup[]> {
  const db = await database();
  try {
    const tx = db.transaction(STORE_NAME, "readonly");
    const values = await requestResult(tx.objectStore(STORE_NAME).getAll());
    await transactionDone(tx);
    return (values as unknown[]).flatMap((value) => {
      const setup = migrateStationSetup(value);
      return setup ? [setup] : [];
    });
  } finally { db.close(); }
}

/** Restores valid station snapshots without deleting unrelated saved stations. */
export async function restoreStationSetups(setups: readonly StationSetup[]): Promise<void> {
  const validated = setups.map(migrateStationSetup);
  if (validated.some((setup) => !setup)) throw new Error("One or more station layouts are invalid.");
  const db = await database();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    validated.forEach((setup) => store.put(copyStationSetup(setup!)));
    await transactionDone(tx);
  } finally { db.close(); }
}

export async function removeStationSetup(id: string): Promise<void> {
  const db = await database();
  try { const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).delete(id); await transactionDone(tx); } finally { db.close(); }
}
