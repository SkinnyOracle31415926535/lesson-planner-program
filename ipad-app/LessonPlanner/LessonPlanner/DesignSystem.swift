//
//  DesignSystem.swift
//  LessonPlanner
//

import SwiftUI

enum RetroPalette {
    static let webTeal = Color(red: 0, green: 128.0 / 255.0, blue: 128.0 / 255.0)
    static let windowGray = Color(red: 192.0 / 255.0, green: 192.0 / 255.0, blue: 192.0 / 255.0)
    static let titleNavy = Color(red: 0, green: 0, blue: 128.0 / 255.0)
    static let electricCyan = Color(red: 0 / 255, green: 1, blue: 1)
    static let laserYellow = Color(red: 1, green: 1, blue: 0)
    static let hotPink = Color(red: 1, green: 0, blue: 1)
    static let terminalGreen = Color(red: 0, green: 1, blue: 0)
    static let stationSky = Color(red: 78.0 / 255.0, green: 185.0 / 255.0, blue: 228.0 / 255.0)
    static let stationOutline = Color(red: 7.0 / 255.0, green: 143.0 / 255.0, blue: 199.0 / 255.0)
    static let stationLabel = Color(red: 1, green: 225.0 / 255.0, blue: 120.0 / 255.0)
    static let stationShadow = Color(red: 146.0 / 255.0, green: 232.0 / 255.0, blue: 166.0 / 255.0)
    static let warning = Color(red: 237.0 / 255.0, green: 98.0 / 255.0, blue: 98.0 / 255.0)
}

struct RetroWindow<Content: View>: View {
    let title: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(title)
                    .font(.system(size: 12, weight: .black, design: .monospaced))
                Spacer()
                Text("▾")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 9)
            .frame(height: 30)
            .background(RetroPalette.titleNavy)

            content
                .background(RetroPalette.windowGray)
        }
        .background(
            Rectangle()
                .fill(RetroPalette.windowGray)
        )
        .overlay(Rectangle().stroke(.black, lineWidth: 2))
    }
}

struct BevelButtonStyle: ButtonStyle {
    var fill: Color = RetroPalette.windowGray

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 11, weight: .black, design: .monospaced))
            .foregroundStyle(.black)
            .padding(.horizontal, 9)
            .padding(.vertical, 7)
            .background(fill)
            .overlay(
                Rectangle()
                    .stroke(.black, lineWidth: 2)
                    .overlay(
                        Rectangle()
                            .stroke(.white, lineWidth: configuration.isPressed ? 0 : 1)
                            .padding(2)
                    )
            )
            .offset(x: configuration.isPressed ? 1 : 0, y: configuration.isPressed ? 1 : 0)
    }
}
