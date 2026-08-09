# Google Play Store Privacy & Data Safety Audit Checklist

This checklist ensures full compliance with **Google Play Store Policy**, **Google Play Data Safety Section declarations**, **User Data Deletion mandates**, and **Formspree Feedback Service** disclosures.

---

## 1. Google Play Console Data Safety Declarations

Use the table below when completing the **Data Safety Form** in Google Play Console (**Policy > App Content > Data Safety**).

### A. Data Types & Declarations

| Data Category              | Specific Data Type               | Collected?           | Shared?         | Processing Purpose                          | Required / Optional       | Encryption in Transit          |
| :------------------------- | :------------------------------- | :------------------- | :-------------- | :------------------------------------------ | :------------------------ | :----------------------------- |
| **Personal Info**          | Email Address                    | Yes                  | Yes (Formspree) | App functionality & Developer communication | Optional (Feedback reply) | Yes (HTTPS / TLS 1.3)          |
| **User Content**           | Feedback Messages / Text         | Yes                  | Yes (Formspree) | App functionality & Bug fixing              | Required for submission   | Yes (HTTPS / TLS 1.3)          |
| **App Info & Performance** | Operating System / Build Version | Yes                  | Yes (Formspree) | Diagnostics & App performance               | Automatically attached    | Yes (HTTPS / TLS 1.3)          |
| **App Activity**           | User Preferences (Theme, Audio)  | Yes (Stored locally) | No              | App functionality                           | Required for settings     | N/A (Stored locally on device) |

---

## 2. Privacy Policy & Public Link Mandate

- [x] **Hosted Privacy Policy URL**: A publicly accessible HTTPS URL containing the privacy policy (`https://tallyho.eng618-account.workers.dev/privacy`) generated directly from Expo web build (`expo export -p web`).
- [x] **In-App Privacy Access**: Accessible inside the app via **Settings > View Store Privacy Policy Page** (navigates directly to `/privacy` route).
- [x] **Third-Party Disclosures**: Formspree (`https://formspree.io/f/xgawwval`) and Sentry explicitly named as data processors for feedback form submissions and crash reporting.
- [x] **Non-Tracking Declaration**: Clearly states that data is NOT sold, rented, or shared with third-party data brokers for cross-site targeting.

---

## 3. Account & Local Data Deletion Compliance

Per Google Play Policy requirements on Data & Account Deletion:

- [x] **In-App Purge Action**: App provides an immediate local cache and preference reset via **Settings > Reset Local Storage & Settings**.
- [x] **Submitted Feedback Deletion**: Privacy Policy provides an explicit email point of contact (`privacy.tallyho@garciaericn.com`) for requesting permanent erasure of submitted feedback.
- [x] **No Hidden Retainers**: Local storage clearing resets `themeMode`, `soundEnabled`, `hapticsEnabled`, and `customServerUrl` back to initial defaults.

---

## 4. Children’s Privacy & COPPA Verification

- [ ] **Target Audience Declaration**: Specified in Play Console (**Policy > App Content > Target Audience and Content**).
- [x] **Zero Sensitive Tracking**: App does not request location, contacts, SMS, camera, microphone (permission array removed in `app.json`), or advertising ID (`GAID`) permissions.
- [x] **COPPA Statement**: Included in Privacy Policy confirming no intentional collection of data from children under 13.

---

## 5. Security & Network Protocols

- [x] **TLS 1.2 / 1.3 Enforcement**: Feedback submissions sent exclusively over `https://formspree.io/f/xgawwval`.
- [x] **Cleartext Traffic Disabled**: Android Manifest / Expo config restricts HTTP cleartext traffic (`android:usesCleartextTraffic="false"` by default in Expo Android builds).
- [x] **Sanitized Payload**: Submissions filter out sensitive internal tokens and include only category, user message, optional email, platform, and version.

---

## 6. Pre-Submission Release Checklist

- [ ] **Play Console Data Safety Form Completed**: Matches actual data transmission behavior.
- [ ] **Privacy Policy URL Active**: Tested in private browsing window.
- [ ] **Settings Modal Verified**: Open settings modal, submit test feedback via Formspree, verify success alert banner.
- [ ] **Data Reset Verified**: Trigger reset button, confirm `Alert.alert` dialog prompt and default state restoration.
