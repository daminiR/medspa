const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Explicitly set project root and server root to this directory
config.projectRoot = projectRoot;
config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};

// Monorepo configuration - only watch packages folder if you have shared packages
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Disable hierarchical lookup to prevent Metro from walking up to monorepo root
config.resolver.disableHierarchicalLookup = true;

// Force single React instance from monorepo root (React is hoisted there)
config.resolver.extraNodeModules = {
  react: path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
};

module.exports = config;
