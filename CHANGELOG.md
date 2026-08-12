# Changelog

All notable changes to the TallyHo project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
