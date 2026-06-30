'use strict';

/**
 * Maps an Indian state / UT to one of five commerce regions:
 *   North · South · East · West · Northeast
 *
 * Based loosely on the Indian Zonal Councils, with the Central zone folded into
 * neighbouring regions (the spec only defines five regions). Lookup is
 * case/space/punctuation-insensitive and handles common aliases.
 */

const REGIONS = ['North', 'South', 'East', 'West', 'Northeast'];

const STATE_TO_REGION = {
  // North
  delhi: 'North',
  'new delhi': 'North',
  haryana: 'North',
  punjab: 'North',
  'himachal pradesh': 'North',
  uttarakhand: 'North',
  uttaranchal: 'North',
  'uttar pradesh': 'North',
  'jammu and kashmir': 'North',
  'jammu kashmir': 'North',
  ladakh: 'North',
  chandigarh: 'North',
  rajasthan: 'North',

  // South
  'andhra pradesh': 'South',
  karnataka: 'South',
  kerala: 'South',
  'tamil nadu': 'South',
  telangana: 'South',
  puducherry: 'South',
  pondicherry: 'South',
  lakshadweep: 'South',
  'andaman and nicobar islands': 'South',

  // East
  bihar: 'East',
  jharkhand: 'East',
  odisha: 'East',
  orissa: 'East',
  'west bengal': 'East',
  chhattisgarh: 'East',

  // West
  goa: 'West',
  gujarat: 'West',
  maharashtra: 'West',
  'madhya pradesh': 'West',
  'dadra and nagar haveli and daman and diu': 'West',
  'daman and diu': 'West',

  // Northeast
  assam: 'Northeast',
  'arunachal pradesh': 'Northeast',
  manipur: 'Northeast',
  meghalaya: 'Northeast',
  mizoram: 'Northeast',
  nagaland: 'Northeast',
  tripura: 'Northeast',
  sikkim: 'Northeast',
};

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Derive a region from a state name. Returns null when the state is unknown so
 * callers can fall back to national (non-regional) data.
 */
function deriveRegion(state) {
  if (!state) return null;
  const key = normalize(state);
  if (STATE_TO_REGION[key]) return STATE_TO_REGION[key];
  // tolerate a region name passed directly (e.g. already-derived value)
  const asRegion = REGIONS.find((r) => r.toLowerCase() === key);
  return asRegion || null;
}

function isValidRegion(region) {
  return REGIONS.includes(region);
}

module.exports = { REGIONS, STATE_TO_REGION, deriveRegion, isValidRegion, normalize };
