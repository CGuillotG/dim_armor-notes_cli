/**
 * generateNotes_2_4.js - Archetype-Based Analysis System with Class Filtering
 *
 * Rates Armor 3.0 by archetype + tertiary stat combinations (e.g., "GunnerCls")
 * Rates Armor 2.0 by cross-group 2-stat combinations, comparing against A3.0 pieces
 * Focuses on base total stats rather than percentiles for cleaner, more practical evaluation
 * 
 * Features class filtering arrays that allow customization of which stat combinations
 * each class should track, enabling inventory management while maintaining the most
 * relevant armor combinations for each guardian type.
 *
 * Quality: Excellent ⭐⭐⭐⭐⭐
 */

import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from '../core/utilities.js'
import { oldNotes, guardians, slots, classSlots, fieldMap, extraArmor } from '../core/enums.js'

// Archetype mapping - maps the two highest stats to archetype name
const archetypeMap = {
  'SupMel': 'Paragon',
  'GreSup': 'Grenadier',
  'ClsWep': 'Specialist',
  'MelHel': 'Brawler',
  'HelCls': 'Bulwark',
  'WepGre': 'Gunner'
}

// A3.0 archetype+tertiary combinations with class filters
// Format: [archetypeCombo, [allowedClasses]]
const a3_archetypeClassFilters = [
  // Paragon (Sup+Mel)
  ['ParagonWep', ['Warlock', 'Titan', 'Hunter']],
  ['ParagonHel', ['Titan']],
  ['ParagonCls', ['Warlock', 'Titan', 'Hunter']],
  ['ParagonGre', ['Warlock', 'Titan', 'Hunter']],
  
  // Grenadier (Gre+Sup)
  ['GrenadierWep', ['Warlock', 'Titan', 'Hunter']],
  ['GrenadierHel', ['Titan']],
  ['GrenadierCls', ['Warlock', 'Titan', 'Hunter']],
  ['GrenadierMel', ['Warlock', 'Titan', 'Hunter']],
  
  // Specialist (Cls+Wep)
  ['SpecialistHel', ['Titan']],
  ['SpecialistGre', ['Warlock', 'Titan', 'Hunter']],
  ['SpecialistSup', ['Warlock', 'Titan', 'Hunter']],
  ['SpecialistMel', ['Warlock', 'Titan', 'Hunter']],
  
  // Brawler (Mel+Hel)
  ['BrawlerWep', ['Titan']],
  ['BrawlerCls', ['Titan']],
  ['BrawlerGre', ['Titan']],
  ['BrawlerSup', ['Titan']],
  
  // Bulwark (Hel+Cls)
  ['BulwarkWep', ['Titan']],
  ['BulwarkGre', ['Titan']],
  ['BulwarkSup', ['Titan']],
  ['BulwarkMel', ['Titan']],
  
  // Gunner (Wep+Gre)
  ['GunnerHel', ['Titan']],
  ['GunnerCls', ['Warlock', 'Titan', 'Hunter']],
  ['GunnerSup', ['Warlock', 'Titan', 'Hunter']],
  ['GunnerMel', ['Warlock', 'Titan', 'Hunter']]
]

// A2.0 cross-group 2-stat combinations with class filters
// Format: [statCombo, [allowedClasses]]
const a2_statClassFilters = [
  // Weapon trios
  ['WepGre', ['Warlock', 'Titan', 'Hunter']],
  ['WepSup', ['Warlock', 'Titan', 'Hunter']],
  ['WepMel', ['Warlock', 'Titan', 'Hunter']],
  
  // Health trios
  ['HelGre', ['Warlock', 'Titan']],
  ['HelSup', ['Warlock', 'Titan']],
  ['HelMel', ['Warlock', 'Titan']],
  
  // Class trios
  ['ClsGre', ['Warlock', 'Titan', 'Hunter']],
  ['ClsSup', ['Warlock', 'Titan', 'Hunter']],
  ['ClsMel', ['Warlock', 'Titan', 'Hunter']],
  
  // Grenade trios
  ['GreWep', ['Warlock', 'Titan', 'Hunter']],
  ['GreHel', ['Warlock', 'Titan']],
  ['GreCls', ['Warlock', 'Titan', 'Hunter']],
  
  // Super trios
  ['SupWep', ['Warlock', 'Titan', 'Hunter']],
  ['SupHel', ['Warlock', 'Titan']],
  ['SupCls', ['Warlock', 'Titan', 'Hunter']],
  
  // Melee trios
  ['MelWep', ['Warlock', 'Titan', 'Hunter']],
  ['MelHel', ['Warlock', 'Titan']],
  ['MelCls', ['Warlock', 'Titan', 'Hunter']]
]

const allSlots = [...slots, ...classSlots]

const maxDists = {} // Structure: maxDists[guardian][slot][distCombo]

// Initialize max tracking for all guardians and slots with class filtering
for (let guardian of guardians) {
  maxDists[guardian] = {}
  for (let slot of allSlots) {
    maxDists[guardian][slot] = {}
    
    // Initialize A2.0 2-stat combos (only for allowed classes)
    a2_statClassFilters.forEach(([combo, allowedClasses]) => {
      if (allowedClasses.includes(guardian)) {
        maxDists[guardian][slot][combo] = -Infinity
      }
    })
    
    // Initialize A3.0 archetype+tertiary combos (only for allowed classes)
    a3_archetypeClassFilters.forEach(([combo, allowedClasses]) => {
      if (allowedClasses.includes(guardian)) {
        maxDists[guardian][slot][combo] = -Infinity
      }
    })
  }
}

export const generateNotes_2_4 = async (originPath, destinationPath) => {
  console.log('Generating Notes for Version 2.4...')
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
    // Add extra armor to the list
    extraArmor.forEach(armor => {
      originalArmor.push(armor)
    })

    return [...originalArmor].map(armor => {
      armor.Id = armor.Id.replace(/"""/g, '"')

      // Fix for Festival of the Lost Masks with Stats
      if (armor.Type === 'Festival Mask') {
        armor.Type = 'Helmet'
        armor.isFestivalMask = true
      }

      let textNotes = []

      // Skip analysis for ALL exotic class items, but analyze non-exotic class items
      const isClassItem = armor.Type === 'Titan Mark' || armor.Type === 'Warlock Bond' || armor.Type === 'Hunter Cloak'
      const isExoticClassItem = isClassItem && armor.Rarity === 'Exotic'

      if (!isExoticClassItem) {
        // Determine if this is A2.0 or A3.0
        // A3.0: Tier >= 1, A2.0: Tier = 0
        const tierValue = parseInt(armor.Tier) || 0
        const isArmor30 = tierValue > 0

        armor.Dists = {}
        let bestDistName = ''
        let bestDistValue = -Infinity

        if (isArmor30) {
          // Handle Armor 3.0 - archetype + tertiary analysis
          const archetypeTertiary = getArchetypeTertiary(armor)
          if (archetypeTertiary) {
            const { name, value } = archetypeTertiary
            
            // Only process if this combination is allowed for this class
            const isAllowedForClass = a3_archetypeClassFilters.some(([combo, allowedClasses]) => 
              combo === name && allowedClasses.includes(armor.Equippable)
            )
            
            if (isAllowedForClass) {
              armor.Dists[name] = value

              // Update max (exclude exotics and masks from updating max)
              if (armor.Rarity !== 'Exotic' && !armor.isFestivalMask) {
                maxDists[armor.Equippable][armor.Type][name] = Math.max(maxDists[armor.Equippable][armor.Type][name], value)

                // Also contribute to A2.0 max tracking for relevant 2-stat combos
                updateA20MaxFromA30(armor)
              }

              bestDistName = name
              bestDistValue = value
            }
          }
        } else {
          // Handle Armor 2.0 - 2-stat cross-group analysis
          const armorStats = getArmorStats(armor)

          a2_statClassFilters.forEach(([combo, allowedClasses]) => {
            // Only process if this combination is allowed for this class
            if (!allowedClasses.includes(armor.Equippable)) {
              return
            }

            const [stat1, stat2] = [combo.slice(0, 3), combo.slice(3, 6)]

            // Skip combinations where either stat is 0 or 2 (minimum/unusable values)
            if (armorStats[stat1] <= 2 || armorStats[stat2] <= 2) {
              return
            }

            // Only consider combinations where the order is correct (first stat >= second stat)
            if (armorStats[stat1] < armorStats[stat2]) {
              return
            }

            let value = armorStats[stat1] + armorStats[stat2] + 4 // +4 for masterwork

            // Add artifice bonus for A2.0 pieces
            if (armor['Seasonal Mod'] === 'artifice') {
              value += 3 // +3 for artifice
            }

            armor.Dists[combo] = value

            // Update A2.0 max values (exclude exotics and masks from updating max)
            if (armor.Rarity !== 'Exotic' && !armor.isFestivalMask) {
              maxDists[armor.Equippable][armor.Type][combo] = Math.max(maxDists[armor.Equippable][armor.Type][combo], value)
            }

            if (value > bestDistValue) {
              bestDistValue = value
              bestDistName = combo
            }
          })
        }

        armor.Highest = [bestDistName, bestDistValue]

        if (bestDistValue > 0) {
          textNotes.push(`.${bestDistName}.`)
        } else {
          // Only add 'Junk' if there are no old notes to preserve
          if (!oldNotes.some(oldNote => armor.Notes && armor.Notes.includes(oldNote))) {
            textNotes.push('Junk')
          }
        }
      }

      armor['New Notes'] = textNotes
      return armor
    })
  })
}

const hasMaxDist = newArmor => {
  newArmor.forEach(armor => {
    // Skip max checking for ALL exotic class items, but check non-exotic class items
    const isClassItem = armor.Type === 'Titan Mark' || armor.Type === 'Warlock Bond' || armor.Type === 'Hunter Cloak'
    const isExoticClassItem = isClassItem && armor.Rarity === 'Exotic'

    if (!isExoticClassItem) {
      let hasAnyMax = false
      for (let dist in armor.Dists) {
        if (armor.Dists[dist] >= maxDists[armor.Equippable][armor.Type][dist]) {
          // Check if this distribution is valid for this class
          const isA20Combo = a2_statClassFilters.some(([combo]) => combo === dist)
          const isA30Combo = a3_archetypeClassFilters.some(([combo]) => combo === dist)
          
          let shouldMarkAsMax = true
          
          if (isA20Combo) {
            // For A2.0 pieces, check if this is the correct order (first stat >= second stat)
            const [stat1, stat2] = [dist.slice(0, 3), dist.slice(3, 6)]
            const armorStats = getArmorStats(armor)
            shouldMarkAsMax = armorStats[stat1] >= armorStats[stat2]
          }

          if (shouldMarkAsMax) {
            if (armor['New Notes'].length === 1 && !hasAnyMax) {
              armor['New Notes'].push('-')
              hasAnyMax = true
            }
            armor['New Notes'].push(`${dist}_Max`)
          }
        }
      }
    } else {
      // For exotic class items, preserve existing notes exactly as-is
      if (armor.Notes && armor.Notes.trim() !== '') {
        armor['New Notes'] = armor.Notes.split(' ').filter(note => note.trim() !== '')
      } else {
        armor['New Notes'] = []
      }
    }

    // Add old notes exceptions back (only for non-exotic class items)
    if (!isExoticClassItem) {
      oldNotes.forEach(oldNote => {
        if (!armor['New Notes'].includes(oldNote)) {
          if (armor.Notes && armor.Notes.includes(oldNote)) {
            armor['New Notes'].push(oldNote)
          } else if (
            (oldNote === 'IB' && armor['Perks 0'] === "Iron Lord's Pride*") ||
            (oldNote === 'Artifice' && armor['Seasonal Mod'] === 'artifice' && armor.Rarity !== 'Exotic')
          ) {
            armor['New Notes'].push(oldNote)
          }
        }
      })
    }

    armor['New Notes'] = armor['New Notes'].toString().replace(/,/g, ' ')
  })

  return newArmor
}

const getArchetypeTertiary = armor => {
  const armorStats = getArmorStats(armor)

  // Get stats sorted by value (descending) - only include A3.0 stats with value > 0
  const a30Stats = ['Wep', 'Hel', 'Cls', 'Gre', 'Sup', 'Mel']
  const sortedStats = Object.entries(armorStats)
    .filter(([statName, statValue]) => a30Stats.includes(statName) && statValue > 0)
    .sort((a, b) => b[1] - a[1])

  if (sortedStats.length < 3) {
    return null
  }

  const [first, second, third] = sortedStats
  const archetypeKey = first[0] + second[0]
  const archetype = archetypeMap[archetypeKey]

  if (!archetype) {
    return null
  }

  const combinationName = archetype + third[0]
  const baseTotal = parseInt(armor['Total (Base)']) || 0
  // Add weighted spike bonuses for better distribution ranking
  const combinationValue = baseTotal + first[1] * 0.1 + second[1] * 0.01 + third[1] * 0.001

  return { name: combinationName, value: combinationValue }
}

const getArmorStats = armor => {
  const stats = {}
  Object.entries(fieldMap).forEach(([name, longName]) => {
    stats[name] = parseInt(armor[longName]) || 0
  })
  return stats
}

const updateA20MaxFromA30 = armor => {
  const armorStats = getArmorStats(armor)

  // Check allowed A2.0 2-stat combinations against this A3.0 piece
  a2_statClassFilters.forEach(([combo, allowedClasses]) => {
    // Only process if this combination is allowed for this class
    if (!allowedClasses.includes(armor.Equippable)) {
      return
    }

    const [stat1, stat2] = [combo.slice(0, 3), combo.slice(3, 6)]
    const comboValue = armorStats[stat1] + armorStats[stat2]

    // Only update max for the correct order (first stat >= second stat)
    if (armorStats[stat1] >= armorStats[stat2]) {
      // Update max if this A3.0 piece has a higher 2-stat combo than current max
      if (comboValue > maxDists[armor.Equippable][armor.Type][combo]) {
        maxDists[armor.Equippable][armor.Type][combo] = comboValue
      }
    }
  })
}

//DIM Queries
/*
  DIM FAV

  -tag:favorite -tag:archive -tag:junk -(is:classitem is:exotic) (
    (
      is:armor2.0 not:exotic basestat:highest+secondhighest:>=53
    ) or (
      is:armor3.0 not:exotic basestat:highest+secondhighest:>=55
    ) or (
      is:exotic basestat:highest+secondhighest:>=50
    )
  )

  DIM KEEP
  -tag:keep -tag:archive -tag:junk -(is:classitem is:exotic) (
    (
      is:armor2.0 not:exotic (basestat:highest+secondhighest:>=46 basestat:highest+secondhighest:<53)
    ) or (
      is:armor3.0 not:exotic (basestat:highest+secondhighest:>=48 basestat:highest+secondhighest:<55)
    ) or (
      is:exotic ((basestat:highest+secondhighest+thirdhighest:>=59 or notes:_max) basestat:highest+secondhighest:<50)
    )
  )
  
  DIM JUNK
  is:armor not:exotic -tag:archive -name:"masquerader" ((-notes:_max -notes:KeepSet) or notes:junk or (
    (
      is:armor2.0 basestat:highest+secondhighest:<46
    ) or (
      is:armor3.0 basestat:highest+secondhighest:<48
    )
  )) -((is:maxpower or power:powerfulcap) -power:powerfloor)

  DIM INFUSE
  is:armor not:exotic -tag:archive -name:"masquerader" ((-notes:_max -notes:KeepSet) or notes:junk or (
    (
      is:armor2.0 basestat:highest+secondhighest:<46
    ) or (
      is:armor3.0 basestat:highest+secondhighest:<48
    )
  )) (is:maxpower or power:powerfulcap) -power:powerfloor

  -----------------------------------------------------------

  DIM ARMOR RESET
  is:armor is:tagged -tag:archive -tag:junk -(is:classitem is:exotic)

  DIM EXOTIC LEFTOVERS
  is:armor tag:none -(is:classitem is:exotic) -notes:exotic
*/
