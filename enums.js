const guardians = ['Titan', 'Warlock', 'Hunter']
const fields = ['Mobility (Base)', 'Resilience (Base)', 'Recovery (Base)', 'Discipline (Base)', 'Intellect (Base)', 'Strength (Base)']
const totalField = 'Total (Base)'
const slots = ['Helmet', 'Gauntlets', 'Chest Armor', 'Leg Armor']
const oldNotes = ['AFK', 'TEMP', 'EXOTIC', 'MASTERWORK', 'ARTIFICE', 'IB', 'DELETE']

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

const extraArmor = [
  {
    Name: "Masquerader's Helm", Tier: 'Legendary', Type: 'Festival Mask', Equippable: 'Titan', 'Seasonal Mod': '', isManualInput: true, Id: '""',
    'Mobility (Base)': '2',
    'Resilience (Base)': '18',
    'Recovery (Base)': '13',
    'Discipline (Base)': '21',
    'Intellect (Base)': '2',
    'Strength (Base)': '6',
    'Total (Base)': '62',
    Notes: '2,18,13,21,2,6,62'
  },
  {
    Name: "Masquerader's Helm", Tier: 'Legendary', Type: 'Festival Mask', Equippable: 'Titan', 'Seasonal Mod': '', isManualInput: true, Id: '""',
    'Mobility (Base)': '2',
    'Resilience (Base)': '22',
    'Recovery (Base)': '10',
    'Discipline (Base)': '13',
    'Intellect (Base)': '2',
    'Strength (Base)': '17',
    'Total (Base)': '66',
    Notes: '2,22,10,13,2,17,66'
  },
  {
    Name: "Masquerader's Hood", Tier: 'Legendary', Type: 'Festival Mask', Equippable: 'Warlock', 'Seasonal Mod': '', isManualInput: true, Id: '""',
    'Mobility (Base)': '16',
    'Resilience (Base)': '8',
    'Recovery (Base)': '8',
    'Discipline (Base)': '20',
    'Intellect (Base)': '2',
    'Strength (Base)': '10',
    'Total (Base)': '64',
    Notes: '16,8,8,20,2,10,64'
  },
  {
    Name: "Masquerader's Cowl", Tier: 'Legendary', Type: 'Festival Mask', Equippable: 'Hunter', 'Seasonal Mod': '', isManualInput: true, Id: '""',
    'Mobility (Base)': '2',
    'Resilience (Base)': '12',
    'Recovery (Base)': '16',
    'Discipline (Base)': '16',
    'Intellect (Base)': '8',
    'Strength (Base)': '7',
    'Total (Base)': '61',
    Notes: '2,12,16,16,8,7,61'
  }
]

export { guardians, fields, totalField, slots, oldNotes, fieldMap, topFields, bottomFields, extraArmor }