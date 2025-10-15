const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Metro treats .wasm files as assets so imports like
// node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.wasm resolve correctly.
config.resolver.assetExts = config.resolver.assetExts.concat(['wasm']);

module.exports = config;
