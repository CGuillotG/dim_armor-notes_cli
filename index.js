#!/usr/bin/env node

import { generateNotes_1_1 } from './src/generators/generateNotes_1_1.js'
import { generateNotes_1_2 } from './src/generators/generateNotes_1_2.js'
import { generateNotes_2_0 } from './src/generators/generateNotes_2_0.js'
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
    description: 'Use armor notes generation method from version 1, 2, or 3',
    type: 'number'
  })
  .help()
  .alias('help', 'h')
  .alias('version', 'v').argv

const origin = argv.origin || 'storage/destiny-armor'
const destination = argv.destination || 'storage/destiny-armor-notes'
const method = argv.method || 2.0

switch (method) {
  case 1.1:
    generateNotes_1_1(origin + '.csv', destination + '.csv')
    break
  case 1.2:
    generateNotes_1_2(origin + '.csv', destination + '.csv')
    break
  case 2:
  default:
    generateNotes_2_0(origin + '.csv', destination + '.csv')
    break
}