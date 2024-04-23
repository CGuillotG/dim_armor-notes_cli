#!/usr/bin/env node
import { generateNotes } from './generateNotes_v1.js'
import { generateNotes2 } from './generateNotes_v2.js'
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
    description: 'Use armor notes generation method from version 1 or 2',
    type: 'number'
  })
  .help()
  .alias('help', 'h')
  .alias('version', 'v').argv

const origin = argv.origin || 'destinyArmor'
const destination = argv.destination || 'destinyArmorNotes'
const method = argv.method || 1

console.log('Method ' + method)
if (method === 2) {
  generateNotes2(origin + '.csv', destination + '.csv')
// } else if (method === 3) {
//   generateNotes3(origin + '.csv', destination + '.csv')
} else {
  generateNotes(origin + '.csv', destination + '.csv')
}