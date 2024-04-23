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

export { guardians, fields, totalField, slots, oldNotes, fieldMap, topFields, bottomFields }