// Re-export brand config for frontend use
// This single import means changing brand.config.js changes EVERYTHING
const BRAND = require('../../brand.config');

module.exports = BRAND;
