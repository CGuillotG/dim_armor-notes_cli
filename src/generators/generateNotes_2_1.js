/**
 * generateNotes_2_1.js - Percentile Analysis System (Armor 2.0 and 3.0 Hybrid)
 *
 * Uses the same statistical percentile method as 2_0, but applies it to the new Armor 3.0 stats.
 * While the approach remains robust, the statClassDists are no longer as well tuned for class usefulness in 3.0, since stat importance has shifted.
 * The method analyzes new Armor 3.0 items using the Armor 2.0 system, but 3.0 stats behave differently—many pieces are spiky (high in a few stats) but have low totals, so the filtering is less effective for 3.0.
 * However, this is still very useful for determining if a new Armor 3.0 piece makes an old 2.0 piece redundant.
 * Now includes non-exotic class items (Titan Mark, Warlock Bond, Hunter Cloak) which have stats in Armor 3.0.
 *
 * Quality: Very Good ⭐⭐⭐⭐
 */

import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from '../core/utilities.js'
import { oldNotes, guardians, slots, classSlots, fieldMap, extraArmor } from '../core/enums.js'
import { twoStats, threeStats, fourStats, fiveStats, totalStat } from '../core/percentileTables.js'

const a2_statClassDists = [
  [['Wep', 'Gre'], ['Hunter', 'Titan' ,'Warlock']],
  [['Wep', 'Sup'], ['Hunter', 'Titan' ,'Warlock']],
  [['Wep', 'Mel'], ['Hunter', 'Titan' ,'Warlock']],
  [['Hel', 'Gre'], ['Titan', 'Warlock', 'Hunter']],
  [['Hel', 'Sup'], ['Titan', 'Warlock', 'Hunter']],
  [['Hel', 'Mel'], ['Titan', 'Warlock', 'Hunter']],
  [['Cls', 'Gre'], ['Titan', 'Warlock']],
  [['Cls', 'Sup'], ['Titan', 'Warlock']],
  [['Cls', 'Mel'], ['Titan', 'Warlock']],
  [['Wep', 'Gre', 'Sup'], ['Titan', 'Warlock', 'Hunter']],
  [['Wep', 'Gre', 'Mel'], ['Titan', 'Warlock', 'Hunter']],
  [['Wep', 'Sup', 'Mel'], ['Titan', 'Warlock', 'Hunter']],
  [['Hel', 'Gre', 'Sup'], ['Titan', 'Warlock', 'Hunter']],
  [['Hel', 'Gre', 'Mel'], ['Titan', 'Warlock', 'Hunter']],
  [['Hel', 'Sup', 'Mel'], ['Titan', 'Warlock', 'Hunter']],
  [['Cls', 'Gre', 'Sup'], ['Titan', 'Warlock']],
  [['Cls', 'Gre', 'Mel'], ['Titan', 'Warlock']],
  [['Cls', 'Sup', 'Mel'], ['Titan', 'Warlock']],
  [['Wep', 'Hel', 'Gre'], ['Titan', 'Warlock', 'Hunter']],
  [['Wep', 'Cls', 'Gre'], ['Titan', 'Warlock']],
  [['Hel', 'Cls', 'Gre'], ['Titan', 'Warlock']],
  [['Wep', 'Hel', 'Sup'], ['Titan', 'Warlock', 'Hunter']],
  [['Wep', 'Cls', 'Sup'], ['Titan', 'Warlock']],
  [['Hel', 'Cls', 'Sup'], ['Titan', 'Warlock']],
  [['Wep', 'Hel', 'Mel'], ['Titan', 'Warlock', 'Hunter']],
  [['Wep', 'Cls', 'Mel'], ['Titan', 'Warlock']],
  [['Hel', 'Cls', 'Mel'], ['Titan', 'Warlock']]
]

const a3_statClassDists = [
  [['Wep', 'Hel'], ['Warlock', 'Titan']],
  [['Wep', 'Cls'], ['Warlock', 'Titan']],
  [['Wep', 'Sup'], ['Warlock', 'Titan']],
  [['Wep', 'Mel'], ['Warlock', 'Titan']],
  [['Hel', 'Cls'], ['Warlock', 'Titan']],
  [['Hel', 'Sup'], ['Warlock', 'Titan']],
  [['Hel', 'Mel'], ['Warlock', 'Titan']],
  [['Cls', 'Sup'], ['Warlock', 'Titan']],
  [['Cls', 'Mel'], ['Warlock', 'Titan']],
  [['Gre', 'Sup'], ['Warlock', 'Titan']],
  [['Gre', 'Mel'], ['Warlock', 'Titan']],
  [['Sup', 'Mel'], ['Warlock', 'Titan']],
  [['Wep', 'Hel', 'Cls'], ['Warlock', 'Titan']],
  [['Wep', 'Hel', 'Gre'], ['Warlock', 'Titan']],
  [['Wep', 'Hel', 'Sup'], ['Warlock', 'Titan']],
  [['Wep', 'Hel', 'Mel'], ['Warlock', 'Titan']],
  [['Wep', 'Cls', 'Gre'], ['Warlock', 'Titan']],
  [['Wep', 'Cls', 'Sup'], ['Warlock', 'Titan']],
  [['Wep', 'Cls', 'Mel'], ['Warlock', 'Titan']],
  [['Hel', 'Cls', 'Sup'], ['Warlock', 'Titan']],
  [['Hel', 'Cls', 'Mel'], ['Warlock', 'Titan']],
  [['Gre', 'Sup', 'Mel'], ['Warlock', 'Titan']]
]

const statClassDists = [...a2_statClassDists, ...a3_statClassDists]

const totalStatClasses = [['Total'], ['Titan', 'Warlock']]

const allSlots = [...slots, ...classSlots]

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
  for (let slot of allSlots) {
    maxDists[guardian][slot] = { ...distCombos }
    if (totalStatClasses[1].includes(guardian)) {
      maxTotal[guardian][slot] = { ...totalCombo }
    }
  }
}

export const generateNotes_2_1 = async (originPath, destinationPath) => {
  console.log('Generating Notes for Version 2.1...')
  generateNewArmor(originPath)
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

const generateNewArmor = path => {
  return getArmor(path).then(originalArmor => {

    //Add extra armor to the list
    extraArmor.forEach(armor => {
      originalArmor.push(armor)
    })

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
        armor['Total (Base)'] = armor['Total (Base)'] + 3
      }

      let textNotes = []

      // Skip analysis for exotic class items
      if (!(armor.Type === 'Titan Mark' || armor.Type === 'Warlock Bond' || armor.Type === 'Hunter Cloak') || armor.Rarity !== 'Exotic') {
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
          if (armor.Rarity !== 'Exotic' && !armor.isFestivalMask) {
            maxDists[armor.Equippable][armor.Type][armorDist] = Math.max(maxDists[armor.Equippable][armor.Type][armorDist], armor.Dists[armorDist])
          }
        }
        //Register highest Total values per class and slot
        if (totalStatClasses[1].includes(armor.Equippable) && armor.Rarity !== 'Exotic' && !armor.isFestivalMask) {
          maxTotal[armor.Equippable][armor.Type]['Total'] = Math.max(maxTotal[armor.Equippable][armor.Type]['Total'], armor['Total (Base)'])
        }

        if (highestArmorDistPercentile[1] <= 0) {
          armor.Dists = {}
        } else {
          textNotes.push(highestArmorDistPercentile[1].toFixed(7), `.${highestArmorDistPercentile[0]}.`)
        }
      }

      //Tag Item not falling on any category
      if (!textNotes.length && !((armor.Type === 'Titan Mark' || armor.Type === 'Warlock Bond' || armor.Type === 'Hunter Cloak') && armor.Rarity === 'Exotic')) {
        // textNotes.push('JUNK')
      }

      armor['New Notes'] = textNotes

      return armor
    })
  })
}

const hasMaxDist = newArmor => {
  newArmor.forEach(armor => {
    // Skip max dist checking for exotic class items
    if (!(armor.Type === 'Titan Mark' || armor.Type === 'Warlock Bond' || armor.Type === 'Hunter Cloak') || armor.Rarity !== 'Exotic') {
      for (let dist in armor.Dists) {
        if (armor.Dists[dist] >= maxDists[armor.Equippable][armor.Type][dist]) {
          if (armor['New Notes'].length === 2) {
            armor['New Notes'].push('-')
            armor.hasMax = true
          }
          armor['New Notes'].push(`${dist}_Max`)
        }
      }
      if (!armor.hasMax) {
        if (
          totalStatClasses[1].includes(armor.Equippable) &&
          armor['Total (Base)'] >= maxTotal[armor.Equippable][armor.Type]['Total']
        ) {
          armor['New Notes'].push('Total_Max')
        }
      }
    } else {
      // For exotic class items, preserve all existing notes
      if (armor.Notes && armor.Notes.trim() !== '') {
        armor['New Notes'] = armor.Notes.split(' ').filter(note => note.trim() !== '')
      }
    }

    //Add old notes exceptions back to new notes (for non-exotic class items)
    if (!((armor.Type === 'Titan Mark' || armor.Type === 'Warlock Bond' || armor.Type === 'Hunter Cloak') && armor.Rarity === 'Exotic')) {
      oldNotes.forEach(oldNote => {
        if (armor.Notes.includes(oldNote)) {
          armor['New Notes'].push(oldNote)
        } else if (
          (oldNote === "IB" && armor['Perks 0'] === "Iron Lord's Pride*") ||
          (oldNote === "Artifice" && armor['Seasonal Mod'] === "artifice" && armor.Rarity !== 'Exotic')
        ) {
          armor['New Notes'].push(oldNote)
        }
      })
    }

    armor['New Notes'] = armor['New Notes'].toString().replace(/,/g, ' ')
  })
  return newArmor
}

const getDistPercentile = (distList, armor) => {
  let spikes = distList.length
  let armorStats = {}
  let maxSpikes = 0

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

  if (armor['Seasonal Mod'] === 'artifice') {
    statSum += 3
  }
  if (armor['Perks 0'] === "Iron Lord's Pride*") {
    statSum += 1.5
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
