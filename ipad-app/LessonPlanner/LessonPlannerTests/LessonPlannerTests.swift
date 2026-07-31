//
//  LessonPlannerTests.swift
//  LessonPlannerTests
//
//  Created by Ryan Sadler on 7/19/26.
//

import Foundation
import Testing
@testable import LessonPlanner

struct LessonPlannerTests {

    @Test func visualPhaseIncludesOnlyItsSelectedZones() async throws {
        let bars = try #require(LessonDemoData.phases.first(where: { $0.id == "bars" }))

        #expect(bars.zones.map(\.alias) == ["PB/HB", "TS"])
        #expect(!bars.zones.map(\.alias).contains("Rings"))
        #expect(bars.mode == .mixed)
    }

    @Test func textOnlyPhaseHasNoStationPanels() async throws {
        let arrival = try #require(LessonDemoData.phases.first(where: { $0.id == "arrival" }))

        #expect(arrival.zones.isEmpty)
        #expect(arrival.mode == .text)
    }

    @Test @MainActor func localScheduleAdvisoryIsReadOnlyAndKeepsOpeningsSeparate() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-schedule-advisory-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let phasesBeforePreview = store.phases
        let advisory = store.scheduleAdvisory

        #expect(advisory.dateISO == "2026-01-09")
        #expect(advisory.selectedGroup == "DEMO GROUP")
        #expect(advisory.resolvedWeek == "Even")
        #expect(advisory.rotationBlocks.count == 6)
        #expect(advisory.optionalOpenings.isEmpty)
        #expect(advisory.suggestedStructureBlocks == advisory.rotationBlocks + advisory.supportBlocks)
        #expect(store.phases == phasesBeforePreview)
    }

    @Test @MainActor func lessonEditsStayLocalAndBecomeSnapshots() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-store-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let card = try #require(store.activeShelf.first)

        #expect(store.addSnapshot(of: card, toPhaseID: "bars", destinationZoneID: "pb-hb"))
        store.addTextNote("Check grip tape.", toPhaseID: "arrival")
        store.setReady(true)

        let bars = try #require(store.phases.first(where: { $0.id == "bars" }))
        let arrival = try #require(store.phases.first(where: { $0.id == "arrival" }))
        #expect(bars.zones[0].cards.contains(where: { $0.title == card.title && $0.id != card.id }))
        #expect(arrival.textCues.contains("Check grip tape."))

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        #expect(reloadedStore.isReady)
        #expect(reloadedStore.phases.first(where: { $0.id == "arrival" })?.textCues.contains("Check grip tape.") == true)
    }

    @Test @MainActor func snapshotsRequireAnExplicitStationAndCanBePlacedInTheTextRunList() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-explicit-snapshot-zone-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let card = try #require(store.activeShelf.first)
        let barsBefore = try #require(store.phases.first(where: { $0.id == "bars" }))
        let pbHBCountBefore = try #require(barsBefore.zones.first(where: { $0.id == "pb-hb" })?.cards.count)
        let trampolineCountBefore = try #require(barsBefore.zones.first(where: { $0.id == "ts" })?.cards.count)

        // A nil destination is an explicit text-list choice. It must not
        // quietly choose PB/HB just because it is first in the saved order.
        #expect(store.snapshotDestinationZones(forPhaseID: "bars").map(\.id) == ["pb-hb", "ts"])
        #expect(store.addSnapshot(of: card, toPhaseID: "bars"))
        let textPlacedBars = try #require(store.phases.first(where: { $0.id == "bars" }))
        #expect(textPlacedBars.zones.first(where: { $0.id == "pb-hb" })?.cards.count == pbHBCountBefore)
        #expect(textPlacedBars.zones.first(where: { $0.id == "ts" })?.cards.count == trampolineCountBefore)
        #expect(textPlacedBars.textCues.contains(where: { $0.contains(card.title) }))
        #expect(store.pendingPlannedLibraryCardIDs == [card.id])

        #expect(store.addSnapshot(of: card, toPhaseID: "bars", destinationZoneID: "ts"))
        let placedBars = try #require(store.phases.first(where: { $0.id == "bars" }))
        #expect(placedBars.zones.first(where: { $0.id == "pb-hb" })?.cards.count == pbHBCountBefore)
        #expect(placedBars.zones.first(where: { $0.id == "ts" })?.cards.count == trampolineCountBefore + 1)
        #expect(store.pendingPlannedLibraryCardIDs == [card.id])

        // Text and no-zone phases intentionally retain their coaching-cue
        // behavior instead of requiring a fictional station target.
        #expect(store.addSnapshot(of: card, toPhaseID: "arrival"))
        let arrival = try #require(store.phases.first(where: { $0.id == "arrival" }))
        #expect(arrival.textCues.contains(where: { $0.contains("Idea: \(card.title)") }))
        #expect(arrival.zones.isEmpty)

        let noZonePhaseID = store.addPhase(after: "arrival")
        store.updatePhase(id: noZonePhaseID, mode: .visual)
        #expect(store.snapshotDestinationZones(forPhaseID: noZonePhaseID).isEmpty)
        #expect(store.addSnapshot(of: card, toPhaseID: noZonePhaseID))
        let noZonePhase = try #require(store.phases.first(where: { $0.id == noZonePhaseID }))
        #expect(noZonePhase.mode == .visual)
        #expect(noZonePhase.zones.isEmpty)
        #expect(noZonePhase.textCues.contains(where: { $0.contains("Idea: \(card.title)") }))

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        let reloadedBars = try #require(reloadedStore.phases.first(where: { $0.id == "bars" }))
        #expect(reloadedBars.zones.first(where: { $0.id == "ts" })?.cards.count == trampolineCountBefore + 1)
    }

    @Test @MainActor func phaseStructureEditorPreservesHiddenZoneContentAndPersists() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-phase-editor-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let originalBarZone = try #require(
            store.phases.first(where: { $0.id == "bars" })?.zones.first(where: { $0.id == "pb-hb" })
        )

        // Turning off a panel must not destroy its cards. It moves off-canvas
        // until the same zone is chosen again.
        store.toggleZone("pb-hb", inPhaseID: "bars")
        let offCanvasBars = try #require(store.phases.first(where: { $0.id == "bars" }))
        #expect(!offCanvasBars.zones.contains(where: { $0.id == "pb-hb" }))
        #expect(offCanvasBars.hiddenZones.first(where: { $0.id == "pb-hb" })?.cards == originalBarZone.cards)

        store.toggleZone("pb-hb", inPhaseID: "bars")
        let restoredBars = try #require(store.phases.first(where: { $0.id == "bars" }))
        #expect(restoredBars.zones.first(where: { $0.id == "pb-hb" })?.cards == originalBarZone.cards)

        let newPhaseID = store.addPhase(after: "bars")
        store.updatePhase(
            id: newPhaseID,
            title: "F4 + TS connector",
            time: "4:10–4:20",
            mode: .mixed
        )
        store.toggleZone("f4", inPhaseID: newPhaseID)
        store.toggleZone("ts", inPhaseID: newPhaseID)

        let newPhase = try #require(store.phases.first(where: { $0.id == newPhaseID }))
        #expect(newPhase.visibleZones.map(\.alias) == ["F4", "TS"])
        #expect(!newPhase.isRequired)
        #expect(store.deletePhase(id: "arrival") == false)

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        let reloadedPhase = try #require(reloadedStore.phases.first(where: { $0.id == newPhaseID }))
        #expect(reloadedPhase.title == "F4 + TS connector")
        #expect(reloadedPhase.visibleZones.map(\.alias) == ["F4", "TS"])
        #expect(reloadedStore.phases.first(where: { $0.id == "bars" })?.zones.first(where: { $0.id == "pb-hb" })?.cards == originalBarZone.cards)

        #expect(reloadedStore.deletePhase(id: newPhaseID))
        #expect(!reloadedStore.phases.contains(where: { $0.id == newPhaseID }))
    }

    @Test @MainActor func libraryGemsAndCompletedUsesPersistLocally() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-library-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let archivedCard = try #require(
            store.libraryCards(in: .archive).first(where: { $0.id == "archive-vault-shapes" })
        )

        store.toggleGem(for: archivedCard.id)
        #expect(store.addSnapshot(of: archivedCard, toPhaseID: "bars", destinationZoneID: "pb-hb"))

        #expect(store.libraryCards(in: .recent).isEmpty)
        #expect(store.pendingPlannedLibraryCardIDs == [archivedCard.id])

        // A placed snapshot is only planned. Recent is earned when the coach
        // explicitly completes the local lesson, not at placement time.
        store.completeLocalDemoLesson()
        #expect(store.libraryCards(in: .recent).first?.id == archivedCard.id)
        #expect(store.libraryCards(in: .archive).first(where: { $0.id == archivedCard.id })?.isGem == true)

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        #expect(reloadedStore.libraryCards(in: .recent).first?.id == archivedCard.id)
        #expect(reloadedStore.libraryCards(in: .archive).first(where: { $0.id == archivedCard.id })?.isGem == true)
    }

    @Test @MainActor func localDailyOperationsRollForwardAndRevisionDecisionsPersist() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-daily-operations-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let recurringTask = try #require(store.dailyTasks.first(where: { $0.cadence == .recurring }))
        let temporaryTask = try #require(store.dailyTasks.first(where: { $0.cadence == .temporary }))
        let update = try #require(store.dailyUpdates.first)

        store.setDailyTaskComplete(recurringTask.id, completed: true)
        store.advanceLocalDemoClass()

        #expect(store.demoClassNumber == 2)
        #expect(store.dailyTasks.first(where: { $0.id == recurringTask.id })?.isComplete == false)
        #expect(store.dailyTasks.first(where: { $0.id == temporaryTask.id })?.rollForwardCount == 1)

        store.decide(.rejected, forUpdateID: update.id)
        #expect(store.dailyUpdates.first(where: { $0.id == update.id })?.currentDecision == .rejected)

        // Rejecting R1 must not mute R2. A new revision has no decision until
        // the coach makes one, while the original decision remains recorded.
        store.simulateNewRevision(forUpdateID: update.id)
        let revisedUpdate = try #require(store.dailyUpdates.first(where: { $0.id == update.id }))
        #expect(revisedUpdate.revision == 2)
        #expect(revisedUpdate.currentDecision == nil)
        #expect(revisedUpdate.decision(forRevision: 1) == .rejected)

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        let reloadedUpdate = try #require(reloadedStore.dailyUpdates.first(where: { $0.id == update.id }))
        #expect(reloadedStore.demoClassNumber == 2)
        #expect(reloadedStore.dailyTasks.first(where: { $0.id == temporaryTask.id })?.rollForwardCount == 1)
        #expect(reloadedUpdate.currentDecision == nil)
        #expect(reloadedUpdate.decision(forRevision: 1) == .rejected)
    }

    @Test @MainActor func phasesStayInsideEventsAndEarlyTransitionCreatesANewEvent() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-event-blocks-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let barsEvent = try #require(store.event(forPhaseID: "bars"))
        let eventCountBefore = store.eventBlocks.count

        let extraBarsPhaseID = store.addPhase(inEventID: barsEvent.id, afterPhaseID: "bars")
        #expect(store.eventBlocks.count == eventCountBefore)
        #expect(store.event(forPhaseID: extraBarsPhaseID)?.id == barsEvent.id)
        #expect(store.event(forPhaseID: "bars")?.phases.map(\.id) == ["bars", extraBarsPhaseID])

        let nextEventPhaseID = try #require(store.transitionEarly(fromPhaseID: extraBarsPhaseID))
        #expect(store.eventBlocks.count == eventCountBefore + 1)
        let nextEvent = try #require(store.event(forPhaseID: nextEventPhaseID))
        #expect(nextEvent.id != barsEvent.id)
        #expect(nextEvent.title == "New event")
        #expect(nextEvent.time == "SET TIME")

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        #expect(reloadedStore.event(forPhaseID: extraBarsPhaseID)?.id == barsEvent.id)
        #expect(reloadedStore.event(forPhaseID: nextEventPhaseID)?.title == "New event")
    }

    @Test @MainActor func attendanceAndCoachAddedIdeasPersistLocally() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-attendance-ideas-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let person = try #require(store.attendance.first)
        store.setAttendanceStatus(.absent, forPersonID: person.id)
        let idea = try #require(store.addLibraryCard(
            kind: .drill,
            title: "Coach-added shape drill",
            detail: "Two clean holds before moving on.",
            tags: ["F2", "L3"]
        ))

        #expect(store.attendance.first(where: { $0.id == person.id })?.status == .absent)
        #expect(store.libraryCards(in: .relevant).contains(where: { $0.id == idea.id }))

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        #expect(reloadedStore.attendance.first(where: { $0.id == person.id })?.status == .absent)
        #expect(reloadedStore.libraryCards(in: .relevant).contains(where: { $0.id == idea.id }))
    }

    @Test @MainActor func legacyIdeaCardsDecodeWithSafeDetailDefaults() async throws {
        let legacyData = Data(
            """
            {
              "id": "legacy-card",
              "kind": "DRILL",
              "title": "Legacy shape drill",
              "detail": "Saved before the detailed library fields existed.",
              "tags": ["floor", "L3–L4"]
            }
            """.utf8
        )

        let card = try JSONDecoder().decode(PlanningCard.self, from: legacyData)

        #expect(card.kind == .drill)
        #expect(card.levels == ["L3–L4"])
        #expect(card.skills.isEmpty)
        #expect(card.events.isEmpty)
        #expect(card.mats.isEmpty)
        #expect(card.variantCount == 1)
        #expect(!card.hasPhotoAttachment)
        #expect(!card.hasStationSetup)
        #expect(card.mediaAndStationIndicator == "NO PHOTO OR STATION SETUP")
    }

    @Test @MainActor func warmUpIdeasAndNormalizedTagsPersistWithDetailedFields() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-warm-up-library-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)

        #expect(PlanningCardKind.allCases.contains(.warmUp))
        #expect(store.libraryTagSuggestions.contains(where: {
            $0.caseInsensitiveCompare("warmup") == .orderedSame
        }))
        #expect(store.normalizedLibraryTags(["warm-up", "Warm Up", "floor"]) == ["warmup", "floor"])

        let added = try #require(store.addLibraryCard(
            kind: .warmUp,
            title: "Coach-added warm-up",
            detail: "Prepare ankles and landing shapes.",
            tags: ["Warm Up", "warm-up", "L3"]
        ))

        #expect(added.kind == .warmUp)
        // Existing saved spellings win for equivalent suggestions: the fixture
        // already stores this level tag as `L3+`.
        #expect(added.tags == ["warmup", "L3+"])
        #expect(added.matchesLibrarySearch("warm_up"))

        let updated = try #require(store.updateLibraryCard(
            id: added.id,
            kind: .warmUp,
            title: "Coach-added warm-up",
            detail: "Prepare ankles and landing shapes before bars.",
            tags: ["warm-up", "BARS"],
            levels: ["L3", "L4"],
            skills: ["Landing shape", "Ankle prep"],
            events: ["BARS"],
            mats: ["Panel mat"],
            safetyRequirement: "Keep travel lanes clear.",
            variantCount: 3
        ))

        #expect(updated.kind == .warmUp)
        #expect(updated.tags == ["warmup", "bars"])
        #expect(updated.levels == ["L3", "L4"])
        #expect(updated.skills == ["Landing shape", "Ankle prep"])
        #expect(updated.events == ["BARS"])
        #expect(updated.mats == ["Panel mat"])
        #expect(updated.safetyRequirement == "Keep travel lanes clear.")
        #expect(updated.variantCount == 3)

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        let reloaded = try #require(
            reloadedStore.libraryCards(in: .relevant).first(where: { $0.id == added.id })
        )
        #expect(reloaded.kind == .warmUp)
        #expect(reloaded.tags == ["warmup", "bars"])
        #expect(reloaded.events == ["BARS"])
        #expect(reloaded.variantCount == 3)
    }

    @Test func selectedZoneLayoutsUseDurableAnchorsAndCompositeUnions() async throws {
        let pbHBLayout = GymLayoutAnchorRegistry.layout(forLocalZoneID: "pb-hb")
        let ringsPommelLayout = GymLayoutAnchorRegistry.layout(forLocalZoneID: "sr-ph")
        let tumbleStripLayout = GymLayoutAnchorRegistry.layout(forLocalZoneID: "ts")

        #expect(GymLayoutAnchorRegistry.canonicalAnchorCount == 201)
        #expect(pbHBLayout.usesStationBoardBackground)
        #expect(pbHBLayout.stationBoard?.assetName == "StationBoardPBHB")
        #expect(pbHBLayout.anchors.contains(where: { $0.id == "anchor-parallel-bars-01" }))
        #expect(pbHBLayout.anchors.contains(where: { $0.id == "anchor-high-bar-boys-bar-01" }))
        #expect(!pbHBLayout.anchors.contains(where: { $0.id.hasPrefix("anchor-vault-") }))
        #expect(ringsPommelLayout.usesStationBoardBackground)
        #expect(ringsPommelLayout.stationBoard?.assetName == "StationBoardSRPH")
        #expect(ringsPommelLayout.anchors.contains(where: { $0.id == "anchor-still-rings-01" }))
        #expect(ringsPommelLayout.anchors.contains(where: { $0.id == "anchor-pommel-horse-01" }))

        #expect(tumbleStripLayout.usesStationBoardBackground)
        #expect(tumbleStripLayout.stationBoard?.assetName == "StationBoardTS")
        #expect(tumbleStripLayout.anchors.count == 7)
        #expect(tumbleStripLayout.anchors.allSatisfy { $0.id.hasPrefix("anchor-tumble-strip-") })
        #expect(tumbleStripLayout.anchors.allSatisfy { $0.fallbackRelativeY == nil })

        // Direct boards use their supplied art, while F1–F4 continue to use
        // the verified Skeleton source. Both coordinate systems must retain
        // every durable label in its visible/tappable board bounds.
        for localZoneID in ["f4", "f3", "f2", "f1", "pb-hb", "sr-ph", "rings"] {
            let layout = GymLayoutAnchorRegistry.layout(forLocalZoneID: localZoneID)
            let viewport = try #require(layout.viewport)
            #expect(layout.anchors.allSatisfy { anchor in
                anchor.rect.x >= viewport.x
                    && anchor.rect.maxX <= viewport.maxX
                    && anchor.rect.y >= viewport.y
                    && anchor.rect.maxY <= viewport.maxY
            })
        }
    }

    @Test func suppliedStationBoardsOverrideAutomaticCropsWithoutInventingFXOrF5() async throws {
        let expectedAssets = [
            "f6": "StationBoardF6",
            "wr": "StationBoardWR",
            "sr-ph": "StationBoardSRPH",
            "hb": "StationBoardHB",
            "pb": "StationBoardPB",
            "pb-hb": "StationBoardPBHB",
            "beam-all": "StationBoardBeamAll",
            "fx-ts": "StationBoardFXTS",
            "ts": "StationBoardTS",
            "vault": "StationBoardVault",
            "pit-pb": "StationBoardPitPB",
            "ub1-ub2-strap": "StationBoardUB1UB2Strap",
            "tumble-track": "StationBoardTumbleTrack",
            "preschool": "StationBoardPreschool"
        ]

        for (localZoneID, assetName) in expectedAssets {
            let layout = GymLayoutAnchorRegistry.layout(forLocalZoneID: localZoneID)
            #expect(layout.stationBoard?.assetName == assetName)
            #expect(layout.usesStationBoardBackground)
        }

        #expect(GymLayoutAnchorRegistry.layout(forLocalZoneID: "fx").stationBoard == nil)
        #expect(GymLayoutAnchorRegistry.layout(forLocalZoneID: "fx").usesSkeletonBackground)
        #expect(GymLayoutAnchorRegistry.layout(forLocalZoneID: "f5").stationBoard == nil)
        #expect(LocalDemoZoneCatalog.zone(withID: "stap-bar")?.alias == "STRAP BAR")
        #expect(LocalDemoZoneCatalog.zone(withID: "ub3")?.alias == "UB3")
    }

    @Test @MainActor func anchorPlacementIsExplicitSingleCapacityAndPersists() async throws {
        let storeURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("lesson-planner-anchor-placement-\(UUID().uuidString).json")
        defer { try? FileManager.default.removeItem(at: storeURL) }

        let store = PlannerStore(persistenceURL: storeURL)
        let card = try #require(store.activeShelf.first)
        let firstAvailableAnchor = try #require(
            store.compatibleAnchorIDs(forPhaseID: "bars", destinationZoneID: "ts").first
        )

        #expect(firstAvailableAnchor.hasPrefix("anchor-tumble-strip-"))
        #expect(store.addSnapshot(
            of: card,
            toPhaseID: "bars",
            destinationZoneID: "ts",
            destinationAnchorID: firstAvailableAnchor
        ))
        #expect(!store.addSnapshot(
            of: card,
            toPhaseID: "bars",
            destinationZoneID: "ts",
            destinationAnchorID: firstAvailableAnchor
        ))

        let placedBars = try #require(store.phases.first(where: { $0.id == "bars" }))
        let placedTumbleStrip = try #require(placedBars.zones.first(where: { $0.id == "ts" }))
        #expect(placedTumbleStrip.anchorPlacements.contains(where: {
            $0.anchorID == firstAvailableAnchor && $0.title == card.title
        }))
        #expect(!store.compatibleAnchorIDs(forPhaseID: "bars", destinationZoneID: "ts")
            .contains(firstAvailableAnchor))

        let textAnchor = try #require(
            store.compatibleAnchorIDs(forPhaseID: "bars", destinationZoneID: "ts").first
        )
        let runListCount = placedBars.textCues.count
        #expect(store.addAnchoredText(
            "Coach cue stays in the run list.",
            toPhaseID: "bars",
            destinationZoneID: "ts",
            destinationAnchorID: textAnchor
        ))
        let textPlacedBars = try #require(store.phases.first(where: { $0.id == "bars" }))
        let textPlacedTumbleStrip = try #require(textPlacedBars.zones.first(where: { $0.id == "ts" }))
        #expect(textPlacedBars.textCues.count == runListCount)
        #expect(textPlacedTumbleStrip.anchorPlacements.contains(where: {
            $0.anchorID == textAnchor && $0.contentKind == .text
        }))

        let reloadedStore = PlannerStore(persistenceURL: storeURL)
        let reloadedTumbleStrip = try #require(
            reloadedStore.phases.first(where: { $0.id == "bars" })?.zones.first(where: { $0.id == "ts" })
        )
        #expect(reloadedTumbleStrip.anchorPlacements.contains(where: { $0.anchorID == firstAvailableAnchor }))
        #expect(reloadedTumbleStrip.anchorPlacements.contains(where: { $0.anchorID == textAnchor }))
    }

    @Test func zoneCatalogKeepsTheFloorSlicesAndTumbleStripSemantics() async throws {
        let floor = LocalDemoZoneCatalog.zones.filter { $0.mapGroup == "FLOOR" }
        let orderedFloorSlices = floor
            .filter { $0.mapOrder != nil }
            .sorted { ($0.mapOrder ?? 0) < ($1.mapOrder ?? 0) }
        #expect(orderedFloorSlices.map(\.alias) == ["F1", "F2", "F3", "F4", "F5", "F6"])
        #expect(orderedFloorSlices.compactMap(\.mapOrder) == [1, 2, 3, 4, 5, 6])
        #expect(floor.contains(where: { $0.id == "fx" }))
        #expect(LocalDemoZoneCatalog.zone(withID: "ts")?.title == "TUMBLE STRIP")
    }

}
