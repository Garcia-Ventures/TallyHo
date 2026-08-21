import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from '@gv-tech/ui-native';
import { useRouter } from 'expo-router';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Database,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react-native';
import { View } from 'react-native';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { PALETTE } from '../src/constants/colors';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <ScreenContainer maxWidth="4xl" padding="normal">
      <View className="gap-6 py-2">
        {/* HERO BANNER */}
        <Card className="border-chip-sage/30 bg-chip-sage/10 p-6 shadow-sm">
          <CardContent className="gap-3 p-0">
            <View className="flex-row items-center gap-3">
              <View className="bg-chip-sage h-11 w-11 items-center justify-center rounded-2xl">
                <ShieldCheck size={24} color={PALETTE.white} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-xl font-black">TallyHo Privacy Policy</Text>
                <Text className="text-muted-foreground text-xs font-semibold">
                  100% Offline-First • Zero Data Sales • Complete Transparency
                </Text>
              </View>
            </View>
            <Text className="text-foreground/90 text-xs leading-5 font-medium">
              At <Text className="font-bold">TallyHo</Text> (developed by Garcia Ventures), we believe board game and
              card game scorekeeping should be simple, tactile, and completely private. This Privacy Policy details how
              data is handled across our mobile apps (Android, iOS) and web application in strict compliance with Google
              Play Store Data Safety rules, Apple Privacy Guidelines, COPPA, and international data standards.
            </Text>
            <View className="flex-row items-center gap-2 pt-1">
              <Badge className="bg-chip-sage/20 border-chip-sage/30 border">
                <Text className="text-chip-sage text-[10px] font-black">Effective: August 2026</Text>
              </Badge>
              <Badge className="border-border bg-popover border">
                <Text className="text-muted-foreground text-[10px] font-bold">Version 1.1.0</Text>
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 1: CORE DATA PRINCIPLES */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
                <Lock size={18} color={PALETTE.chip.sage} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">1. Core Data Philosophy</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.sage} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">Local-First Architecture</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  Your custom games, player libraries, round history, scoreboards, and settings (theme mode, audio,
                  haptics) are stored strictly on your local device. We do not require account creation, logins, or
                  mandatory cloud database syncs for core scorekeeping.
                </Text>
              </View>
            </View>

            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.sage} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">Zero Cross-App Ad Tracking</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  TallyHo contains zero third-party advertising brokers, zero ad tracking SDKs, and zero cross-app
                  tracking tools. We do not collect, request, or transmit your device Advertising ID (GAID or IDFA).
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 2: DATA SAFETY TABLE */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-purple/15 h-8 w-8 items-center justify-center rounded-full">
                <Database size={18} color={PALETTE.chip.purple} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">
                2. Data Collection &amp; Safety Declaration
              </CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground mb-1 text-xs leading-5 font-medium">
              Below is the comprehensive data breakdown matching our Google Play Console Data Safety and Apple Privacy
              declarations:
            </Text>

            <View className="border-border bg-popover overflow-hidden rounded-xl border">
              <View className="bg-muted/40 border-border flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-[11px] font-black">Category</Text>
                <Text className="text-foreground w-1/4 text-[11px] font-black">Data Type</Text>
                <Text className="text-foreground w-1/4 text-[11px] font-black">Purpose</Text>
                <Text className="text-foreground w-1/4 text-[11px] font-black">Handling &amp; Security</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">Financial &amp; Purchases</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Order ID, Entitlement Status</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">TallyHo Pro &amp; Billing</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">RevenueCat / Play Billing</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">Personal Info</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Email Address (Optional / Restore)</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Cross-Device Restore &amp; Support</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">HTTPS Encrypted (TLS 1.3)</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">Analytics</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Anonymous Feature Usage</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Product Improvement</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">Self-Hosted OpenPanel</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">Diagnostics</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Crash Traces, OS Version</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Crash Mitigation &amp; QA</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">Sentry Telemetry (No PII)</Text>
              </View>

              <View className="flex-row p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">App Activity &amp; Scores</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Scores, Players, Presets</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Core Gameplay</Text>
                <Text className="w-1/4 text-xs font-bold text-blue-600 dark:text-blue-400">100% Local Storage</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 3: THIRD PARTY PROCESSORS */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-mustard/15 h-8 w-8 items-center justify-center rounded-full">
                <Globe size={18} color={PALETTE.chip.mustard} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">3. Third-Party Service Processors</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3.5 p-0">
            {/* RevenueCat */}
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <CreditCard size={16} color={PALETTE.chip.mustard} />
                  <Text className="text-foreground text-xs font-bold">RevenueCat &amp; In-App Billing</Text>
                </View>
                <Badge className="border-chip-mustard/40 bg-chip-mustard/20 border">
                  <Text className="text-chip-mustard text-[10px] font-black">Purchases &amp; Entitlements</Text>
                </Badge>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                TallyHo uses RevenueCat (<Text className="text-foreground font-bold">https://www.revenuecat.com</Text>)
                to securely manage digital product entitlements (TallyHo Pro Monthly, Yearly, and Lifetime). On mobile,
                payments are handled exclusively by the Google Play Store and Apple App Store. On the Web, transactions
                are processed by Stripe. We never see or store your payment card numbers.
              </Text>
            </View>

            {/* Sentry */}
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Activity size={16} color={PALETTE.chip.purple} />
                  <Text className="text-foreground text-xs font-bold">Sentry (Crash &amp; Health Monitoring)</Text>
                </View>
                <Badge className="border border-purple-500/40 bg-purple-500/20">
                  <Text className="text-[10px] font-black text-purple-600 dark:text-purple-300">Crash Telemetry</Text>
                </Badge>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                TallyHo incorporates Sentry (<Text className="text-foreground font-bold">https://sentry.io</Text>) to
                catch unhandled exceptions, inspect diagnostic stack traces, and monitor release health. Sentry reports
                contain zero personal identifiers and are strictly used to diagnose and fix application crashes.
              </Text>
            </View>

            {/* OpenPanel */}
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <BarChart3 size={16} color={PALETTE.chip.sage} />
                  <Text className="text-foreground text-xs font-bold">OpenPanel (Self-Hosted Anonymous Analytics)</Text>
                </View>
                <Badge className="border-chip-sage/40 bg-chip-sage/20 border">
                  <Text className="text-chip-sage text-[10px] font-black">Anonymous Events</Text>
                </Badge>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                To understand feature popularity and improve gameplay flow, TallyHo connects to our self-hosted
                OpenPanel instance (<Text className="text-foreground font-bold">openpanel.gventureshq.com</Text>). We
                track aggregate events (e.g. game started, round completed, game completed) without tracking IP
                addresses, device advertising IDs, or individual user identities.
              </Text>
            </View>

            {/* Formspree */}
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Mail size={16} color={PALETTE.ink.muted} />
                  <Text className="text-foreground text-xs font-bold">Formspree (Direct User Feedback)</Text>
                </View>
                <Badge className="border-border bg-card border">
                  <Text className="text-muted-foreground text-[10px] font-bold">User Feedback</Text>
                </Badge>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                When you choose to submit feedback or bug reports via the in-app Settings modal, your feedback message,
                optional reply email, and app version are transmitted securely to Formspree (
                <Text className="text-foreground font-bold">https://formspree.io</Text>) over TLS 1.3 encryption solely
                to process your inquiry.
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 4: CROSS-PLATFORM PRO RESTORE & EMAIL USAGE */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-mustard/15 h-8 w-8 items-center justify-center rounded-full">
                <Sparkles size={18} color={PALETTE.chip.mustard} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">
                4. Cross-Platform Purchases &amp; Email Usage
              </CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              TallyHo Pro is designed to be seamless across physical devices and web browsers. Here is how purchase
              restoration and email data are handled:
            </Text>

            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.mustard} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">Native Store Restoration</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  If you purchase TallyHo Pro via the Google Play Store or Apple App Store, tapping &ldquo;Restore
                  Purchases&rdquo; on the same device or store account automatically re-authenticates your entitlement
                  with zero personal data or email input required.
                </Text>
              </View>
            </View>

            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.mustard} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">Cross-Device &amp; Web Restoration</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  If you purchase on the Web (via Stripe) or wish to sync your Pro entitlement to a device on a
                  different ecosystem (e.g. from Web to Android), providing your billing email allows RevenueCat to
                  match and unlock your Pro entitlement.
                </Text>
              </View>
            </View>

            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.mustard} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">No Marketing or Spam</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  Your restore email is used exclusively as a unique cryptographic identifier for receipt delivery and
                  entitlement lookup. We never sell your email or add you to marketing campaigns, newsletters, or
                  third-party lists.
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 5: DATA CONTROL & DELETION RIGHTS */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-status-error-bg h-8 w-8 items-center justify-center rounded-full">
                <RefreshCw size={18} color={PALETTE.status.errorText} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">
                5. Local Data Reset &amp; Erasure Rights
              </CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center gap-2">
                <RefreshCw size={16} color={PALETTE.chip.sage} />
                <Text className="text-foreground text-xs font-bold">Instant Local Device Purge</Text>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                You retain complete control over your local device data. Navigating to{' '}
                <Text className="text-foreground font-bold">Settings &gt; Reset Local Storage &amp; Settings</Text>{' '}
                instantly wipes all locally stored preferences, players, and match history.
              </Text>
            </View>

            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center gap-2">
                <Mail size={16} color={PALETTE.chip.purple} />
                <Text className="text-foreground text-xs font-bold">Permanent Erasure of Submitted Data</Text>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                Per Google Play and GDPR Data Deletion requirements, if you provided an email address during support
                feedback or cross-device restore and wish to request permanent deletion of your customer record, email
                us directly at:
              </Text>
              <View className="bg-card border-border mt-1 flex-row items-center justify-between rounded-lg border p-3">
                <Text className="text-foreground text-xs font-black select-all">privacy.tallyho@gventureshq.com</Text>
                <Text className="text-muted-foreground text-[10px] font-semibold">Response within 5 business days</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 6: CHILDREN'S PRIVACY (COPPA) & SECURITY */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-navy/15 h-8 w-8 items-center justify-center rounded-full">
                <UserCheck size={18} color={PALETTE.chip.navy} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">6. Children’s Privacy &amp; Security</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              <Text className="text-foreground font-bold">COPPA Compliance:</Text> TallyHo is built for general
              audiences and table scorekeeping. We do not knowingly solicit or collect personal information from
              children under 13 years of age.
            </Text>
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              <Text className="text-foreground font-bold">Transit Security:</Text> All network communications (feedback
              forms, purchase verifications, analytics, and diagnostics) strictly enforce HTTPS and TLS 1.3 encryption.
              Cleartext HTTP traffic is completely disabled.
            </Text>
          </CardContent>
        </Card>

        {/* SECTION 7: DEVELOPER CONTACT */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
                <Mail size={18} color={PALETTE.chip.sage} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">7. Developer &amp; Legal Contact</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              If you have any questions, inquiries, or data deletion requests regarding this Privacy Policy, please
              contact Garcia Ventures:
            </Text>
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <Text className="text-foreground text-xs font-black">Garcia Ventures LLC</Text>
              <Text className="text-muted-foreground text-xs font-medium">Privacy &amp; Compliance Office</Text>
              <Text className="text-muted-foreground text-xs font-medium">
                Privacy Inquiries:{' '}
                <Text className="text-foreground font-bold select-all">privacy.tallyho@gventureshq.com</Text>
              </Text>
              <Text className="text-muted-foreground text-xs font-medium">
                General Support: <Text className="text-foreground font-bold select-all">tallyho@gventureshq.com</Text>
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* FOOTER ACTIONS */}
        <View className="items-center justify-center gap-4 py-4">
          <Button onPress={handleBack} className="bg-primary rounded-xl px-8 py-3 shadow-sm">
            <Text className="text-primary-foreground text-xs font-bold">Return to App</Text>
          </Button>

          <Text className="text-muted-foreground text-center text-[11px] font-semibold">
            TallyHo Board Game Scorekeeper • Hosted via Cloudflare Pages • All Rights Reserved © 2026 Garcia Ventures
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
