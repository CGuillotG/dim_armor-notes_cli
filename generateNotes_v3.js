import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from './utilities.js'
import { oldNotes, guardians, slots, fieldMap, topFields, bottomFields } from './enums.js'
import { twoStats, threeStats, fourStats, fiveStats } from './percentileTables.js'

const statDists = [
  ['Mob', 'Dis'],
  ['Mob', 'Int'],
  ['Mob', 'Str'],
  ['Res', 'Dis'],
  ['Res', 'Int'],
  ['Res', 'Str'],
  ['Rec', 'Dis'],
  ['Rec', 'Int'],
  ['Rec', 'Str'],
  ['Mob', 'Dis', 'Int'],
  ['Mob', 'Dis', 'Str'],
  ['Mob', 'Int', 'Str'],
  ['Res', 'Dis', 'Int'],
  ['Res', 'Dis', 'Str'],
  ['Res', 'Int', 'Str'],
  ['Rec', 'Dis', 'Int'],
  ['Rec', 'Dis', 'Str'],
  ['Rec', 'Int', 'Str'],
  ['Mob', 'Res', 'Dis'],
  ['Mob', 'Rec', 'Dis'],
  ['Res', 'Rec', 'Dis'],
  ['Mob', 'Res', 'Int'],
  ['Mob', 'Rec', 'Int'],
  ['Res', 'Rec', 'Int'],
  ['Mob', 'Res', 'Str'],
  ['Mob', 'Rec', 'Str'],
  ['Res', 'Rec', 'Str'],
  ['Mob', 'Res', 'Dis', 'Int'],
  ['Mob', 'Res', 'Dis', 'Str'],
  ['Mob', 'Res', 'Int', 'Str'],
  ['Mob', 'Rec', 'Dis', 'Int'],
  ['Mob', 'Rec', 'Dis', 'Str'],
  ['Mob', 'Rec', 'Int', 'Str'],

  ['Res', 'Rec', 'Dis', 'Int'],

  ['Res', 'Rec', 'Dis', 'Str'],
  ['Res', 'Rec', 'Int', 'Str'],
  ['Mob', 'Dis', 'Int', 'Str'],
  ['Res', 'Dis', 'Int', 'Str'],
  ['Rec', 'Dis', 'Int', 'Str'],
  ['Res', 'Rec', 'Dis', 'Int', 'Str'],
  ['Mob', 'Rec', 'Dis', 'Int', 'Str'],
  ['Mob', 'Res', 'Dis', 'Int', 'Str'],
  ['Mob', 'Res', 'Rec', 'Int', 'Str'],
  ['Mob', 'Res', 'Rec', 'Dis', 'Str'],
  ['Mob', 'Res', 'Rec', 'Dis', 'Int']
]

const maxDists = {} //Populate initial maxDistCombos
for (let guardian of guardians) {
  //maxDists[guardian][slot][distCombo]
  let distCombos = {}
  statDists.forEach(distList => {
    distCombos[distList.join('')] = -Infinity
  })
  maxDists[guardian] = {}
  for (let slot of slots) {
    maxDists[guardian][slot] = { ...distCombos }
  }
}

export const generateNotes3 = async (originPath, destinationPath) => {
  console.log('Generating Notes for Version 3...')
  generateNewArmor3(originPath)
    .then(newArmor => {
      // console.log(newArmor)
      return hasMaxDist(newArmor)
    })
    .then(newArmorMax => {
      printDifferences(newArmorMax)
      console.log(maxDists['Titan']['Chest Armor'])
      return reduceNewNotes(newArmorMax)
    })
    .then(reducedNewArmor => {
      // console.log({ResRecDisInt: maxDists['Titan']['Chest Armor']['ResRecDisInt']})
      saveJsonToCsv(reducedNewArmor, destinationPath)
    })
    .catch(err => {
      console.error(err)
    })
}

const generateNewArmor3 = path => {
  return getArmor(path).then(originalArmor => {
    // return [...originalArmor.filter(oA => oA.Equippable === 'Titan' && oA.Type === 'Chest Armor' && oA.Tier === 'Legendary')].map(armor => {
    return [...originalArmor].map(armor => {
      armor.Id = armor.Id.replace(/"""/g, '"')

      // Fix for Festival of the Lost Masks
      // Masks only get exported in csv during FOTL (and likely only when in inventory and/or equipped)
      if (armor.Type === 'Festival Mask') {
        armor.Type = 'Helmet'
        armor.isFestivalMask = true //To exclude from Max checking
      }

      let textNotes = []

      if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
        let highestArmorDistPercentile = ['', -Infinity]
        armor.Dists = {}

        //Iterate on Dists
        statDists.forEach(distList => {
          let armorPercentile = getDistPercentile(distList, armor)
          if (armorPercentile !== 0) {
            armor.Dists[distList.join('')] = armorPercentile
            if (armorPercentile > highestArmorDistPercentile[1]) {
              highestArmorDistPercentile = [distList.join(''), armorPercentile]
            }
          }
        })
        armor.Highest = highestArmorDistPercentile

        //Register highest Dists values per class and slot
        for (let armorDist in armor.Dists) {
          //Exclude Exotics and Masks from influencingMax values
          if (armor.Tier !== 'Exotic' && !armor.isFestivalMask) {
            maxDists[armor.Equippable][armor.Type][armorDist] = Math.max(maxDists[armor.Equippable][armor.Type][armorDist], armor.Dists[armorDist])
          }
        }

        if (highestArmorDistPercentile[1] <= 0) {
          armor.Dists = {}
        } else if (highestArmorDistPercentile[1] === 1) {
          textNotes.push('1.0', `.${highestArmorDistPercentile[0]}.`)
        } else {
          textNotes.push(highestArmorDistPercentile[1], `.${highestArmorDistPercentile[0]}.`)
        }
      }

      //Tag Item not falling on any category
      if (!textNotes.length && armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
        // textNotes.push('MissingNo.')
      }

      armor['New Notes'] = textNotes

      return armor
    })
  })
}

const hasMaxDist = newArmor => {
  newArmor.forEach(armor => {
    for (let dist in armor.Dists) {
      if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
        if (armor.Dists[dist] >= maxDists[armor.Equippable][armor.Type][dist]) {
          if (armor['New Notes'].length === 2) {
            armor['New Notes'].push('-')
          }
          armor['New Notes'].push(`${dist}_Max`)
        }
      }
    }

    //Add old notes exceptions back to new notes
    oldNotes.forEach(oldNote => {
      if (armor.Notes.includes(oldNote)) {
        armor['New Notes'].push(oldNote)
      }
    })

    armor['New Notes'] = armor['New Notes'].toString().replace(/,/g, '  ')
  })
  return newArmor
}

const getDistPercentile = (distList, armor) => {
  let spikes = distList.length
  let armorStats = {}
  let sum = 0
  let percentile = 0
  let value, nthLargest, nextNthLargest

  Object.entries(fieldMap).forEach(([name, longName]) => {
    armorStats[name] = parseInt(armor[longName])
  })
  nthLargest = Object.values(armorStats).sort((a, b) => b - a)[spikes]

  distList.forEach(field => {
    if (armorStats[field] <= nthLargest) {
      return 0
    }
    // console.log(field, armorStats[field])
    sum = sum + armorStats[field]
  })
  value = sum / spikes

  // console.log(distList, nthLargest, armorStats, value)

  percentile = matchPercentileTable(value, spikes)

  // if (spikes !== 6) {
  //   nextNthLargest = Object.values(armorStats).sort((a, b) => b - a)[spikes + 1]
  //   if (nextNthLargest >= Math.floor(value / (1 + (1 / spikes)))) {
  //     return 0
  //   }
  // }

  return percentile
}

const matchPercentileTable = (value, spikes) => {
  let percentileTables = {}
  switch (spikes) {
    case 2:
      percentileTables = twoStats
      break
    case 3:
      percentileTables = threeStats
      break
    case 4:
      percentileTables = fourStats
      break
    case 5:
      percentileTables = fiveStats
      break
    default:
      console.error('Invalid spikes value')
      return 0
  }
  for (let i = 0; i < percentileTables.length; i++) {
    if (percentileTables[i].percentile === 1) {
      return 1
    }
    if (percentileTables[i].value === value || percentileTables[i + 1].value > value) {
      return percentileTables[i].percentile
    }
  }
}
