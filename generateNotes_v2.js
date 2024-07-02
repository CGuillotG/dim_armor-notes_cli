import { reduceNewNotes, printDifferences, saveJsonToCsv, getArmor } from "./utilities.js"
import { oldNotes, guardians, slots, fieldMap, topFields, bottomFields } from "./enums.js"

const tiers = ['SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F']
const intervals = [0, -3, -8, -13, -18, -23, -38]
const topStatDists = {
  MobRes: { 'Mob': 22, 'Res': 10, 'Rec': 2 },
  MobRec: { 'Mob': 22, 'Res': 2, 'Rec': 10 },
  Mobil: { 'Mob': 30, 'Res': 2, 'Rec': 2 },
  ResRec: { 'Mob': 2, 'Res': 22, 'Rec': 10 },
  ResMob: { 'Mob': 10, 'Res': 22, 'Rec': 2 },
  Resil: { 'Mob': 2, 'Res': 30, 'Rec': 2 },
  RecMob: { 'Mob': 10, 'Res': 2, 'Rec': 22 },
  RecRes: { 'Mob': 2, 'Res': 10, 'Rec': 22 },
  Recov: { 'Mob': 2, 'Res': 2, 'Rec': 30 }
}
const bottomStatDists = {
  DisInt: { 'Dis': 22, 'Int': 10, 'Str': 2 },
  DisStr: { 'Dis': 22, 'Int': 2, 'Str': 10 },
  Discip: { 'Dis': 30, 'Int': 2, 'Str': 2 },
  IntDis: { 'Dis': 10, 'Int': 22, 'Str': 2 },
  IntStr: { 'Dis': 2, 'Int': 22, 'Str': 10 },
  Intell: { 'Dis': 2, 'Int': 30, 'Str': 2 },
  StrDis: { 'Dis': 10, 'Int': 2, 'Str': 22 },
  StrInt: { 'Dis': 2, 'Int': 10, 'Str': 22 },
  Strng: { 'Dis': 2, 'Int': 2, 'Str': 30 }
}
const distRank = {
  'Titan': {
    top: {
      ResRec: 1,
      Resil: 2,
      RecRes: 4,
      Recov: 7
    },
    // topExtra: {
    //   Mobil: 12
    // },
    bottom: {
      Discip: 2,
      DisStr: 3,
      StrDis: 5,
      Strng: 6,
      IntDis: 7,
      IntStr: 9,
      Intell: 11
    }
  },
  'Warlock': {
    top: {
      ResRec: 1,
      Resil: 2,
      RecRes: 3,
      Recov: 4
    },
    bottom: {
      Discip: 2,
      DisStr: 3,
      StrDis: 5,
      Strng: 6,
      IntDis: 7,
      IntStr: 9,
      Intell: 10
    }
  },
  'Hunter': {
    top: {
      ResMob: 1,
      MobRes: 3,
      Resil: 4,
      Mobil: 5
    },
    bottom: {
      Discip: 2,
      DisStr: 3,
      StrDis: 4,
      Strng: 5,
      IntDis: 7,
      IntStr: 8,
      Intell: 9
    }
  }
}

const maxDistCombos = {} //maxDistCombos[guardian][slot][distCombo]
for (let guardian of guardians) { //Populate initial maxDistCombos
  maxDistCombos[guardian] = {}
  let distCombos = {}
  for (let topDist in distRank[guardian].top) {
    for (let bottomDist in distRank[guardian].bottom) {
      distCombos[`${topDist}${bottomDist}`] = -Infinity
    }
  }
  if ('topExtra' in distRank[guardian]) {
    for (let topExtraDist in distRank[guardian].topExtra) {
      distCombos[topExtraDist] = -Infinity
    }
  }
  if ('bottomExtra' in distRank[guardian]) {
    for (let bottomExtraDist in distRank[guardian].bottomExtra) {
      distCombos[bottomExtraDist] = -Infinity
    }
  }

  for (let slot of slots) {
    maxDistCombos[guardian][slot] = { ...distCombos }
  }
}

export const generateNotes2 = async (originPath, destinationPath) => {
  generateNewArmor2(originPath)
    .then(newArmor => {
      return hasMaxDist(newArmor)
    })
    .then(newArmorMax => {
      printDifferences(newArmorMax)
      // printMaxDistCombos('Titan')
      // printMaxDistCombos('Warlock')
      // printMaxDistCombos('Hunter')
      return reduceNewNotes(newArmorMax)
    })
    .then(reducedNewArmor => {
      saveJsonToCsv(reducedNewArmor, destinationPath)
    })
    .catch(err => {
      console.error(err)
    })
}

const getTier = number => {
  for (let i = 0; i < intervals.length; i++) {
    if (number >= intervals[i]) {
      return tiers[i]
    }
  }
  return tiers.at(-1)
}

const rankToFibo = rank => {
  if (rank <= 2) return rank
  return rankToFibo(rank - 1) + rankToFibo(rank - 2)
}

const hasMaxDist = newArmor => {
  newArmor.forEach(armor => {
    for (let comboDist in armor.ComboDists) {
      if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
        if (armor.ComboDists[comboDist] >= maxDistCombos[armor.Equippable][armor.Type][comboDist]) {
          armor['New Notes'].push(`${comboDist}_Max`)
        }
      }
    }
    oldNotes.forEach(note => {
      if (armor.Notes.includes(note)) {
        armor['New Notes'].push(note)
      }
    })
    armor['New Notes'] = armor['New Notes'].toString().replace(/,/g, ' ')
  })

  return newArmor
}

// const printMaxDistCombos = printGuardian => {
// const printableMaxDistCombos = {}
// for (let distCombo in maxDistCombos[printGuardian]['Helmet']) {
//   printableMaxDistCombos[distCombo] = {}
//   for (let slot of slots) {
//     printableMaxDistCombos[distCombo][slot] = maxDistCombos[printGuardian][slot][distCombo]
//   }
// }
// console.table(printableMaxDistCombos)
// }

const generateNewArmor2 = path => {
  return getArmor(path).then(originalArmor => {
    const getDistScore = (fields, distStats, armor) => {
      let distScore = 0
      fields.forEach(field => {
        if (distStats[field] === 2) {
          distScore += (armor[fieldMap[field]] - 2) / 2
        } else if (armor[fieldMap[field]] >= parseInt(distStats[field])) {
          distScore += armor[fieldMap[field]] - parseInt(distStats[field])
        } else {
          distScore += (armor[fieldMap[field]] - distStats[field]) * 2
        }
      })
      return distScore
    }

    return [
      ...originalArmor.map((armor, index) => {
        armor.Id = armor.Id.replace(/"""/g, '"')
        
        //Fix for Festival of the Lost Masks (mask only get exported as csv when in a character inventory and NOT in vault)
          //So far only tested during FOTL and on an active character. will test further on alt characters inventory and later when FOTL is not active.
        if (armor.Type === 'Festival Mask') {
          armor.isFestivalMask = true
          armor.Type = 'Helmet'
        }

        let textNotes = []

        if (armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
          armor.TopDists = {}
          armor.BottomDists = {}
          armor.ComboDists = {}
          let highestArmorTopDistScore = ['', -Infinity]
          let highestArmorBottomDistScore = ['', -Infinity]

          //Iterate on Top Dists
          for (let topDist in distRank[armor.Equippable].top) {
            let topDistStats = topStatDists[topDist]
            let armorTopScore = getDistScore(topFields, topDistStats, armor)
            armor.TopDists[topDist] = armorTopScore

            if (armorTopScore > highestArmorTopDistScore[1]) { highestArmorTopDistScore = [topDist, armorTopScore] }
          }

          //Iterate on Bottom Dists
          for (let bottomDist in distRank[armor.Equippable].bottom) {
            let bottomDistStats = bottomStatDists[bottomDist]
            let armorBottomScore = getDistScore(bottomFields, bottomDistStats, armor)
            armor.BottomDists[bottomDist] = armorBottomScore

            if (armorBottomScore > highestArmorBottomDistScore[1]) { highestArmorBottomDistScore = [bottomDist, armorBottomScore] }
          }

          //Register highest MaxDist Combo values per class and slot
          for (let armorTopDist in armor.TopDists) {
            for (let armorBottomDist in armor.BottomDists) {
              if (armor.Tier !== 'Exotic' && !armor.isFestivalMask) {
                //Exclude Exotics from Max values
                maxDistCombos[armor.Equippable][armor.Type][`${armorTopDist}${armorBottomDist}`] = Math.max(
                  maxDistCombos[armor.Equippable][armor.Type][`${armorTopDist}${armorBottomDist}`],
                  armor.TopDists[armorTopDist] + armor.BottomDists[armorBottomDist]
                )
              }
              armor.ComboDists[`${armorTopDist}${armorBottomDist}`] = armor.TopDists[armorTopDist] + armor.BottomDists[armorBottomDist]
            }
          }

          //Iterate on Top Extra
          if ('topExtra' in distRank[armor.Equippable]) {
            for (let topExtraDist in distRank[armor.Equippable].topExtra) {
              let topExtraDistStats = topStatDists[topExtraDist]
              let armorTopExtraScore = getDistScore(topFields, topExtraDistStats, armor)
              armor.TopDists[topExtraDist] = armorTopExtraScore

              if (armorTopExtraScore > highestArmorTopDistScore[1]) { highestArmorTopDistScore = [topExtraDist, armorTopExtraScore] }

              //Compare to MaxDist Combo values for Top Extra Dists
              if (armor.Tier !== 'Exotic' && armor) {
                //Exclude Exotics from Max values
                maxDistCombos[armor.Equippable][armor.Type][topExtraDist] = Math.max(maxDistCombos[armor.Equippable][armor.Type][topExtraDist], armor.TopDists[topExtraDist])
              }
              armor.ComboDists[topExtraDist] = armor.TopDists[topExtraDist]
            }
          }

          //Iterate on Bottom Extra
          if ('bottomExtra' in distRank[armor.Equippable]) {
            for (let bottomExtraDist in distRank[armor.Equippable].bottomExtra) {
              let bottomExtraDistStats = bottomStatDists[bottomExtraDist]
              let armorBottomExtraScore = getDistScore(bottomFields, bottomExtraDistStats, armor)
              armor.BottomDists[bottomExtraDist] = armorBottomExtraScore

              if (armorBottomExtraScore > highestArmorBottomDistScore[1]) { highestArmorBottomDistScore = [bottomExtraDist, armorBottomExtraScore] }

              //Compare to MaxDist Combo values for Bottom Extra Dists
              if (armor.Tier !== 'Exotic' && armor) {
                //Exclude Exotics from Max values
                maxDistCombos[armor.Equippable][armor.Type][bottomExtraDist] = Math.max(
                  maxDistCombos[armor.Equippable][armor.Type][bottomExtraDist],
                  armor.BottomDists[bottomExtraDist]
                )
              }
              armor.ComboDists[bottomExtraDist] = armor.BottomDists[bottomExtraDist]
            }
          }

          textNotes.push(`${highestArmorTopDistScore[0]}_${getTier(highestArmorTopDistScore[1])}`)
          textNotes.push(`${highestArmorBottomDistScore[0]}_${getTier(highestArmorBottomDistScore[1])}`)

          //Add High Fibo Rank to notes
          //Do Artifice somewhere here
          let maxTopDistRank = distRank[armor.Equippable].top[highestArmorTopDistScore[0]] || distRank[armor.Equippable].topExtra[highestArmorTopDistScore[0]]
          let maxBottomDistRank = distRank[armor.Equippable].bottom[highestArmorBottomDistScore[0]] || distRank[armor.Equippable].bottomExtra[highestArmorBottomDistScore[0]]
          let rank = highestArmorTopDistScore[1] * maxTopDistRank + highestArmorBottomDistScore[1] * maxBottomDistRank
          let fiboRank = Math.ceil(highestArmorTopDistScore[1] * rankToFibo(maxTopDistRank) + highestArmorBottomDistScore[1] * rankToFibo(maxBottomDistRank))
          armor.rank = rank
          armor.fiboRank = fiboRank
          let isFiboRankPositive = fiboRank > 0
          let stringFiboRank = isFiboRankPositive ? `${fiboRank}` : `${fiboRank * -1}`
          let fiboLength = stringFiboRank.length
          if (fiboLength < 4) {
            for (let i = fiboLength; i < 4; i++) {
              stringFiboRank = `${isFiboRankPositive ? '*' : '.'}${stringFiboRank}` //Adding characters as zeroes to the left for string sorting
            }
          }
          textNotes.unshift(stringFiboRank)
        }

        //Tag Item not falling on any category
        if (!textNotes.length && armor.Type !== 'Titan Mark' && armor.Type !== 'Warlock Bond' && armor.Type !== 'Hunter Cloak') {
          textNotes.push('MissingNo.')
        }

        armor['New Notes'] = textNotes

        return armor
      })
    ]
  })
}