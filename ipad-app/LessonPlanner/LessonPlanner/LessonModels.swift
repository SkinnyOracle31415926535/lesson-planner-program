//
//  LessonModels.swift
//  LessonPlanner
//

import Foundation

enum PlanningCardKind: String, CaseIterable, Identifiable, Codable {
    case skill = "SKILL"
    case drill = "DRILL"
    case routine = "ROUTINE"
    case warmUp = "WARM_UP"
    case activity = "ACTIVITY"
    case reference = "REFERENCE"

    var id: String { rawValue }
}

/// Library views are deliberately small, action-oriented shelves rather than
/// one giant unfiltered pile of ideas. A card can move into Recent only after
/// the coach explicitly completes a lesson that used its local snapshot.
enum LibraryScope: String, CaseIterable, Identifiable, Codable {
    case relevant = "RELEVANT"
    case recent = "RECENT"
    case archive = "ARCHIVE"

    var id: String { rawValue }

    var emptyState: String {
        switch self {
        case .relevant:
            return "No relevant ideas match these filters. Clear a filter or search."
        case .recent:
            return "Nothing has been completed yet. Finish a local lesson after placing snapshots and they will rise to the top here."
        case .archive:
            return "No archived ideas match these filters."
        }
    }
}

enum CardAccent: String, Codable {
    case cyan, green, yellow, pink
}

struct PlanningCard: Identifiable, Hashable, Codable {
    let id: String
    var kind: PlanningCardKind
    var title: String
    var detail: String
    var tags: [String]
    var accent: CardAccent
    /// Gems are an explicitly coach-controlled signal. They never change
    /// automatically based on an algorithm or import.
    var isGem: Bool
    var safetyRequirement: String?
    /// These metadata fields mirror the fuller Idea Library contract while
    /// retaining safe defaults for ideas saved by older prototype builds.
    var levels: [String]
    var skills: [String]
    var events: [String]
    var mats: [String]
    var variantCount: Int
    /// The native prototype has no private media importer yet. These flags
    /// are deliberately just truthful availability indicators, not stand-ins
    /// for actual photo or station data.
    var hasPhotoAttachment: Bool
    var hasStationSetup: Bool

    init(
        id: String,
        kind: PlanningCardKind,
        title: String,
        detail: String,
        tags: [String],
        accent: CardAccent? = nil,
        isGem: Bool,
        safetyRequirement: String?,
        levels: [String] = [],
        skills: [String] = [],
        events: [String] = [],
        mats: [String] = [],
        variantCount: Int = 1,
        hasPhotoAttachment: Bool = false,
        hasStationSetup: Bool = false
    ) {
        self.id = id
        self.kind = kind
        self.title = title
        self.detail = detail
        self.tags = tags
        self.accent = accent ?? kind.defaultAccent
        self.isGem = isGem
        self.safetyRequirement = safetyRequirement
        self.levels = levels.isEmpty ? Self.inferredLevels(from: tags) : levels
        self.skills = skills
        self.events = events
        self.mats = mats
        self.variantCount = max(1, variantCount)
        self.hasPhotoAttachment = hasPhotoAttachment
        self.hasStationSetup = hasStationSetup
    }

    private enum CodingKeys: String, CodingKey {
        case id, kind, title, detail, tags, accent, isGem, safetyRequirement
        case levels, skills, events, mats, variantCount, hasPhotoAttachment, hasStationSetup
    }

    /// Existing local lesson files predate the richer Idea Library fields.
    /// Decode them with conservative derived metadata rather than rejecting
    /// or rewriting a saved card merely because the app learned new fields.
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        kind = try container.decode(PlanningCardKind.self, forKey: .kind)
        title = try container.decode(String.self, forKey: .title)
        detail = try container.decode(String.self, forKey: .detail)
        tags = try container.decodeIfPresent([String].self, forKey: .tags) ?? []
        accent = try container.decodeIfPresent(CardAccent.self, forKey: .accent) ?? kind.defaultAccent
        isGem = try container.decodeIfPresent(Bool.self, forKey: .isGem) ?? false
        safetyRequirement = try container.decodeIfPresent(String.self, forKey: .safetyRequirement)
        levels = try container.decodeIfPresent([String].self, forKey: .levels)
            ?? Self.inferredLevels(from: tags)
        skills = try container.decodeIfPresent([String].self, forKey: .skills) ?? []
        events = try container.decodeIfPresent([String].self, forKey: .events) ?? []
        mats = try container.decodeIfPresent([String].self, forKey: .mats) ?? []
        variantCount = max(1, try container.decodeIfPresent(Int.self, forKey: .variantCount) ?? 1)
        hasPhotoAttachment = try container.decodeIfPresent(Bool.self, forKey: .hasPhotoAttachment) ?? false
        hasStationSetup = try container.decodeIfPresent(Bool.self, forKey: .hasStationSetup) ?? false
    }

    static func inferredLevels(from tags: [String]) -> [String] {
        tags.filter { tag in
            let uppercased = tag.uppercased()
            return uppercased.hasPrefix("L") && uppercased.dropFirst().first?.isNumber == true
        }
    }
}

extension PlanningCardKind {
    var defaultAccent: CardAccent {
        switch self {
        case .skill, .drill:
            return .cyan
        case .routine, .activity:
            return .green
        case .warmUp:
            return .pink
        case .reference:
            return .yellow
        }
    }
}

extension PlanningCard {
    /// These concise categories are intentionally derived from the tags in
    /// the small prototype catalog. A richer production importer can replace
    /// this with normalized event metadata without changing the UI contract.
    private var inferredLibraryEvent: String {
        let normalizedTags = tags.map { $0.uppercased() }
        if normalizedTags.contains(where: { $0.contains("HB") || $0.contains("PB") || $0.contains("BAR") }) {
            return "BARS"
        }
        if normalizedTags.contains(where: { $0.contains("TRAMP") || $0.contains("TUMBLE") || $0 == "TS" }) {
            return "TUMBLE"
        }
        if normalizedTags.contains(where: { $0.contains("FLOOR") || $0.contains("ROUNDOFF") }) {
            return "FLOOR"
        }
        if normalizedTags.contains(where: { $0.contains("VAULT") }) {
            return "VAULT"
        }
        return "GENERAL"
    }

    var libraryEvents: [String] {
        let explicitEvents = events
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).uppercased() }
            .filter { !$0.isEmpty }
        return explicitEvents.isEmpty ? [inferredLibraryEvent] : explicitEvents
    }

    var libraryEvent: String {
        libraryEvents.first ?? "GENERAL"
    }

    var libraryLevels: [String] {
        let explicitLevels = levels
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).uppercased() }
            .filter { !$0.isEmpty }
        let inferredLevels = Self.inferredLevels(from: tags).map { $0.uppercased() }
        let values = explicitLevels.isEmpty ? inferredLevels : explicitLevels
        return values.isEmpty ? ["ALL LEVELS"] : values
    }

    var libraryLevel: String {
        libraryLevels.first ?? "ALL LEVELS"
    }

    var mediaAndStationIndicator: String {
        switch (hasPhotoAttachment, hasStationSetup) {
        case (true, true):
            return "PHOTO + STATION SETUP"
        case (true, false):
            return "PHOTO ATTACHED"
        case (false, true):
            return "STATION SETUP SAVED"
        case (false, false):
            return "NO PHOTO OR STATION SETUP"
        }
    }

    func matchesLibrarySearch(_ query: String) -> Bool {
        let trimmedQuery = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedQuery.isEmpty else { return true }
        let searchableText = (
            [title, detail, kind.rawValue, libraryEvent, libraryLevel, safetyRequirement ?? ""]
                + tags + levels + skills + events + mats
        )
            .joined(separator: " ")
        return searchableText.localizedCaseInsensitiveContains(trimmedQuery)
    }
}

/// A rendering anchor for one compact placement label. The fallback values
/// keep the local demo usable before the owner-confirmed map bridge arrives;
/// persisted placements retain the durable `anchor-*` string, not a generic
/// visual slot, so later geometry can resolve the same saved choice.
struct LocalPanelAnchor: Identifiable, Hashable {
    let id: String
    let zoneID: String
    let shortName: String
    let relativeX: Double
    let relativeY: Double
}

enum LocalPanelAnchorCatalog {
    /// These are panel-local fallback positions only. They are intentionally
    /// separate from the eventual Skeleton Freeform geometry registry.
    private static let fallbackPositions: [(shortName: String, x: Double, y: Double)] = [
        ("A", 0.28, 0.20), ("B", 0.72, 0.20),
        ("C", 0.28, 0.50), ("D", 0.72, 0.50),
        ("E", 0.28, 0.79), ("F", 0.72, 0.79)
    ]

    static func anchors(forZoneID zoneID: String) -> [LocalPanelAnchor] {
        fallbackPositions.enumerated().map { index, position in
            LocalPanelAnchor(
                id: "anchor-\(durableZoneStem(for: zoneID))-\(String(format: "%02d", index + 1))",
                zoneID: zoneID,
                shortName: position.shortName,
                relativeX: position.x,
                relativeY: position.y
            )
        }
    }

    private static func durableZoneStem(for zoneID: String) -> String {
        switch zoneID {
        case "pb-hb": "parallel-bars-high-bar"
        case "ts": "tumble-strip"
        case "stap-bar": "strap-bar"
        default: zoneID
        }
    }
}

enum ZoneAnchorContentKind: String, Codable, Hashable {
    case idea = "IDEA"
    case text = "TEXT"
}

/// The small, tappable label shown on a station panel. Its full title and
/// detail stay local to the lesson and open in a detail sheet when tapped.
struct ZoneAnchorPlacement: Identifiable, Hashable, Codable {
    let id: String
    /// The durable map-anchor ID. It remains stable when a later geometry
    /// renderer replaces fallback panel positions with real map positions.
    let anchorID: String
    let contentKind: ZoneAnchorContentKind
    let shortLabel: String
    let title: String
    let detail: String
    let sourceCardID: String?
    let planningCardKind: PlanningCardKind?
    let tags: [String]
    let safetyRequirement: String?

    init(card: PlanningCard, anchorID: String) {
        id = "anchor-\(UUID().uuidString.lowercased())"
        self.anchorID = anchorID
        contentKind = .idea
        shortLabel = Self.compactLabel(card.title)
        title = card.title
        detail = card.detail
        sourceCardID = card.id
        planningCardKind = card.kind
        tags = card.tags
        safetyRequirement = card.safetyRequirement
    }

    init(text: String, anchorID: String) {
        let trimmedText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        id = "anchor-\(UUID().uuidString.lowercased())"
        self.anchorID = anchorID
        contentKind = .text
        shortLabel = Self.compactLabel(trimmedText)
        title = "Text item"
        detail = trimmedText
        sourceCardID = nil
        planningCardKind = nil
        tags = []
        safetyRequirement = nil
    }

    func moved(to anchorID: String) -> ZoneAnchorPlacement {
        ZoneAnchorPlacement(
            id: id,
            anchorID: anchorID,
            contentKind: contentKind,
            shortLabel: shortLabel,
            title: title,
            detail: detail,
            sourceCardID: sourceCardID,
            planningCardKind: planningCardKind,
            tags: tags,
            safetyRequirement: safetyRequirement
        )
    }

    private init(
        id: String,
        anchorID: String,
        contentKind: ZoneAnchorContentKind,
        shortLabel: String,
        title: String,
        detail: String,
        sourceCardID: String?,
        planningCardKind: PlanningCardKind?,
        tags: [String],
        safetyRequirement: String?
    ) {
        self.id = id
        self.anchorID = anchorID
        self.contentKind = contentKind
        self.shortLabel = shortLabel
        self.title = title
        self.detail = detail
        self.sourceCardID = sourceCardID
        self.planningCardKind = planningCardKind
        self.tags = tags
        self.safetyRequirement = safetyRequirement
    }

    private static func compactLabel(_ value: String) -> String {
        let trimmedValue = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmedValue.count > 30 else { return trimmedValue }
        return String(trimmedValue.prefix(27)) + "..."
    }
}

struct GymZone: Identifiable, Hashable, Codable {
    let id: String
    let title: String
    let alias: String
    let laneDescription: String
    let safetyNote: String
    var cards: [PlanningCard]
    /// A semantic map relationship only. The real proportional geometry is
    /// intentionally deferred until the coach's Freeform skeleton is
    /// inspected, so this never invents coordinates from the rough PDFs.
    let mapGroup: String?
    /// F1–F4 are horizontal slices of the one full floor. This ordering is
    /// preserved now so the eventual map renderer has an honest foundation.
    let mapOrder: Int?
    /// Empty anchors are intentionally invisible during ordinary coaching.
    /// They appear only while the coach is actively placing a selected item.
    /// Existing cards migrate into compact anchors so updating the prototype
    /// does not make previously planned ideas disappear from a station.
    var anchorPlacements: [ZoneAnchorPlacement]

    init(
        id: String,
        title: String,
        alias: String,
        laneDescription: String,
        safetyNote: String,
        cards: [PlanningCard],
        mapGroup: String? = nil,
        mapOrder: Int? = nil,
        anchorPlacements: [ZoneAnchorPlacement]? = nil
    ) {
        self.id = id
        self.title = title
        self.alias = alias
        self.laneDescription = laneDescription
        self.safetyNote = safetyNote
        self.cards = cards
        self.mapGroup = mapGroup
        self.mapOrder = mapOrder
        self.anchorPlacements = Self.normalizedAnchorPlacements(
            anchorPlacements ?? Self.migratedAnchorPlacements(from: cards, zoneID: id),
            zoneID: id
        )
    }

    func anchorPlacement(at anchorID: String) -> ZoneAnchorPlacement? {
        anchorPlacements.first(where: { $0.anchorID == anchorID })
    }

    var availableAnchorIDs: [String] {
        GymLayoutAnchorRegistry.layout(forLocalZoneID: id).anchors
            .map(\.id)
            .filter { anchorPlacement(at: $0) == nil }
    }

    private static func migratedAnchorPlacements(from cards: [PlanningCard], zoneID: String) -> [ZoneAnchorPlacement] {
        zip(cards, GymLayoutAnchorRegistry.layout(forLocalZoneID: zoneID).anchors).map { card, anchor in
            ZoneAnchorPlacement(card: card, anchorID: anchor.id)
        }
    }

    /// One earlier local build used generic panel-slot IDs before the durable
    /// map registry arrived. Repair those IDs on load without losing the
    /// lesson-local snapshot content. A recognized durable ID always wins.
    private static func normalizedAnchorPlacements(
        _ placements: [ZoneAnchorPlacement],
        zoneID: String
    ) -> [ZoneAnchorPlacement] {
        let validAnchorIDs = GymLayoutAnchorRegistry.layout(forLocalZoneID: zoneID).anchors.map(\.id)
        var usedAnchorIDs = Set<String>()
        var nextFallbackIndex = 0

        return placements.compactMap { placement in
            if validAnchorIDs.contains(placement.anchorID),
               usedAnchorIDs.insert(placement.anchorID).inserted {
                return placement
            }
            while nextFallbackIndex < validAnchorIDs.count,
                  usedAnchorIDs.contains(validAnchorIDs[nextFallbackIndex]) {
                nextFallbackIndex += 1
            }
            guard nextFallbackIndex < validAnchorIDs.count else {
                // An unknown overflow placement stays readable in storage.
                // The renderer can surface it once a later registry revision
                // supplies additional anchors for this zone.
                return placement
            }
            let repairedAnchorID = validAnchorIDs[nextFallbackIndex]
            usedAnchorIDs.insert(repairedAnchorID)
            nextFallbackIndex += 1
            return placement.moved(to: repairedAnchorID)
        }
    }

    private enum CodingKeys: String, CodingKey {
        case id, title, alias, laneDescription, safetyNote, cards, mapGroup, mapOrder, anchorPlacements
    }

    /// Local fixtures from earlier prototype builds stored cards only. Decode
    /// them as anchors on first read rather than losing their station context.
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        alias = try container.decode(String.self, forKey: .alias)
        laneDescription = try container.decode(String.self, forKey: .laneDescription)
        safetyNote = try container.decode(String.self, forKey: .safetyNote)
        cards = try container.decodeIfPresent([PlanningCard].self, forKey: .cards) ?? []
        mapGroup = try container.decodeIfPresent(String.self, forKey: .mapGroup)
        mapOrder = try container.decodeIfPresent(Int.self, forKey: .mapOrder)
        let decodedAnchorPlacements = try container.decodeIfPresent([ZoneAnchorPlacement].self, forKey: .anchorPlacements)
            ?? Self.migratedAnchorPlacements(from: cards, zoneID: id)
        anchorPlacements = Self.normalizedAnchorPlacements(decodedAnchorPlacements, zoneID: id)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(title, forKey: .title)
        try container.encode(alias, forKey: .alias)
        try container.encode(laneDescription, forKey: .laneDescription)
        try container.encode(safetyNote, forKey: .safetyNote)
        try container.encode(cards, forKey: .cards)
        try container.encodeIfPresent(mapGroup, forKey: .mapGroup)
        try container.encodeIfPresent(mapOrder, forKey: .mapOrder)
        try container.encode(anchorPlacements, forKey: .anchorPlacements)
    }
}

enum LessonPhaseMode: String, CaseIterable, Identifiable, Codable {
    case text = "TEXT"
    case visual = "VISUAL"
    case mixed = "MIXED"

    var id: String { rawValue }
}

struct LessonPhase: Identifiable, Hashable, Codable {
    let id: String
    var time: String
    var title: String
    var mode: LessonPhaseMode
    var textCues: [String]
    /// These are the only zone panels currently placed on the phase canvas.
    /// They may be multiple disconnected areas (for example, F4 + TS).
    var zones: [GymZone]
    /// Removing a zone from the canvas moves it here instead of discarding
    /// cards, notes, or setup details. Re-selecting the same local demo zone
    /// restores its exact saved content.
    var hiddenZones: [GymZone]
    /// The demo protects schedule anchors such as arrival and closing. A
    /// coach-created phase is intentionally removable.
    let isRequired: Bool

    init(
        id: String,
        time: String,
        title: String,
        mode: LessonPhaseMode,
        textCues: [String],
        zones: [GymZone],
        hiddenZones: [GymZone] = [],
        isRequired: Bool = false
    ) {
        self.id = id
        self.time = time
        self.title = title
        self.mode = mode
        self.textCues = textCues
        self.zones = zones
        self.hiddenZones = hiddenZones
        self.isRequired = isRequired
    }

    /// Text phases may retain a zone selection for a later visual/mixed pass,
    /// but never render station panels while they are text-only.
    var visibleZones: [GymZone] {
        mode == .text ? [] : zones
    }

    var selectedZoneIDs: Set<String> {
        Set(zones.map(\.id))
    }

    private enum CodingKeys: String, CodingKey {
        case id, time, title, mode, textCues, zones, hiddenZones, isRequired
    }

    /// Existing local-demo files predate `hiddenZones` and `isRequired`.
    /// Decode them safely so adding the phase editor does not erase a saved
    /// lesson when the prototype is updated.
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        time = try container.decode(String.self, forKey: .time)
        title = try container.decode(String.self, forKey: .title)
        mode = try container.decode(LessonPhaseMode.self, forKey: .mode)
        textCues = try container.decodeIfPresent([String].self, forKey: .textCues) ?? []
        zones = try container.decodeIfPresent([GymZone].self, forKey: .zones) ?? []
        hiddenZones = try container.decodeIfPresent([GymZone].self, forKey: .hiddenZones) ?? []
        // The earliest local demo persistence did not include this flag. Keep
        // its known schedule anchors protected during that one-way upgrade.
        isRequired = try container.decodeIfPresent(Bool.self, forKey: .isRequired)
            ?? Self.legacyRequiredPhaseIDs.contains(id)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(time, forKey: .time)
        try container.encode(title, forKey: .title)
        try container.encode(mode, forKey: .mode)
        try container.encode(textCues, forKey: .textCues)
        try container.encode(zones, forKey: .zones)
        try container.encode(hiddenZones, forKey: .hiddenZones)
        try container.encode(isRequired, forKey: .isRequired)
    }

    private static let legacyRequiredPhaseIDs: Set<String> = ["arrival", "finish"]
}

/// A schedule event owns one or more ordered planning phases. This separates
/// "add another part while we stay at bars" from "leave bars early and begin
/// a new event" without silently changing a schedule range.
struct LessonEvent: Identifiable, Hashable, Codable {
    let id: String
    var time: String
    var title: String
    var phases: [LessonPhase]
    let isRequired: Bool

    init(
        id: String,
        time: String,
        title: String,
        phases: [LessonPhase],
        isRequired: Bool = false
    ) {
        self.id = id
        self.time = time
        self.title = title
        self.phases = phases
        self.isRequired = isRequired
    }

    /// Older local files stored a flat lesson. Each old phase becomes a
    /// single-phase event, preserving every title, cue, zone, and card.
    static func migratedFromLegacyPhases(_ phases: [LessonPhase]) -> [LessonEvent] {
        phases.map { phase in
            LessonEvent(
                id: "event-legacy-\(phase.id)",
                time: phase.time,
                title: phase.title,
                phases: [phase],
                isRequired: phase.isRequired
            )
        }
    }
}

/// A local-only station chooser. The IDs that existed in the first prototype
/// remain unchanged so saved lessons still resolve, while the expanded list
/// exposes the coach-supplied station boards without claiming live data.
enum LocalDemoZoneCatalog {
    static let zones: [GymZone] = [
        makeZone(id: "f6", title: "FLOOR 6", alias: "F6", mapGroup: "FLOOR", mapOrder: 6),
        makeZone(id: "wr", title: "WEIGHT ROOM", alias: "WR"),
        makeZone(id: "sr-ph", title: "STILL RINGS / POMMEL HORSE", alias: "SR/PH"),
        // `rings` is a legacy persisted ID. Its coach-facing wording is now
        // the requested still-rings shorthand, and it renders the SR board.
        makeZone(id: "rings", title: "STILL RINGS", alias: "SR"),
        makeZone(id: "ph", title: "POMMEL HORSE", alias: "PH"),
        makeZone(id: "hb", title: "HIGH BAR", alias: "HB"),
        makeZone(id: "pb", title: "PARALLEL BARS", alias: "PB"),
        makeZone(id: "pb-hb", title: "PB / HB AREA", alias: "PB/HB"),
        makeZone(id: "beam-1", title: "BEAM 1", alias: "BEAM 1"),
        makeZone(id: "beam-2", title: "BEAM 2", alias: "BEAM 2"),
        makeZone(id: "beam-all", title: "ALL BEAMS", alias: "BEAMS"),
        makeZone(id: "fx", title: "FLOOR EXERCISE", alias: "FX", mapGroup: "FLOOR"),
        makeZone(id: "fx-ts", title: "FLOOR + TUMBLE STRIP", alias: "FX + TS"),
        makeZone(id: "ts", title: "TUMBLE STRIP", alias: "TS"),
        makeZone(id: "f1", title: "FLOOR 1", alias: "F1", mapGroup: "FLOOR", mapOrder: 1),
        makeZone(id: "f2", title: "FLOOR 2", alias: "F2", mapGroup: "FLOOR", mapOrder: 2),
        makeZone(id: "f3", title: "FLOOR 3", alias: "F3", mapGroup: "FLOOR", mapOrder: 3),
        makeZone(id: "f4", title: "FLOOR 4", alias: "F4", mapGroup: "FLOOR", mapOrder: 4),
        makeZone(id: "f5", title: "FLOOR 5", alias: "F5", mapGroup: "FLOOR", mapOrder: 5),
        makeZone(id: "vault", title: "VAULT", alias: "VAULT"),
        makeZone(id: "pit-pb", title: "PIT / PARALLEL BARS", alias: "PIT + PB"),
        makeZone(id: "pit-highbar-rings-pb", title: "PIT / HIGH BAR / RINGS / PB", alias: "PIT + HB + SR + PB"),
        makeZone(id: "ub1-ub2-strap", title: "UB 1 / UB 2 / STRAP BAR", alias: "UB1 + UB2 + SB"),
        // Keep the legacy local ID stable for persisted prototype lessons;
        // the coach-facing label uses the correct apparatus name.
        makeZone(id: "stap-bar", title: "STRAP BAR", alias: "STRAP BAR"),
        makeZone(id: "pit-strap", title: "PIT + STRAP BAR", alias: "PIT + SB"),
        makeZone(id: "trampoline", title: "TRAMPOLINE", alias: "TRAMP"),
        makeZone(id: "tumble-track", title: "TUMBLE TRACK", alias: "TT"),
        makeZone(id: "ub3", title: "UB 3", alias: "UB3"),
        makeZone(id: "preschool", title: "PRESCHOOL", alias: "PRESCHOOL")
    ]

    static func zone(withID id: String) -> GymZone? {
        zones.first(where: { $0.id == id })
    }

    private static func makeZone(
        id: String,
        title: String,
        alias: String,
        mapGroup: String? = nil,
        mapOrder: Int? = nil
    ) -> GymZone {
        GymZone(
            id: id,
            title: title,
            alias: alias,
            laneDescription: "Coach-selected station · configure this lesson's lane details",
            safetyNote: "Confirm current equipment and safety coverage.",
            cards: [],
            mapGroup: mapGroup,
            mapOrder: mapOrder
        )
    }
}

struct AttendancePerson: Identifiable, Hashable, Codable {
    enum Status: String, CaseIterable, Codable, Identifiable {
        case unmarked = "UNMARKED"
        case present = "PRESENT"
        case late = "LATE"
        case absent = "ABSENT"

        var id: String { rawValue }
    }
    let id: String
    let name: String
    var status: Status
}

/// A task can return for every class or exist only for a short, intentional
/// follow-through window. Temporary tasks remain visible when their window is
/// exhausted so they cannot silently disappear before the coach resolves them.
enum DailyTaskCadence: String, Codable {
    case recurring = "RECURRING"
    case temporary = "TEMPORARY"
}

struct DailyTask: Identifiable, Hashable, Codable {
    let id: String
    let title: String
    let detail: String
    let cadence: DailyTaskCadence
    /// A nil value means the task is recurring. A temporary task uses this as
    /// a short planning window, not as an automatic deletion date.
    let plannedClassWindow: Int?
    var isComplete: Bool
    var rollForwardCount: Int

    var statusLabel: String {
        if isComplete {
            return cadence == .recurring ? "DONE FOR THIS CLASS" : "TEMPORARY TASK CLOSED"
        }
        if cadence == .recurring {
            return "DUE THIS CLASS"
        }
        if let plannedClassWindow, rollForwardCount >= plannedClassWindow {
            return "WINDOW ENDED · REVIEW"
        }
        return "ROLLS FORWARD UNTIL DONE"
    }

    var rollForwardLabel: String? {
        guard cadence == .temporary, let plannedClassWindow else { return nil }
        let currentClass = min(rollForwardCount + 1, plannedClassWindow)
        return "CLASS WINDOW \(currentClass)/\(plannedClassWindow)"
    }
}

/// Decisions belong to an individual revision of an update. In particular,
/// rejecting revision 1 does not suppress a later revision of that same item.
enum DailyUpdateDecision: String, Codable, CaseIterable, Identifiable {
    case important = "IMPORTANT"
    case later = "LATER"
    case rejected = "REJECT"

    var id: String { rawValue }
}

struct DailyUpdate: Identifiable, Hashable, Codable {
    let id: String
    let title: String
    var detail: String
    let sourceLabel: String
    var revision: Int
    /// Keyed by `r1`, `r2`, etc. rather than by update ID alone, so a new
    /// revision re-enters the inbox with no inherited decision.
    var decisionsByRevision: [String: DailyUpdateDecision]

    var revisionKey: String { "r\(revision)" }

    var currentDecision: DailyUpdateDecision? {
        decisionsByRevision[revisionKey]
    }

    var hasEarlierRevisionDecision: Bool {
        decisionsByRevision.keys.contains { $0 != revisionKey }
    }

    func decision(forRevision revision: Int) -> DailyUpdateDecision? {
        decisionsByRevision["r\(revision)"]
    }
}

/// A privacy-safe, local preview of the resolved schedule-day handoff. It is
/// deliberately a *read-only advisory*: the planner may display it to help a
/// coach think through a day, but it never creates, moves, or overwrites a
/// lesson phase. Live schedule access belongs to a future explicit bridge.
struct ScheduleAdvisoryBlock: Identifiable, Hashable {
    let id: String
    let startMinute: Int
    let endMinute: Int
    let eventLabel: String
    let equipment: [String]
    let activityType: String
    let confidence: String
    let reviewStatus: String

    var timeRangeLabel: String {
        "\(formattedTime(startMinute))–\(formattedTime(endMinute))"
    }

    var equipmentLabel: String {
        equipment.isEmpty ? "NO EQUIPMENT LABEL" : equipment.joined(separator: " · ")
    }

    private func formattedTime(_ minute: Int) -> String {
        let normalizedMinute = ((minute % 1_440) + 1_440) % 1_440
        let hour24 = normalizedMinute / 60
        let minutePart = normalizedMinute % 60
        let hour12 = hour24 % 12 == 0 ? 12 : hour24 % 12
        let meridiem = hour24 < 12 ? "AM" : "PM"
        return "\(hour12):\(String(format: "%02d", minutePart)) \(meridiem)"
    }
}

/// Mirrors only the safe semantics of `schedule-day-plan.schema.json`: a
/// chosen date/group/rotation plus media-free planning blocks, warnings, and
/// optional openings. Source identifiers, raw labels, student records, and
/// media are intentionally absent from the native demo.
struct ScheduleDayAdvisory: Hashable {
    let dateISO: String
    let dayLabel: String
    let selectedGroup: String
    let monthWeekOrdinal: Int
    let rotationStatus: String
    let resolvedWeek: String?
    let manualConfirmationRequired: Bool
    let selectionStatus: String
    let advisories: [String]
    let rotationBlocks: [ScheduleAdvisoryBlock]
    let supportBlocks: [ScheduleAdvisoryBlock]
    let optionalOpenings: [ScheduleAdvisoryBlock]

    /// These are the only blocks that can inform the coach's thinking. Open
    /// time stays intentionally separate so it cannot masquerade as a lesson
    /// phase or get treated as a booked rotation.
    var suggestedStructureBlocks: [ScheduleAdvisoryBlock] {
        rotationBlocks + supportBlocks
    }

    var dateLabel: String {
        "\(dayLabel.uppercased()) · \(dateISO)"
    }

    var rotationLabel: String {
        let week = resolvedWeek ?? "UNRESOLVED"
        return "\(week.uppercased()) · WEEK \(monthWeekOrdinal) · \(rotationStatus.uppercased())"
    }
}

enum LessonDemoData {
    static let phases: [LessonPhase] = [
        LessonPhase(
            id: "arrival",
            time: "3:30–3:40",
            title: "Arrival / shape prep",
            mode: .text,
            textCues: ["2× hollow / arch check", "Review today’s bar safety cue", "Move to assigned first station"],
            zones: [],
            isRequired: true
        ),
        LessonPhase(
            id: "bars",
            time: "3:40–4:10",
            title: "Bars + trampoline strip",
            mode: .mixed,
            textCues: ["Coach bar group first; swap after 15 minutes.", "Show the perfect demo once before the first rotation."],
            zones: [
                GymZone(
                    id: "pb-hb",
                    title: "PB / HB AREA",
                    alias: "PB/HB",
                    laneDescription: "Group A · rotate on coach signal",
                    safetyNote: "Second coach required for spotted flyaway progressions.",
                    cards: [
                        PlanningCard(id: "tap-swing", kind: .drill, title: "Tap Swing Ladder", detail: "3 clean shapes before moving to the next rung.", tags: ["HB", "L3–L4", "shape"], accent: .cyan, isGem: true, safetyRequirement: nil),
                        PlanningCard(id: "perfect-demo", kind: .reference, title: "Perfect Tap Demo", detail: "Video placeholder · 0:18 reference", tags: ["demo", "video"], accent: .yellow, isGem: false, safetyRequirement: nil)
                    ]
                ),
                GymZone(
                    id: "ts",
                    title: "TUMBLE STRIP",
                    alias: "TS",
                    laneDescription: "Group B · 3 athletes active",
                    safetyNote: "Land to the marked mat only; reset after every turn.",
                    cards: [
                        PlanningCard(id: "stick-it", kind: .activity, title: "Stick-It Relay", detail: "Rules-only activity: earn a team point for a held landing.", tags: ["landing", "game", "L3"], accent: .green, isGem: false, safetyRequirement: nil)
                    ]
                )
            ]
        ),
        LessonPhase(
            id: "floor",
            time: "4:10–4:35",
            title: "Floor 4 + conditioning",
            mode: .visual,
            textCues: [],
            zones: [
                GymZone(
                    id: "f4",
                    title: "FLOOR 4",
                    alias: "F4",
                    laneDescription: "Group A · parallel lane",
                    safetyNote: "Use the short strip; keep the landing zone open.",
                    cards: [
                        PlanningCard(id: "roundoff", kind: .drill, title: "Roundoff Shape Check", detail: "Reach long, snap together, freeze.", tags: ["floor", "roundoff", "L3–L4"], accent: .pink, isGem: true, safetyRequirement: nil)
                    ],
                    mapGroup: "FLOOR",
                    mapOrder: 4
                )
            ]
        ),
        LessonPhase(
            id: "finish",
            time: "4:35–4:45",
            title: "Activity + close",
            mode: .text,
            textCues: ["Freeze-frame game: best shape wins a team point.", "Announcements + equipment reset."],
            zones: [],
            isRequired: true
        )
    ]

    /// The local fixture begins with one phase per scheduled event so the
    /// familiar legacy lesson remains recognizable. New phases can now be
    /// inserted inside any event without becoming a separate schedule block.
    static let events: [LessonEvent] = LessonEvent.migratedFromLegacyPhases(phases)

    static let activeShelf: [PlanningCard] = [
        PlanningCard(
            id: "line-challenge",
            kind: .activity,
            title: "Line Challenge",
            detail: "Quick rules-only finish game.",
            tags: ["activity", "warmup", "L3+"],
            accent: .green,
            isGem: true,
            safetyRequirement: nil,
            levels: ["L3+"],
            skills: ["Body shapes", "Listening"],
            events: ["FLOOR"],
            mats: ["Floor strip"],
            variantCount: 2
        ),
        PlanningCard(
            id: "joint-prep",
            kind: .warmUp,
            title: "Joint Prep Circuit",
            detail: "Coach-led movement prep before the first rotation.",
            tags: ["warm-up", "mobility", "L3+"],
            accent: .pink,
            isGem: false,
            safetyRequirement: "Use clear travel lanes.",
            levels: ["L3+"],
            skills: ["Mobility", "Landing shapes"],
            events: ["GENERAL"],
            mats: ["Open floor"],
            variantCount: 3
        ),
        PlanningCard(
            id: "spotting-readiness",
            kind: .drill,
            title: "Spotting Readiness",
            detail: "Setup sequence with second-coach safety check.",
            tags: ["safety", "bars", "setup"],
            accent: .pink,
            isGem: false,
            safetyRequirement: "Requires second coach",
            levels: ["ALL LEVELS"],
            skills: ["Spotting setup"],
            events: ["BARS"],
            mats: ["Bar landing mat", "Panel mat"],
            variantCount: 1,
            hasStationSetup: true
        ),
        PlanningCard(
            id: "shape-demo",
            kind: .reference,
            title: "Straight-body Demo",
            detail: "Private video placeholder · not imported.",
            tags: ["video", "shape", "demo"],
            accent: .yellow,
            isGem: false,
            safetyRequirement: nil,
            levels: ["ALL LEVELS"],
            skills: ["Straight body"],
            events: ["GENERAL"],
            mats: [],
            variantCount: 1
        )
    ]

    /// Archive is a separate shelf on purpose: record keeping is preserved,
    /// but old ideas do not crowd the day-to-day Relevant shelf.
    static let archivedLibrary: [PlanningCard] = [
        PlanningCard(
            id: "archive-vault-shapes",
            kind: .drill,
            title: "Vault Run Shapes",
            detail: "Short approach rhythm with a controlled freeze at the board.",
            tags: ["vault", "L3", "archive"],
            accent: .cyan,
            isGem: false,
            safetyRequirement: nil,
            levels: ["L3"],
            skills: ["Approach rhythm", "Board shape"],
            events: ["VAULT"],
            mats: ["Runway", "Board mat"],
            variantCount: 2
        ),
        PlanningCard(
            id: "archive-floor-corners",
            kind: .activity,
            title: "Floor Corner Quest",
            detail: "Rules-only group game: collect a point for each named shape.",
            tags: ["floor", "game", "L3–L4", "archive"],
            accent: .green,
            isGem: false,
            safetyRequirement: nil,
            levels: ["L3–L4"],
            skills: ["Body shapes"],
            events: ["FLOOR"],
            mats: ["Floor strip"],
            variantCount: 4
        ),
        PlanningCard(
            id: "archive-bar-setup",
            kind: .reference,
            title: "Bar Setup Checklist",
            detail: "Reference card for equipment order and coach checks.",
            tags: ["bars", "setup", "archive"],
            accent: .yellow,
            isGem: true,
            safetyRequirement: "Coach verifies setup",
            levels: ["ALL LEVELS"],
            skills: ["Equipment setup"],
            events: ["BARS"],
            mats: ["Bar landing mat"],
            variantCount: 1,
            hasStationSetup: true
        )
    ]

    static let attendance: [AttendancePerson] = [
        AttendancePerson(id: "fixture-1", name: "Avery", status: .present),
        AttendancePerson(id: "fixture-2", name: "Morgan", status: .present),
        AttendancePerson(id: "fixture-3", name: "Quinn", status: .late),
        AttendancePerson(id: "fixture-4", name: "Riley", status: .present)
    ]

    /// These are deliberately local fixture tasks. They are not copied from a
    /// calendar, email, roster, or the existing automation while the prototype
    /// is being developed.
    static let dailyTasks: [DailyTask] = [
        DailyTask(
            id: "recurring-bar-mats",
            title: "Set bar station mats",
            detail: "Recurring pre-class setup check.",
            cadence: .recurring,
            plannedClassWindow: nil,
            isComplete: false,
            rollForwardCount: 0
        ),
        DailyTask(
            id: "temporary-parent-reminder",
            title: "Share the makeup-class reminder",
            detail: "Temporary follow-through task for a three-class planning window.",
            cadence: .temporary,
            plannedClassWindow: 3,
            isComplete: false,
            rollForwardCount: 0
        )
    ]

    /// Normalized, media-free local fixtures. A future connector may supply
    /// the same shape, but it must never silently connect to email or calendar
    /// data in this prototype.
    static let dailyUpdates: [DailyUpdate] = [
        DailyUpdate(
            id: "demo-opening-note",
            title: "Possible opening after class",
            detail: "Local mock summary: an optional 15-minute opening may be available. Confirm manually before using it.",
            sourceLabel: "LOCAL MOCK UPDATE",
            revision: 1,
            decisionsByRevision: [:]
        ),
        DailyUpdate(
            id: "demo-equipment-note",
            title: "Equipment note needs a coach check",
            detail: "Local mock summary: review the setup note before the next bars rotation.",
            sourceLabel: "LOCAL MOCK UPDATE",
            revision: 1,
            decisionsByRevision: [:]
        )
    ]

    /// This is a synthetic, local sample shaped by the safe schedule-day
    /// contract. It does not copy a real schedule fixture or read the vault,
    /// a schedule database, calendar, names, or media at runtime.
    static let scheduleAdvisory = ScheduleDayAdvisory(
        dateISO: "2026-01-09",
        dayLabel: "Fri",
        selectedGroup: "DEMO GROUP",
        monthWeekOrdinal: 2,
        rotationStatus: "auto",
        resolvedWeek: "Even",
        manualConfirmationRequired: false,
        selectionStatus: "ready",
        advisories: [
            "Local sample: confirm today's schedule before using it as a planning reference."
        ],
        rotationBlocks: [
            ScheduleAdvisoryBlock(
                id: "fixture-rotation-1",
                startMinute: 930,
                endMinute: 945,
                eventLabel: "DEMO WARMUP",
                equipment: ["FLOOR"],
                activityType: "rotation",
                confidence: "high",
                reviewStatus: "auto_extracted"
            ),
            ScheduleAdvisoryBlock(
                id: "fixture-rotation-2",
                startMinute: 945,
                endMinute: 960,
                eventLabel: "DEMO TUMBLE STRIP",
                equipment: ["TS"],
                activityType: "rotation",
                confidence: "high",
                reviewStatus: "auto_extracted"
            ),
            ScheduleAdvisoryBlock(
                id: "fixture-rotation-3",
                startMinute: 960,
                endMinute: 975,
                eventLabel: "DEMO BAR LANE",
                equipment: ["PB/HB"],
                activityType: "rotation",
                confidence: "high",
                reviewStatus: "auto_extracted"
            ),
            ScheduleAdvisoryBlock(
                id: "fixture-rotation-4",
                startMinute: 975,
                endMinute: 1_005,
                eventLabel: "DEMO RING LANE",
                equipment: ["RINGS"],
                activityType: "rotation",
                confidence: "high",
                reviewStatus: "auto_extracted"
            ),
            ScheduleAdvisoryBlock(
                id: "fixture-rotation-5",
                startMinute: 1_005,
                endMinute: 1_025,
                eventLabel: "DEMO FLOOR LANE",
                equipment: ["FLOOR"],
                activityType: "rotation",
                confidence: "high",
                reviewStatus: "auto_extracted"
            ),
            ScheduleAdvisoryBlock(
                id: "fixture-rotation-6",
                startMinute: 1_025,
                endMinute: 1_050,
                eventLabel: "DEMO ACTIVITY",
                equipment: [],
                activityType: "rotation",
                confidence: "high",
                reviewStatus: "auto_extracted"
            )
        ],
        supportBlocks: [],
        optionalOpenings: []
    )
}
