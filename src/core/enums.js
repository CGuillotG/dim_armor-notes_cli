const guardians = ['Titan', 'Warlock', 'Hunter']
const a2_fields = ['Mobility (Base)', 'Resilience (Base)', 'Recovery (Base)', 'Discipline (Base)', 'Intellect (Base)', 'Strength (Base)']
const fields = ['Weapons (Base)', 'Health (Base)', 'Class (Base)', 'Grenade (Base)', 'Super (Base)', 'Melee (Base)']
const totalField = 'Total (Base)'
const slots = ['Helmet', 'Gauntlets', 'Chest Armor', 'Leg Armor']
const classSlots = ['Titan Mark', 'Warlock Bond', 'Hunter Cloak']
const oldNotes = ['AFK', 'TEMP', 'EXOTIC', 'IB', 'Artifice', 'Trials', 'LastWish']

const fieldMap = {
  // Armor 2.0
  'Mob': 'Mobility (Base)',
  'Res': 'Resilience (Base)',
  'Rec': 'Recovery (Base)',
  'Dis': 'Discipline (Base)',
  'Int': 'Intellect (Base)',
  'Str': 'Strength (Base)',
  // Armor 3.0
  'Wep': 'Weapons (Base)',
  'Hel': 'Health (Base)',
  'Cls': 'Class (Base)',
  'Gre': 'Grenade (Base)',
  'Sup': 'Super (Base)',
  'Mel': 'Melee (Base)'
}

const a2_topFields = ['Mob', 'Res', 'Rec']
const a2_bottomFields = ['Dis', 'Int', 'Str']

const topFields = ['Wep', 'Hea', 'Cls']
const bottomFields = ['Gre', 'Sup', 'Mel']

// Import extra armor data from extraArmorData.js
let extraArmorData = []
try {
  const { extraArmorData: importedData } = await import('../../extraArmorData.js')
  extraArmorData = importedData
} catch (error) {
  console.log('No extraArmorData.js found or error importing, using empty array')
}

const extraArmor = extraArmorData.map(data => {
  // Throw error if sum of 6 fields is not equal to the last field
  if (data[3] + data[4] + data[5] + data[6] + data[7] + data[8] !== data[9]) {
    throw new Error(`Sum of 6 fields does not equal the last field: ${data[3]}+${data[4]}+${data[5]}+${data[6]}+${data[7]}+${data[8]} != ${data[9]}`)
  }

  // Detect tier and seasonal mod from name string
  const rarity = data[0].includes('EXOTIC') ? 'Exotic' : 'Legendary'
  const seasonal = data[0].includes('(Artifice)') ? 'artifice' : ''

  return {
    Name: data[0],
    Type: data[1],
    Equippable: data[2],
    'Mobility (Base)': data[3],
    'Resilience (Base)': data[4],
    'Recovery (Base)': data[5],
    'Discipline (Base)': data[6],
    'Intellect (Base)': data[7],
    'Strength (Base)': data[8],
    'Weapons (Base)': data[3],
    'Health (Base)': data[4],
    'Class (Base)': data[5],
    'Grenade (Base)': data[6],
    'Super (Base)': data[7],
    'Melee (Base)': data[8],
    'Total (Base)': data[9],
    Rarity: rarity,
    Tier: 0,
    'Seasonal Mod': seasonal,
    isManualInput: true,
    Id: '""',
    Notes: data.slice(3, 10).toString()
  }
})

export { 
  guardians, 
  a2_fields,
  fields, 
  totalField, 
  slots, 
  classSlots,
  oldNotes, 
  fieldMap,
  a2_topFields,
  a2_bottomFields,
  topFields, 
  bottomFields,
  extraArmor 
}
