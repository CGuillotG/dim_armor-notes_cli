import fs from 'fs'
import jsonexport from 'jsonexport'
import csvToJson from 'csvtojson'

export const reduceNewNotes = newArmor => {
  return [
    ...newArmor.map(armor => {
      return { Hash: armor.Hash, Id: armor.Id, Tag: armor.Tag, Notes: armor['New Notes'] }
    })
  ]
}

export const printDifferences = newArmor => {
  let singleLineArray = newArmor
    .filter(na => { return na['Notes'] !== na['New Notes'] })
    .map(({ Name, Tier, Notes, 'New Notes': NewNotes }) => ({ No: 0, Name, Tier, Notes, NewNotes }))
  let multiLineArray = []

  singleLineArray.forEach((elem, index) => {
    let notes = elem.Notes.split('  ')
    let newNotes = elem.NewNotes.split('  ')
    elem.No = index + 1
    elem.Notes = notes[0]
    elem.NewNotes = newNotes[0]
    // Can't remember the purpose of this, so I'm commenting it out and will delete it later
      // if (newNotes[0].length !== 4) {
      //   elem.NNLength = newNotes[0].length
      // }
    if (index !== 0) {
      multiLineArray.push({})
    }
    multiLineArray.push(elem)
    for (let i = 1; i < Math.max(notes.length, newNotes.length); i++) {
      let extraLine = {}
      if (notes[i]) {
        extraLine.Notes = notes[i]
      }
      if (newNotes[i]) {
        extraLine.NewNotes = newNotes[i]
      }
      multiLineArray.push(extraLine)
    }
  })
  console.table(multiLineArray)
}

export const saveJsonToCsv = (json, destinationPath) => {
  jsonexport(json, function (err, csv) {
    if (err) return console.error(err)
    fs.writeFile(destinationPath, csv, function (err) {
      if (err) throw err
    })
    console.log(`${destinationPath} saved successfully`)
  })
}

export const getArmor = path => {
  return csvToJson({
    delimiter: ',',
    quote: '"'
  }).fromFile(path)
}