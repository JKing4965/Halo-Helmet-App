
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target file
const OUTPUT_FILE = path.join(__dirname, '../src/utils/resortData.js');

// Overpass API URL
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Regions to query (Strictly US Bounding Boxes)
// We split the US into chunks to keep queries manageable
const REGIONS = {
  NORTHEAST: [38.0, -82.0, 48.0, -66.0], // PA, NY, VT, NH, ME, MA
  ROCKIES: [33.0, -112.0, 49.0, -102.0], // CO, UT, WY, MT, ID
  WEST_COAST: [32.0, -125.0, 49.0, -114.0], // CA, OR, WA, NV
  MIDWEST: [36.0, -98.0, 49.0, -82.0] // MN, WI, MI
};

// Known Canadian/Non-US Latitudes to hard exclude if bbox overlaps
const EXCLUDE_NORTH_OF_LAT = 49.1; // 49th Parallel roughly

// Existing patrol numbers
const PATROL_NUMBERS = {
  'vail': '970-754-1111',
  'breck': '970-496-7911',
  'aspen': '970-920-5555',
  'stowe': '802-253-3000',
  'killington': '802-422-6200',
  'bryce': '540-856-2121',
  'whiteface': '518-946-2223',
  'jackson': '307-739-2626',
  'mammoth': '760-934-0611',
  'palisades': '530-583-6911',
  'heavenly': '775-586-7000',
  'parkcity': '435-615-1911',
  'bigsky': '406-995-5800'
};

async function fetchRegion(name, bbox) {
  const query = `
    [out:json][timeout:25];
    (
      way["landuse"="winter_sports"]["name"](${bbox.join(',')});
      relation["landuse"="winter_sports"]["name"](${bbox.join(',')});
      node["sport"="skiing"]["name"](${bbox.join(',')});
    );
    out center;
  `;

  console.log(`Fetching ${name}...`);
  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query
    });
    
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.elements;
  } catch (error) {
    console.error(`Error fetching ${name}:`, error);
    return [];
  }
}

function processElements(elements) {
  const resorts = [];
  const seenNames = new Set();

  // Keyword filters to remove non-resorts
  const BLOCKLIST = [
    'Rental', 'School', 'Shop', 'Condos', 'Parking', 'Lodge', 
    'Nordic', 'Cross Country', 'Trail', 'Tubing', 'Sledding', 
    'Golf', 'Center', 'Club', 'Park' // Often filters out "City Park Ski Hill"
  ];

  elements.forEach(el => {
    const name = el.tags.name;
    
    // 1. Basic Name Checks
    if (!name || seenNames.has(name)) return;
    if (BLOCKLIST.some(bad => name.includes(bad))) return;

    // 2. Coordinate Checks
    const lat = el.center ? el.center.lat : el.lat;
    const lng = el.center ? el.center.lon : el.lon;

    if (!lat || !lng) return;
    
    // Strict US Latitude check (Exclude Canada)
    if (lat > EXCLUDE_NORTH_OF_LAT) return;

    // Strict US Longitude check (Exclude Europe just in case)
    if (lng > -60) return; 

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Determine State/Region (Rough Box Approximation)
    let region = 'US';
    if (lng > -80) region = 'Northeast'; // VT, NH, ME, NY
    else if (lng > -105 && lat < 41) region = 'Colorado/Utah';
    else if (lng < -115) region = 'West Coast'; 
    else region = 'Rockies';

    resorts.push({
      id,
      name,
      lat,
      lng,
      region,
      patrolNumber: PATROL_NUMBERS[id] || '911'
    });

    seenNames.add(name);
  });

  return resorts;
}

async function main() {
  let allRaw = [];
  
  for (const [key, bbox] of Object.entries(REGIONS)) {
    const data = await fetchRegion(key, bbox);
    allRaw = allRaw.concat(data);
  }

  const processed = processElements(allRaw);
  
  // Sort Alphabetical
  processed.sort((a, b) => a.name.localeCompare(b.name));

  const fileContent = `export const RESORTS = ${JSON.stringify(processed, null, 2)};`;
  
  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`Successfully wrote ${processed.length} US resorts to ${OUTPUT_FILE}`);
}

main();
