//
//  PlannerStore.swift
//  LessonPlanner
//

import Foundation
import Observation

/// A deliberately small local-first store for the prototype. It persists only
/// the current demo lesson in the app sandbox; vault imports and remote sync
/// will arrive through separate, explicit bridges.
@MainActor
@Observable
final class PlannerStore {
    /// Events are the schedule-level containers. Their ordered phases are
    /// the coach's actual run-of-show within that event.
    var eventBlocks: [LessonEvent]
    /// Compatibility/read-only surface for existing views and local tests.
    /// All mutation goes through event-aware methods below.
    var phases: [LessonPhase] { eventBlocks.flatMap(\.phases) }
    var activeShelf: [PlanningCard]
    /// Archive records are editable library records too. Making the fixture
    /// shelf local and persisted avoids a misleading read-only exception for
    /// an idea merely because it was archived.
    var archivedShelf: [PlanningCard]
    var attendance: [AttendancePerson]
    var isReady: Bool
    var dailyTasks: [DailyTask]
    var dailyUpdates: [DailyUpdate]
    /// A visible local-only counter lets the prototype demonstrate which
    /// tasks reset and which temporary tasks carry into the next class.
    var demoClassNumber: Int
    /// IDs, rather than a ranking algorithm, make gems a durable deliberate
    /// choice that works across the Relevant, Recent, and Archive shelves.
    var gemmedLibraryCardIDs: Set<String>
    /// Most recently *completed* library uses come first. Snapshot placement
    /// is intentionally held separately until a coach explicitly finishes the
    /// local demo lesson.
    var recentlyUsedLibraryCardIDs: [String]
    /// Snapshot planning is not the same thing as completing a lesson. These
    /// IDs stay pending until `completeLocalDemoLesson()` promotes them.
    var pendingPlannedLibraryCardIDs: [String]

    /// Read-only safe-fixture data for the schedule advisory preview. It is
    /// intentionally outside persistence and has no API that can apply it to
    /// phases, so schedule suggestions cannot silently rewrite a lesson.
    var scheduleAdvisory: ScheduleDayAdvisory {
        LessonDemoData.scheduleAdvisory
    }

    /// Compatibility surface for the first prototype test/data shape. The
    /// source of truth is the recurring task in `dailyTasks`.
    var taskComplete: Bool {
        dailyTasks.first(where: { $0.cadence == .recurring })?.isComplete ?? false
    }

    @ObservationIgnored private let persistenceURL: URL?

    init(persistenceURL: URL? = PlannerStore.defaultPersistenceURL()) {
        self.persistenceURL = persistenceURL

        if let persistenceURL,
           let data = try? Data(contentsOf: persistenceURL),
           let persisted = try? JSONDecoder().decode(PersistedLesson.self, from: data) {
            eventBlocks = persisted.eventBlocks
                ?? LessonEvent.migratedFromLegacyPhases(persisted.phases ?? LessonDemoData.phases)
            activeShelf = persisted.activeShelf
            archivedShelf = persisted.archivedShelf ?? LessonDemoData.archivedLibrary
            attendance = persisted.attendance
            isReady = persisted.isReady
            var loadedDailyTasks = persisted.dailyTasks ?? LessonDemoData.dailyTasks
            if persisted.dailyTasks == nil,
               let recurringIndex = loadedDailyTasks.firstIndex(where: { $0.cadence == .recurring }) {
                // The previous prototype persisted one recurring checkbox.
                // Preserve it when the richer task list is first introduced.
                loadedDailyTasks[recurringIndex].isComplete = persisted.taskComplete
            }
            dailyTasks = loadedDailyTasks
            dailyUpdates = persisted.dailyUpdates ?? LessonDemoData.dailyUpdates
            demoClassNumber = persisted.demoClassNumber ?? 1
            gemmedLibraryCardIDs = persisted.gemmedLibraryCardIDs ?? PlannerStore.defaultGemmedLibraryCardIDs
            // Earlier local demo files promoted a card at snapshot placement.
            // Do not carry those historical mock recents into the corrected
            // completion-only behavior.
            recentlyUsedLibraryCardIDs = persisted.libraryCompletionTrackingVersion == 1
                ? persisted.recentlyUsedLibraryCardIDs ?? []
                : []
            pendingPlannedLibraryCardIDs = persisted.pendingPlannedLibraryCardIDs ?? []
        } else {
            eventBlocks = LessonDemoData.events
            activeShelf = LessonDemoData.activeShelf
            archivedShelf = LessonDemoData.archivedLibrary
            attendance = LessonDemoData.attendance
            isReady = false
            dailyTasks = LessonDemoData.dailyTasks
            dailyUpdates = LessonDemoData.dailyUpdates
            demoClassNumber = 1
            gemmedLibraryCardIDs = PlannerStore.defaultGemmedLibraryCardIDs
            recentlyUsedLibraryCardIDs = []
            pendingPlannedLibraryCardIDs = []
        }
    }

    var libraryEventOptions: [String] {
        ["ALL"] + Array(Set(allLibraryCards.flatMap(\.libraryEvents))).sorted()
    }

    var libraryLevelOptions: [String] {
        ["ALL"] + Array(Set(allLibraryCards.flatMap(\.libraryLevels))).sorted()
    }

    /// Tags are intentionally collected from saved local ideas rather than a
    /// second, hand-maintained catalog. The first saved spelling becomes the
    /// reusable display spelling for obvious variants such as warmup,
    /// warm-up, and Warm Up.
    var libraryTagSuggestions: [String] {
        var canonicalTags: [String: String] = [:]
        for card in allLibraryCards {
            for tag in card.tags {
                let cleanedTag = tag.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !cleanedTag.isEmpty else { continue }
                let key = Self.normalizedTagKey(cleanedTag)
                if canonicalTags[key] == nil {
                    canonicalTags[key] = cleanedTag
                }
            }
        }
        return canonicalTags.values.sorted {
            $0.localizedCaseInsensitiveCompare($1) == .orderedAscending
        }
    }

    /// Use the saved spelling when a matching tag already exists and remove
    /// duplicate spellings within the submitted selection. This is deliberately
    /// narrow: it does not collapse unrelated words just because they look
    /// similar.
    func normalizedLibraryTags(_ tags: [String]) -> [String] {
        let existingTags = Dictionary(
            uniqueKeysWithValues: libraryTagSuggestions.map { (Self.normalizedTagKey($0), $0) }
        )
        var seenKeys = Set<String>()
        var normalizedTags: [String] = []
        for tag in tags {
            let cleanedTag = tag.trimmingCharacters(in: .whitespacesAndNewlines)
            let key = Self.normalizedTagKey(cleanedTag)
            guard !key.isEmpty, seenKeys.insert(key).inserted else { continue }
            normalizedTags.append(existingTags[key] ?? cleanedTag)
        }
        return normalizedTags
    }

    func libraryCards(in scope: LibraryScope) -> [PlanningCard] {
        switch scope {
        case .relevant:
            return activeShelf
                .map(decorateForLibrary)
                .sorted { lhs, rhs in
                    if lhs.isGem != rhs.isGem { return lhs.isGem }
                    return lhs.title.localizedCaseInsensitiveCompare(rhs.title) == .orderedAscending
                }
        case .recent:
            return recentlyUsedLibraryCardIDs.compactMap { cardID in
                rawLibraryCard(withID: cardID).map(decorateForLibrary)
            }
        case .archive:
            return archivedShelf
                .map(decorateForLibrary)
                .sorted { lhs, rhs in
                    if lhs.isGem != rhs.isGem { return lhs.isGem }
                    return lhs.title.localizedCaseInsensitiveCompare(rhs.title) == .orderedAscending
                }
        }
    }

    func toggleGem(for cardID: String) {
        guard rawLibraryCard(withID: cardID) != nil else { return }

        if gemmedLibraryCardIDs.contains(cardID) {
            gemmedLibraryCardIDs.remove(cardID)
        } else {
            gemmedLibraryCardIDs.insert(cardID)
        }

        if let activeShelfIndex = activeShelf.firstIndex(where: { $0.id == cardID }) {
            activeShelf[activeShelfIndex].isGem = gemmedLibraryCardIDs.contains(cardID)
        }
        if let archivedShelfIndex = archivedShelf.firstIndex(where: { $0.id == cardID }) {
            archivedShelf[archivedShelfIndex].isGem = gemmedLibraryCardIDs.contains(cardID)
        }
        save()
    }

    func setReady(_ ready: Bool) {
        isReady = ready
        save()
    }

    func setTaskComplete(_ completed: Bool) {
        guard let recurringTaskID = dailyTasks.first(where: { $0.cadence == .recurring })?.id else { return }
        setDailyTaskComplete(recurringTaskID, completed: completed)
    }

    func setDailyTaskComplete(_ taskID: String, completed: Bool) {
        guard let taskIndex = dailyTasks.firstIndex(where: { $0.id == taskID }) else { return }
        dailyTasks[taskIndex].isComplete = completed
        save()
    }

    /// Advances only local fixture state. Recurring tasks reset for the next
    /// class, while unfinished temporary tasks visibly carry forward.
    func advanceLocalDemoClass() {
        demoClassNumber += 1
        for taskIndex in dailyTasks.indices {
            switch dailyTasks[taskIndex].cadence {
            case .recurring:
                dailyTasks[taskIndex].isComplete = false
            case .temporary:
                guard !dailyTasks[taskIndex].isComplete else { continue }
                dailyTasks[taskIndex].rollForwardCount += 1
            }
        }
        save()
    }

    func decide(_ decision: DailyUpdateDecision, forUpdateID updateID: String) {
        guard let updateIndex = dailyUpdates.firstIndex(where: { $0.id == updateID }) else { return }
        let revisionKey = dailyUpdates[updateIndex].revisionKey
        dailyUpdates[updateIndex].decisionsByRevision[revisionKey] = decision
        save()
    }

    var unresolvedDailyUpdateCount: Int {
        dailyUpdates.filter { $0.currentDecision == nil }.count
    }

    func setAttendanceStatus(_ status: AttendancePerson.Status, forPersonID personID: String) {
        guard let personIndex = attendance.firstIndex(where: { $0.id == personID }) else { return }
        attendance[personIndex].status = status
        save()
    }

    /// Local test control: it makes a newer normalized revision arrive. The
    /// old decision remains in persistence, but it deliberately does not carry
    /// into the new revision (including an earlier Reject decision).
    func simulateNewRevision(forUpdateID updateID: String) {
        guard let updateIndex = dailyUpdates.firstIndex(where: { $0.id == updateID }) else { return }
        dailyUpdates[updateIndex].revision += 1
        dailyUpdates[updateIndex].detail = "Revised local mock: \(dailyUpdates[updateIndex].detail)"
        save()
    }

    /// Returns the active visual station panels that can receive a snapshot.
    /// Text phases intentionally return no destinations: their snapshot is a
    /// coaching cue instead of a station card. Hidden/off-canvas panels are
    /// never placement targets.
    func snapshotDestinationZones(forPhaseID phaseID: String) -> [GymZone] {
        guard let location = phaseLocation(for: phaseID),
              eventBlocks[location.eventIndex].phases[location.phaseIndex].mode != .text else {
            return []
        }
        return eventBlocks[location.eventIndex].phases[location.phaseIndex].zones
    }

    /// Returns empty, panel-local anchors only for a selected visual station.
    /// This deliberately does not infer a destination from a card's tags: the
    /// coach chooses among the zones already selected for this exact phase.
    func compatibleAnchorIDs(
        forPhaseID phaseID: String,
        destinationZoneID: String
    ) -> [String] {
        guard let location = phaseLocation(for: phaseID),
              eventBlocks[location.eventIndex].phases[location.phaseIndex].mode != .text,
              let zone = eventBlocks[location.eventIndex].phases[location.phaseIndex].zones
                .first(where: { $0.id == destinationZoneID }) else {
            return []
        }
        return zone.availableAnchorIDs
    }

    /// Places an immutable lesson-local copy. Updating the library card later
    /// will not rewrite the card already used in this lesson.
    ///
    /// A selected idea goes either into the phase's text run-list or into the
    /// exact station anchor the coach taps. `nil` is an explicit text-list
    /// choice; it never means "pick the first station" in the app UI.
    @discardableResult
    func addSnapshot(
        of card: PlanningCard,
        toPhaseID phaseID: String,
        destinationZoneID: String? = nil,
        destinationAnchorID: String? = nil
    ) -> Bool {
        guard let location = phaseLocation(for: phaseID) else { return false }
        let libraryCard = decorateForLibrary(card)
        let snapshot = PlanningCard(
            id: "snapshot-\(UUID().uuidString)",
            kind: libraryCard.kind,
            title: libraryCard.title,
            detail: libraryCard.detail,
            tags: libraryCard.tags,
            accent: libraryCard.accent,
            isGem: libraryCard.isGem,
            safetyRequirement: libraryCard.safetyRequirement,
            levels: libraryCard.levels,
            skills: libraryCard.skills,
            events: libraryCard.events,
            mats: libraryCard.mats,
            variantCount: libraryCard.variantCount,
            hasPhotoAttachment: libraryCard.hasPhotoAttachment,
            hasStationSetup: libraryCard.hasStationSetup
        )

        if let destinationZoneID {
            let compatibleAnchorIDs = compatibleAnchorIDs(
                forPhaseID: phaseID,
                destinationZoneID: destinationZoneID
            )
            // The nil fallback preserves the narrow pre-anchor store API for
            // existing local callers and tests. The actual UI always passes a
            // specific anchor selected by the coach.
            guard let destinationAnchorID = destinationAnchorID ?? compatibleAnchorIDs.first,
                  compatibleAnchorIDs.contains(destinationAnchorID),
                  let destinationIndex = eventBlocks[location.eventIndex].phases[location.phaseIndex].zones
                    .firstIndex(where: { $0.id == destinationZoneID }) else {
                return false
            }
            eventBlocks[location.eventIndex].phases[location.phaseIndex].zones[destinationIndex].cards.append(snapshot)
            eventBlocks[location.eventIndex].phases[location.phaseIndex].zones[destinationIndex].anchorPlacements
                .append(ZoneAnchorPlacement(card: snapshot, anchorID: destinationAnchorID))
        } else {
            guard destinationAnchorID == nil else { return false }
            eventBlocks[location.eventIndex].phases[location.phaseIndex].textCues
                .append("\(snapshot.title) — \(snapshot.detail)")
        }
        recordPendingLibraryPlacement(card.id)
        save()
        return true
    }

    /// Pins a copy of an existing text item to one selected station anchor.
    /// The original run-list line remains intact so the clean chronological
    /// lesson-plan document does not silently lose a coaching instruction.
    @discardableResult
    func addAnchoredText(
        _ text: String,
        toPhaseID phaseID: String,
        destinationZoneID: String,
        destinationAnchorID: String
    ) -> Bool {
        let trimmedText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedText.isEmpty,
              let location = phaseLocation(for: phaseID),
              compatibleAnchorIDs(
                forPhaseID: phaseID,
                destinationZoneID: destinationZoneID
              ).contains(destinationAnchorID),
              let destinationIndex = eventBlocks[location.eventIndex].phases[location.phaseIndex].zones
                .firstIndex(where: { $0.id == destinationZoneID }) else {
            return false
        }

        eventBlocks[location.eventIndex].phases[location.phaseIndex].zones[destinationIndex].anchorPlacements
            .append(ZoneAnchorPlacement(text: trimmedText, anchorID: destinationAnchorID))
        save()
        return true
    }

    /// Explicit completion is the only point at which planned library cards
    /// become Recent. This is local prototype state, not attendance or a
    /// claim that a real lesson was automatically completed.
    func completeLocalDemoLesson() {
        for cardID in pendingPlannedLibraryCardIDs.reversed() {
            recordLibraryUse(cardID)
        }
        pendingPlannedLibraryCardIDs.removeAll()
        save()
    }

    func addTextNote(_ note: String, toPhaseID phaseID: String) {
        let trimmedNote = note.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedNote.isEmpty,
              let location = phaseLocation(for: phaseID) else { return }
        eventBlocks[location.eventIndex].phases[location.phaseIndex].textCues.append(trimmedNote)
        save()
    }

    func updateTextCue(_ cue: String, at index: Int, inPhaseID phaseID: String) {
        guard let location = phaseLocation(for: phaseID),
              eventBlocks[location.eventIndex].phases[location.phaseIndex].textCues.indices.contains(index) else {
            return
        }
        eventBlocks[location.eventIndex].phases[location.phaseIndex].textCues[index] = cue
        save()
    }

    func removeTextCue(at index: Int, inPhaseID phaseID: String) {
        guard let location = phaseLocation(for: phaseID),
              eventBlocks[location.eventIndex].phases[location.phaseIndex].textCues.indices.contains(index) else {
            return
        }
        eventBlocks[location.eventIndex].phases[location.phaseIndex].textCues.remove(at: index)
        save()
    }

    /// Inserts a coach-created phase within its current schedule event. It
    /// deliberately starts text-only so the coach chooses whether it needs a
    /// visual setup instead of inheriting unrelated station panels.
    @discardableResult
    func addPhase(inEventID eventID: String, afterPhaseID phaseID: String? = nil) -> String {
        let newPhase = LessonPhase(
            id: "phase-\(UUID().uuidString.lowercased())",
            time: "",
            title: "New phase",
            mode: .text,
            textCues: [],
            zones: []
        )

        guard let eventIndex = eventBlocks.firstIndex(where: { $0.id == eventID }) else {
            return newPhase.id
        }
        if let phaseID,
           let selectedIndex = eventBlocks[eventIndex].phases.firstIndex(where: { $0.id == phaseID }) {
            eventBlocks[eventIndex].phases.insert(newPhase, at: selectedIndex + 1)
        } else {
            eventBlocks[eventIndex].phases.append(newPhase)
        }
        save()
        return newPhase.id
    }

    /// Compatibility entry point for the first prototype. It now keeps the
    /// new phase inside the selected event instead of creating a look-alike
    /// schedule block.
    @discardableResult
    func addPhase(after phaseID: String? = nil) -> String {
        if let phaseID,
           let event = event(forPhaseID: phaseID) {
            return addPhase(inEventID: event.id, afterPhaseID: phaseID)
        }
        let newEvent = makeNewEvent()
        eventBlocks.append(newEvent)
        save()
        return newEvent.phases[0].id
    }

    /// Makes a distinct event after the current one. It intentionally does
    /// not trim or rewrite the event being left; the coach explicitly edits
    /// either time range once they decide what "early" means that day.
    @discardableResult
    func transitionEarly(fromPhaseID phaseID: String) -> String? {
        guard let currentEventIndex = eventIndex(forPhaseID: phaseID) else { return nil }
        let newEvent = makeNewEvent()
        eventBlocks.insert(newEvent, at: currentEventIndex + 1)
        save()
        return newEvent.phases[0].id
    }

    /// Required phases are the demo's schedule anchors. Other phases can be
    /// removed without affecting library records or other lesson phases.
    @discardableResult
    func deletePhase(id phaseID: String) -> Bool {
        guard let location = phaseLocation(for: phaseID),
              !eventBlocks[location.eventIndex].phases[location.phaseIndex].isRequired else {
            return false
        }
        eventBlocks[location.eventIndex].phases.remove(at: location.phaseIndex)
        if eventBlocks[location.eventIndex].phases.isEmpty,
           !eventBlocks[location.eventIndex].isRequired {
            eventBlocks.remove(at: location.eventIndex)
        }
        save()
        return true
    }

    func updatePhase(
        id phaseID: String,
        title: String? = nil,
        time: String? = nil,
        mode: LessonPhaseMode? = nil
    ) {
        guard let location = phaseLocation(for: phaseID) else { return }
        if let title { eventBlocks[location.eventIndex].phases[location.phaseIndex].title = title }
        if let time { eventBlocks[location.eventIndex].phases[location.phaseIndex].time = time }
        if let mode { eventBlocks[location.eventIndex].phases[location.phaseIndex].mode = mode }
        save()
    }

    func updateEvent(id eventID: String, title: String? = nil, time: String? = nil) {
        guard let eventIndex = eventBlocks.firstIndex(where: { $0.id == eventID }) else { return }
        if let title { eventBlocks[eventIndex].title = title }
        if let time { eventBlocks[eventIndex].time = time }
        save()
    }

    func event(forPhaseID phaseID: String) -> LessonEvent? {
        guard let eventIndex = eventIndex(forPhaseID: phaseID) else { return nil }
        return eventBlocks[eventIndex]
    }

    func isZoneSelected(_ zoneID: String, inPhaseID phaseID: String) -> Bool {
        guard let location = phaseLocation(for: phaseID) else { return false }
        return eventBlocks[location.eventIndex].phases[location.phaseIndex].selectedZoneIDs.contains(zoneID)
    }

    /// Returns generic local-demo zone choices plus any previously saved
    /// zone. The latter avoids losing a future mapped zone that is not in the
    /// prototype catalog yet.
    func zoneOptions(forPhaseID phaseID: String) -> [GymZone] {
        guard let location = phaseLocation(for: phaseID) else {
            return LocalDemoZoneCatalog.zones
        }
        let phase = eventBlocks[location.eventIndex].phases[location.phaseIndex]
        var seenIDs = Set<String>()
        return (LocalDemoZoneCatalog.zones + phase.zones + phase.hiddenZones).filter {
            seenIDs.insert($0.id).inserted
        }
    }

    /// Deselecting moves the exact panel to hidden storage; its cards and
    /// setup notes are restored intact if the coach selects it again.
    func toggleZone(_ zoneID: String, inPhaseID phaseID: String) {
        guard let location = phaseLocation(for: phaseID) else { return }
        let eventIndex = location.eventIndex
        let phaseIndex = location.phaseIndex

        if let selectedZoneIndex = eventBlocks[eventIndex].phases[phaseIndex].zones.firstIndex(where: { $0.id == zoneID }) {
            let removedZone = eventBlocks[eventIndex].phases[phaseIndex].zones.remove(at: selectedZoneIndex)
            eventBlocks[eventIndex].phases[phaseIndex].hiddenZones.removeAll { $0.id == zoneID }
            eventBlocks[eventIndex].phases[phaseIndex].hiddenZones.append(removedZone)
        } else if let hiddenZoneIndex = eventBlocks[eventIndex].phases[phaseIndex].hiddenZones.firstIndex(where: { $0.id == zoneID }) {
            let restoredZone = eventBlocks[eventIndex].phases[phaseIndex].hiddenZones.remove(at: hiddenZoneIndex)
            eventBlocks[eventIndex].phases[phaseIndex].zones.append(restoredZone)
        } else if let freshZone = LocalDemoZoneCatalog.zone(withID: zoneID) {
            eventBlocks[eventIndex].phases[phaseIndex].zones.append(freshZone)
        } else {
            return
        }
        save()
    }

    @discardableResult
    func addLibraryCard(
        kind: PlanningCardKind,
        title: String,
        detail: String,
        tags: [String]
    ) -> PlanningCard? {
        let cleanedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedTitle.isEmpty else { return nil }
        let cleanedDetail = detail.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanedTags = normalizedLibraryTags(tags)
        let card = PlanningCard(
            id: "library-\(UUID().uuidString.lowercased())",
            kind: kind,
            title: cleanedTitle,
            detail: cleanedDetail.isEmpty ? "Coach-added idea." : cleanedDetail,
            tags: cleanedTags.isEmpty ? ["GENERAL"] : cleanedTags,
            accent: kind.defaultAccent,
            isGem: false,
            safetyRequirement: nil
        )
        activeShelf.insert(card, at: 0)
        save()
        return card
    }

    /// Updates only the source library record. Existing lesson placements are
    /// intentional snapshots and therefore remain unchanged.
    @discardableResult
    func updateLibraryCard(
        id: String,
        kind: PlanningCardKind,
        title: String,
        detail: String,
        tags: [String],
        levels: [String],
        skills: [String],
        events: [String],
        mats: [String],
        safetyRequirement: String?,
        variantCount: Int
    ) -> PlanningCard? {
        let cleanedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedTitle.isEmpty else { return nil }

        let cleanedDetail = detail.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanedSafetyRequirement = safetyRequirement?
            .trimmingCharacters(in: .whitespacesAndNewlines)
        let updatedTags = normalizedLibraryTags(tags)

        func applyEdits(to card: inout PlanningCard) {
            card.kind = kind
            card.title = cleanedTitle
            card.detail = cleanedDetail.isEmpty ? "Coach-added idea." : cleanedDetail
            card.tags = updatedTags.isEmpty ? ["GENERAL"] : updatedTags
            card.accent = kind.defaultAccent
            card.levels = Self.cleanedLibraryValues(levels)
            card.skills = Self.cleanedLibraryValues(skills)
            card.events = Self.cleanedLibraryValues(events)
            card.mats = Self.cleanedLibraryValues(mats)
            card.safetyRequirement = cleanedSafetyRequirement?.isEmpty == false ? cleanedSafetyRequirement : nil
            card.variantCount = max(1, variantCount)
        }

        if let activeIndex = activeShelf.firstIndex(where: { $0.id == id }) {
            applyEdits(to: &activeShelf[activeIndex])
            save()
            return decorateForLibrary(activeShelf[activeIndex])
        }
        if let archiveIndex = archivedShelf.firstIndex(where: { $0.id == id }) {
            applyEdits(to: &archivedShelf[archiveIndex])
            save()
            return decorateForLibrary(archivedShelf[archiveIndex])
        }
        return nil
    }

    private func phaseLocation(for phaseID: String) -> (eventIndex: Int, phaseIndex: Int)? {
        for eventIndex in eventBlocks.indices {
            if let phaseIndex = eventBlocks[eventIndex].phases.firstIndex(where: { $0.id == phaseID }) {
                return (eventIndex, phaseIndex)
            }
        }
        return nil
    }

    private func eventIndex(forPhaseID phaseID: String) -> Int? {
        phaseLocation(for: phaseID)?.eventIndex
    }

    private func makeNewEvent() -> LessonEvent {
        let phase = LessonPhase(
            id: "phase-\(UUID().uuidString.lowercased())",
            time: "",
            title: "New phase",
            mode: .text,
            textCues: [],
            zones: []
        )
        return LessonEvent(
            id: "event-\(UUID().uuidString.lowercased())",
            time: "SET TIME",
            title: "New event",
            phases: [phase]
        )
    }

    private func save() {
        guard let persistenceURL else { return }
        let persisted = PersistedLesson(
            eventBlocks: eventBlocks,
            phases: phases,
            activeShelf: activeShelf,
            archivedShelf: archivedShelf,
            attendance: attendance,
            isReady: isReady,
            taskComplete: taskComplete,
            dailyTasks: dailyTasks,
            dailyUpdates: dailyUpdates,
            demoClassNumber: demoClassNumber,
            gemmedLibraryCardIDs: gemmedLibraryCardIDs,
            recentlyUsedLibraryCardIDs: recentlyUsedLibraryCardIDs,
            pendingPlannedLibraryCardIDs: pendingPlannedLibraryCardIDs,
            libraryCompletionTrackingVersion: 1
        )

        do {
            try FileManager.default.createDirectory(
                at: persistenceURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            try encoder.encode(persisted).write(to: persistenceURL, options: .atomic)
        } catch {
            // The lesson remains usable in memory if local persistence fails.
        }
    }

    nonisolated private static func defaultPersistenceURL() -> URL? {
        guard let baseURL = try? FileManager.default.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: false
        ) else {
            return nil
        }
        return baseURL
            .appendingPathComponent("LessonPlanner", isDirectory: true)
            .appendingPathComponent("local-demo-lesson.json")
    }

    private var allLibraryCards: [PlanningCard] {
        activeShelf + archivedShelf
    }

    private func rawLibraryCard(withID cardID: String) -> PlanningCard? {
        allLibraryCards.first(where: { $0.id == cardID })
    }

    private func decorateForLibrary(_ card: PlanningCard) -> PlanningCard {
        var decoratedCard = card
        decoratedCard.isGem = gemmedLibraryCardIDs.contains(card.id)
        return decoratedCard
    }

    private func recordLibraryUse(_ cardID: String) {
        guard rawLibraryCard(withID: cardID) != nil else { return }
        recentlyUsedLibraryCardIDs.removeAll { $0 == cardID }
        recentlyUsedLibraryCardIDs.insert(cardID, at: 0)
        recentlyUsedLibraryCardIDs = Array(recentlyUsedLibraryCardIDs.prefix(12))
    }

    private func recordPendingLibraryPlacement(_ cardID: String) {
        guard rawLibraryCard(withID: cardID) != nil else { return }
        pendingPlannedLibraryCardIDs.removeAll { $0 == cardID }
        pendingPlannedLibraryCardIDs.insert(cardID, at: 0)
        pendingPlannedLibraryCardIDs = Array(pendingPlannedLibraryCardIDs.prefix(12))
    }

    private static var defaultGemmedLibraryCardIDs: Set<String> {
        Set((LessonDemoData.activeShelf + LessonDemoData.archivedLibrary)
            .filter(\.isGem)
            .map(\.id))
    }

    private static func normalizedTagKey(_ value: String) -> String {
        value
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)
            .lowercased()
            .unicodeScalars
            .filter { CharacterSet.alphanumerics.contains($0) }
            .map(String.init)
            .joined()
    }

    private static func cleanedLibraryValues(_ values: [String]) -> [String] {
        var seenValues = Set<String>()
        return values.compactMap { value in
            let cleanedValue = value.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !cleanedValue.isEmpty else { return nil }
            let comparisonKey = cleanedValue.folding(
                options: [.caseInsensitive, .diacriticInsensitive],
                locale: .current
            )
            return seenValues.insert(comparisonKey).inserted ? cleanedValue : nil
        }
    }
}

private struct PersistedLesson: Codable {
    /// Optional to read the pre-event-block local demo safely.
    let eventBlocks: [LessonEvent]?
    /// Retained alongside eventBlocks as a one-way migration fallback for
    /// older prototype builds that persisted only a flat phase list.
    let phases: [LessonPhase]?
    let activeShelf: [PlanningCard]
    /// Optional so pre-archive-edit local files retain the built-in archive
    /// fixture without failing their migration.
    let archivedShelf: [PlanningCard]?
    let attendance: [AttendancePerson]
    let isReady: Bool
    let taskComplete: Bool
    /// Optional keys preserve prototype lesson files created before the daily
    /// operations slice was added.
    let dailyTasks: [DailyTask]?
    let dailyUpdates: [DailyUpdate]?
    let demoClassNumber: Int?
    /// Optional keys preserve existing prototype lesson files created before
    /// library controls were added.
    let gemmedLibraryCardIDs: Set<String>?
    let recentlyUsedLibraryCardIDs: [String]?
    let pendingPlannedLibraryCardIDs: [String]?
    /// Version 1 means Recent was populated only via explicit local lesson
    /// completion. Missing preserves no old automatic-placement recents.
    let libraryCompletionTrackingVersion: Int?
}
