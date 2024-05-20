import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from './utilities.js'
import { oldNotes, guardians, slots, fieldMap, extraArmor } from './enums.js'
import { twoStats, threeStats, fourStats, fiveStats, totalStat } from './percentileTables.js'

const statClassDists = [
  [['Mob', 'Dis'], ['Hunter']],
  [['Mob', 'Int'], ['Hunter']],
  [['Mob', 'Str'], ['Hunter']],
  [['Res', 'Dis'], ['Titan', 'Warlock', 'Hunter']],
  [['Res', 'Int'], ['Titan', 'Warlock', 'Hunter']],
  [['Res', 'Str'], ['Titan', 'Warlock', 'Hunter']],
  [['Rec', 'Dis'], ['Titan', 'Warlock']],
  [['Rec', 'Int'], ['Titan', 'Warlock']],
  [['Rec', 'Str'], ['Titan', 'Warlock']],
  [['Mob', 'Dis', 'Int'], ['Hunter']],
  [['Mob', 'Dis', 'Str'], ['Hunter']],
  [['Mob', 'Int', 'Str'], ['Hunter']],
  [['Res', 'Dis', 'Int'], ['Titan', 'Warlock', 'Hunter']],
  [['Res', 'Dis', 'Str'], ['Titan', 'Warlock', 'Hunter']],
  [['Res', 'Int', 'Str'], ['Titan', 'Warlock', 'Hunter']],
  [['Rec', 'Dis', 'Int'], ['Titan', 'Warlock']],
  [['Rec', 'Dis', 'Str'], ['Titan', 'Warlock']],
  [['Rec', 'Int', 'Str'], ['Titan', 'Warlock']],
  [['Mob', 'Res', 'Dis'], ['Titan', 'Hunter']],
  [['Mob', 'Rec', 'Dis'], []],
  [['Res', 'Rec', 'Dis'], ['Titan', 'Warlock']],
  [['Mob', 'Res', 'Int'], ['Hunter']],
  [['Mob', 'Rec', 'Int'], []],
  [['Res', 'Rec', 'Int'], ['Titan', 'Warlock']],
  [['Mob', 'Res', 'Str'], ['Hunter']],
  [['Mob', 'Rec', 'Str'], []],
  [['Res', 'Rec', 'Str'], ['Titan', 'Warlock']],
  [['Mob', 'Res', 'Dis', 'Int'], ['Hunter']],
  [['Mob', 'Res', 'Dis', 'Str'], ['Hunter']],
  [['Mob', 'Res', 'Int', 'Str'], ['Hunter']],
  [['Mob', 'Rec', 'Dis', 'Int'], []],
  [['Mob', 'Rec', 'Dis', 'Str'], []],
  [['Mob', 'Rec', 'Int', 'Str'], []],
  [['Res', 'Rec', 'Dis', 'Int'], ['Titan', 'Warlock']],
  [['Res', 'Rec', 'Dis', 'Str'], ['Titan', 'Warlock']],
  [['Res', 'Rec', 'Int', 'Str'], ['Titan', 'Warlock']],
  [['Mob', 'Dis', 'Int', 'Str'], ['Hunter']],
  [['Res', 'Dis', 'Int', 'Str'], ['Titan', 'Warlock', 'Hunter']],
  [['Rec', 'Dis', 'Int', 'Str'], ['Titan', 'Warlock']],
  [['Mob', 'Res', 'Rec', 'Dis'], []],
  [['Mob', 'Res', 'Rec', 'Int'], []],
  [['Mob', 'Res', 'Rec', 'Str'], []],
  [['Res', 'Rec', 'Dis', 'Int', 'Str'], ['Titan', 'Warlock']],
  [['Mob', 'Rec', 'Dis', 'Int', 'Str'], []],
  [['Mob', 'Res', 'Dis', 'Int', 'Str'], ['Hunter']],
  [['Mob', 'Res', 'Rec', 'Int', 'Str'], []],
  [['Mob', 'Res', 'Rec', 'Dis', 'Str'], []],
  [['Mob', 'Res', 'Rec', 'Dis', 'Int'], []],
]

const totalStatClasses = [['Total'], ['Titan']]

const maxDists = {} //Populate initial maxDistCombos
const maxTotal = {}
for (let guardian of guardians) {
  //maxDists[guardian][slot][distCombo]
  let distCombos = {}
  let totalCombo = {}
  statClassDists.forEach(distArray => {
    let [distList, distClasses] = distArray
    if (distClasses.includes(guardian)) { 
      distCombos[distList.join('')] = -Infinity
    }
  })
  if (totalStatClasses[1].includes(guardian)) {
    totalCombo[totalStatClasses[0]] = -Infinity
    maxTotal[guardian] = {}
  }
  maxDists[guardian] = {}
  for (let slot of slots) {
    maxDists[guardian][slot] = { ...distCombos }
    if (totalStatClasses[1].includes(guardian)) {
      maxTotal[guardian][slot] = { ...totalCombo }
    }
  }
}

export const generateNotes3 = async (originPath, destinationPath) => {
  console.log('Generating Notes for Version 3...')
  generateNewArmor3(originPath)
    .then(newArmor => {
      return hasMaxDist(newArmor)
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

const generateNewArmor3 = path => {
  return getArmor(path).then(originalArmor => {

    //Add extra armor to the list
    // extraArmor.forEach(armor => {
    //   originalArmor.push(armor)
    // })

    return [...originalArmor].map(armor => {
      armor.Id = armor.Id.replace(/"""/g, '"')

      // Fix for Festival of the Lost Masks
      // Masks only get exported in csv during FOTL (and likely only when in inventory and/or equipped)
      if (armor.Type === 'Festival Mask') {
        armor.Type = 'Helmet'
        armor.isFestivalMask = true //To exclude from Max checking
      }
      //Add Artifice modifier and +3 to 'Total (Base)'
      armor['Total (Base)'] = parseInt(armor['Total (Base)'])
      if (armor['Seasonal Mod'] === 'artifice') {
        armor.isArtifice = true
        armor['Total (Base)'] = armor['Total (Base)'] + 3
      }

      let textNotes = []

      if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
        let highestArmorDistPercentile = ['', -Infinity]
        armor.Dists = {}

        //Iterate on Dists
        statClassDists.forEach(distArray => {
          let [distList, distClasses] = distArray
          if (distClasses.includes(armor.Equippable)) {
            let armorPercentile = getDistPercentile(distList, armor)
            if (armorPercentile !== 0) {
              armor.Dists[distList.join('')] = armorPercentile
              if (armorPercentile > highestArmorDistPercentile[1]) {
                highestArmorDistPercentile = [distList.join(''), armorPercentile]
              }
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
        //Register highest Total values per class and slot
        if (totalStatClasses[1].includes(armor.Equippable) && armor.Tier !== 'Exotic' && !armor.isFestivalMask) {
          maxTotal[armor.Equippable][armor.Type]['Total'] = Math.max(maxTotal[armor.Equippable][armor.Type]['Total'], armor['Total (Base)'])
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
        textNotes.push('MissingNo.')
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
            armor.hasMax = true
          }
          armor['New Notes'].push(`${dist}_Max`)
        }
      }
    }
    if (!armor.hasMax && armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
      if (
        totalStatClasses[1].includes(armor.Equippable) &&
        armor['Total (Base)'] >= maxTotal[armor.Equippable][armor.Type]['Total']
      ) {
        armor['New Notes'].push('Total_Max')
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
  let maxSpikes = 0
  let isArtifice = armor['Seasonal Mod'] === 'artifice' ? true : false

  Object.entries(fieldMap).forEach(([name, longName]) => {
    let stat = parseInt(armor[longName])
    maxSpikes = stat >= 6 ? maxSpikes + 1 : maxSpikes
    armorStats[name] = stat
  })

  if (spikes > maxSpikes) {
    return 0
  }

  for (const field of distList) {
    if (field !== 'Total' && armorStats[field] < 6) {
      return 0
    }
  }

  let statSum = distList.reduce((sum, field) => sum + armorStats[field], 0)

  if (isArtifice) {
    statSum += 3
  }

  return matchPercentileTable(statSum / spikes, spikes)
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
    case 1:
      percentileTables = totalStat
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
