# Changelog

All notable changes to the TallyHo project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-08-18

### Added
- integrate live RevenueCat offerings and restrict developer settings to debug mode
- enhance RemoveAdsModal analytics with comprehensive tracking for impressions, interactions, and purchase events
- expand purchase options with tiered TallyHo Pro plans and add customer center support
- integrate RevenueCat for ad-free IAP and implement dynamic ad impression tracking
- implement multi-platform analytics service using OpenPanel for web and native targets

### Fixed
- update RevenueCat API key resolution logic to support platform-specific keys and remove hardcoded test key

### Changed
- restructure documentation directory to improve organization and maintainability.

## [1.0.2] - 2026-08-13

### Added
- add expo-application dependency

### Changed
- simplify analytics initialization by replacing safeRequire with direct imports and inline error handling

## [1.0.1] - 2026-08-13

### Added
- add automated semver versioning script and update package.json commands
- integrate OpenPanel analytics with tracking for game and settings events
- implement automated changelog generation and GitHub release workflow with conventional commits support
- initialize native project structures with Expo integration and Sentry configuration
- configure Expo Updates with runtime versioning and required Android permissions
- move AdBannerCard component to top of home screen layout
- implement in-app monetization with ad-free state management, configuration, and UI banners.
- add CustomHeader component and integrate it into stack navigation for web, and update settings screen max width
- add victory screenshot asset and update input field heights in GameSetupModal
- implement privacy policy screen, update store assets, and refactor settings UI for improved layout and feedback submission.
- add dependabot configuration for bun package manager
- integrate Sentry error tracking, add CI/CD pipelines, and document release and store procedures.
- add setup-ui-native agent skill for @gv-tech/ui-native configuration
- implement comprehensive haptic and sound effect service with global event triggers
- introduce ScreenContainer component and standardize layout across app screens and modals
- add wrangler.jsonc configuration for Cloudflare Pages deployment
- implement system-wide theme support with dynamic dark mode switching
- implement settings modal, add UI dependencies, and document Google Play privacy compliance
- implement route-based modal navigation and redesign Game Over screen UI
- transform repository from base template to Tally Ho scorekeeping application including assets and updated documentation
- integrate NativeWind for styling and implement isomorphic storage layer
- initialize Expo project configuration and EAS build profiles
- implement expo-router navigation and main UI screens for game management
- add native haptic, audio, and confetti celebration services for improved UX
- implement native ScoreboardView with animated flip transition and supporting modular components
- implement play mode state, sound effects, and enhanced game progression logic
- initialize TallyHo project structure with scoreboard management and game UI components

### Fixed
- downgrade lightningcss to 1.30.1 and remove css layer syntax from global imports
- remove fixed height from preset card to prevent content clipping

### Changed
- centralize color theme configuration in a new palette constant and integrate across application components
- standardize modal navigation and headers using global Stack configuration with custom Back and Close buttons.
- standardize flex-1 layouts across scroll views and screen containers to improve responsiveness
- enhance game-over flow by adding support for historical matches, scrollable containers, and an improved victory podium layout.
- add full storage reset capability and consolidate settings management logic
- standardize keypad button height and text vertical alignment across modal and play view
- add optional header support to ScreenContainer and update components to utilize the new layout pattern
- update confetti animation logic and standardize modal layout structure across components
- wrap component content in a centered container for improved tablet and wide-screen responsiveness
- migrate ScoreboardView components to use consistent UI library primitives and design tokens
- remove web-specific components and assets to finalize transition to mobile-only codebase
- update component imports to use explicit .native file extensions
- migrate game state, player library, and settings management to dedicated Zustand stores

## [1.0.0] - 2026-08-11

### Added

- **Game Engine & Scoring**: Multi-player scoring engine supporting `RACE_HIGH`, `RACE_LOW`, and `FIXED_ROUNDS` target win conditions.
- **Game Presets**: Instant match templates for Rummy (500), Uno, Pass the Pigs, Qwirkle, and custom match creation.
- **Paper-Tactile UI Design**: Custom warm theme palette (`#FDFBF7`), card flip transitions, and accessible numeric keypad modal.
- **Victory Celebrations**: Winner podium modal with statistics summary and confetti canvas celebrations.
- **Audio & Haptic Feedback**: Custom sound effects (keypad entry, round submission, winner fanfares) and tactile haptics.
- **Privacy & Storage**: 100% offline local persistence using Zustand and AsyncStorage with zero tracking or mandatory accounts.
- **Monetization**: Non-intrusive ad placement (home bottom banner + game over card) with $1.99 lifetime "Remove Ads" unlock and ad-blocker fallback.
- **Sentry Observability**: Integrated `@sentry/react-native` for real-time error logging and performance tracing.
- **CI/CD & Native Builds**: Automated GitHub Actions workflows and EAS Build setup for production Android App Bundle (.aab) and iOS binaries.
