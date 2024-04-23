import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from './utilities.js'
import { guardians, fields, totalField, slots, oldNotes } from './enums.js'


let maxStats = {}
for (let guardian of guardians) {
  maxStats[guardian] = {}
  for (let slot of slots) {
    maxStats[guardian][slot] = {}
    for (let field of fields.concat(totalField)) {
      maxStats[guardian][slot][field] = 0
    }
  }
}

export const generateNotes = async (originPath, destinationPath) => {
  generateNewArmor(originPath)
    .then(newArmor => {
      return hasMaxStat(newArmor)
    })
    .then(newArmorMax => {
      printDifferences(newArmorMax)
      return reduceNewNotes(newArmorMax)
    })
    .then(reducedNewArmor => {
      saveJsonToCsv(reducedNewArmor, destinationPath)
    })
    .catch(err => {
      console.error(err)
    })
}

const hasMaxStat = newArmor => {
  newArmor.forEach(armor => {
    ;[...fields, totalField].forEach(field => {
      if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak' /*&& armor.Type !== 'Mask'*/) {
        if (armor[field] >= maxStats[armor.Equippable][armor.Type][field]) {
          armor['New Notes'] += '  MAX'
          armor['New Notes'] = armor['New Notes'].replace('MAX  MAX', 'MAX')
        }
      }
    })
    armor['New Notes'] = armor['New Notes'].toString().replace(/,/g, '  ')
  })
  return newArmor
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

const generateNewArmor = path => {
  return getArmor(path).then(originalArmor => {
    const mainRules = [
      { tier: 'GOD', grade: 'SSS', rules: { high1: { op: 'gte', num: 30 }, high2: { op: 'gte', num: 25 } } },
      { tier: 'GOD', grade: 'SS', rules: { high1: { op: 'gte', num: 30 }, high2: { op: 'gte', num: 20 } } },
      { tier: 'GOD', grade: 'S', rules: { high1: { op: 'gte', num: 25 }, high2: { op: 'gte', num: 25 } } },
      { tier: 'GOD', grade: 'A+', rules: { high1: { op: 'gte', num: 25 }, high2: { op: 'gte', num: 20 } } },
      { tier: 'GOD', grade: 'A-', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 20 } } },
      { tier: 'GOD', grade: 'B+', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 18 } } },
      { tier: 'GOD', grade: 'B-', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 16 } } },
      { tier: 'GOD', grade: 'C+', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'gte', num: 15 } } },
      { tier: 'GOD', grade: 'C-', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'gte', num: 13 } } },
      { tier: 'GOD', grade: 'D', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'gte', num: 10 } } },
      { tier: 'GOD', grade: 'F', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'lt', num: 10 }, total: { op: 'gte', num: 60 } } },
      { tier: 'GREAT', grade: 'A', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'gte', num: 15 }, high3: { op: 'lt', num: 10 }, total: { op: 'lt', num: 60 } } },
      { tier: 'GREAT', grade: 'B', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'lt', num: 15 }, total: { op: 'gte', num: 60 } } },
      { tier: 'GOOD', grade: 'A', rules: { high1: { op: 'gte', num: 20 }, high2: { op: 'lt', num: 15 }, total: { op: 'lt', num: 60 } } },
      { tier: 'GOOD', grade: 'B', rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'gte', num: 15 }, total: { op: 'gte', num: 60 } } },
      { tier: 'MAYBE', grade: 'A', rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'gte', num: 15 }, total: { op: 'lt', num: 60 } } },
      { tier: 'MAYBE', grade: 'B', rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'lt', num: 15 }, total: { op: 'gte', num: 60 } } }
    ]
    const shardRules = [
      { tier: 'SHARD', rules: { high1: { op: 'gte', num: 15 }, high2: { op: 'lt', num: 15 }, total: { op: 'lt', num: 60 } } },
      { tier: 'SHARD', rules: { high1: { op: 'lt', num: 15 }, high2: { op: 'lt', num: 15 } } }
    ]

    //Generate New Notes Array
    return [
      ...originalArmor.map(armor => {
        let textNotes = []
        let stats = []
        let highStats = { high1: 0, high2: 0, high3: 0, total: parseInt(armor[totalField]) }

        //Fix for Festival of the Lost Masks (currently it is being excluded from the csv)
        if (armor.Type === 'Festival Mask') {
          armor.Type = 'Helmet'
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
        ;[highStats.high1, highStats.high2, highStats.high3] = stats.sort((a, b) => {
          return b - a
        })

        //Evaluate Tier Rules
        mainRules.some(r => {
          //Using .some instead of a forEach to exit early
          let boolArray = []
          for (let key in r.rules) {
            let passesRule = compareNums(highStats[key], r.rules[key].op, r.rules[key].num)
            boolArray.push(passesRule)
            if (!passesRule) {
              break
            }
          }
          if (boolArray.every(Boolean)) {
            textNotes.push(`${r.tier}${r.grade ? '_' + r.grade : ''}`)
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
          shardRules.some(r => {
            //Using .some instead of a forEach to exit early
            let boolArray = []
            for (let key in r.rules) {
              let passesRule = compareNums(highStats[key], r.rules[key].op, r.rules[key].num)
              boolArray.push(passesRule)
              if (!passesRule) {
                break
              }
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
      })
    ]
  })
}