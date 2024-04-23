#!/usr/bin/env node
import { generateNotes } from './generateNotes.js'
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
  .help()
  .alias('help', 'h')
  .alias('version', 'v').argv

const origin = argv.origin || 'destinyArmor'
const destination = argv.destination || 'destinyArmorNotes'

generateNotes(origin + '.csv', destination + '.csv')
