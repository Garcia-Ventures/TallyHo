# Changelog

All notable changes to the TallyHo project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1](https://github.com/Garcia-Ventures/TallyHo/compare/tally-ho-v1.3.0...tally-ho-v1.3.1) (2026-08-31)


### Performance Improvements

* memoize calculatePlayerTotals in ScoreboardView ([#24](https://github.com/Garcia-Ventures/TallyHo/issues/24)) ([9902f6f](https://github.com/Garcia-Ventures/TallyHo/commit/9902f6ffa8592261781046722a450f39fbe75f5e))

## [1.3.0](https://github.com/Garcia-Ventures/TallyHo/compare/tally-ho-v1.2.0...tally-ho-v1.3.0) (2026-08-25)


### Features

* add eas-build-safe wrapper to handle and report Expo build quota limits gracefully in CI ([f5d48e3](https://github.com/Garcia-Ventures/TallyHo/commit/f5d48e3eb7f5c63abfe3715252149873fef8a986))
* enhance validation script with Maestro syntax checks, build steps, and comprehensive CLI flags for CI/CD workflows ([3d852a5](https://github.com/Garcia-Ventures/TallyHo/commit/3d852a507611588d9658162c2858a031ad916428))


### Bug Fixes

* remove hardcoded default API key for RevenueCat on Android ([#21](https://github.com/Garcia-Ventures/TallyHo/issues/21)) ([0e016b3](https://github.com/Garcia-Ventures/TallyHo/commit/0e016b3be6e5b72ac22970f58d663f74229f0784))
* update hook permisions ([1780d73](https://github.com/Garcia-Ventures/TallyHo/commit/1780d735180060532a5009f0c9c85f7c2f30a128))


### Performance Improvements

* **playmodeview:** memoize calculatePlayerTotals ([#20](https://github.com/Garcia-Ventures/TallyHo/issues/20)) ([b43fd67](https://github.com/Garcia-Ventures/TallyHo/commit/b43fd675138a5bfe217585e8ec12502697cc0aca))

## [1.2.0](https://github.com/Garcia-Ventures/TallyHo/compare/tally-ho-v1.1.0...tally-ho-v1.2.0) (2026-08-23)


### Features

* add dark mode support for app assets and integrate custom branding across UI components ([957b384](https://github.com/Garcia-Ventures/TallyHo/commit/957b38463a55bf1b225a6b7849a43afde1e5f16d))
* add horizontal, stacked, and primary logo assets ([1bdf9b9](https://github.com/Garcia-Ventures/TallyHo/commit/1bdf9b96d13af48ae438da17b37a11a4c21eeedd))
* add local EAS build scripts and update documentation while removing redundant version tracking from app config ([7b91e2c](https://github.com/Garcia-Ventures/TallyHo/commit/7b91e2c3d47ab39240b413af6ea45f4dc62ef480))
* polyfill Array and String at methods and configure Sentry error ignore filters ([ed5e634](https://github.com/Garcia-Ventures/TallyHo/commit/ed5e63406bd53f39cc5a7c86f1fafb7aeca5cdeb))


### Bug Fixes

* local builds ([f28bf0a](https://github.com/Garcia-Ventures/TallyHo/commit/f28bf0a6cc831a88ea298f1c99e6a917c3237967))
* **styles:** correct button size rendering and ux ([9016079](https://github.com/Garcia-Ventures/TallyHo/commit/901607975485dcb85591a0b6113dd1c9ec4add19))
* update RevenueCat API key and add validation check for initialization ([40673db](https://github.com/Garcia-Ventures/TallyHo/commit/40673dbb32f930f80d4ba468b6db6e801d0e7ad7))

## [1.1.0](https://github.com/Garcia-Ventures/TallyHo/compare/tally-ho-v1.0.3...tally-ho-v1.1.0) (2026-08-19)


### Features

* add automated semver versioning script and update package.json commands ([e5bee50](https://github.com/Garcia-Ventures/TallyHo/commit/e5bee501057fdcfeb2028a9e626d35edf87cde9a))
* add CustomHeader component and integrate it into stack navigation for web, and update settings screen max width ([3eafac0](https://github.com/Garcia-Ventures/TallyHo/commit/3eafac047ef7adb6a74c0aa8230a6eb2a22e2c77))
* add dependabot configuration for bun package manager ([c320f1f](https://github.com/Garcia-Ventures/TallyHo/commit/c320f1fc4153c04717e28510af84298504be562a))
* add expo-application dependency ([2b609f8](https://github.com/Garcia-Ventures/TallyHo/commit/2b609f8cc5f5ce815e598ccb4a9d142873c37205))
* add native haptic, audio, and confetti celebration services for improved UX ([f76aaab](https://github.com/Garcia-Ventures/TallyHo/commit/f76aaab0728cfaf7bbe424fc75369daa5032665b))
* add optional email support to purchase flow, improve customer center status handling, and enhance web session management ([539f396](https://github.com/Garcia-Ventures/TallyHo/commit/539f3965d93c2c697754ea4c989b5835f423597d))
* add setup-ui-native agent skill for @gv-tech/ui-native configuration ([7f7b5a3](https://github.com/Garcia-Ventures/TallyHo/commit/7f7b5a3835ffc9a132be6dc1a3528ebedd16a875))
* add victory screenshot asset and update input field heights in GameSetupModal ([770fb8c](https://github.com/Garcia-Ventures/TallyHo/commit/770fb8ca46696cdf56e0dc4a89b5d281df4d3f18))
* add wrangler.jsonc configuration for Cloudflare Pages deployment ([b5617a4](https://github.com/Garcia-Ventures/TallyHo/commit/b5617a4ee0510dca5fa5bd031cd03822254dece6))
* automate versioning, changelog generation, and EAS distribution using Google release-please ([0d7f2e5](https://github.com/Garcia-Ventures/TallyHo/commit/0d7f2e54d415aa6824af9c53e597cbdad5bfe64b))
* configure Expo Updates with runtime versioning and required Android permissions ([d372cfd](https://github.com/Garcia-Ventures/TallyHo/commit/d372cfd5b2724677b0a05a73d18610799578dcc2))
* configure Vitest with coverage support and update dependencies ([5e10f42](https://github.com/Garcia-Ventures/TallyHo/commit/5e10f4263719780085b491cc1561f2e9f57d04d9))
* enhance RemoveAdsModal analytics with comprehensive tracking for impressions, interactions, and purchase events ([a9a2b16](https://github.com/Garcia-Ventures/TallyHo/commit/a9a2b16c65d2bb7906754cbce2fd98677bec9702))
* expand purchase options with tiered TallyHo Pro plans and add customer center support ([6439e09](https://github.com/Garcia-Ventures/TallyHo/commit/6439e093b26eecd8b8a5ae8d62fa1fa783a5b31b))
* implement automated changelog generation and GitHub release workflow with conventional commits support ([4caaed9](https://github.com/Garcia-Ventures/TallyHo/commit/4caaed9e898c963ad5f334bbfc1af0be2bbff45c))
* implement comprehensive haptic and sound effect service with global event triggers ([14b4a9f](https://github.com/Garcia-Ventures/TallyHo/commit/14b4a9f3812e65921a1f5bb85f223251353ed41c))
* implement cross-platform toast notifications and update restore purchase flow with email-based lookup support ([0703004](https://github.com/Garcia-Ventures/TallyHo/commit/07030046ae5b5a03fb16b149c7cc431c89d8202d))
* implement expo-router navigation and main UI screens for game management ([4cdeb9a](https://github.com/Garcia-Ventures/TallyHo/commit/4cdeb9ad4c6c023b34e0a616a5661236166ca293))
* implement in-app monetization with ad-free state management, configuration, and UI banners. ([72a1ba3](https://github.com/Garcia-Ventures/TallyHo/commit/72a1ba34b9969b59a8408c23f0154b32b5a105e8))
* implement multi-platform analytics service using OpenPanel for web and native targets ([410e3e9](https://github.com/Garcia-Ventures/TallyHo/commit/410e3e924066f68dc50b0d5057bc028f0a82ef5b))
* implement native ScoreboardView with animated flip transition and supporting modular components ([4e18648](https://github.com/Garcia-Ventures/TallyHo/commit/4e1864829f425241cf9097acb451376956e3b163))
* implement play mode state, sound effects, and enhanced game progression logic ([5e05b93](https://github.com/Garcia-Ventures/TallyHo/commit/5e05b93ffa352aceaff6c5b56ca9d06105a29d91))
* implement privacy policy screen, update store assets, and refactor settings UI for improved layout and feedback submission. ([2367bd1](https://github.com/Garcia-Ventures/TallyHo/commit/2367bd177d014e81d7941876b90a33deb69839ef))
* implement route-based modal navigation and redesign Game Over screen UI ([257f605](https://github.com/Garcia-Ventures/TallyHo/commit/257f6053a910bf8607e3bdc944750d515c11571c))
* implement settings modal, add UI dependencies, and document Google Play privacy compliance ([942f278](https://github.com/Garcia-Ventures/TallyHo/commit/942f278e469d1f2a5f36b624a80a052a3c279624))
* implement system-wide theme support with dynamic dark mode switching ([96e5f2b](https://github.com/Garcia-Ventures/TallyHo/commit/96e5f2b4167fc7f0ef5cf842164306250bcad4e1))
* improve subscription management flow by adding management URL support and cross-platform fallbacks ([bc9ef23](https://github.com/Garcia-Ventures/TallyHo/commit/bc9ef2308af2b01c99234063900720d38f074ab3))
* initialize Expo project configuration and EAS build profiles ([79ea27f](https://github.com/Garcia-Ventures/TallyHo/commit/79ea27fcbf62c11e827ac83df20ae3423b463274))
* initialize native project structures with Expo integration and Sentry configuration ([edfe11b](https://github.com/Garcia-Ventures/TallyHo/commit/edfe11bf2c29e0574254bcb707049d279d8a0550))
* initialize TallyHo project structure with scoreboard management and game UI components ([6c5498e](https://github.com/Garcia-Ventures/TallyHo/commit/6c5498e88b6d27791f60f41d370e14d581fc2da4))
* integrate live RevenueCat offerings and restrict developer settings to debug mode ([7d9f23a](https://github.com/Garcia-Ventures/TallyHo/commit/7d9f23a1ad8b22f279fb66cdc17793a64ca2f0b9))
* integrate NativeWind for styling and implement isomorphic storage layer ([8d60e0e](https://github.com/Garcia-Ventures/TallyHo/commit/8d60e0e7dc1bb908f461f962fbb0e07750c4016d))
* integrate OpenPanel analytics with tracking for game and settings events ([3565697](https://github.com/Garcia-Ventures/TallyHo/commit/3565697302150dc49c4c12b99dcf6c2de83d60c0))
* integrate RevenueCat for ad-free IAP and implement dynamic ad impression tracking ([5a43d40](https://github.com/Garcia-Ventures/TallyHo/commit/5a43d40ff06acb1998b2322751a93fb71aad26b6))
* integrate Sentry error tracking, add CI/CD pipelines, and document release and store procedures. ([c5f71d2](https://github.com/Garcia-Ventures/TallyHo/commit/c5f71d219f4a3904e591556380dcd5e3cf44a873))
* introduce ScreenContainer component and standardize layout across app screens and modals ([e471ad9](https://github.com/Garcia-Ventures/TallyHo/commit/e471ad91e2547d05ac4121372e4ed88335205877))
* migrate web payment services from Stripe to RevenueCat SDK ([ab2417c](https://github.com/Garcia-Ventures/TallyHo/commit/ab2417cbb296f6dff210311555ca414442a931b8))
* move AdBannerCard component to top of home screen layout ([7c1e824](https://github.com/Garcia-Ventures/TallyHo/commit/7c1e8241853feb2f15d1a8c1db7694b27f2d9081))
* transform repository from base template to Tally Ho scorekeeping application including assets and updated documentation ([008fa8e](https://github.com/Garcia-Ventures/TallyHo/commit/008fa8e1f78e15037d33b4a87a18eedcb1a5913f))


### Bug Fixes

* downgrade lightningcss to 1.30.1 and remove css layer syntax from global imports ([968efb6](https://github.com/Garcia-Ventures/TallyHo/commit/968efb69fcc8344d22f48ca294de5334c1fbaba1))
* remove fixed height from preset card to prevent content clipping ([b1aea14](https://github.com/Garcia-Ventures/TallyHo/commit/b1aea14a04942e80b97cddf4f2bec5bb4a75b1db))
* update RevenueCat API key resolution logic to support platform-specific keys and remove hardcoded test key ([0589593](https://github.com/Garcia-Ventures/TallyHo/commit/058959353765bf011f550176f8c77ed6a343b069))

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
