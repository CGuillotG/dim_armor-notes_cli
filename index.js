#!/usr/bin/env node
const csvToJson = require('convert-csv-to-json')
const jsonexport = require('jsonexport');
const fs = require('fs')
const yargs = require('yargs')

const getArmor = (path) => {
    let armorJson = csvToJson.fieldDelimiter(',').getJsonFromCsv(path)
    return armorJson
}

const generateNewArmor = (path) => {
    const originalArmor = getArmor(path)
    const [lowThreshold, highThreshold, totalThreshold] = [15, 20, 60]
    const oldNotes = ['AFK', 'TRANSMOG', 'NOSTALGIA', 'EXOTIC']
    const [namingLow, namingHigh, namingTotal] = ['+', '*', '^']
    const fields = ['Mobility(Base)', 'Resilience(Base)', 'Recovery(Base)', 'Discipline(Base)', 'Intellect(Base)', 'Strength(Base)']
    const totalField = 'Total(Base)'
    const rules = [{ high: 2 }, { high: 1, low: 1 }, { high: 1 }, { low: 2 }, { low: 1 }]
    const highCategories = ["GOD", "GREAT", "GOOD", "MAYBE"]
    const lowCategories = ["SHARD"]

    //Generate New Notes Array
    const newArmor = [...originalArmor.map(armor => {
        let statNotes = []
        let textNotes = []
        let highCount = 0
        let lowCount = 0
        let bigTotal = false

        //Stats Analysis
        fields.forEach(field => {
            if (parseInt(armor[field]) >= highThreshold) {
                statNotes.push(field.substr(0, 3) + namingHigh)
                highCount++
            } else if (parseInt(armor[field]) >= lowThreshold) {
                statNotes.push(field.substr(0, 3) + namingLow)
                lowCount++
            }
        })
        if (parseInt(armor[totalField]) >= totalThreshold) {
            statNotes.push(totalField.substr(0, 3) + namingTotal)
            bigTotal = true
        }

        //High categories
        highCategories.forEach((cat, i) => {
            if (!textNotes.length) {
                let pass = false
                let j = i + 1

                for (let key in rules[i]) {
                    if (key === 'high') {
                        if (highCount >= rules[i][key]) {
                            pass = true
                        } else {
                            pass = false
                            break;
                        }
                    } else if (key === 'low') {
                        if (lowCount >= rules[i][key]) {
                            pass = true
                        } else {
                            pass = false
                            break;
                        }
                    }
                }
                if (!pass && bigTotal) {
                    for (let key in rules[j]) {
                        if (key === 'high') {
                            if (highCount >= rules[j][key]) {
                                pass = true
                            } else {
                                pass = false
                                break;
                            }
                        } else if (key === 'low') {
                            if (lowCount >= rules[j][key]) {
                                pass = true
                            } else {
                                pass = false
                                break;
                            }
                        }
                    }
                }
                if (pass) {
                    textNotes.push(cat)
                }
            }
        })

        //Old Notes
        oldNotes.forEach(note => {
            if (armor.Notes.includes(note)) {
                textNotes.push(note)
            }
        })

        //Low categories
        lowCategories.forEach((cat, i) => {
            if (!textNotes.length) {
                let pass = false
                let j = i + highCategories.length

                for (let key in rules[j]) {
                    if (key === 'high') {
                        if (highCount >= rules[j][key]) {
                            pass = true
                        } else {
                            pass = false
                            break;
                        }
                    } else if (key === 'low') {
                        if (lowCount >= rules[j][key]) {
                            pass = true
                        } else {
                            pass = false
                            break;
                        }
                    }
                }
                // console.log(cat, pass)
                if (pass) {
                    textNotes.push(cat)
                }
            }
        })

        //Non-Class Remaining
        if (!textNotes.length && armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
            textNotes.push('SHARD')
        }

        let notes = [...textNotes, ...statNotes]

        armor['New Notes'] = notes.toString().replace(/,/g, '  ')
        armor.Id = armor.Id.replace(/"""/g, '"')
        armor['Diff'] = (armor['Notes'] !== armor['New Notes'])
        // armor['Vars'] = "*" + highCount + "  +" + lowCount + "  ^" + bigTotal

        return armor
    })]

    console.table(newArmor.filter(na => {
        return na.Diff
    }), ['Name', 'Tier', 'Notes', 'New Notes', 'Diff'])
    return newArmor
}

const reduceNewNotes = (newNotes) => {
    return [...newNotes.map(armor => {
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

const generateNotes = (originPath, destinationPath) => {

    let newArmor = generateNewArmor(originPath);

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