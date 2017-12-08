import db from './init'

const writeKitty = (k) => {
  // Order of values is important, make sure it matches the schema
  return db.query(`INSERT INTO kitties VALUES (
    ${k.id},
    ${k.isgestating},
    ${k.isready},
    to_timestamp(${k.birthtime}),
    to_timestamp(${k.nextactionat}),
    ${k.cooldownindex},
    ${k.siringwithid},
    ${k.matronid},
    ${k.sireid},
    ${k.generation},
    ${k.genes},
    ${k.forsale},
    ${k.forsire},
    ${k.currentprice},
    ${k.startprice},
    ${k.endprice},
    ${k.duration},
    to_timestamp(${k.startedat}),
    to_timestamp(${k.lastsynced}) );`,
  ).catch((err) => {
    console.error(`Error saving kitty ${k.id}: ${err}`)
    return 'Error'
  })
}

export default { writeKitty }
