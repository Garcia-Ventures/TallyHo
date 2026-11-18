const path = require('node:path');

const { inlineVariables } = require('@gv-tech/design-tokens/native-preset');
const { withNativewind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Expo Router's require.context includes every .ts/.tsx file under app/.
// Colocated *.test.tsx files import Vitest, which pulls Vite's dynamic import()
// and fails the Metro bundle. Vitest still reads these files from disk.
const appTests = new RegExp(`${escapeForRegExp(path.resolve(__dirname, 'app'))}[/\\\\].*\\.test\\.[jt]sx?$`);
const existingBlockList = config.resolver.blockList;
config.resolver.blockList = Array.isArray(existingBlockList)
  ? [...existingBlockList, appTests]
  : [existingBlockList, appTests];

function escapeForRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

module.exports = withNativewind(config, {
  input: './src/global.css',
  inlineVariables,
});
