//
//  LessonPlannerUITests.swift
//  LessonPlannerUITests
//
//  Created by Ryan Sadler on 7/19/26.
//

import XCTest

final class LessonPlannerUITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    @MainActor
    func testExample() throws {
        // UI tests must launch the application that they test.
        let app = XCUIApplication()
        app.launch()

        // Use XCTAssert and related functions to verify your tests produce the correct results.
        // XCUIAutomation Documentation
        // https://developer.apple.com/documentation/xcuiautomation
    }

    @MainActor
    func testIdeaLibraryDetailExposesQuickFieldEditing() throws {
        let app = XCUIApplication()
        app.launch()

        let newIdeaButton = app.buttons["+ NEW IDEA"]
        for _ in 0..<10 where !newIdeaButton.exists {
            app.swipeUp()
        }
        XCTAssertTrue(newIdeaButton.exists, "The populated Idea Library should remain reachable in Edit mode.")

        let infoButton = app.buttons["INFO"].firstMatch
        XCTAssertTrue(infoButton.exists, "Each visible Idea card should keep a single-tap detail action.")
        infoButton.tap()

        XCTAssertTrue(app.navigationBars["IDEA DETAIL"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["TYPE"].exists)
        XCTAssertTrue(app.staticTexts["DESCRIPTION"].exists)
        XCTAssertTrue(app.staticTexts["PHOTO / STATION"].exists)

        let editTypeButton = app.buttons["idea-detail-edit-kind"]
        XCTAssertTrue(editTypeButton.exists)
        editTypeButton.tap()

        XCTAssertTrue(app.navigationBars["QUICK EDIT"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.buttons["SAVE TYPE"].exists)
    }

    @MainActor
    func testLaunchPerformance() throws {
        // This measures how long it takes to launch your application.
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }
}
