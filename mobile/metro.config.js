const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// O cálculo das previsões também é usado pelo painel web.
config.watchFolders = [path.resolve(__dirname, '../public')];
module.exports = config;
