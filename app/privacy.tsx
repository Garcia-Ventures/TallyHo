import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from '@gv-tech/ui-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Database, Globe, Lock, Mail, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react-native';
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
              <View className="bg-chip-sage h-10 w-10 items-center justify-center rounded-2xl">
                <ShieldCheck size={22} color={PALETTE.white} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-xl font-black">Tally Ho Privacy Commitment</Text>
                <Text className="text-muted-foreground text-xs font-semibold">
                  100% Offline-First • Zero Data Sales • Complete Transparency
                </Text>
              </View>
            </View>
            <Text className="text-foreground/90 text-xs leading-5 font-medium">
              At Tally Ho (developed by Garcia Ventures), we believe game night scorekeeping should be simple, tactile,
              and completely private. This Privacy Policy details how data is handled across our mobile and web
              applications in strict compliance with Google Play Store Data Safety rules, COPPA, and international data
              standards.
            </Text>
          </CardContent>
        </Card>

        {/* SECTION 1: CORE DATA PRINCIPLES */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
                <Lock size={18} color={PALETTE.chip.sage} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">1. Core Data Principles</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.sage} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">Local-First Storage</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  Your custom games, player libraries, round history, scoreboards, and settings (theme mode, audio,
                  haptics) are stored strictly on your local device. We do not operate user accounts, logins, or cloud
                  database syncs.
                </Text>
              </View>
            </View>

            <View className="border-border bg-popover/50 flex-row items-start gap-3 rounded-xl border p-3.5">
              <CheckCircle2 size={18} color={PALETTE.chip.sage} className="mt-0.5" />
              <View className="flex-1">
                <Text className="text-foreground mb-1 text-xs font-bold">No Tracking or Ad Brokers</Text>
                <Text className="text-muted-foreground text-xs leading-5 font-medium">
                  Tally Ho contains zero advertisements, zero third-party marketing SDKs, and zero cross-app tracking
                  tools. We do not collect or request your device Advertising ID (GAID or IDFA).
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
                2. Data Collection & Safety Declaration
              </CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground mb-1 text-xs leading-5 font-medium">
              Below is the exact data breakdown matching our Google Play Console Data Safety form:
            </Text>

            <View className="border-border bg-popover overflow-hidden rounded-xl border">
              <View className="bg-muted/40 border-border flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-[11px] font-black">Category</Text>
                <Text className="text-foreground w-1/4 text-[11px] font-black">Data Type</Text>
                <Text className="text-foreground w-1/4 text-[11px] font-black">Purpose</Text>
                <Text className="text-foreground w-1/4 text-[11px] font-black">Handling</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">Personal Info</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Email (Optional)</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Support Replies</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">HTTPS Encrypted</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">User Content</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Feedback Text</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Bug Fixing / QA</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">Formspree Processor</Text>
              </View>

              <View className="border-border/60 flex-row border-b p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">Diagnostics</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">OS & App Version</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">App Stability</Text>
                <Text className="text-chip-sage w-1/4 text-xs font-bold">Sentry Telemetry</Text>
              </View>

              <View className="flex-row p-3">
                <Text className="text-foreground w-1/4 text-xs font-bold">App Activity</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">Preferences</Text>
                <Text className="text-muted-foreground w-1/4 text-xs">App Functionality</Text>
                <Text className="w-1/4 text-xs font-bold text-blue-600 dark:text-blue-400">100% Local Only</Text>
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
          <CardContent className="gap-3 p-0">
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-xs font-bold">Formspree (Feedback Collector)</Text>
                <Badge className="border-chip-mustard/40 bg-chip-mustard/20 border">
                  <Text className="text-chip-mustard text-[10px] font-black">Form Processor</Text>
                </Badge>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                When submitting feedback inside Settings, your message, optional email address, and device metadata are
                transmitted securely to Formspree (
                <Text className="text-foreground font-bold">https://formspree.io</Text>) over TLS 1.3 encryption. This
                data is used solely to process feature requests and fix bugs.
              </Text>
            </View>

            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground text-xs font-bold">Sentry (Crash Reporting)</Text>
                <Badge className="border border-purple-500/40 bg-purple-500/20">
                  <Text className="text-[10px] font-black text-purple-600 dark:text-purple-300">Crash Analytics</Text>
                </Badge>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                Tally Ho incorporates Sentry (<Text className="text-foreground font-bold">https://sentry.io</Text>) to
                catch unhandled JavaScript exceptions and diagnostic stack traces. Sentry reports contain no personal
                identifiers and are strictly used to eliminate app crashes.
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 4: DATA CONTROL & DELETION RIGHTS */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-status-error-bg h-8 w-8 items-center justify-center rounded-full">
                <RefreshCw size={18} color={PALETTE.status.errorText} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">4. Local Data Reset & Erasure Rights</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center gap-2">
                <RefreshCw size={16} color={PALETTE.chip.sage} />
                <Text className="text-foreground text-xs font-bold">Instant Local Device Purge</Text>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                You retain complete control over your local data. Navigating to{' '}
                <Text className="text-foreground font-bold">Settings &gt; Reset Local Storage &amp; Settings</Text>{' '}
                instantly wipes all locally stored preferences, players, and match history.
              </Text>
            </View>

            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <View className="flex-row items-center gap-2">
                <Mail size={16} color={PALETTE.chip.purple} />
                <Text className="text-foreground text-xs font-bold">Permanent Erasure of Submitted Feedback</Text>
              </View>
              <Text className="text-muted-foreground text-xs leading-5 font-medium">
                Per Google Play Data Deletion requirements, if you submitted feedback with your email address and wish
                to request permanent removal of your submission from our records, email us at:
              </Text>
              <View className="bg-card border-border mt-1 flex-row items-center justify-between rounded-lg border p-3">
                <Text className="text-foreground text-xs font-black select-all">privacy.tallyho@gventureshq.com</Text>
                <Text className="text-muted-foreground text-[10px] font-semibold">Response within 5 business days</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* SECTION 5: CHILDREN'S PRIVACY (COPPA) & SECURITY */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-navy/15 h-8 w-8 items-center justify-center rounded-full">
                <UserCheck size={18} color={PALETTE.chip.navy} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">5. Children’s Privacy & Security</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              <Text className="text-foreground font-bold">COPPA Compliance:</Text> Tally Ho is designed for general
              audiences and card/board game scorekeeping. We do not knowingly solicit or collect personal information
              from children under 13 years of age.
            </Text>
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              <Text className="text-foreground font-bold">Transit Security:</Text> All network communications (feedback
              forms and diagnostics) strictly enforce HTTPS and TLS 1.3 protocol encryption. Cleartext HTTP traffic is
              disabled.
            </Text>
          </CardContent>
        </Card>

        {/* SECTION 6: DEVELOPER CONTACT */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="mb-4 gap-1 p-0">
            <View className="flex-row items-center gap-2.5">
              <View className="bg-chip-sage/15 h-8 w-8 items-center justify-center rounded-full">
                <Mail size={18} color={PALETTE.chip.sage} />
              </View>
              <CardTitle className="text-foreground text-lg font-black">6. Developer & Legal Contact</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-3 p-0">
            <Text className="text-muted-foreground text-xs leading-5 font-medium">
              If you have any questions, concerns, or data requests regarding this Privacy Policy, please contact Garcia
              Ventures:
            </Text>
            <View className="border-border bg-popover gap-2 rounded-xl border p-4">
              <Text className="text-foreground text-xs font-black">Garcia Ventures LLC</Text>
              <Text className="text-muted-foreground text-xs font-medium">Privacy & Compliance Office</Text>
              <Text className="text-muted-foreground text-xs font-medium">
                Privacy Email:{' '}
                <Text className="text-foreground font-bold select-all">privacy.tallyho@gventureshq.com</Text>
              </Text>
              <Text className="text-muted-foreground text-xs font-medium">
                Support Email: <Text className="text-foreground font-bold select-all">tallyho@gventureshq.com</Text>
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
            Tally Ho Scorekeeper • Hosted via Cloudflare Pages • All Rights Reserved © 2026 Garcia Ventures
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
