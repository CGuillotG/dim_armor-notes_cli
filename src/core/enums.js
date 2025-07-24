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
  const tier = data[0].includes('EXOTIC') ? 'Exotic' : 'Legendary'
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
    'Total (Base)': data[9],
    Tier: tier,
    'Seasonal Mod': seasonal,
    isManualInput: true,
    Id: '""',
    Notes: data.slice(3, 10).toString()
  }
})

export { guardians, fields, totalField, slots, oldNotes, fieldMap, topFields, bottomFields, extraArmor }
