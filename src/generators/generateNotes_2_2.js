/**
 * generateNotes_2_2.js - Linear Percentile Analysis System
 *
 * Simplified percentile analysis approach for a more deterministic Armor 3.0 model. Handles armor with 2 or 3 spikes, which covers all of Armor 3.0 and only Armor 2.0 worth keeping.
 *
 * Provides precise percentile rankings for all classes including class items.
 * This is the recommended method and current default.
 *
 */

import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from '../core/utilities.js'
import { oldNotes, guardians, slots, classSlots, fieldMap, extraArmor } from '../core/enums.js'
import { twoStatsA3, threeStatsA3 } from '../core/percentileTables.js'

const a2_statClassDists = [
  [['Wep', 'Gre'], ['Warlock', 'Titan', 'Hunter']], // Gunner
  [['Wep', 'Sup'], ['Warlock', 'Titan', 'Hunter']],
  [['Wep', 'Mel'], ['Warlock', 'Titan', 'Hunter']],
  [['Hel', 'Gre'], ['Warlock', 'Titan', 'Hunter']],
  [['Hel', 'Sup'], ['Warlock', 'Titan', 'Hunter']],
  [['Hel', 'Mel'], ['Warlock', 'Titan', 'Hunter']], // Brawler
  [['Cls', 'Gre'], ['Warlock', 'Titan', 'Hunter']],
  [['Cls', 'Sup'], ['Warlock', 'Titan', 'Hunter']],
  [['Cls', 'Mel'], ['Warlock', 'Titan', 'Hunter']],
  // [['Wep', 'Gre', 'Sup'], ['Titan', 'Hunter']],
  // [['Wep', 'Gre', 'Mel'], ['Titan', 'Hunter']],
  // [['Wep', 'Sup', 'Mel'], ['Titan', 'Hunter']],
  // [['Hel', 'Gre', 'Sup'], ['Titan', 'Hunter']],
  // [['Hel', 'Gre', 'Mel'], ['Titan', 'Hunter']],
  // [['Hel', 'Sup', 'Mel'], ['Titan', 'Hunter']],
  // [['Cls', 'Gre', 'Sup'], ['Titan', 'Hunter']],
  // [['Cls', 'Gre', 'Mel'], ['Titan', 'Hunter']],
  // [['Cls', 'Sup', 'Mel'], ['Titan', 'Hunter']],
  // [['Wep', 'Hel', 'Gre'], ['Titan', 'Hunter']],
  // [['Wep', 'Cls', 'Gre'], ['Titan', 'Hunter']],
  // [['Hel', 'Cls', 'Gre'], ['Titan', 'Hunter']],
  // [['Wep', 'Hel', 'Sup'], ['Titan', 'Hunter']],
  // [['Wep', 'Cls', 'Sup'], ['Titan', 'Hunter']],
  // [['Hel', 'Cls', 'Sup'], ['Titan', 'Hunter']],
  // [['Wep', 'Hel', 'Mel'], ['Titan', 'Hunter']],
  // [['Wep', 'Cls', 'Mel'], ['Titan', 'Hunter']],
  // [['Hel', 'Cls', 'Mel'], ['Titan', 'Hunter']]
]

const a3_statClassDists = [
  [['Wep', 'Hel'], ['Warlock', 'Titan', 'Hunter']],
  [['Wep', 'Cls'], ['Warlock', 'Titan', 'Hunter']], // Specialist
  [['Hel', 'Cls'], ['Warlock', 'Titan', 'Hunter']], // Bulwark
  [['Gre', 'Sup'], ['Warlock', 'Titan', 'Hunter']], // Grenadier
  [['Gre', 'Mel'], ['Warlock', 'Titan', 'Hunter']],
  [['Sup', 'Mel'], ['Warlock', 'Titan', 'Hunter']], // Paragon
  // [['Wep', 'Hel', 'Cls'], ['Titan', 'Hunter']],
  // [['Wep', 'Hel', 'Gre'], ['Titan', 'Hunter']],
  // [['Wep', 'Hel', 'Sup'], ['Titan', 'Hunter']],
  // [['Wep', 'Hel', 'Mel'], ['Titan', 'Hunter']],
  // [['Wep', 'Cls', 'Gre'], ['Titan', 'Hunter']],
  // [['Wep', 'Cls', 'Sup'], ['Titan', 'Hunter']],
  // [['Wep', 'Cls', 'Mel'], ['Titan', 'Hunter']],
  // [['Hel', 'Cls', 'Sup'], ['Titan', 'Hunter']],
  // [['Hel', 'Cls', 'Mel'], ['Titan', 'Hunter']],
  // [['Gre', 'Sup', 'Mel'], ['Titan', 'Hunter']]
]

const statClassDists = [...a2_statClassDists, ...a3_statClassDists]

const totalStatClasses = [['Total'], ['Warlock', 'Titan', 'Hunter']]

const allSlots = [...slots, ...classSlots]

const maxDists = {} //Populate initial maxDistCombos
const maxTotal = {}
for (let guardian of guardians) {
  //maxDists Structure: maxDists[guardian][slot][distCombo]
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

export const generateNotes_2_2 = async (originPath, destinationPath) => {
  console.log('Generating Notes using Method 2.2...')
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
          textNotes.push('0.0000')
        } else {
          textNotes.push(highestArmorDistPercentile[1].toFixed(4), `.${highestArmorDistPercentile[0]}.`)
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
    maxSpikes = stat >= 8 ? maxSpikes + 1 : maxSpikes
    armorStats[name] = stat
  })

  if (spikes > maxSpikes) {
    return 0
  }

  for (const field of distList) {
    if (field !== 'Total' && armorStats[field] < 8) {
      return 0
    }
  }

  let statSum = distList.reduce((sum, field) => sum + armorStats[field], 0)

  if (armor['Seasonal Mod'] === 'artifice') {
    statSum += 3
  }

  // Add Armor 2.0 masterwork bonuses
  if (armor.Tier === '0') {
    if (spikes === 2) {
      statSum += 4
    } else if (spikes === 3) {
      statSum += 6
    }
  }

  return matchPercentileTable(statSum, spikes)
}

const matchPercentileTable = (value, spikes) => {
  let percentileTables = {}
  switch (spikes) {
    case 2:
      percentileTables = twoStatsA3
      break
    case 3:
      percentileTables = threeStatsA3
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

//DIM Queries
/*
  DIM FAV
  -tag:favorite -tag:archive -tag:junk -(is:classitem is:exotic) (
    (
      is:warlock (notes:0.85 or notes:0.86 or notes:0.87 or notes:0.88 or notes:0.89 or notes:0.9 or notes:1.0)
    ) or (
      (is:titan or is:hunter) (notes:0.8 or notes:0.9 or notes:1.0)
    )
  )

  DIM KEEP
  -tag:keep -tag:archive -tag:junk -(is:classitem is:exotic) (
    (
      is:warlock (notes:0.78 or notes:0.79 or notes:0.80 or notes:0.81 or notes:0.82 or notes:0.83 or notes:0.84)
    ) or (
      (is:titan or is:hunter) (notes:0.75 or notes:0.76 or notes:0.77 or notes:0.78 or notes:0.79)
    )
  )
  
  DIM JUNK
  is:armor -is:exotic -tag:archive -name:"masquerader" (-notes:_max or (
    (
      is:warlock (-notes:0.78 -notes:0.79 -notes:0.8 -notes:0.9 -notes:1.0)
    ) or (
      (is:titan or is:hunter) (-notes:0.75 -notes:0.76 -notes:0.77 -notes:0.78 -notes:0.79 -notes:0.8 -notes:0.9 -notes:1.0)
    )
  ) ) -is:maxpower

  DIM INFUSE
  is:armor -is:exotic -tag:archive -name:"masquerader" (-notes:_max or (
    (
      is:warlock (-notes:0.78 -notes:0.79 -notes:0.8 -notes:0.9 -notes:1.0)
    ) or (
      (is:titan or is:hunter) (-notes:0.75 -notes:0.76 -notes:0.77 -notes:0.78 -notes:0.79 -notes:0.8 -notes:0.9 -notes:1.0)
    )
  ) ) is:maxpower

  -----------------------------------------------------------

  DIM ARMOR RESET
  is:armor is:tagged -tag:archive -tag:junk -(is:classitem is:exotic)

  DIM EXOTIC LEFTOVERS
  is:armor tag:none -(is:classitem is:exotic) -notes:exotic
*/