#!/usr/bin/env node

/**
 * Plant Scanner Data Sync Script
 *
 * This script syncs plant data from multiple sources:
 * - GBIF: Taxonomy and scientific names
 * - Wikidata: Chinese names and aliases
 * - iNaturalist: CC-licensed images
 * - OpenFarm: Care profiles
 *
 * Run with: node scripts/data-sync/index.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// GBIF API
const GBIF_API = 'https://api.gbif.org/v1';
const GBIF_MATCH_LIMIT = 100;

// Wikidata SPARQL
const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';

// iNaturalist API
const INATURALIST_API = 'https://api.inaturalist.org/v1';

// OpenFarm API
const OPENFARM_API = 'https://openfarm.cc/api/v1/crops';

// Sync statistics
const stats = {
  gbif_synced: 0,
  wikidata_synced: 0,
  inaturalist_synced: 0,
  openfarm_synced: 0,
  errors: []
};

/**
 * Fetch common plant species from GBIF
 */
async function syncGBIFData() {
  console.log('Syncing GBIF taxonomy data...');

  try {
    // Get plant kingdom key (Plantae = 1)
    // Search for plant species with occurrence counts
    const response = await fetch(
      `${GBIF_API}/species/match?kingdom=Plantae&limit=${GBIF_MATCH_LIMIT}`
    );

    if (!response.ok) {
      throw new Error(`GBIF API error: ${response.statusText}`);
    }

    const data = await response.json();

    for (const result of data.results || []) {
      if (result.matchType === 'EXACT' && result.rank === 'SPECIES') {
        // Upsert to plant_species
        const { error } = await supabase.from('plant_species').upsert({
          scientific_name: result.scientificName,
          common_name: result.vernacularName || result.scientificName,
          category: result.phylum || '未知',
          source: 'GBIF',
          external_id: String(result.usageKey),
          care_profile: {} // Will be filled by OpenFarm
        }, {
          onConflict: 'scientific_name',
          ignoreDuplicates: true
        });

        if (error) {
          stats.errors.push({ source: 'GBIF', error: error.message });
        } else {
          stats.gbif_synced++;
        }
      }
    }

    console.log(`  Synced ${stats.gbif_synced} species from GBIF`);

  } catch (error) {
    console.error('GBIF sync error:', error);
    stats.errors.push({ source: 'GBIF', error: String(error) });
  }
}

/**
 * Fetch Chinese names and aliases from Wikidata
 */
async function syncWikidataData() {
  console.log('Syncing Wikidata Chinese names...');

  try {
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?chineseName ?scientificName ?familyLabel
      WHERE {
        ?item wdt:P31 wd:Q756;  # instance of plant
              wdt:P225 ?scientificName.  # taxonomic name

        OPTIONAL {
          ?item rdfs:label ?chineseName FILTER(LANG(?chineseName) = "zh")
        }

        OPTIONAL {
          ?item wdt:P1087 ?family.  # family
          ?family rdfs:label ?familyLabel FILTER(LANG(?familyLabel) = "zh")
        }

        SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en". }
      }
      LIMIT 500
    `;

    const response = await fetch(
      `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`,
      {
        headers: {
          'Accept': 'application/sparql-results+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Wikidata API error: ${response.statusText}`);
    }

    const data = await response.json();

    for (const binding of data.results?.bindings || []) {
      const chineseName = binding.chineseName?.value;
      const scientificName = binding.scientificName?.value;

      if (chineseName && scientificName) {
        const { error } = await supabase.from('plant_species').upsert({
          scientific_name: scientificName,
          common_name: chineseName,
          category: binding.familyLabel?.value || '未知',
          source: 'Wikidata',
          external_id: binding.item.value.split('/').pop(),
          tags: [binding.familyLabel?.value, '从Wikidata导入'].filter(Boolean)
        }, {
          onConflict: 'scientific_name',
          ignoreDuplicates: true
        });

        if (error) {
          stats.errors.push({ source: 'Wikidata', error: error.message });
        } else {
          stats.wikidata_synced++;
        }
      }
    }

    console.log(`  Synced ${stats.wikidata_synced} names from Wikidata`);

  } catch (error) {
    console.error('Wikidata sync error:', error);
    stats.errors.push({ source: 'Wikidata', error: String(error) });
  }
}

/**
 * Fetch CC-licensed images from iNaturalist
 */
async function syncINaturalistImages() {
  console.log('Syncing iNaturalist images...');

  try {
    // Search for plants with photos
    const response = await fetch(
      `${INATURALIST_API}/observations?taxon_id=1&photos=true&per_page=50&license=CC-BY,CC-BY-NC,CC0`
    );

    if (!response.ok) {
      throw new Error(`iNaturalist API error: ${response.statusText}`);
    }

    const data = await response.json();

    for (const obs of data.results || []) {
      if (obs.taxon && obs.photos?.[0]) {
        const photo = obs.photos[0];
        const imageUrl = photo.url?.replace('square', 'large');

        // Update plant_species with image
        const { error } = await supabase.from('plant_species').upsert({
          scientific_name: obs.taxon.name,
          image_urls: [imageUrl],
          source: 'iNaturalist',
          license: obs.license_code || 'CC-BY'
        }, {
          onConflict: 'scientific_name',
          ignoreDuplicates: false,
          update: {
            image_urls: supabase.raw('array_cat(image_urls, ?)', [imageUrl])
          }
        });

        if (error) {
          stats.errors.push({ source: 'iNaturalist', error: error.message });
        } else {
          stats.inaturalist_synced++;
        }
      }
    }

    console.log(`  Synced ${stats.inaturalist_synced} images from iNaturalist`);

  } catch (error) {
    console.error('iNaturalist sync error:', error);
    stats.errors.push({ source: 'iNaturalist', error: String(error) });
  }
}

/**
 * Fetch care profiles from OpenFarm
 */
async function syncOpenFarmData() {
  console.log('Syncing OpenFarm care profiles...');

  try {
    const response = await fetch(
      `${OPENFARM_API}?page_size=50`
    );

    if (!response.ok) {
      throw new Error(`OpenFarm API error: ${response.statusText}`);
    }

    const data = await response.json();

    for (const crop of data.crops || []) {
      if (crop.attributes) {
        const careProfile = {
          light_requirement: mapOpenFarmSun(crop.attributes.sunlight),
          water_frequency_days: mapOpenFarmWater(crop.attributes.watering),
          temperature_min_c: crop.attributes.min_temp || 10,
          temperature_max_c: crop.attributes.max_temp || 30,
          soil_type: crop.attributes.soil || '通用土壤',
          fertilizer_frequency_days: 30,
          difficulty: mapOpenFarmDifficulty(crop.attributes.difficulty),
          toxicity: [],
          expert_tips: crop.attributes.tips ? [crop.attributes.tips] : [],
          troubleshooting: []
        };

        const { error } = await supabase.from('plant_species').upsert({
          scientific_name: crop.attributes.binomial_name || crop.attributes.name,
          common_name: crop.attributes.name,
          description: crop.attributes.description,
          care_profile: careProfile,
          source: 'OpenFarm',
          external_id: String(crop.id)
        }, {
          onConflict: 'scientific_name',
          ignoreDuplicates: false,
          update: {
            care_profile: careProfile
          }
        });

        if (error) {
          stats.errors.push({ source: 'OpenFarm', error: error.message });
        } else {
          stats.openfarm_synced++;
        }
      }
    }

    console.log(`  Synced ${stats.openfarm_synced} care profiles from OpenFarm`);

  } catch (error) {
    console.error('OpenFarm sync error:', error);
    stats.errors.push({ source: 'OpenFarm', error: String(error) });
  }
}

// Helper functions
function mapOpenFarmSun(sunlight: string): 'full_sun' | 'partial_sun' | 'partial_shade' | 'full_shade' {
  const s = sunlight?.toLowerCase() || '';
  if (s.includes('full')) return 'full_sun';
  if (s.includes('partial') && s.includes('sun')) return 'partial_sun';
  if (s.includes('partial') && s.includes('shade')) return 'partial_shade';
  if (s.includes('shade')) return 'full_shade';
  return 'partial_sun';
}

function mapOpenFarmWater(watering: string): number {
  const w = watering?.toLowerCase() || '';
  if (w.includes('frequent') || w.includes('daily')) return 1;
  if (w.includes('average') || w.includes('regular')) return 3;
  if (w.includes('minimum') || w.includes('low')) return 7;
  if (w.includes('rare') || w.includes('dry')) return 14;
  return 5;
}

function mapOpenFarmDifficulty(difficulty: string): 'easy' | 'medium' | 'hard' {
  const d = difficulty?.toLowerCase() || '';
  if (d.includes('easy') || d.includes('simple')) return 'easy';
  if (d.includes('hard') || d.includes('difficult')) return 'hard';
  return 'medium';
}

/**
 * Main sync function
 */
async function main() {
  console.log('🌱 Plant Scanner Data Sync');
  console.log('==========================\n');

  const startTime = Date.now();

  // Run sync tasks
  await Promise.all([
    syncGBIFData(),
    syncWikidataData(),
    syncINaturalistImages(),
    syncOpenFarmData()
  ]);

  // Print summary
  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log('\n📊 Sync Summary');
  console.log('================');
  console.log(`GBIF: ${stats.gbif_synced} records`);
  console.log(`Wikidata: ${stats.wikidata_synced} records`);
  console.log(`iNaturalist: ${stats.inaturalist_synced} images`);
  console.log(`OpenFarm: ${stats.openfarm_synced} care profiles`);
  console.log(`Duration: ${duration}s`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  ${stats.errors.length} errors:`);
    stats.errors.forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.source}] ${e.error}`);
    });
  }

  process.exit(stats.errors.length > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { syncGBIFData, syncWikidataData, syncINaturalistImages, syncOpenFarmData };
