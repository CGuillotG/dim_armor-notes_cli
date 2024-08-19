const guardians = ['Titan', 'Warlock', 'Hunter']
const fields = ['Mobility (Base)', 'Resilience (Base)', 'Recovery (Base)', 'Discipline (Base)', 'Intellect (Base)', 'Strength (Base)']
const totalField = 'Total (Base)'
const slots = ['Helmet', 'Gauntlets', 'Chest Armor', 'Leg Armor']
const oldNotes = ['AFK', 'TEMP', 'EXOTIC', 'IB', 'Artifice', 'Trials', 'LastWish']

const fieldMap = {
  'Mob': 'Mobility (Base)',
  'Res': 'Resilience (Base)',
  'Rec': 'Recovery (Base)',
  'Dis': 'Discipline (Base)',
  'Int': 'Intellect (Base)',
  'Str': 'Strength (Base)'
}
const topFields = ['Mob', 'Res', 'Rec']
const bottomFields = ['Dis', 'Int', 'Str']

// Extra Armor formatted like this:
// [NAME, SLOT, CLASS, mob, res, rec, dis, int, str, total]
const extraArmorData = [
  // ["XUR'S T CHEST", 'Chest Armor', 'Titan', 25, 2, 6, 15, 16, 2, 66],
  // ["XUR'S T HELMET", 'Helmet', 'Titan', 16, 16, 2, 10, 6, 16, 66],
  // ["XUR'S T LEGS", 'Leg Armor', 'Titan', 2, 15, 16, 23, 2, 6, 64],
  // ["XUR'S H CHEST", 'Chest Armor', 'Hunter', 10, 21, 2, 2, 7, 24, 66],
  // ["XUR'S W GAUNTLETS", 'Gauntlets', 'Warlock', 6, 10, 16, 20, 11, 2, 65],
  // ["XUR'S H GAUNTLETS", 'Gauntlets', 'Hunter', 2, 25, 6, 11, 20, 2, 66],

  // ["Masquerader's Helm", 'Festival Mask', 'Titan', 2, 18, 13, 21, 2, 6, 62],
  // ["Masquerader's Helm", 'Festival Mask', 'Titan', 2, 22, 10, 13, 2, 17, 66],
  // ["Masquerader's Hood", 'Festival Mask', 'Warlock', 16, 8, 8, 20, 2, 10, 64],
  // ["Masquerader's Cowl", 'Festival Mask', 'Hunter', 2, 12, 16, 16, 8, 7, 61]
]

const extraArmor = extraArmorData.map(data => {
  // Throw error if sum of 6 fields is not equal to the last field
  if (data[3] + data[4] + data[5] + data[6] + data[7] + data[8] !== data[9]) {
    throw new Error('Sum of 6 fields does not equal the last field')
  }

  return { Name: data[0], Type: data[1], Equippable: data[2], 'Mobility (Base)': data[3], 'Resilience (Base)': data[4], 'Recovery (Base)': data[5], 'Discipline (Base)': data[6], 'Intellect (Base)': data[7], 'Strength (Base)': data[8], 'Total (Base)': data[9], Tier: 'Legendary', 'Seasonal Mod': '', isManualInput: true, Id: '""', Notes: data.slice(-7).toString() }
})

export { guardians, fields, totalField, slots, oldNotes, fieldMap, topFields, bottomFields, extraArmor }