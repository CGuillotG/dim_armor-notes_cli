#!/usr/bin/env node
const csvToJson = require('convert-csv-to-json')
const jsonexport = require('jsonexport');
const fs = require('fs')
const yargs = require('yargs')

const fields = ['Mobility(Base)', 'Resilience(Base)', 'Recovery(Base)', 'Discipline(Base)', 'Intellect(Base)', 'Strength(Base)']
const totalField = 'Total(Base)'
let maxStats = {
    'Titan': {
        'Helmet': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Gauntlets': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Chest Armor': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Leg Armor': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 }
    },
    'Warlock': {
        'Helmet': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Gauntlets': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Chest Armor': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Leg Armor': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 }
    },
    'Hunter': {
        'Helmet': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Gauntlets': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Chest Armor': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 },
        'Leg Armor': { 'Mobility(Base)': 0, 'Resilience(Base)': 0, 'Recovery(Base)': 0, 'Discipline(Base)': 0, 'Intellect(Base)': 0, 'Strength(Base)': 0, 'Total(Base)': 0 }
    }
}

const getArmor = (path) => {
    let armorJson = csvToJson.fieldDelimiter(',').getJsonFromCsv(path)
    return armorJson
}

const compareNums = (num1, action, num2) => {
    switch (action) {
        case 'gte':
            return num1 >= num2
        case 'gt':
            return num1 > num2
        case 'eq':
            return num1 == num2
        case 'lt':
            return num1 < num2
        case 'lte':
            return num1 <= num2
    }
}

const generateNewArmor = (path) => {
    const originalArmor = getArmor(path)
    const oldNotes = ['AFK', 'TEMP', 'NOSTALGIA', 'EXOTIC', 'RAID']
    const mainRules = [
        { tier: "GOD", grade: "SSS", rules: { high1: { op: 'gte', num: 30 }, high2: { op: 'gte', num: 25 } } },
        { tier: "GOD", grade: "SS", rules: { high1: { op: 'gte', num: 30 }, high2: { op: 'gte', num: 20 } } },
        { tier: "GOD", grade: "S", rules: { high1: { op: 'gte', num: 25 }, high2: { op: 'gte', num: 25 } } },
        { tier: "GOD", grade: "A+", rules: { high1: { op: 'gte', num: 25 }, high2: { op: 'gte', num: 20 } } },
        { tier: "GOD", grade: "A-", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 20 } } },
        { tier: "GOD", grade: "B+", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 18 } } },
        { tier: "GOD", grade: "B-", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 16 } } },
        { tier: "GOD", grade: "C+", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'gte', num: 15 } } },
        { tier: "GOD", grade: "C-", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'gte', num: 13 } } },
        { tier: "GOD", grade: "D", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'gte', num: 10 } } },
        { tier: "GOD", grade: "F", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'lt', num: 10 }, total: { op: 'gte', num: 60 } } },
        { tier: "GREAT", grade: "A", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'lt', num: 10 }, total: { op: 'lt', num: 60 } } },
        { tier: "GREAT", grade: "B", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'lt', num: 15 }, total: { op: 'gte', num: 60 } } },
        { tier: "GOOD", grade: "A", rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'lt', num: 15 }, total: { op: 'lt', num: 60 } } },
        { tier: "GOOD", grade: "B", rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'gte', num: 15 }, total: { op: 'gte', num: 60 } } },
        { tier: "MAYBE", grade: "A", rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'gte', num: 15 }, total: { op: 'lt', num: 60 } } },
        { tier: "MAYBE", grade: "B", rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'lt', num: 15 }, total: { op: 'gte', num: 60 } } },
    ]
    const shardRules = [
        { tier: "SHARD", rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'lt', num: 15 }, total: { op: 'lt', num: 60 } } },
        { tier: "SHARD", rules: { high1: { op: 'lt', num: 15 }, high2: { op: 'lt', num: 15 } } },
    ]

    //Generate New Notes Array
    return [...originalArmor.map(armor => {
        let textNotes = []
        let stats = []
        let highStats = { high1: 0, high2: 0, high3: 0, total: parseInt(armor[totalField]) }

        // Patched csv bug on Armor with two mod slots
        if (armor.SeasonalMod.charAt(0) === '"') {
            armor.Notes = armor.Perks0
        }

        //Stats Analysis
        fields.forEach(field => {
            if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak' && armor.Tier !== 'Exotic') {
                maxStats[armor.Equippable][armor.Type][field] = Math.max(maxStats[armor.Equippable][armor.Type][field], armor[field])
            }
            stats.push(parseInt(armor[field]))
        })
        if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak' && armor.Tier !== 'Exotic') {
            maxStats[armor.Equippable][armor.Type][totalField] = Math.max(maxStats[armor.Equippable][armor.Type][totalField], armor[totalField])
        }

        //Extract Higher Stats
        [highStats.high1, highStats.high2, highStats.high3] = stats.sort((a, b) => { return b - a })

        //Evaluate Tier Rules
        mainRules.some(r => { //Using .some instead of a forEach to exit early
            let boolArray = []
            for (key in r.rules) {
                passesRule = compareNums(highStats[key], r.rules[key].op, r.rules[key].num)
                boolArray.push(passesRule)
                if (!passesRule) { break }
            }
            if (boolArray.every(Boolean)) {
                textNotes.push(`${r.tier}${r.grade ? "_" + r.grade : ""}`)
                return true
            } else {
                return false
            }
        })

        //Old Notes
        oldNotes.forEach(note => {
            if (armor.Notes.includes(note)) {
                textNotes.push(note)
            }
        })

        //Evaluate Shard Rules
        if (!textNotes.length && armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
            shardRules.some(r => { //Using .some instead of a forEach to exit early
                let boolArray = []
                for (key in r.rules) {
                    passesRule = compareNums(highStats[key], r.rules[key].op, r.rules[key].num)
                    boolArray.push(passesRule)
                    if (!passesRule) { break }
                }
                if (boolArray.every(Boolean)) {
                    textNotes.push(r.tier)
                    return true
                } else {
                    return false
                }
            })
        }

        //Tag Item not falling on any category
        if (!textNotes.length && armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
            textNotes.push('MissingNo.')
        }

        armor['New Notes'] = textNotes.toString().replace(/,/g, '  ')
        armor.Id = armor.Id.replace(/"""/g, '"')

        return armor
    })]
}

const reduceNewNotes = (newArmor) => {
    return [...newArmor.map(armor => {
        return { Hash: armor.Hash, Id: armor.Id, Tag: armor.Tag, Notes: armor['New Notes'] }
    })]
}

const saveJsonToCsv = (json, destinationPath) => {
    jsonexport(json, function (err, csv) {
        if (err) return console.error(err);
        fs.writeFile(destinationPath, csv, function (err) { if (err) throw err; })
        console.log(`${destinationPath} saved successfully`);
    });
}

const hasMaxStat = (newArmor) => {
    newArmor.forEach(armor => {
        [...fields, totalField].forEach(field => {
            if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
                if (armor[field] >= maxStats[armor.Equippable][armor.Type][field]) {
                    armor['New Notes'] += '  MAX'
                    armor['New Notes'] = armor['New Notes'].replace('MAX  MAX', 'MAX')
                }
            }
        })
    })

    console.table(newArmor.filter(na => {
        return (na['Notes'] !== na['New Notes'])
    }), ['Name', 'Tier', 'Notes', 'New Notes'])

    return newArmor
}

const generateNotes = (originPath, destinationPath) => {

    let newArmor = generateNewArmor(originPath);

    newArmor = hasMaxStat(newArmor)

    let reducedNewArmor = reduceNewNotes(newArmor)

    saveJsonToCsv(reducedNewArmor, destinationPath)

}

//Yargs setup
let argv = yargs
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
    .alias('version', 'v')
    .argv

let origin = argv.origin || 'destinyArmor'
let destination = argv.destination || 'destinyArmorNotes'

generateNotes(origin + '.csv', destination + '.csv')