//
//  ContentView.swift
//  LessonPlanner
//

import Combine
import SwiftUI

/// Keeps a selected library idea or run-list item attached to the phase that
/// was on screen when the coach pressed Place. A later phase selection cannot
/// redirect it to another station.
private enum PlacementPayload {
    case libraryIdea(PlanningCard)
    case textItem(String)

    var shortLabel: String {
        switch self {
        case let .libraryIdea(card): card.title
        case let .textItem(text): text
        }
    }

    var title: String {
        switch self {
        case let .libraryIdea(card): card.title
        case .textItem: "Text item"
        }
    }

    var detail: String {
        switch self {
        case let .libraryIdea(card): card.detail
        case let .textItem(text): text
        }
    }

    var canAddToTextList: Bool {
        if case .libraryIdea = self { return true }
        return false
    }
}

private struct SnapshotPlacementRequest: Identifiable {
    let id = UUID()
    let payload: PlacementPayload
    let phaseID: String
}

struct ContentView: View {
    /// Every station uses one bounded planning canvas. Coach-supplied station
    /// art is letterboxed inside it, rather than making a Tumble Strip grow
    /// vertically or a PB/HB board grow horizontally to its raw pixel ratio.
    private static let compactStationCanvasAspectRatio: CGFloat = 16.0 / 10.0
    private static let compactStationCanvasMinimumHeight: CGFloat = 180
    private static let compactStationCanvasMaximumHeight: CGFloat = 280
    private static let stationLabelEdgeInset: CGFloat = 5

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var store = PlannerStore()
    @State private var selectedPhaseID = "bars"
    @State private var isViewMode = false
    /// A selected idea or text item stays selected until the coach taps one
    /// compatible anchor or cancels. It is never placed merely because a
    /// phase has one visible station.
    @State private var placementRequest: SnapshotPlacementRequest?
    @State private var selectedAnchorDetail: ZoneAnchorPlacement?
    @State private var selectedLibraryScope: LibraryScope = .relevant
    @State private var librarySearch = ""
    @State private var selectedLibraryCategory = "ALL"
    @State private var selectedLibraryEvent = "ALL"
    @State private var selectedLibraryLevel = "ALL"
    @State private var textNote = ""
    @State private var remainingSeconds = 30 * 60
    @State private var isTimerRunning = false
    @State private var phaseRunStatus: [String: String] = [:]
    @State private var isScheduleAdvisoryExpanded = true
    @State private var isNewIdeaSheetPresented = false
    @State private var newIdeaKind: PlanningCardKind = .drill
    @State private var newIdeaTitle = ""
    @State private var newIdeaDetail = ""
    @State private var newIdeaTags = ""
    @State private var isHeaderSparkActive = false
    @State private var isUpdateShakeActive = false

    private let countdownTimer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private var selectedPhase: LessonPhase {
        store.phases.first(where: { $0.id == selectedPhaseID })
            ?? store.phases.first
            ?? LessonDemoData.phases[0]
    }

    private var selectedEvent: LessonEvent? {
        store.event(forPhaseID: selectedPhaseID)
    }

    var body: some View {
        NavigationSplitView {
            phaseSidebar
                .navigationTitle("TODAY")
        } detail: {
            ScrollView {
                VStack(spacing: 14) {
                    terminalStrip
                    lessonHeader
                    scheduleAdvisoryPreview
                    if isViewMode { lessonPlanDocument }
                    phaseBoard
                    if !isViewMode { activeShelf }
                    operations
                }
                .padding(14)
            }
            .background(RetroPalette.webTeal.ignoresSafeArea())
            .navigationTitle("LESSON PLANNER")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Picker("Mode", selection: $isViewMode) {
                        Text("EDIT").tag(false)
                        Text("VIEW").tag(true)
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 138)
                }
            }
        }
        .tint(RetroPalette.titleNavy)
        .sheet(isPresented: $isNewIdeaSheetPresented) {
            newIdeaSheet
                .presentationDetents([.medium, .large])
        }
        .sheet(item: $selectedAnchorDetail) { placement in
            anchorDetailSheet(for: placement)
                .presentationDetents([.medium])
        }
        .onReceive(countdownTimer) { _ in
            guard isTimerRunning, remainingSeconds > 0 else { return }
            remainingSeconds -= 1
            if remainingSeconds == 0 { isTimerRunning = false }
        }
        .onChange(of: selectedPhaseID) { _, _ in
            isTimerRunning = false
            remainingSeconds = 30 * 60
            placementRequest = nil
            selectedAnchorDetail = nil
        }
        .onChange(of: store.unresolvedDailyUpdateCount) { _, _ in
            startAttentionAnimations()
        }
        .onAppear {
            startAttentionAnimations()
        }
    }

    private var terminalStrip: some View {
        HStack {
            Text(store.isReady ? "● READY DEMO FLAG · LOCAL ONLY · NO LIVE CONNECTORS" : "● LOCAL DRAFT · MEDIA NOT IMPORTED · NO LIVE CONNECTORS")
            Spacer()
            Text("LESSON PLANNER · NO LIVE CONNECTORS")
        }
        .font(.system(size: 10, weight: .bold, design: .monospaced))
        .foregroundStyle(store.isReady ? RetroPalette.terminalGreen : RetroPalette.electricCyan)
        .padding(8)
        .background(.black)
    }

    private var lessonHeader: some View {
        RetroWindow(title: "SATURDAY · JULY 19") {
            HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 5) {
                        Text("✦")
                            .scaleEffect(reduceMotion ? 1 : (isHeaderSparkActive ? 1.22 : 0.82))
                            .rotationEffect(.degrees(reduceMotion ? 0 : (isHeaderSparkActive ? 9 : -9)))
                            .foregroundStyle(RetroPalette.hotPink)
                            .animation(reduceMotion ? nil : .easeInOut(duration: 0.75).repeatForever(autoreverses: true), value: isHeaderSparkActive)
                        Text("LESSON PLANNER")
                            .font(.system(size: 18, weight: .black, design: .monospaced))
                            .foregroundStyle(RetroPalette.titleNavy)
                        Text("✦")
                            .scaleEffect(reduceMotion ? 1 : (isHeaderSparkActive ? 0.82 : 1.22))
                            .rotationEffect(.degrees(reduceMotion ? 0 : (isHeaderSparkActive ? -9 : 9)))
                            .foregroundStyle(RetroPalette.hotPink)
                            .animation(reduceMotion ? nil : .easeInOut(duration: 0.75).repeatForever(autoreverses: true), value: isHeaderSparkActive)
                    }
                    Text("LEVEL 3")
                        .font(.system(size: 30, weight: .black, design: .rounded))
                    Text("3:30–4:45 PM · iPAD LESSON RUNNER")
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                }
                Spacer()
                Button(store.isReady ? "READY ✓" : "MARK READY →") { store.setReady(!store.isReady) }
                    .buttonStyle(BevelButtonStyle(fill: store.isReady ? .green.opacity(0.7) : RetroPalette.laserYellow))
            }
            .padding(12)
        }
    }

    private var phaseSidebar: some View {
        List {
            Section("SCHEDULE") {
                ForEach(store.eventBlocks) { event in
                    Section {
                        ForEach(event.phases) { phase in
                            Button {
                                selectedPhaseID = phase.id
                            } label: {
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(phase.title)
                                        .font(.system(size: 13, weight: .bold))
                                    Text(phaseSidebarSummary(for: phase))
                                        .font(.system(size: 9, weight: .medium, design: .monospaced))
                                        .foregroundStyle(.secondary)
                                }
                                .padding(.vertical, 5)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(selectedPhaseID == phase.id ? RetroPalette.laserYellow.opacity(0.55) : .clear)
                            }
                            .buttonStyle(.plain)
                        }
                    } header: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(event.time)
                                .font(.system(size: 9, weight: .black, design: .monospaced))
                            Text(event.title)
                                .font(.system(size: 11, weight: .black))
                        }
                    }
                }
            }
            Section("OPEN TIME · ADVISORY") {
                if store.scheduleAdvisory.optionalOpenings.isEmpty {
                    Label("No optional openings in local fixture", systemImage: "plus.rectangle.on.rectangle")
                        .font(.system(size: 12, weight: .bold))
                } else {
                    ForEach(store.scheduleAdvisory.optionalOpenings) { opening in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(opening.timeRangeLabel)
                                .font(.system(size: 10, weight: .bold, design: .monospaced))
                            Text(opening.eventLabel)
                                .font(.system(size: 12, weight: .bold))
                        }
                    }
                }
                Text("Never added to the lesson automatically.")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundStyle(.secondary)
            }
        }
        .listStyle(.sidebar)
    }

    private var scheduleAdvisoryPreview: some View {
        let advisory = store.scheduleAdvisory

        return RetroWindow(title: "SCHEDULE ADVISORY · LOCAL DEMO FIXTURE") {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top, spacing: 8) {
                    Text("SUGGESTS STRUCTURE ONLY · NEVER ADDS, REMOVES, OR OVERWRITES LESSON PHASES")
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                        .foregroundStyle(RetroPalette.laserYellow)
                        .padding(7)
                        .background(.black)
                    Spacer(minLength: 0)
                    Button(isScheduleAdvisoryExpanded ? "HIDE" : "SHOW") {
                        isScheduleAdvisoryExpanded.toggle()
                    }
                    .buttonStyle(BevelButtonStyle(fill: .white))
                }

                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 8) {
                        scheduleAdvisoryFact(title: "DATE", value: advisory.dateLabel)
                        scheduleAdvisoryFact(title: "GROUP", value: advisory.selectedGroup)
                        scheduleAdvisoryFact(title: "ROTATION", value: advisory.rotationLabel)
                    }
                    VStack(alignment: .leading, spacing: 7) {
                        scheduleAdvisoryFact(title: "DATE", value: advisory.dateLabel)
                        scheduleAdvisoryFact(title: "GROUP", value: advisory.selectedGroup)
                        scheduleAdvisoryFact(title: "ROTATION", value: advisory.rotationLabel)
                    }
                }

                if advisory.manualConfirmationRequired {
                    Text("ROTATION NEEDS MANUAL CONFIRMATION BEFORE ITS BLOCKS SHOULD BE USED AS A REFERENCE.")
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                        .foregroundStyle(.black)
                        .padding(7)
                        .background(RetroPalette.warning)
                        .overlay(Rectangle().stroke(.black))
                }

                if isScheduleAdvisoryExpanded {
                    if !advisory.advisories.isEmpty {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("ADVISORIES · REVIEW BEFORE USING")
                                .font(.system(size: 10, weight: .black, design: .monospaced))
                                .foregroundStyle(.red)
                            ForEach(advisory.advisories, id: \.self) { advisoryText in
                                Text("⚠ \(advisoryText)")
                                    .font(.system(size: 11, weight: .bold))
                                    .padding(7)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(RetroPalette.warning.opacity(0.65))
                                    .overlay(Rectangle().stroke(.black.opacity(0.7)))
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 7) {
                        HStack {
                            Text("ADVISORY BLOCKS")
                            Spacer()
                            Text("\(advisory.suggestedStructureBlocks.count) LOCAL FIXTURE BLOCKS")
                        }
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                        .foregroundStyle(RetroPalette.titleNavy)

                        if advisory.suggestedStructureBlocks.isEmpty {
                            Text("No advisory rotation or support blocks are available in this local fixture.")
                                .font(.system(size: 11, weight: .bold))
                                .padding(8)
                                .background(.white.opacity(0.55))
                                .overlay(Rectangle().stroke(.black.opacity(0.6)))
                        } else {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(alignment: .top, spacing: 9) {
                                    ForEach(advisory.suggestedStructureBlocks) { block in
                                        scheduleAdvisoryBlockCard(block)
                                    }
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }

                    Divider().overlay(.black.opacity(0.45))

                    VStack(alignment: .leading, spacing: 7) {
                        Text("OPTIONAL OPENINGS · KEPT SEPARATE FROM THE SUGGESTED STRUCTURE")
                            .font(.system(size: 10, weight: .black, design: .monospaced))
                            .foregroundStyle(RetroPalette.titleNavy)

                        if advisory.optionalOpenings.isEmpty {
                            Text("No optional openings in this local fixture. If openings arrive later, they remain suggestions until you choose to create or edit a phase yourself.")
                                .font(.system(size: 11, weight: .bold))
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(.white.opacity(0.55))
                                .overlay(Rectangle().stroke(.black.opacity(0.6)))
                        } else {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(alignment: .top, spacing: 9) {
                                    ForEach(advisory.optionalOpenings) { opening in
                                        scheduleAdvisoryBlockCard(opening)
                                    }
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }

                    Text("FIXTURE STATUS: \(advisory.selectionStatus.uppercased()) · NO VAULT, SCHEDULE DATABASE, CALENDAR, NAMES, OR MEDIA IS READ HERE.")
                        .font(.system(size: 9, weight: .black, design: .monospaced))
                        .foregroundStyle(.black.opacity(0.72))
                }
            }
            .padding(12)
        }
    }

    private func scheduleAdvisoryFact(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title)
                .font(.system(size: 8, weight: .black, design: .monospaced))
                .foregroundStyle(.black.opacity(0.65))
            Text(value)
                .font(.system(size: 11, weight: .black, design: .monospaced))
        }
        .padding(7)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RetroPalette.electricCyan.opacity(0.42))
        .overlay(Rectangle().stroke(.black, lineWidth: 1))
    }

    private func scheduleAdvisoryBlockCard(_ block: ScheduleAdvisoryBlock) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(block.timeRangeLabel)
                    .font(.system(size: 10, weight: .black, design: .monospaced))
                Spacer(minLength: 5)
                Text(block.activityType.uppercased())
                    .font(.system(size: 8, weight: .black, design: .monospaced))
                    .padding(3)
                    .background(RetroPalette.laserYellow)
                    .overlay(Rectangle().stroke(.black.opacity(0.7)))
            }
            Text(block.eventLabel)
                .font(.system(size: 17, weight: .black, design: .rounded))
            Text(block.equipmentLabel)
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundStyle(RetroPalette.titleNavy)
            HStack(spacing: 5) {
                Text("CONF: \(block.confidence.uppercased())")
                Text("\(block.reviewStatus.uppercased())")
            }
            .font(.system(size: 8, weight: .black, design: .monospaced))
            .padding(.top, 2)
        }
        .padding(9)
        .frame(width: 218, alignment: .leading)
        .background(.white.opacity(0.8))
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
        .overlay(alignment: .leading) {
            Rectangle().fill(RetroPalette.hotPink).frame(width: 7)
        }
    }

    @ViewBuilder
    private var phaseBoard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .lastTextBaseline) {
                VStack(alignment: .leading) {
                    Text(selectedEvent.map { "\($0.time) · \($0.title)" } ?? "CURRENT PHASE")
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                    Text(selectedPhase.title)
                        .font(.system(size: 25, weight: .black, design: .rounded))
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text(selectedPhase.mode.rawValue)
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                    if let phaseStatus = phaseRunStatus[selectedPhaseID] {
                        Text(phaseStatus)
                            .font(.system(size: 9, weight: .black, design: .monospaced))
                            .padding(4)
                            .background(phaseStatus == "DONE" ? RetroPalette.terminalGreen : RetroPalette.warning)
                            .foregroundStyle(.black)
                    }
                }
            }
            .foregroundStyle(.white)

            if !isViewMode {
                phaseStructureEditor
            }

            if isViewMode {
                HStack(spacing: 8) {
                    Button("✓ DONE") { phaseRunStatus[selectedPhaseID] = "DONE" }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.terminalGreen))
                    Button("SKIP") { phaseRunStatus[selectedPhaseID] = "SKIPPED" }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.warning))
                    Spacer()
                    Button(isTimerRunning ? "❚❚ \(timerLabel)" : "⏱ \(timerLabel)") {
                        isTimerRunning.toggle()
                    }
                    .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                }
            }

            if isViewMode, !selectedPhase.textCues.isEmpty {
                RetroWindow(title: "TEXT / COACHING CUES") {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(Array(selectedPhase.textCues.enumerated()), id: \.offset) { index, cue in
                            HStack(alignment: .top) {
                                Text("\(index + 1)").font(.system(size: 12, weight: .black, design: .monospaced)).foregroundStyle(RetroPalette.titleNavy)
                                Text(cue).font(.system(size: 14, weight: .bold))
                            }
                        }
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }

            if !isViewMode {
                editableRunList
                if let placementRequest, placementRequest.phaseID == selectedPhaseID {
                    placementChooser(for: placementRequest)
                }
            }

            if selectedPhase.visibleZones.isEmpty {
                RetroWindow(title: selectedPhase.mode == .text ? "TEXT-ONLY PHASE" : "NO ZONES SELECTED") {
                    Text(
                        isViewMode
                            ? "This phase runs from its text plan."
                            : (selectedPhase.mode == .text
                                ? "This phase runs from its text plan. Any station selections remain saved until you switch it back to Visual or Mixed."
                                : "Add the stations used in this phase below.")
                    )
                        .font(.system(size: 15, weight: .bold))
                        .padding(18)
                        .frame(maxWidth: .infinity, minHeight: 180, alignment: .topLeading)
                }
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("ONLY THESE ZONES ARE IN THIS PHASE")
                        Spacer()
                    }
                    .font(.system(size: 10, weight: .black, design: .monospaced))
                    .foregroundStyle(RetroPalette.laserYellow)

                    ViewThatFits(in: .horizontal) {
                        HStack(alignment: .top, spacing: 12) {
                            ForEach(selectedPhase.visibleZones) { zone in stationPanel(for: zone).frame(maxWidth: .infinity) }
                        }
                        VStack(spacing: 12) { ForEach(selectedPhase.visibleZones) { zone in stationPanel(for: zone) } }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var phaseStructureEditor: some View {
        if let event = selectedEvent {
            RetroWindow(title: "EVENT + PHASE SETUP") {
                VStack(alignment: .leading, spacing: 10) {
                    Text("EVENT BLOCK · \(event.phases.count) \(event.phases.count == 1 ? "PHASE" : "PHASES")")
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                        .foregroundStyle(RetroPalette.titleNavy)

                    HStack(spacing: 8) {
                        TextField("Event time", text: eventTimeBinding(event.id))
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 13, weight: .bold, design: .monospaced))
                            .frame(maxWidth: 150)
                        TextField("Event name", text: eventTitleBinding(event.id))
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 13, weight: .bold))
                    }

                    TextField("This phase", text: phaseTitleBinding)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 13, weight: .bold))

                    Picker("Phase form", selection: phaseModeBinding) {
                        ForEach(LessonPhaseMode.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    HStack(spacing: 8) {
                        Button("+ PHASE IN EVENT") {
                            selectedPhaseID = store.addPhase(inEventID: event.id, afterPhaseID: selectedPhaseID)
                            textNote = ""
                        }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))

                        Button("TRANSITION EARLY →") {
                            guard let newPhaseID = store.transitionEarly(fromPhaseID: selectedPhaseID) else { return }
                            selectedPhaseID = newPhaseID
                            textNote = ""
                        }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.electricCyan))

                        Button("DELETE PHASE") {
                            guard store.deletePhase(id: selectedPhaseID) else { return }
                            selectedPhaseID = store.phases.first?.id ?? ""
                            textNote = ""
                        }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.warning))
                        .disabled(selectedPhase.isRequired)
                    }

                    Text("Add a phase to stay in this event. Transition early creates a separate next event; neither time range changes until you edit it.")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(RetroPalette.titleNavy)

                    if selectedPhase.isRequired {
                        Text("SCHEDULE ANCHOR · KEPT")
                            .font(.system(size: 9, weight: .black, design: .monospaced))
                            .padding(5)
                            .background(.white)
                            .overlay(Rectangle().stroke(.black))
                    }

                    Divider().overlay(.black.opacity(0.45))

                    Text("STATIONS IN THIS PHASE")
                        .font(.system(size: 10, weight: .black, design: .monospaced))
                        .foregroundStyle(RetroPalette.titleNavy)
                    Text("Choose the areas you are using. F1–F4 are horizontal slices of the full floor; combine any areas that run together.")
                        .font(.system(size: 11, weight: .bold))

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 7) {
                            ForEach(store.zoneOptions(forPhaseID: selectedPhaseID)) { zone in
                                let isSelected = store.isZoneSelected(zone.id, inPhaseID: selectedPhaseID)
                                Button {
                                    store.toggleZone(zone.id, inPhaseID: selectedPhaseID)
                                } label: {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(isSelected ? "✓ USING" : "+ ADD")
                                            .font(.system(size: 8, weight: .black, design: .monospaced))
                                        Text(zone.alias)
                                            .font(.system(size: 12, weight: .black, design: .rounded))
                                    }
                                    .frame(minWidth: 86, alignment: .leading)
                                }
                                .buttonStyle(BevelButtonStyle(fill: isSelected ? RetroPalette.terminalGreen : .white))
                            }
                        }
                        .padding(.vertical, 1)
                    }

                    if selectedPhase.mode == .text, !selectedPhase.zones.isEmpty {
                        Text("\(selectedPhase.zones.map(\.alias).joined(separator: " + ")) is saved for this phase and returns when you switch it to Visual or Mixed.")
                            .font(.system(size: 9, weight: .black, design: .monospaced))
                            .foregroundStyle(RetroPalette.titleNavy)
                    }
                }
                .padding(12)
            }
        }
    }

    private var phaseTitleBinding: Binding<String> {
        Binding(
            get: { selectedPhase.title },
            set: { store.updatePhase(id: selectedPhaseID, title: $0) }
        )
    }

    private func eventTitleBinding(_ eventID: String) -> Binding<String> {
        Binding(
            get: { store.eventBlocks.first(where: { $0.id == eventID })?.title ?? "" },
            set: { store.updateEvent(id: eventID, title: $0) }
        )
    }

    private func eventTimeBinding(_ eventID: String) -> Binding<String> {
        Binding(
            get: { store.eventBlocks.first(where: { $0.id == eventID })?.time ?? "" },
            set: { store.updateEvent(id: eventID, time: $0) }
        )
    }

    private var phaseModeBinding: Binding<LessonPhaseMode> {
        Binding(
            get: { selectedPhase.mode },
            set: { store.updatePhase(id: selectedPhaseID, mode: $0) }
        )
    }

    private func phaseSidebarSummary(for phase: LessonPhase) -> String {
        if phase.mode == .text {
            return "TEXT · run list"
        }
        if phase.visibleZones.isEmpty {
            return "\(phase.mode.rawValue) · choose zones"
        }
        return "\(phase.mode.rawValue) · \(phase.visibleZones.map(\.alias).joined(separator: " + "))"
    }

    private var editableRunList: some View {
        RetroWindow(title: "RUN LIST · TEXT PLAN") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Type a line or place an idea here. View mode turns this into the clean lesson-plan list.")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(RetroPalette.titleNavy)

                if selectedPhase.textCues.isEmpty {
                    Text("No text items yet.")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(.secondary)
                }

                ForEach(Array(selectedPhase.textCues.enumerated()), id: \.offset) { index, cue in
                    HStack(alignment: .center, spacing: 7) {
                        Text("\(index + 1)")
                            .font(.system(size: 11, weight: .black, design: .monospaced))
                            .foregroundStyle(RetroPalette.titleNavy)
                            .frame(width: 18)
                        TextField("Plan line", text: textCueBinding(at: index))
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 13, weight: .bold))
                        Button("PLACE") {
                            placementRequest = SnapshotPlacementRequest(
                                payload: .textItem(cue),
                                phaseID: selectedPhaseID
                            )
                        }
                        .buttonStyle(BevelButtonStyle(
                            fill: isSelectedTextItem(cue) ? RetroPalette.hotPink : RetroPalette.laserYellow
                        ))
                        .disabled(cue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        .accessibilityLabel("Place text item \(index + 1) on a station anchor")
                        Button("×") { store.removeTextCue(at: index, inPhaseID: selectedPhaseID) }
                            .buttonStyle(BevelButtonStyle(fill: RetroPalette.warning))
                            .accessibilityLabel("Remove plan line \(index + 1)")
                    }
                }

                HStack(spacing: 8) {
                    TextField("Add a line to this phase", text: $textNote)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 13, weight: .bold))
                    Button("ADD LINE") {
                        store.addTextNote(textNote, toPhaseID: selectedPhaseID)
                        textNote = ""
                    }
                    .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                    .disabled(textNote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .padding(12)
        }
    }

    private func textCueBinding(at index: Int) -> Binding<String> {
        Binding(
            get: {
                guard selectedPhase.textCues.indices.contains(index) else { return "" }
                return selectedPhase.textCues[index]
            },
            set: { store.updateTextCue($0, at: index, inPhaseID: selectedPhaseID) }
        )
    }

    private func placementChooser(for request: SnapshotPlacementRequest) -> some View {
        RetroWindow(title: "PLACE SELECTED ITEM") {
            VStack(alignment: .leading, spacing: 9) {
                HStack(alignment: .top, spacing: 8) {
                    placementPayloadPreview(request.payload)
                    VStack(alignment: .leading, spacing: 7) {
                        Text("TAP ONE HIGHLIGHTED ANCHOR IN A SELECTED STATION.")
                            .font(.system(size: 10, weight: .black, design: .monospaced))
                            .foregroundStyle(RetroPalette.titleNavy)
                        if request.payload.canAddToTextList {
                            Button("ADD TO TEXT LIST") {
                                placeItem(request, destinationZoneID: nil, destinationAnchorID: nil)
                            }
                            .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                        } else {
                            Text("This is a station copy; its original text line stays in the run list.")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(RetroPalette.titleNavy)
                        }
                        Button("CANCEL") { placementRequest = nil }
                            .buttonStyle(BevelButtonStyle(fill: RetroPalette.warning))
                    }
                }
                if selectedPhase.visibleZones.isEmpty {
                    Text(request.payload.canAddToTextList
                        ? "This phase has no visual stations selected, so the text list is the available destination."
                        : "This text item can be pinned after you select a visual station for this phase.")
                        .font(.system(size: 11, weight: .bold))
                } else {
                    Text("Only empty anchors in these selected zones are compatible. Tap one to place this item.")
                        .font(.system(size: 11, weight: .bold))
                }
            }
            .padding(12)
        }
    }

    private var lessonPlanDocument: some View {
        RetroWindow(title: "TODAY'S LESSON PLAN · RUN LIST") {
            VStack(alignment: .leading, spacing: 12) {
                ForEach(store.eventBlocks) { event in
                    VStack(alignment: .leading, spacing: 7) {
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Text(event.time)
                                .font(.system(size: 11, weight: .black, design: .monospaced))
                                .foregroundStyle(RetroPalette.titleNavy)
                            Text(event.title.uppercased())
                                .font(.system(size: 16, weight: .black, design: .rounded))
                        }
                        .padding(.bottom, 1)

                        ForEach(event.phases) { phase in
                            VStack(alignment: .leading, spacing: 5) {
                                if event.phases.count > 1 || phase.title != event.title {
                                    Text(phase.title)
                                        .font(.system(size: 12, weight: .black))
                                        .foregroundStyle(.black.opacity(0.72))
                                }

                                ForEach(Array(phase.textCues.enumerated()), id: \.offset) { index, cue in
                                    HStack(alignment: .top, spacing: 6) {
                                        Text("•")
                                            .font(.system(size: 12, weight: .black))
                                        Text(cue)
                                            .font(.system(size: 13, weight: .bold))
                                    }
                                }

                                ForEach(phase.visibleZones) { zone in
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(zone.alias)
                                            .font(.system(size: 10, weight: .black, design: .monospaced))
                                            .foregroundStyle(RetroPalette.titleNavy)
                                        ForEach(zone.cards) { card in
                                            Text("• \(card.title) — \(card.detail)")
                                                .font(.system(size: 12, weight: .bold))
                                        }
                                    }
                                    .padding(.leading, 15)
                                }
                            }
                            .padding(.leading, 8)
                        }
                    }
                    .padding(9)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white.opacity(0.58))
                    .overlay(Rectangle().stroke(.black.opacity(0.6)))
                }
            }
            .padding(12)
        }
    }

    private func stationPanel(for zone: GymZone) -> some View {
        let request = activePlacementRequest
        let mapLayout = GymLayoutAnchorRegistry.layout(forLocalZoneID: zone.id)
        let compatibleAnchorIDs = request == nil
            ? []
            : store.compatibleAnchorIDs(forPhaseID: selectedPhaseID, destinationZoneID: zone.id)
        return stationPanelSurface(
            for: zone,
            placementRequest: request,
            compatibleAnchorIDs: compatibleAnchorIDs,
            mapLayout: mapLayout
        )
    }

    private var activePlacementRequest: SnapshotPlacementRequest? {
        guard !isViewMode,
              let placementRequest,
              placementRequest.phaseID == selectedPhaseID else {
            return nil
        }
        return placementRequest
    }

    private func stationPanelSurface(
        for zone: GymZone,
        placementRequest: SnapshotPlacementRequest?,
        compatibleAnchorIDs: [String],
        mapLayout: GymMapSelectionLayout
    ) -> some View {
        let isPlacementTarget = !compatibleAnchorIDs.isEmpty

        return VStack(spacing: 8) {
            VStack(spacing: 1) {
                Text(zone.title)
                    .font(.system(size: 14, weight: .black, design: .rounded))
                    .lineLimit(1)
                    .minimumScaleFactor(0.68)
                    .truncationMode(.tail)
                    .frame(maxWidth: .infinity)
                Text(zone.alias)
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .foregroundStyle(.black.opacity(0.6))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .truncationMode(.tail)
                    .frame(maxWidth: .infinity)
                if !isViewMode, let geometryReviewNote = mapLayout.geometryReviewNote {
                    Text("MAP DRAFT")
                        .font(.system(size: 7, weight: .black, design: .monospaced))
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(RetroPalette.warning)
                        .overlay(Rectangle().stroke(.black, lineWidth: 1))
                        .accessibilityLabel("Map draft: \(geometryReviewNote)")
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 5)
            .background(
                Rectangle()
                    .fill(isPlacementTarget ? RetroPalette.laserYellow : RetroPalette.stationLabel)
            )
            .overlay(Rectangle().stroke(.black, lineWidth: 2))

            ZStack(alignment: .topLeading) {
                stationMapBackground(for: mapLayout)
                stationAnchorLayer(
                    for: zone,
                    placementRequest: placementRequest,
                    compatibleAnchorIDs: compatibleAnchorIDs,
                    mapLayout: mapLayout
                )
            }
            .frame(maxWidth: .infinity)
            // This is intentionally a stable lesson-plan canvas, not the
            // raw aspect ratio of each source image. Art remains uncropped
            // via `scaledToFit()` above, while the plan stays compact.
            .aspectRatio(Self.compactStationCanvasAspectRatio, contentMode: .fit)
            .frame(
                minHeight: Self.compactStationCanvasMinimumHeight,
                maxHeight: Self.compactStationCanvasMaximumHeight,
                alignment: .topLeading
            )
            .clipped()
            .overlay(RoundedRectangle(cornerRadius: 2).stroke(RetroPalette.stationOutline, lineWidth: 2))

            VStack(alignment: .leading, spacing: 4) {
                Text(zone.laneDescription).font(.system(size: 10, weight: .black, design: .monospaced)).foregroundStyle(.black.opacity(0.65))
                Text(zone.safetyNote).font(.system(size: 11, weight: .black)).padding(5).background(RetroPalette.warning).overlay(Rectangle().stroke(.black))
            }
        }
        .padding(9)
        .background(
            Rectangle()
                .fill(RetroPalette.stationSky)
        )
        .overlay(Rectangle().stroke(isPlacementTarget ? RetroPalette.hotPink : RetroPalette.stationOutline, lineWidth: isPlacementTarget ? 5 : 3))
        .overlay(alignment: .topTrailing) {
            if isPlacementTarget {
                Text("TAP TO PLACE")
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .padding(5)
                    .background(RetroPalette.hotPink)
                    .overlay(Rectangle().stroke(.black, lineWidth: 1))
                    .padding(6)
            }
        }
    }

    /// An exact station-board image supplied by the coach always wins over an
    /// automatic Skeleton crop, including standalone FX and F5 boards.
    @ViewBuilder
    private func stationMapBackground(for mapLayout: GymMapSelectionLayout) -> some View {
        if let stationBoard = mapLayout.stationBoard {
            Image(stationBoard.assetName)
                .resizable()
                .interpolation(.none)
                // Never crop a coach-supplied station board. The surrounding
                // compact lesson canvas leaves safe sky padding around the
                // source whenever the two aspect ratios differ.
                .scaledToFit()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .clipped()
                .background(RetroPalette.stationSky)
                .accessibilityLabel("Coach supplied station board")
        } else if let viewport = mapLayout.viewport {
            GeometryReader { geometry in
                let imageWidth = geometry.size.width * CGFloat(1000 / viewport.width)
                let imageHeight = geometry.size.height * CGFloat(1000 / viewport.height)

                Image("GymLayoutSkeleton")
                    .resizable()
                    .interpolation(.none)
                    .frame(width: imageWidth, height: imageHeight)
                    .position(
                        x: imageWidth / 2 - CGFloat(viewport.x / 1000) * imageWidth,
                        y: imageHeight / 2 - CGFloat(viewport.y / 1000) * imageHeight
                    )
            }
            .background(RetroPalette.stationSky)
        } else {
            Rectangle().fill(RetroPalette.stationSky.opacity(0.56))
        }
    }

    /// Empty anchors are shown only while a selected item is in placement
    /// mode. A contract anchor has one item of capacity, so occupied labels
    /// remain tappable but never become destinations again.
    private func stationAnchorLayer(
        for zone: GymZone,
        placementRequest: SnapshotPlacementRequest?,
        compatibleAnchorIDs: [String],
        mapLayout: GymMapSelectionLayout
    ) -> some View {
        GeometryReader { geometry in
            ForEach(mapLayout.anchors) { anchor in
                let labelSize = anchorLabelSize(
                    for: anchor,
                    in: mapLayout,
                    boardSize: geometry.size
                )
                if let placement = zone.anchorPlacement(at: anchor.id) {
                    Button {
                        selectedAnchorDetail = placement
                    } label: {
                        placedAnchorLabel(
                            placement,
                            size: labelSize
                        )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Open placed \(placement.contentKind.rawValue.lowercased()) \(placement.title)")
                    .position(
                        anchorPoint(
                            for: anchor,
                            in: mapLayout,
                            boardSize: geometry.size,
                            labelSize: labelSize
                        )
                    )
                } else if let placementRequest,
                          compatibleAnchorIDs.contains(anchor.id) {
                    Button {
                        placeItem(
                            placementRequest,
                            destinationZoneID: zone.id,
                            destinationAnchorID: anchor.id
                        )
                    } label: {
                        openAnchorLabel(
                            for: placementRequest,
                            anchor: anchor,
                            size: labelSize
                        )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Place \(placementRequest.payload.shortLabel) at \(anchor.id) in \(zone.alias)")
                    .position(
                        anchorPoint(
                            for: anchor,
                            in: mapLayout,
                            boardSize: geometry.size,
                            labelSize: labelSize
                        )
                    )
                }
            }
        }
    }

    private func anchorPoint(
        for anchor: GymMapAnchor,
        in mapLayout: GymMapSelectionLayout,
        boardSize: CGSize,
        labelSize: CGSize
    ) -> CGPoint {
        let uncontainedPoint: CGPoint
        guard let viewport = mapLayout.viewport else {
            uncontainedPoint = CGPoint(
                x: boardSize.width * CGFloat(anchor.fallbackRelativeX ?? 0.5),
                y: boardSize.height * CGFloat(anchor.fallbackRelativeY ?? 0.5)
            )
            return containedAnchorPoint(
                uncontainedPoint,
                labelSize: labelSize,
                boardSize: boardSize
            )
        }

        uncontainedPoint = CGPoint(
            x: boardSize.width * CGFloat((anchor.rect.x + anchor.rect.width / 2 - viewport.x) / viewport.width),
            y: boardSize.height * CGFloat((anchor.rect.y + anchor.rect.height / 2 - viewport.y) / viewport.height)
        )
        return containedAnchorPoint(
            uncontainedPoint,
            labelSize: labelSize,
            boardSize: boardSize
        )
    }

    private func anchorLabelSize(
        for anchor: GymMapAnchor,
        in mapLayout: GymMapSelectionLayout,
        boardSize: CGSize
    ) -> CGSize {
        guard let viewport = mapLayout.viewport else {
            let count = max(mapLayout.anchors.count, 1)
            let columns = max(2, min(5, Int(ceil(sqrt(Double(count))))))
            let rows = Int(ceil(Double(count) / Double(columns)))
            return containedAnchorLabelSize(
                CGSize(
                    width: min(122, max(42, boardSize.width / CGFloat(columns) - 8)),
                    height: min(52, max(34, boardSize.height / CGFloat(rows) - 8))
                ),
                boardSize: boardSize
            )
        }

        let width = CGFloat(anchor.rect.width / viewport.width) * boardSize.width
        let height = CGFloat(anchor.rect.height / viewport.height) * boardSize.height
        return containedAnchorLabelSize(
            CGSize(
                width: min(max(width, 42), 122),
                height: min(max(height, 34), 56)
            ),
            boardSize: boardSize
        )
    }

    /// Placement anchors may sit on the edge of a coach-supplied board. Keep
    /// the whole tappable label on the compact canvas instead of allowing its
    /// centre point to push half of it off screen.
    private func containedAnchorPoint(
        _ point: CGPoint,
        labelSize: CGSize,
        boardSize: CGSize
    ) -> CGPoint {
        let inset = Self.stationLabelEdgeInset
        let minimumX = labelSize.width / 2 + inset
        let maximumX = boardSize.width - labelSize.width / 2 - inset
        let minimumY = labelSize.height / 2 + inset
        let maximumY = boardSize.height - labelSize.height / 2 - inset

        return CGPoint(
            x: minimumX <= maximumX ? min(max(point.x, minimumX), maximumX) : boardSize.width / 2,
            y: minimumY <= maximumY ? min(max(point.y, minimumY), maximumY) : boardSize.height / 2
        )
    }

    private func containedAnchorLabelSize(_ proposedSize: CGSize, boardSize: CGSize) -> CGSize {
        let horizontalRoom = max(28, boardSize.width - Self.stationLabelEdgeInset * 2)
        let verticalRoom = max(26, boardSize.height - Self.stationLabelEdgeInset * 2)
        return CGSize(
            width: min(proposedSize.width, horizontalRoom),
            height: min(proposedSize.height, verticalRoom)
        )
    }

    private func placedAnchorLabel(_ placement: ZoneAnchorPlacement, size: CGSize) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(placement.contentKind.rawValue)
                .font(.system(size: size.width < 65 ? 6 : 7, weight: .black, design: .monospaced))
                .foregroundStyle(RetroPalette.titleNavy)
                .lineLimit(1)
                .minimumScaleFactor(0.62)
                .truncationMode(.tail)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(placement.shortLabel)
                .font(.system(size: size.width < 65 ? 7 : 10, weight: .black))
                .lineLimit(2)
                .multilineTextAlignment(.leading)
                .minimumScaleFactor(0.62)
                .truncationMode(.tail)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(size.width < 65 ? 3 : 6)
        .frame(width: size.width, height: size.height, alignment: .leading)
        .background(.white)
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
        .overlay(alignment: .leading) {
            Rectangle().fill(RetroPalette.hotPink).frame(width: size.width < 65 ? 3 : 6)
        }
        .clipped()
    }

    private func openAnchorLabel(
        for request: SnapshotPlacementRequest,
        anchor: GymMapAnchor,
        size: CGSize
    ) -> some View {
        VStack(spacing: 2) {
            Text("+")
                .font(.system(size: size.width < 65 ? 12 : 16, weight: .black, design: .monospaced))
            if size.width >= 65 {
                Text("PLACE")
                    .font(.system(size: 8, weight: .black, design: .monospaced))
                Text(request.payload.shortLabel)
                    .font(.system(size: 8, weight: .black))
                    .lineLimit(1)
                    .minimumScaleFactor(0.62)
                    .truncationMode(.tail)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(size.width < 65 ? 2 : 6)
        .frame(width: size.width, height: size.height)
        .background(RetroPalette.laserYellow)
        .overlay(Rectangle().stroke(RetroPalette.hotPink, lineWidth: 3))
        .clipped()
    }

    private func placementPayloadPreview(_ payload: PlacementPayload) -> some View {
        switch payload {
        case let .libraryIdea(card):
            return AnyView(plannerCard(card).frame(maxWidth: 245))
        case let .textItem(text):
            return AnyView(
                VStack(alignment: .leading, spacing: 5) {
                    Text("TEXT ITEM")
                        .font(.system(size: 8, weight: .black, design: .monospaced))
                    Text(text)
                        .font(.system(size: 13, weight: .black))
                        .lineLimit(4)
                }
                .padding(8)
                .frame(maxWidth: 245, alignment: .leading)
                .background(.white)
                .overlay(Rectangle().stroke(.black, lineWidth: 2))
                .overlay(alignment: .leading) { Rectangle().fill(RetroPalette.hotPink).frame(width: 8) }
            )
        }
    }

    private func isSelectedTextItem(_ text: String) -> Bool {
        guard let placementRequest = activePlacementRequest,
              case let .textItem(selectedText) = placementRequest.payload else {
            return false
        }
        return selectedText == text
    }

    private func isSelectedLibraryCard(_ card: PlanningCard) -> Bool {
        guard let placementRequest = activePlacementRequest,
              case let .libraryIdea(selectedCard) = placementRequest.payload else {
            return false
        }
        return selectedCard.id == card.id
    }

    private func anchorDetailSheet(for placement: ZoneAnchorPlacement) -> some View {
        NavigationStack {
            ScrollView {
                RetroWindow(title: "PLACED \(placement.contentKind.rawValue) DETAIL") {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(placement.title)
                            .font(.system(size: 22, weight: .black, design: .rounded))
                        Text(placement.detail)
                            .font(.system(size: 15, weight: .bold))
                        if let planningCardKind = placement.planningCardKind {
                            Text(planningCardKind.rawValue)
                                .font(.system(size: 10, weight: .black, design: .monospaced))
                                .padding(5)
                                .background(RetroPalette.laserYellow)
                                .overlay(Rectangle().stroke(.black))
                        }
                        if !placement.tags.isEmpty {
                            HStack(spacing: 4) {
                                ForEach(placement.tags, id: \.self) { tag in
                                    Text(tag)
                                        .font(.system(size: 9, weight: .black, design: .monospaced))
                                        .padding(4)
                                        .background(RetroPalette.electricCyan.opacity(0.55))
                                        .overlay(Rectangle().stroke(.black.opacity(0.6)))
                                }
                            }
                        }
                        if let safetyRequirement = placement.safetyRequirement {
                            Text("SAFETY · \(safetyRequirement)")
                                .font(.system(size: 11, weight: .black))
                                .padding(7)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(RetroPalette.warning)
                                .overlay(Rectangle().stroke(.black))
                        }
                        VStack(alignment: .leading, spacing: 7) {
                            Text("LOCAL MEDIA / REFERENCES")
                                .font(.system(size: 10, weight: .black, design: .monospaced))
                                .foregroundStyle(RetroPalette.titleNavy)
                            HStack(spacing: 6) {
                                mediaReferenceSlot(icon: "photo", title: "PHOTO")
                                mediaReferenceSlot(icon: "play.rectangle", title: "VIDEO")
                                mediaReferenceSlot(icon: "link", title: "REFERENCE")
                            }
                            Text("A local picture, perfect-demo video, or reference can be attached here in the private media phase. None is connected in this local mock.")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(.black.opacity(0.66))
                        }
                        .padding(8)
                        .background(RetroPalette.laserYellow.opacity(0.45))
                        .overlay(Rectangle().stroke(.black.opacity(0.72)))
                    }
                    .padding(14)
                }
                .padding(14)
            }
            .navigationTitle("ANCHOR DETAIL")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("DONE") { selectedAnchorDetail = nil }
                }
            }
        }
    }

    private func mediaReferenceSlot(icon: String, title: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .black))
            Text(title)
                .font(.system(size: 8, weight: .black, design: .monospaced))
        }
        .frame(maxWidth: .infinity, minHeight: 60)
        .background(.white.opacity(0.86))
        .overlay(Rectangle().stroke(.black.opacity(0.72)))
    }

    private func plannerCard(_ card: PlanningCard) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack { Text(card.kind.rawValue).font(.system(size: 8, weight: .black, design: .monospaced)); Spacer(); if card.isGem { Text("★").font(.system(size: 12, weight: .black, design: .monospaced)) } }
            Text(card.title).font(.system(size: 14, weight: .black))
            Text(card.detail).font(.system(size: 10, weight: .medium))
            HStack(spacing: 3) { ForEach(card.tags, id: \.self) { tag in Text(tag).font(.system(size: 8, weight: .bold, design: .monospaced)).padding(3).background(.black.opacity(0.08)).overlay(Rectangle().stroke(.black.opacity(0.4))) } }
        }
        .padding(8)
        .background(
            Rectangle()
                .fill(.white)
        )
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
        .overlay(alignment: .leading) { Rectangle().fill(accentColor(card.accent)).frame(width: 8) }
    }

    private var activeShelf: some View {
        RetroWindow(title: "IDEA LIBRARY") {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    Picker("Library shelf", selection: $selectedLibraryScope) {
                        ForEach(LibraryScope.allCases) { scope in
                            Text(scope.rawValue).tag(scope)
                        }
                    }
                    .pickerStyle(.segmented)
                    Button("+ NEW IDEA") { isNewIdeaSheetPresented = true }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                }

                HStack(spacing: 7) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 13, weight: .black))
                    TextField("Search titles or tags", text: $librarySearch)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 13, weight: .bold))
                    if hasLibraryFilters {
                        Button("CLEAR") { clearLibraryFilters() }
                            .buttonStyle(BevelButtonStyle(fill: .white))
                    }
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 7) {
                        libraryFilterMenu(
                            title: "TYPE",
                            selection: $selectedLibraryCategory,
                            options: libraryCategoryOptions
                        )
                        libraryFilterMenu(
                            title: "EVENT",
                            selection: $selectedLibraryEvent,
                            options: store.libraryEventOptions
                        )
                        libraryFilterMenu(
                            title: "LEVEL",
                            selection: $selectedLibraryLevel,
                            options: store.libraryLevelOptions
                        )
                        Text("\(filteredLibraryCards.count) OF \(scopedLibraryCards.count)")
                            .font(.system(size: 9, weight: .black, design: .monospaced))
                            .padding(.horizontal, 6)
                    }
                    .padding(.vertical, 1)
                }

                Text(libraryScopeHelper)
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(RetroPalette.titleNavy)

                if filteredLibraryCards.isEmpty {
                    VStack(spacing: 7) {
                        Image(systemName: selectedLibraryScope == .recent ? "clock.arrow.circlepath" : "tray")
                            .font(.system(size: 24, weight: .black))
                        Text(selectedLibraryScope.emptyState)
                            .font(.system(size: 13, weight: .bold))
                            .multilineTextAlignment(.center)
                        if hasLibraryFilters {
                            Button("CLEAR FILTERS") { clearLibraryFilters() }
                                .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                        }
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity)
                    .background(RetroPalette.stationSky.opacity(0.25))
                    .overlay(Rectangle().stroke(.black.opacity(0.65)))
                } else {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(alignment: .top, spacing: 12) {
                            ForEach(filteredLibraryCards) { card in
                                VStack(alignment: .leading, spacing: 7) {
                                    Button {
                                        placementRequest = SnapshotPlacementRequest(
                                            payload: .libraryIdea(card),
                                            phaseID: selectedPhaseID
                                        )
                                    } label: {
                                        plannerCard(card)
                                            .frame(width: 245)
                                            .overlay(
                                                Rectangle()
                                                    .stroke(
                                                        isSelectedLibraryCard(card)
                                                            ? RetroPalette.hotPink
                                                            : .clear,
                                                        lineWidth: 4
                                                    )
                                            )
                                    }
                                    .buttonStyle(.plain)
                                    HStack(spacing: 7) {
                                        Button(card.isGem ? "★" : "☆") {
                                            store.toggleGem(for: card.id)
                                        }
                                        .buttonStyle(BevelButtonStyle(fill: card.isGem ? RetroPalette.hotPink.opacity(0.8) : .white))
                                        .accessibilityLabel(card.isGem ? "Remove star from \(card.title)" : "Star \(card.title)")

                                        Button("PLACE") {
                                            placementRequest = SnapshotPlacementRequest(
                                                payload: .libraryIdea(card),
                                                phaseID: selectedPhaseID
                                            )
                                        }
                                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
            .padding(12)
        }
    }

    private var scopedLibraryCards: [PlanningCard] {
        store.libraryCards(in: selectedLibraryScope)
    }

    private var filteredLibraryCards: [PlanningCard] {
        scopedLibraryCards.filter { card in
            card.matchesLibrarySearch(librarySearch)
                && (selectedLibraryCategory == "ALL" || card.kind.rawValue == selectedLibraryCategory)
                && (selectedLibraryEvent == "ALL" || card.libraryEvent == selectedLibraryEvent)
                && (selectedLibraryLevel == "ALL" || card.libraryLevel == selectedLibraryLevel)
        }
    }

    private var libraryCategoryOptions: [String] {
        ["ALL"] + PlanningCardKind.allCases.map(\.rawValue)
    }

    private var hasLibraryFilters: Bool {
        !librarySearch.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            || selectedLibraryCategory != "ALL"
            || selectedLibraryEvent != "ALL"
            || selectedLibraryLevel != "ALL"
    }

    private var libraryScopeHelper: String {
        switch selectedLibraryScope {
        case .relevant:
            return "GEMS STAY FIRST · ARCHIVE STAYS OUT OF THE WAY"
        case .recent:
            return "RECENT UPDATES ONLY AFTER EXPLICIT LOCAL LESSON COMPLETION"
        case .archive:
            return "KEPT FOR RECORDS · NOT SHOWN IN THE DAILY SHELF"
        }
    }

    private func libraryFilterMenu(
        title: String,
        selection: Binding<String>,
        options: [String]
    ) -> some View {
        Menu {
            ForEach(options, id: \.self) { option in
                Button(option) { selection.wrappedValue = option }
            }
        } label: {
            HStack(spacing: 4) {
                Text("\(title): \(selection.wrappedValue)")
                Image(systemName: "chevron.down")
            }
            .font(.system(size: 9, weight: .black, design: .monospaced))
            .foregroundStyle(.black)
            .padding(.horizontal, 7)
            .padding(.vertical, 6)
            .background(RetroPalette.laserYellow)
            .overlay(Rectangle().stroke(.black, lineWidth: 1))
        }
    }

    private func clearLibraryFilters() {
        librarySearch = ""
        selectedLibraryCategory = "ALL"
        selectedLibraryEvent = "ALL"
        selectedLibraryLevel = "ALL"
    }

    private func placeItem(
        _ request: SnapshotPlacementRequest,
        destinationZoneID: String?,
        destinationAnchorID: String?
    ) {
        switch request.payload {
        case let .libraryIdea(card):
            guard store.addSnapshot(
                of: card,
                toPhaseID: request.phaseID,
                destinationZoneID: destinationZoneID,
                destinationAnchorID: destinationAnchorID
            ) else {
                return
            }
        case let .textItem(text):
            guard let destinationZoneID,
                  let destinationAnchorID,
                  store.addAnchoredText(
                    text,
                    toPhaseID: request.phaseID,
                    destinationZoneID: destinationZoneID,
                    destinationAnchorID: destinationAnchorID
                  ) else {
                return
            }
        }
        placementRequest = nil
    }

    private var newIdeaSheet: some View {
        NavigationStack {
            ScrollView {
                RetroWindow(title: "NEW IDEA") {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Add a drill, activity, or reference once; it stays in your local library for future plans.")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(RetroPalette.titleNavy)

                        Picker("Kind", selection: $newIdeaKind) {
                            ForEach(PlanningCardKind.allCases) { kind in
                                Text(kind.rawValue).tag(kind)
                            }
                        }
                        .pickerStyle(.segmented)

                        TextField("Name of drill / activity / reference", text: $newIdeaTitle)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 15, weight: .bold))
                        TextField("How it works or the coaching cue", text: $newIdeaDetail, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 14, weight: .bold))
                            .lineLimit(3...6)
                        TextField("Tags, separated by commas (for example: HB, L3, shapes)", text: $newIdeaTags)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 13, weight: .bold))

                        HStack(spacing: 8) {
                            Button("ADD TO LIBRARY") { saveNewIdea() }
                                .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                                .disabled(newIdeaTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                            Button("CANCEL") { resetNewIdeaForm() }
                                .buttonStyle(BevelButtonStyle(fill: RetroPalette.warning))
                        }
                    }
                    .padding(14)
                }
                .padding(14)
            }
            .background(RetroPalette.webTeal.ignoresSafeArea())
            .navigationTitle("ADD IDEA")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("DONE") { resetNewIdeaForm() }
                }
            }
        }
    }

    private func saveNewIdea() {
        let tags = newIdeaTags.split(separator: ",").map(String.init)
        guard store.addLibraryCard(
            kind: newIdeaKind,
            title: newIdeaTitle,
            detail: newIdeaDetail,
            tags: tags
        ) != nil else {
            return
        }
        resetNewIdeaForm()
    }

    private func resetNewIdeaForm() {
        newIdeaKind = .drill
        newIdeaTitle = ""
        newIdeaDetail = ""
        newIdeaTags = ""
        isNewIdeaSheetPresented = false
    }

    private var operations: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("DAILY OPS USE LOCAL MOCK INPUTS ONLY · NO EMAIL, CODEX CRAWL, OR LIVE CALENDAR IS CONNECTED")
                .font(.system(size: 10, weight: .black, design: .monospaced))
                .foregroundStyle(RetroPalette.laserYellow)
                .padding(8)
                .background(.black)
                .frame(maxWidth: .infinity, alignment: .leading)

            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    dailyTasksWindow.frame(maxWidth: .infinity)
                    attendanceWindow.frame(maxWidth: .infinity)
                }
                VStack(spacing: 12) {
                    dailyTasksWindow
                    attendanceWindow
                }
            }
            dailyUpdateInbox
        }
    }

    private var dailyTasksWindow: some View {
        RetroWindow(title: "TODAY'S TASKS · LOCAL MOCK") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("DEMO CLASS \(store.demoClassNumber)")
                    Spacer()
                    Text("PERSISTED IN THIS APP")
                }
                .font(.system(size: 9, weight: .black, design: .monospaced))
                .foregroundStyle(RetroPalette.titleNavy)

                ForEach(store.dailyTasks) { task in
                    VStack(alignment: .leading, spacing: 5) {
                        Toggle(isOn: Binding(
                            get: { task.isComplete },
                            set: { store.setDailyTaskComplete(task.id, completed: $0) }
                        )) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(task.title)
                                    .font(.system(size: 13, weight: .black))
                                Text(task.detail)
                                    .font(.system(size: 10, weight: .medium))
                            }
                        }
                        .font(.system(size: 12, weight: .bold))
                        .tint(RetroPalette.terminalGreen)

                        HStack(spacing: 6) {
                            Text(task.cadence.rawValue)
                            Text(task.statusLabel)
                            if let rollForwardLabel = task.rollForwardLabel {
                                Text(rollForwardLabel)
                            }
                        }
                        .font(.system(size: 8, weight: .black, design: .monospaced))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 4)
                        .background(taskStatusFill(task))
                        .foregroundStyle(.black)
                    }
                    .padding(7)
                    .background(.white.opacity(0.55))
                    .overlay(Rectangle().stroke(.black.opacity(0.55)))
                }

                HStack(spacing: 8) {
                    Button("NEXT DEMO CLASS") { store.advanceLocalDemoClass() }
                        .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
                    Button("COMPLETE LOCAL LESSON (\(store.pendingPlannedLibraryCardIDs.count))") {
                        store.completeLocalDemoLesson()
                    }
                    .buttonStyle(BevelButtonStyle(fill: RetroPalette.terminalGreen))
                    .disabled(store.pendingPlannedLibraryCardIDs.isEmpty)
                }

                Text("NEXT DEMO CLASS resets recurring tasks and rolls unfinished temporary work forward. Completing this local demo lesson is the only action that promotes planned ideas to Recent.")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(RetroPalette.titleNavy)

                Divider().overlay(.black.opacity(0.4))
                Text("⚠ READY CHECK")
                    .font(.system(size: 11, weight: .black, design: .monospaced))
                    .foregroundStyle(.red)
                Text("Second coach is needed before spotting progressions.")
                    .font(.system(size: 11, weight: .bold))
                Button("ACKNOWLEDGE") { store.setReady(true) }
                    .buttonStyle(BevelButtonStyle(fill: .white))
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var attendanceWindow: some View {
        RetroWindow(title: "ATTENDANCE · LOCAL FIXTURE") {
            VStack(alignment: .leading, spacing: 7) {
                Text("DEMO NAMES ONLY · EDITABLE IN VIEW MODE")
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .foregroundStyle(RetroPalette.titleNavy)
                ForEach(store.attendance) { person in
                    HStack(spacing: 8) {
                        Text(person.name).font(.system(size: 12, weight: .bold))
                        Spacer()
                        Menu {
                            ForEach(AttendancePerson.Status.allCases) { status in
                                Button(status.rawValue) {
                                    store.setAttendanceStatus(status, forPersonID: person.id)
                                }
                            }
                        } label: {
                            HStack(spacing: 3) {
                                Text(person.status.rawValue)
                                Image(systemName: "chevron.down")
                            }
                            .font(.system(size: 9, weight: .black, design: .monospaced))
                            .foregroundStyle(attendanceStatusColor(person.status))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 5)
                            .background(.white)
                            .overlay(Rectangle().stroke(.black))
                        }
                    }
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var dailyUpdateInbox: some View {
        let pendingCount = store.unresolvedDailyUpdateCount
        let shouldShake = pendingCount > 0 && !reduceMotion

        return RetroWindow(title: pendingCount > 0 ? "DAILY UPDATE INBOX · \(pendingCount) PENDING" : "DAILY UPDATE INBOX · LOCAL MOCK") {
            VStack(alignment: .leading, spacing: 10) {
                Text("NORMALIZED DEMO ITEMS ONLY · NO EMAIL/CALENDAR/CRAWL DATA IS BEING READ")
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .foregroundStyle(RetroPalette.titleNavy)

                ForEach(store.dailyUpdates) { update in
                    dailyUpdateCard(update)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .rotationEffect(.degrees(shouldShake ? (isUpdateShakeActive ? -0.8 : 0.8) : 0))
        .animation(shouldShake ? .linear(duration: 0.16).repeatForever(autoreverses: true) : nil, value: isUpdateShakeActive)
    }

    private func dailyUpdateCard(_ update: DailyUpdate) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(alignment: .top, spacing: 8) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(update.title)
                        .font(.system(size: 13, weight: .black))
                    Text(update.detail)
                        .font(.system(size: 10, weight: .medium))
                }
                Spacer()
                Text("R\(update.revision)")
                    .font(.system(size: 10, weight: .black, design: .monospaced))
                    .padding(5)
                    .background(RetroPalette.laserYellow)
                    .overlay(Rectangle().stroke(.black))
            }

            HStack(spacing: 6) {
                Text(update.sourceLabel)
                if let currentDecision = update.currentDecision {
                    Text("THIS REVISION: \(currentDecision.rawValue)")
                } else {
                    Text("THIS REVISION: NEEDS DECISION")
                }
            }
            .font(.system(size: 8, weight: .black, design: .monospaced))
            .padding(.horizontal, 5)
            .padding(.vertical, 4)
            .background(update.currentDecision.map(updateDecisionFill) ?? .white)
            .foregroundStyle(.black)

            if update.hasEarlierRevisionDecision, update.currentDecision == nil {
                Text("A prior revision was decided. R\(update.revision) deliberately returns for a fresh choice.")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(RetroPalette.titleNavy)
            }

            HStack(spacing: 7) {
                ForEach(DailyUpdateDecision.allCases) { decision in
                    Button(decision.rawValue) { store.decide(decision, forUpdateID: update.id) }
                        .buttonStyle(BevelButtonStyle(fill: update.currentDecision == decision ? updateDecisionFill(decision) : .white))
                }
                Spacer()
                Button("NEW LOCAL REVISION") { store.simulateNewRevision(forUpdateID: update.id) }
                    .buttonStyle(BevelButtonStyle(fill: RetroPalette.laserYellow))
            }

            Text("REJECT APPLIES ONLY TO R\(update.revision). A later revision is not permanently muted.")
                .font(.system(size: 8, weight: .black, design: .monospaced))
                .foregroundStyle(.black.opacity(0.7))
        }
        .padding(8)
        .background(.white.opacity(0.55))
        .overlay(Rectangle().stroke(.black.opacity(0.6)))
    }

    private func taskStatusFill(_ task: DailyTask) -> Color {
        if task.isComplete { return RetroPalette.terminalGreen }
        if task.cadence == .temporary,
           let plannedClassWindow = task.plannedClassWindow,
           task.rollForwardCount >= plannedClassWindow {
            return RetroPalette.warning
        }
        return task.cadence == .recurring ? RetroPalette.electricCyan : RetroPalette.laserYellow
    }

    private func attendanceStatusColor(_ status: AttendancePerson.Status) -> Color {
        switch status {
        case .unmarked:
            return RetroPalette.titleNavy
        case .present:
            return .green
        case .late:
            return .orange
        case .absent:
            return .red
        }
    }

    private func updateDecisionFill(_ decision: DailyUpdateDecision) -> Color {
        switch decision {
        case .important:
            return RetroPalette.hotPink.opacity(0.7)
        case .later:
            return RetroPalette.laserYellow
        case .rejected:
            return RetroPalette.warning
        }
    }

    private func accentColor(_ accent: CardAccent) -> Color {
        switch accent {
        case .cyan:
            return RetroPalette.electricCyan
        case .green:
            return .green
        case .yellow:
            return RetroPalette.laserYellow
        case .pink:
            return RetroPalette.hotPink
        }
    }

    private var timerLabel: String {
        String(format: "%02d:%02d", remainingSeconds / 60, remainingSeconds % 60)
    }

    private func startAttentionAnimations() {
        guard !reduceMotion else {
            isHeaderSparkActive = false
            isUpdateShakeActive = false
            return
        }
        isHeaderSparkActive = true
        isUpdateShakeActive = store.unresolvedDailyUpdateCount > 0
    }
}

#Preview {
    ContentView()
}
