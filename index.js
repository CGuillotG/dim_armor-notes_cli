#!/usr/bin/env node

import { generateNotes_1_1 } from './src/generators/generateNotes_1_1.js'
import { generateNotes_2_0 } from './src/generators/generateNotes_2_0.js'
import { generateNotes_2_2 } from './src/generators/generateNotes_2_2.js'
import { generateNotes_3_0 } from './src/generators/generateNotes_3_0.js'
import yargs from 'yargs'

//Yargs setup
const argv = yargs
  .option('origin', {
    alias: 'o',
    description: 'Origin file name for DIM Armor CSV export',
    type: 'string'
  })
  .option('destination', {
    alias: 'd',
    description: 'Destination file for DIM Armor CSV with new Notes',
    type: 'string'
  })
  .option('method', {
    alias: 'm',
    description: `Armor evaluation method:
    1.1 - Basic rule-based system (legacy)
    2.0 - Percentile analysis for Armor 2.0
    2.2 - Linear percentile analysis (2-3 spikes)
    3.0 - Archetype-based with class filtering (recommended, default)`,
    type: 'number'
  })
  .help()
  .alias('help', 'h')
  .alias('version', 'v').argv

const origin = argv.origin || 'storage/destiny-armor'
const destination = argv.destination || 'storage/destiny-armor-notes'
const method = argv.method || 3.0

switch (method) {
  case 1.1:
    generateNotes_1_1(origin + '.csv', destination + '.csv')
    break
  case 2:
    generateNotes_2_0(origin + '.csv', destination + '.csv')
    break
  case 2.2:
    generateNotes_2_2(origin + '.csv', destination + '.csv')
    break
  case 3.0:
    generateNotes_3_0(origin + '.csv', destination + '.csv')
    break
  default:
    console.error('Invalid method')
    break
}