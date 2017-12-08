import db from './init'

const writeKitty = (k) => {
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
  })
}

const readKitty = (k) => {
  return db.query(`SELECT * FROM kitties WHERE id = ${parseInt(k, 10)};`).then((res) => {
    return (res.rowCount !== 0) ? res.rows[0] : false
  }).catch((err) => { console.error(`db.query(SELECT) Error: ${err}`); process.exit(1) })
}

const haveCache = db.query(`SELECT id FROM kitties order by id;`).then(kitties=>{
  return kitties.rows.map(r=>r.id)
})

const haveKitty = (k) => {
  return haveCache.then(kitties => {
    return kitties.includes(k)
  }).catch(err => { console.error(`haveCache(${k}) Error: ${err}`); })
}

export { writeKitty, readKitty, haveKitty }
