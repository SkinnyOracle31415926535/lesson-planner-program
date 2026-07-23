//
//  GymLayoutAnchorRegistry.swift
//  LessonPlanner
//
//  Combines the owner-provided placement-anchor registry with the owner’s
//  Skeleton Freeform geometry draft. PDF-derived coordinates supply anchor
//  identity only; only Skeleton-derived bounds may crop the background image.
//

import Foundation

struct GymMapNormalizedRect: Hashable {
    let x: Double
    let y: Double
    let width: Double
    let height: Double

    var maxX: Double { x + width }
    var maxY: Double { y + height }

    static func union(_ rects: [GymMapNormalizedRect]) -> GymMapNormalizedRect? {
        guard let first = rects.first else { return nil }
        let minX = rects.map(\.x).min() ?? first.x
        let minY = rects.map(\.y).min() ?? first.y
        let maxX = rects.map(\.maxX).max() ?? first.maxX
        let maxY = rects.map(\.maxY).max() ?? first.maxY
        return GymMapNormalizedRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
    }
}

struct GymMapAnchor: Identifiable, Hashable {
    let id: String
    let zoneIDs: [String]
    let rect: GymMapNormalizedRect
    let fallbackRelativeX: Double?
    let fallbackRelativeY: Double?

    init(
        id: String,
        zoneIDs: [String],
        rect: GymMapNormalizedRect,
        fallbackRelativeX: Double? = nil,
        fallbackRelativeY: Double? = nil
    ) {
        self.id = id
        self.zoneIDs = zoneIDs
        self.rect = rect
        self.fallbackRelativeX = fallbackRelativeX
        self.fallbackRelativeY = fallbackRelativeY
    }

    func arrangedInSemanticFallback(x: Double, y: Double) -> GymMapAnchor {
        GymMapAnchor(
            id: id,
            zoneIDs: zoneIDs,
            rect: rect,
            fallbackRelativeX: x,
            fallbackRelativeY: y
        )
    }
}

/// A supplied station-board image is a presentation surface, not a new source
/// of physical gym geometry. Its optional coordinate zones are used only to
/// preserve the existing durable placement-anchor order when an item is being
/// placed. The image itself is rendered exactly as supplied by the coach.
struct GymMapStationBoard: Hashable {
    let assetName: String
    let pixelWidth: Double
    let pixelHeight: Double
    let coordinateZoneIDs: [String]

    var aspectRatio: Double {
        pixelWidth / pixelHeight
    }
}

/// A placement-label coordinate space is not physical gym geometry. The
/// `source` rectangle below comes from the PDF anchor layer; `target` is the
/// corresponding verified Skeleton Freeform geometry. We use the former only
/// to preserve an anchor grid's relative order/spacing as it is projected
/// onto the latter.
private struct SkeletonAnchorComponent: Hashable {
    let source: GymMapNormalizedRect
    let target: GymMapNormalizedRect
}

struct GymMapSelectionLayout: Hashable {
    /// For a Skeleton crop this is physical Freeform geometry. For a supplied
    /// station-board image it is only the coordinate frame used to position
    /// placement labels over that already-correct image.
    let viewport: GymMapNormalizedRect?
    let anchors: [GymMapAnchor]
    /// Direct owner-provided station art takes precedence over an automatic
    /// Skeleton crop whenever it exists for this local station selection.
    let stationBoard: GymMapStationBoard?
    /// A visible Freeform crop can still be deliberately marked as a draft
    /// while the owner confirms an ambiguous zone-to-shape interpretation.
    let geometryReviewNote: String?

    var usesSkeletonBackground: Bool { viewport != nil && stationBoard == nil }
    var usesStationBoardBackground: Bool { stationBoard != nil }
    var usesRenderedBackground: Bool { usesSkeletonBackground || usesStationBoardBackground }
    var requiresGeometryReview: Bool { geometryReviewNote != nil }
}

/// Maps the existing local-demo IDs to the durable semantic map IDs. Composite
/// selections deliberately return the union of member anchors as one board.
enum GymLayoutAnchorRegistry {
    /// Kept visible to focused tests so the embedded native registry cannot
    /// silently drift away from the shared placement-anchor contract.
    static var canonicalAnchorCount: Int { contractAnchors.count }

    static func layout(forLocalZoneID localZoneID: String) -> GymMapSelectionLayout {
        if let stationBoard = suppliedStationBoards[localZoneID] {
            return suppliedStationBoardLayout(
                forLocalZoneID: localZoneID,
                stationBoard: stationBoard
            )
        }

        let semanticZoneIDs = semanticZoneIDs(forLocalZoneID: localZoneID)
        let selectedZoneIDs = Set(semanticZoneIDs)
        let selectedAnchors = skeletonNormalizedAnchors.filter {
            !selectedZoneIDs.isDisjoint(with: Set($0.zoneIDs))
        }
        let selectedViewportRects = semanticZoneIDs.flatMap { skeletonGeometryViewports[$0] ?? [] }

        if !selectedAnchors.isEmpty,
           let viewport = GymMapNormalizedRect.union(selectedViewportRects) {
            return GymMapSelectionLayout(
                viewport: readableViewport(viewport),
                anchors: selectedAnchors,
                stationBoard: nil,
                geometryReviewNote: reviewNote(forSemanticZoneIDs: semanticZoneIDs)
            )
        }

        if !selectedAnchors.isEmpty {
            return GymMapSelectionLayout(
                viewport: nil,
                anchors: anchorsArrangedForSemanticFallback(selectedAnchors),
                stationBoard: nil,
                geometryReviewNote: nil
            )
        }

        return GymMapSelectionLayout(
            viewport: nil,
            anchors: LocalPanelAnchorCatalog.anchors(forZoneID: localZoneID).map { anchor in
                GymMapAnchor(
                    id: anchor.id,
                    zoneIDs: [],
                    rect: GymMapNormalizedRect(x: 0, y: 0, width: 0, height: 0),
                    fallbackRelativeX: anchor.relativeX,
                    fallbackRelativeY: anchor.relativeY
                )
            },
            stationBoard: nil,
            geometryReviewNote: nil
        )
    }

    static func semanticZoneIDs(forLocalZoneID localZoneID: String) -> [String] {
        switch localZoneID {
        // F6 is the coach-facing name for the established Ninja-area anchor
        // set. It is a semantic bridge only; the rendered art is the exact
        // supplied F6 station board.
        case "f6": ["zone-ninja-room"]
        case "wr": ["zone-wr"]
        case "pb-hb": ["zone-parallel-bars", "zone-high-bar-boys-bar"]
        case "pb": ["zone-parallel-bars"]
        case "hb": ["zone-high-bar-boys-bar"]
        case "sr-ph": ["zone-still-rings", "zone-pommel-horse"]
        case "sr", "rings": ["zone-still-rings"]
        case "ph": ["zone-pommel-horse"]
        case "beam-1": ["zone-beam-1"]
        case "beam-2": ["zone-beam-2-a", "zone-beam-2-b"]
        case "beam-all": ["zone-beam-1", "zone-beam-2-a", "zone-beam-2-b"]
        case "fx": ["zone-floor-f1", "zone-floor-f2", "zone-floor-f3", "zone-floor-f4"]
        case "fx-ts": ["zone-floor-f1", "zone-floor-f2", "zone-floor-f3", "zone-floor-f4", "zone-tumble-strip"]
        case "ts": ["zone-tumble-strip"]
        case "f1": ["zone-floor-f1"]
        case "f2": ["zone-floor-f2"]
        case "f3": ["zone-floor-f3"]
        case "f4": ["zone-floor-f4"]
        case "f5": ["zone-floor-f5"]
        case "stap-bar", "strap-bar": ["zone-strap-bar"]
        case "ub1-ub2-strap": ["zone-ub-1", "zone-ub-2", "zone-strap-bar"]
        case "pit-pb": ["zone-pit-pb"]
        case "pit-highbar-rings-pb": ["zone-pit-pb", "zone-pit-rings-high-bar"]
        case "pit-strap": ["zone-pit-pb", "zone-pit-rings-high-bar", "zone-strap-bar"]
        case "trampoline": ["zone-trampoline"]
        case "tumble-track": ["zone-tumble-track"]
        case "ub3": ["zone-ub-3"]
        case "preschool": ["zone-preschool"]
        case "vault": ["zone-vault"]
        default: []
        }
    }

    private static let contractAnchors = parseAnchors(anchorRows)
    private static let skeletonAnchorComponents = parseSkeletonAnchorComponents(skeletonAnchorMappingRows)
    /// These bounds are copied only from `target` values in the mapping table,
    /// which are the owner-provided Skeleton geometry-draft values. The PDF
    /// anchor-layer viewports are never used to crop the background image.
    private static let skeletonGeometryViewports = skeletonAnchorComponents.mapValues { components in
        components.map(\.target)
    }
    private static let skeletonNormalizedAnchors = normalizeAnchorsForSkeletonGeometry(contractAnchors)

    /// These pictures are the exact station boards supplied by the coach.
    /// They intentionally replace automatic Skeleton crops only for the
    /// matching selection, preserving the durable local-zone IDs.
    private static let suppliedStationBoards: [String: GymMapStationBoard] = [
        "f6": board("StationBoardF6", 632, 811, ["zone-ninja-room"]),
        "wr": board("StationBoardWR", 419, 805, ["zone-wr"]),
        "sr-ph": board("StationBoardSRPH", 779, 601, ["zone-still-rings", "zone-pommel-horse"]),
        "sr": board("StationBoardSR", 222, 620, ["zone-still-rings"]),
        "rings": board("StationBoardSR", 222, 620, ["zone-still-rings"]),
        "ph": board("StationBoardPH", 582, 569, ["zone-pommel-horse"]),
        "hb": board("StationBoardHB", 509, 545, ["zone-high-bar-boys-bar"]),
        "pb": board("StationBoardPB", 1299, 385, ["zone-parallel-bars"]),
        "pb-hb": board("StationBoardPBHB", 1767, 533, ["zone-parallel-bars", "zone-high-bar-boys-bar"]),
        "beam-1": board("StationBoardBeam1", 392, 371, ["zone-beam-1"]),
        "beam-2": board("StationBoardBeam2", 238, 143, ["zone-beam-2-a", "zone-beam-2-b"]),
        "beam-all": board("StationBoardBeamAll", 616, 373, ["zone-beam-1", "zone-beam-2-a", "zone-beam-2-b"]),
        "fx": board("StationBoardFX", 531, 530, ["zone-floor-f1", "zone-floor-f2", "zone-floor-f3", "zone-floor-f4"]),
        "fx-ts": board("StationBoardFXTS", 618, 550, ["zone-floor-f1", "zone-floor-f2", "zone-floor-f3", "zone-floor-f4", "zone-tumble-strip"]),
        "ts": board("StationBoardTS", 112, 551, ["zone-tumble-strip"]),
        "vault": board("StationBoardVault", 135, 726, ["zone-vault"]),
        "pit-pb": board("StationBoardPitPB", 279, 330, ["zone-pit-pb"]),
        "pit-highbar-rings-pb": board("StationBoardPitHighBarRingsPB", 479, 333, ["zone-pit-pb", "zone-pit-rings-high-bar"]),
        "ub1-ub2-strap": board("StationBoardUB1UB2Strap", 513, 277, ["zone-ub-1", "zone-ub-2", "zone-strap-bar"]),
        // Preserve the legacy persisted ID while showing the supplied wider
        // context picture rather than manufacturing a separate Strap Bar crop.
        "stap-bar": board("StationBoardUB1UB2Strap", 513, 277, ["zone-ub-1", "zone-ub-2", "zone-strap-bar"]),
        "strap-bar": board("StationBoardUB1UB2Strap", 513, 277, ["zone-ub-1", "zone-ub-2", "zone-strap-bar"]),
        "pit-strap": board("StationBoardPitStrap", 742, 354, ["zone-pit-pb", "zone-pit-rings-high-bar", "zone-strap-bar"]),
        "trampoline": board("StationBoardTrampoline", 317, 289, ["zone-trampoline"]),
        "tumble-track": board("StationBoardTumbleTrack", 613, 163, ["zone-tumble-track", "zone-pit-rings-high-bar"]),
        "ub3": board("StationBoardUB3", 252, 165, ["zone-ub-3"]),
        "preschool": board("StationBoardPreschool", 307, 395, ["zone-preschool"]),
        "f5": board("StationBoardF5", 553, 176, ["zone-floor-f5"])
    ]

    private static func board(
        _ assetName: String,
        _ pixelWidth: Double,
        _ pixelHeight: Double,
        _ coordinateZoneIDs: [String] = []
    ) -> GymMapStationBoard {
        GymMapStationBoard(
            assetName: assetName,
            pixelWidth: pixelWidth,
            pixelHeight: pixelHeight,
            coordinateZoneIDs: coordinateZoneIDs
        )
    }

    private static func suppliedStationBoardLayout(
        forLocalZoneID localZoneID: String,
        stationBoard: GymMapStationBoard
    ) -> GymMapSelectionLayout {
        let semanticZoneIDs = semanticZoneIDs(forLocalZoneID: localZoneID)
        let selectedZoneIDs = Set(semanticZoneIDs)
        let selectedAnchors = contractAnchors.filter {
            !selectedZoneIDs.isDisjoint(with: Set($0.zoneIDs))
        }
        let coordinateZoneIDs = Set(
            stationBoard.coordinateZoneIDs.isEmpty
                ? semanticZoneIDs
                : stationBoard.coordinateZoneIDs
        )
        let coordinateAnchors = contractAnchors.filter {
            !coordinateZoneIDs.isDisjoint(with: Set($0.zoneIDs))
        }

        if !selectedAnchors.isEmpty,
           let viewport = stationBoardAnchorViewport(
                for: coordinateAnchors.isEmpty ? selectedAnchors : coordinateAnchors,
                imageAspect: stationBoard.aspectRatio
           ) {
            return GymMapSelectionLayout(
                viewport: viewport,
                anchors: selectedAnchors,
                stationBoard: stationBoard,
                geometryReviewNote: nil
            )
        }

        return GymMapSelectionLayout(
            viewport: nil,
            anchors: LocalPanelAnchorCatalog.anchors(forZoneID: localZoneID).map { anchor in
                GymMapAnchor(
                    id: anchor.id,
                    zoneIDs: [],
                    rect: GymMapNormalizedRect(x: 0, y: 0, width: 0, height: 0),
                    fallbackRelativeX: anchor.relativeX,
                    fallbackRelativeY: anchor.relativeY
                )
            },
            stationBoard: stationBoard,
            geometryReviewNote: nil
        )
    }

    /// Direct station art has already been cropped by the coach. This frame
    /// only gives the existing label anchors a stable, padded coordinate space
    /// on that picture; it is never used to crop or reinterpret the picture.
    private static func stationBoardAnchorViewport(
        for anchors: [GymMapAnchor],
        imageAspect: Double
    ) -> GymMapNormalizedRect? {
        guard let anchorBounds = GymMapNormalizedRect.union(anchors.map(\.rect)) else { return nil }

        var width = max(anchorBounds.width * 1.24, 70)
        var height = max(anchorBounds.height * 1.24, 70)
        let desiredAspect = max(imageAspect, 0.1)
        let currentAspect = width / height

        if currentAspect < desiredAspect {
            width = height * desiredAspect
        } else {
            height = width / desiredAspect
        }

        return GymMapNormalizedRect(
            x: max(0, min(1000 - width, anchorBounds.x + anchorBounds.width / 2 - width / 2)),
            y: max(0, min(1000 - height, anchorBounds.y + anchorBounds.height / 2 - height / 2)),
            width: min(width, 1000),
            height: min(height, 1000)
        )
    }

    /// Kept in sync with the shared geometry contract. The Freeform crop is
    /// still useful here, but its two PB shapes need an owner confirmation
    /// before this draft becomes an unqualified physical interpretation.
    private static let freeformGeometryReviewNotes: [String: String] = [
        "zone-parallel-bars": "The Skeleton Freeform board shows two disconnected PB-like shapes. They stay one PB destination until their exact physical interpretation is confirmed."
    ]

    private static func reviewNote(forSemanticZoneIDs zoneIDs: [String]) -> String? {
        let notes = zoneIDs.compactMap { freeformGeometryReviewNotes[$0] }
        return notes.isEmpty ? nil : notes.joined(separator: " ")
    }

    /// An intentionally unmapped zone may use the owner-provided anchor IDs,
    /// but must not borrow its dimensions from the incorrect PDF export. A
    /// neutral layer preserves the yellow-grid's relative label layout until
    /// Skeleton geometry exists; it never invents a new generic arrangement.
    private static func anchorsArrangedForSemanticFallback(_ anchors: [GymMapAnchor]) -> [GymMapAnchor] {
        guard let bounds = GymMapNormalizedRect.union(anchors.map(\.rect)) else { return anchors }
        let safeWidth = max(bounds.width, 1)
        let safeHeight = max(bounds.height, 1)
        return anchors.map { anchor in
            return anchor.arrangedInSemanticFallback(
                x: (anchor.rect.x + anchor.rect.width / 2 - bounds.x) / safeWidth,
                y: (anchor.rect.y + anchor.rect.height / 2 - bounds.y) / safeHeight
            )
        }
    }

    private static func parseAnchors(_ rows: String) -> [GymMapAnchor] {
        rows.split(separator: "\n").compactMap { row in
            let fields = row.split(separator: "|", omittingEmptySubsequences: false).map(String.init)
            guard fields.count == 6,
                  let x = Double(fields[2]),
                  let y = Double(fields[3]),
                  let width = Double(fields[4]),
                  let height = Double(fields[5]) else {
                return nil
            }
            return GymMapAnchor(
                id: fields[0],
                zoneIDs: fields[1].split(separator: ",").map(String.init),
                rect: GymMapNormalizedRect(x: x, y: y, width: width, height: height)
            )
        }
    }

    /// Projects PDF overlay anchors onto verified Skeleton bounds. If the
    /// overlay has a bad/out-of-zone anchor (as F3 does), its entire component
    /// is rebased to its own anchor extent so every durable anchor remains
    /// visible and tappable inside the real physical crop. This never changes
    /// an anchor ID, capacity, or reading order.
    private static func normalizeAnchorsForSkeletonGeometry(_ anchors: [GymMapAnchor]) -> [GymMapAnchor] {
        var normalizedByID: [String: GymMapAnchor] = [:]

        for (zoneID, components) in skeletonAnchorComponents {
            let zoneAnchors = anchors.filter { $0.zoneIDs.contains(zoneID) }
            guard !zoneAnchors.isEmpty else { continue }

            let assigned = assign(zoneAnchors, to: components)
            for (componentIndex, componentAnchors) in assigned where !componentAnchors.isEmpty {
                let component = components[componentIndex]
                let source = repairedSourceRect(
                    nominal: component.source,
                    anchors: componentAnchors
                )

                for anchor in componentAnchors {
                    normalizedByID[anchor.id] = GymMapAnchor(
                        id: anchor.id,
                        zoneIDs: anchor.zoneIDs,
                        rect: project(anchor.rect, from: source, to: component.target)
                    )
                }
            }
        }

        return anchors.map { normalizedByID[$0.id] ?? $0 }
    }

    /// PB is deliberately a single semantic destination with two physical
    /// Skeleton components. Assigning its existing anchors by their PDF-layer
    /// centers lets both components retain their label order without inventing
    /// PB1/PB2 destinations.
    private static func assign(
        _ anchors: [GymMapAnchor],
        to components: [SkeletonAnchorComponent]
    ) -> [Int: [GymMapAnchor]] {
        var result: [Int: [GymMapAnchor]] = [:]

        for anchor in anchors {
            let centerX = anchor.rect.x + anchor.rect.width / 2
            let centerY = anchor.rect.y + anchor.rect.height / 2
            let componentIndex = components.indices.min { left, right in
                distanceSquared(fromX: centerX, y: centerY, to: components[left].source)
                    < distanceSquared(fromX: centerX, y: centerY, to: components[right].source)
            } ?? 0
            result[componentIndex, default: []].append(anchor)
        }

        return result
    }

    private static func distanceSquared(
        fromX x: Double,
        y: Double,
        to rect: GymMapNormalizedRect
    ) -> Double {
        let closestX = min(max(x, rect.x), rect.maxX)
        let closestY = min(max(y, rect.y), rect.maxY)
        let deltaX = x - closestX
        let deltaY = y - closestY
        return deltaX * deltaX + deltaY * deltaY
    }

    private static func repairedSourceRect(
        nominal: GymMapNormalizedRect,
        anchors: [GymMapAnchor]
    ) -> GymMapNormalizedRect {
        let hasOutOfBoundsAnchor = anchors.contains { anchor in
            anchor.rect.x < nominal.x || anchor.rect.maxX > nominal.maxX
                || anchor.rect.y < nominal.y || anchor.rect.maxY > nominal.maxY
        }
        guard hasOutOfBoundsAnchor else { return nominal }

        let anchorBounds = GymMapNormalizedRect.union(anchors.map(\.rect)) ?? nominal
        // A one-item component is still rendered as a normal compact label;
        // retain the known source axis whenever a rebased axis would collapse.
        return GymMapNormalizedRect(
            x: anchorBounds.x,
            y: anchorBounds.y,
            width: max(anchorBounds.width, nominal.width * 0.12),
            height: max(anchorBounds.height, nominal.height * 0.12)
        )
    }

    private static func project(
        _ rect: GymMapNormalizedRect,
        from source: GymMapNormalizedRect,
        to target: GymMapNormalizedRect
    ) -> GymMapNormalizedRect {
        let scaleX = target.width / source.width
        let scaleY = target.height / source.height
        return GymMapNormalizedRect(
            x: target.x + (rect.x - source.x) * scaleX,
            y: target.y + (rect.y - source.y) * scaleY,
            width: rect.width * scaleX,
            height: rect.height * scaleY
        )
    }

    /// A literal tumble-strip crop is extremely tall on an iPad. Expand only
    /// the surrounding Freeform image context (never the selected anchors)
    /// to keep a station board readable without stretching the gym drawing.
    private static func readableViewport(_ rect: GymMapNormalizedRect) -> GymMapNormalizedRect {
        let sourceAspect = 2200.0 / 1900.0
        let minimumAspect = 0.72
        let maximumAspect = 3.1
        var x = rect.x
        var y = rect.y
        var width = rect.width
        var height = rect.height
        var aspect = (width * sourceAspect) / height

        if aspect < minimumAspect {
            let targetWidth = min(1000, (height * minimumAspect) / sourceAspect)
            let inset = (targetWidth - width) / 2
            x = max(0, min(1000 - targetWidth, x - inset))
            width = targetWidth
            aspect = (width * sourceAspect) / height
        }

        if aspect > maximumAspect {
            let targetHeight = min(1000, (width * sourceAspect) / maximumAspect)
            let inset = (targetHeight - height) / 2
            y = max(0, min(1000 - targetHeight, y - inset))
            height = targetHeight
        }

        return GymMapNormalizedRect(x: x, y: y, width: width, height: height)
    }

    private static func parseSkeletonAnchorComponents(_ rows: String) -> [String: [SkeletonAnchorComponent]] {
        Dictionary(uniqueKeysWithValues: rows.split(separator: "\n").compactMap { row in
            let fields = row.split(separator: "|", maxSplits: 1, omittingEmptySubsequences: false).map(String.init)
            guard fields.count == 2 else { return nil }
            let components = fields[1].split(separator: ";").compactMap { componentRow -> SkeletonAnchorComponent? in
                let sourceAndTarget = componentRow.split(separator: ">", maxSplits: 1, omittingEmptySubsequences: false)
                guard sourceAndTarget.count == 2 else { return nil }
                let sourceValues = sourceAndTarget[0].split(separator: ",").compactMap { Double($0) }
                let targetValues = sourceAndTarget[1].split(separator: ",").compactMap { Double($0) }
                guard sourceValues.count == 4, targetValues.count == 4 else { return nil }
                return SkeletonAnchorComponent(
                    source: GymMapNormalizedRect(
                        x: sourceValues[0], y: sourceValues[1], width: sourceValues[2], height: sourceValues[3]
                    ),
                    target: GymMapNormalizedRect(
                        x: targetValues[0], y: targetValues[1], width: targetValues[2], height: targetValues[3]
                    )
                )
            }
            return (fields[0], components)
        })
    }

    private static let anchorRows = #"""
anchor-parallel-bars-01|zone-parallel-bars|544|7|27|32
anchor-parallel-bars-02|zone-parallel-bars|592|8|26|32
anchor-parallel-bars-03|zone-parallel-bars|459|14|29|32
anchor-parallel-bars-04|zone-parallel-bars|334|15|29|32
anchor-beam-2-a-01|zone-beam-2-a|110|26|28|33
anchor-high-bar-boys-bar-01|zone-high-bar-boys-bar|278|33|29|32
anchor-parallel-bars-05|zone-parallel-bars|502|43|25|33
anchor-parallel-bars-06|zone-parallel-bars|544|44|26|33
anchor-parallel-bars-07|zone-parallel-bars|587|46|25|33
anchor-ninja-room-01|zone-ninja-room|907|49|27|32
anchor-ninja-room-02|zone-ninja-room|946|49|27|36
anchor-high-bar-boys-bar-02|zone-high-bar-boys-bar|204|54|27|34
anchor-beam-2-a-02|zone-beam-2-a|110|64|28|33
anchor-parallel-bars-08|zone-parallel-bars|337|66|28|33
anchor-parallel-bars-09|zone-parallel-bars|378|66|27|33
anchor-parallel-bars-10|zone-parallel-bars|427|67|27|33
anchor-parallel-bars-11|zone-parallel-bars|458|67|29|32
anchor-wr-01|zone-wr|748|67|27|32
anchor-pommel-horse-01|zone-pommel-horse|606|83|26|32
anchor-still-rings-01|zone-still-rings|508|84|27|32
anchor-pommel-horse-02|zone-pommel-horse|558|84|33|33
anchor-pommel-horse-03|zone-pommel-horse|661|87|26|33
anchor-ninja-room-03|zone-ninja-room|856|95|27|32
anchor-ninja-room-04|zone-ninja-room|906|95|27|32
anchor-ninja-room-05|zone-ninja-room|946|95|27|32
anchor-vault-01|zone-vault|52|100|29|32
anchor-beam-2-a-03|zone-beam-2-a|109|104|29|33
anchor-wr-02|zone-wr|749|110|26|33
anchor-parallel-bars-12|zone-parallel-bars|321|118|29|32
anchor-parallel-bars-13|zone-parallel-bars|460|118|29|32
anchor-parallel-bars-14|zone-parallel-bars|388|120|29|32
anchor-high-bar-boys-bar-03|zone-high-bar-boys-bar|181|128|29|33
anchor-high-bar-boys-bar-04|zone-high-bar-boys-bar|242|128|28|33
anchor-vault-02|zone-vault|56|140|28|32
anchor-still-rings-02|zone-still-rings|516|140|26|33
anchor-ninja-room-06|zone-ninja-room|857|140|26|33
anchor-ninja-room-07|zone-ninja-room|907|140|26|33
anchor-ninja-room-08|zone-ninja-room|947|140|26|33
anchor-wr-03|zone-wr|749|156|26|33
anchor-pommel-horse-04|zone-pommel-horse|648|158|25|33
anchor-pommel-horse-05|zone-pommel-horse|592|164|27|32
anchor-beam-1-01|zone-beam-1|397|173|28|35
anchor-beam-1-02|zone-beam-1|442|173|28|35
anchor-vault-03|zone-vault|14|174|29|32
anchor-beam-1-03|zone-beam-1|354|174|29|35
anchor-vault-04|zone-vault|54|178|29|32
anchor-beam-2-b-01|zone-beam-2-b|94|181|27|33
anchor-beam-2-b-02|zone-beam-2-b|149|181|27|33
anchor-ninja-room-09|zone-ninja-room|856|185|27|32
anchor-ninja-room-10|zone-ninja-room|906|185|27|32
anchor-beam-2-b-03|zone-beam-2-b|248|188|29|35
anchor-beam-2-b-04|zone-beam-2-b|301|188|28|35
anchor-beam-2-b-05|zone-beam-2-b|202|188|27|40
anchor-ninja-room-11|zone-ninja-room|950|190|27|32
anchor-wr-04|zone-wr|749|197|26|33
anchor-beam-1-04|zone-beam-1|352|206|28|39
anchor-beam-1-05|zone-beam-1|439|206|29|35
anchor-beam-2-b-06|zone-beam-2-b|122|207|27|33
anchor-beam-1-06|zone-beam-1|396|209|28|35
anchor-still-rings-03|zone-still-rings|509|209|25|33
anchor-vault-05|zone-vault|57|219|29|32
anchor-beam-2-b-07|zone-beam-2-b|301|222|29|35
anchor-beam-2-b-08|zone-beam-2-b|201|223|28|35
anchor-beam-2-b-09|zone-beam-2-b|249|224|28|35
anchor-beam-2-b-10|zone-beam-2-b|98|235|27|33
anchor-beam-2-b-11|zone-beam-2-b|144|235|27|33
anchor-beam-1-07|zone-beam-1|439|239|28|35
anchor-beam-1-08|zone-beam-1|352|240|28|35
anchor-beam-1-09|zone-beam-1|394|241|29|35
anchor-vault-06|zone-vault|14|250|28|33
anchor-vault-07|zone-vault|51|254|29|32
anchor-vault-08|zone-vault|10|274|31|46
anchor-floor-f4-01|zone-floor-f4|294|278|42|52
anchor-tumble-strip-01|zone-tumble-strip|94|279|43|52
anchor-floor-f4-02|zone-floor-f4|246|279|42|52
anchor-floor-f4-03|zone-floor-f4|342|279|42|52
anchor-floor-f4-04|zone-floor-f4|200|280|42|52
anchor-floor-f4-05|zone-floor-f4|394|280|41|52
anchor-vault-09|zone-vault|51|281|31|43
anchor-floor-f4-06|zone-floor-f4|153|281|42|52
anchor-floor-f4-07|zone-floor-f4|444|281|42|52
anchor-vault-10|zone-vault|13|314|28|32
anchor-vault-11|zone-vault|54|333|29|32
anchor-floor-f3-01|zone-floor-f3|154|333|40|52
anchor-floor-f3-02|zone-floor-f3|246|333|42|52
anchor-floor-f3-03|zone-floor-f3|342|333|42|52
anchor-floor-f3-04|zone-floor-f3|199|334|42|50
anchor-floor-f3-05|zone-floor-f3|393|334|43|50
anchor-floor-f3-06|zone-floor-f3|444|335|42|50
anchor-tumble-strip-02|zone-tumble-strip|94|336|43|52
anchor-vault-12|zone-vault|57|374|29|32
anchor-floor-f3-07|zone-floor-f3|247|378|42|52
anchor-floor-f3-08|zone-floor-f3|199|379|42|52
anchor-floor-f3-09|zone-floor-f3|294|379|41|50
anchor-floor-f3-10|zone-floor-f3|342|380|41|50
anchor-floor-f3-11|zone-floor-f3|444|380|42|52
anchor-floor-f3-12|zone-floor-f3|158|381|37|51
anchor-floor-f3-13|zone-floor-f3|394|381|41|50
anchor-tumble-strip-03|zone-tumble-strip|94|392|43|52
anchor-vault-13|zone-vault|9|394|29|43
anchor-vault-14|zone-vault|54|401|31|43
anchor-vault-15|zone-vault|9|431|29|32
anchor-floor-f3-14|zone-floor-f3|393|433|42|52
anchor-floor-f3-15|zone-floor-f3|446|433|40|52
anchor-tumble-strip-04|zone-tumble-strip|94|451|41|51
anchor-vault-16|zone-vault|57|451|29|32
anchor-vault-17|zone-vault|12|472|29|32
anchor-floor-f2-01|zone-floor-f2|392|483|42|52
anchor-floor-f2-02|zone-floor-f2|444|485|41|52
anchor-vault-18|zone-vault|56|487|29|32
anchor-tumble-strip-05|zone-tumble-strip|94|509|42|52
anchor-vault-19|zone-vault|11|515|29|32
anchor-vault-20|zone-vault|59|528|29|32
anchor-floor-f2-03|zone-floor-f2|392|537|43|47
anchor-floor-f2-04|zone-floor-f2|444|538|42|48
anchor-vault-21|zone-vault|51|554|36|45
anchor-vault-22|zone-vault|14|555|29|32
anchor-tumble-strip-06|zone-tumble-strip|94|569|42|52
anchor-floor-f1-01|zone-floor-f1|394|579|42|52
anchor-floor-f1-02|zone-floor-f1|446|585|42|48
anchor-vault-23|zone-vault|12|599|29|49
anchor-vault-24|zone-vault|54|607|29|32
anchor-floor-f5-01|zone-floor-f5|554|624|28|33
anchor-floor-f5-02|zone-floor-f5|596|624|27|33
anchor-floor-f5-03|zone-floor-f5|679|624|28|33
anchor-floor-f5-04|zone-floor-f5|719|624|27|33
anchor-floor-f5-05|zone-floor-f5|768|624|27|33
anchor-floor-f5-06|zone-floor-f5|809|624|27|33
anchor-floor-f5-07|zone-floor-f5|508|625|27|33
anchor-floor-f5-08|zone-floor-f5|637|626|27|33
anchor-tumble-strip-07|zone-tumble-strip|92|633|46|42
anchor-floor-f1-03|zone-floor-f1|446|635|42|52
anchor-vault-25|zone-vault|12|643|29|32
anchor-floor-f5-09|zone-floor-f5|633|661|28|32
anchor-floor-f5-10|zone-floor-f5|551|662|28|32
anchor-floor-f5-11|zone-floor-f5|592|662|29|32
anchor-floor-f5-12|zone-floor-f5|674|662|29|32
anchor-floor-f5-13|zone-floor-f5|715|662|29|32
anchor-floor-f5-14|zone-floor-f5|764|662|29|32
anchor-floor-f5-15|zone-floor-f5|804|662|28|32
anchor-floor-f5-16|zone-floor-f5|507|663|29|32
anchor-pit-pb-01|zone-pit-pb|8|692|29|32
anchor-ub-1-01|zone-ub-1|186|709|27|33
anchor-strap-bar-01|zone-strap-bar|435|709|27|33
anchor-ub-1-02|zone-ub-1|226|712|29|32
anchor-ub-1-03|zone-ub-1|274|712|29|32
anchor-ub-1-04|zone-ub-1|317|712|29|32
anchor-strap-bar-02|zone-strap-bar|359|712|29|32
anchor-strap-bar-03|zone-strap-bar|473|728|29|32
anchor-preschool-01|zone-preschool|734|728|29|32
anchor-preschool-02|zone-preschool|779|728|29|32
anchor-preschool-03|zone-preschool|688|729|29|32
anchor-pit-pb-02|zone-pit-pb|10|731|27|33
anchor-trampoline-01|zone-trampoline|633|736|28|33
anchor-preschool-04|zone-preschool|821|736|28|33
anchor-preschool-05|zone-preschool|776|765|28|33
anchor-preschool-06|zone-preschool|734|765|27|33
anchor-pit-pb-03|zone-pit-pb|8|766|27|33
anchor-preschool-07|zone-preschool|691|767|28|33
anchor-pit-pb-04|zone-pit-pb|8|802|29|32
anchor-preschool-08|zone-preschool|734|804|29|32
anchor-preschool-09|zone-preschool|779|804|29|32
anchor-preschool-10|zone-preschool|688|806|29|32
anchor-preschool-11|zone-preschool|816|812|29|32
anchor-ub-2-01|zone-ub-2|348|818|29|32
anchor-ub-2-02|zone-ub-2|378|818|28|32
anchor-ub-2-03|zone-ub-2|423|818|29|32
anchor-ub-2-04|zone-ub-2|473|818|29|32
anchor-trampoline-02|zone-trampoline|637|824|27|33
anchor-preschool-12|zone-preschool|775|842|29|32
anchor-preschool-13|zone-preschool|733|842|29|32
anchor-pit-pb-05|zone-pit-pb|8|843|29|32
anchor-preschool-14|zone-preschool|691|844|29|32
anchor-pit-rings-high-bar-01|zone-pit-rings-high-bar,zone-tumble-track|232|878|27|33
anchor-pit-pb-06|zone-pit-pb|7|880|28|33
anchor-preschool-15|zone-preschool|816|880|28|33
anchor-pit-rings-high-bar-02|zone-pit-rings-high-bar,zone-tumble-track|277|881|29|32
anchor-pit-rings-high-bar-03|zone-pit-rings-high-bar,zone-tumble-track|319|881|29|32
anchor-tumble-track-01|zone-tumble-track|374|881|29|32
anchor-tumble-track-02|zone-tumble-track|411|881|29|32
anchor-tumble-track-03|zone-tumble-track|458|881|28|32
anchor-preschool-16|zone-preschool|738|881|29|32
anchor-preschool-17|zone-preschool|782|881|29|32
anchor-preschool-18|zone-preschool|692|883|29|32
anchor-pit-pb-07|zone-pit-pb|53|883|29|32
anchor-pit-pb-08|zone-pit-pb,zone-pit-rings-high-bar,zone-tumble-track|95|883|29|32
anchor-pit-pb-09|zone-pit-pb,zone-pit-rings-high-bar,zone-tumble-track|149|883|29|32
anchor-pit-rings-high-bar-04|zone-pit-rings-high-bar,zone-tumble-track|187|883|29|32
anchor-tumble-track-04|zone-tumble-track|500|890|29|32
anchor-ub-3-01|zone-ub-3|564|890|29|32
anchor-ub-3-02|zone-ub-3|637|908|27|33
anchor-preschool-19|zone-preschool|693|921|27|33
anchor-preschool-20|zone-preschool|737|921|27|33
anchor-preschool-21|zone-preschool|778|921|28|33
anchor-ub-3-03|zone-ub-3|533|942|29|32
anchor-ub-3-04|zone-ub-3|576|946|29|32
anchor-ub-3-05|zone-ub-3|646|952|29|32
anchor-preschool-22|zone-preschool|829|955|29|32
anchor-preschool-23|zone-preschool|692|961|29|32
anchor-preschool-24|zone-preschool|734|961|29|32
anchor-preschool-25|zone-preschool|776|961|29|32
"""#

    /// Each left side is the PDF anchor layer's coordinate frame, used only
    /// for label-grid projection. Every right side is copied from the
    /// Skeleton-only geometry draft and is the sole physical image crop.
    private static let skeletonAnchorMappingRows = #"""
zone-floor-f4|144,281,355,103>145,281,348,96
zone-floor-f3|144,384,355,102>145,383,348,96
zone-floor-f2|144,486,355,102>145,483,348,96
zone-floor-f1|144,588,355,96>145,583,348,98
zone-parallel-bars|293,0,206,169>293,4,212,162;499,0,147,75>507,4,208,73
zone-high-bar-boys-bar|166,0,127,169>167,4,127,162
zone-still-rings|499,75,61,182>505,77,60,181
zone-pommel-horse|560,75,149,182>567,77,150,181
zone-tumble-strip|84,281,60,403>84,281,60,403
zone-vault|0,77,84,607>0,77,84,607
"""#
}
