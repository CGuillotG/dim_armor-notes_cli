#!/usr/bin/env node

import { generateNotes_1_1 } from './src/generators/generateNotes_1_1.js'
import { generateNotes_1_2 } from './src/generators/generateNotes_1_2.js'
import { generateNotes_2_0 } from './src/generators/generateNotes_2_0.js'
import { generateNotes_2_1 } from './src/generators/generateNotes_2_1.js'
import { generateNotes_2_2 } from './src/generators/generateNotes_2_2.js'
import { generateNotes_2_3 } from './src/generators/generateNotes_2_3.js'
import { generateNotes_2_4 } from './src/generators/generateNotes_2_4.js'
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
    1.2 - Distribution scoring (legacy) 
    2.0 - Percentile analysis (recommended, default)
    2.1 - Armor 2.0 Percentile analysis on 3.0 stats`,
    type: 'number'
  })
  .help()
  .alias('help', 'h')
  .alias('version', 'v').argv

const origin = argv.origin || 'storage/destiny-armor'
const destination = argv.destination || 'storage/destiny-armor-notes'
const method = argv.method || 2.4

switch (method) {
  case 1.1:
    generateNotes_1_1(origin + '.csv', destination + '.csv')
    break
  case 1.2:
    generateNotes_1_2(origin + '.csv', destination + '.csv')
    break
  case 2:
    generateNotes_2_0(origin + '.csv', destination + '.csv')
    break
  case 2.1:
    generateNotes_2_1(origin + '.csv', destination + '.csv')
    break
  case 2.2:
    generateNotes_2_2(origin + '.csv', destination + '.csv')
    break
  case 2.3:
    generateNotes_2_3(origin + '.csv', destination + '.csv')
    break
  case 2.4:
    generateNotes_2_4(origin + '.csv', destination + '.csv')
    break
  default:
    console.error('Invalid method')
    break
}