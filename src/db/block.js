import db from './init'

const writeTx = (tx) => {
  return db.query(`INSERT INTO sales VALUES (
    '${tx.txid}',
    ${tx.block},
    ${tx.kittyid},
    ${tx.sale},
    ${tx.sire},
    ${tx.value},
    '${tx.buyer}',
    to_timestamp(${tx.lastsynced}));`,
  ).catch((err) => {
    // Probably tried to add duplicate rows
    // Not a problem worth crashing over or even logging
    // console.error(`Error saving tx: ${err}`)
  })
}

const writeBlock = (block) => {
  return new Promise((resolve, reject) => {
    try {
      (function writeLoop(i) {
        // if we've written everything, get outta here
        if (i >= block.length-1) return(resolve(block))
        writeTx(block[i]).then(() => {
          return writeLoop(i+1)
        }).catch((err) => {
          console.error(`Error in round ${i} of tx write loop: ${err}`)
        })
      })(0)
    } catch (err) {
      return(reject(err))
    }
  })
}

const readBlock = (n) => {
  return db.query(`SELECT * FROM sales WHERE block = ${n}`).then((res) => {
    return (res.rowCount !== 0) ? res.rows : false
  }).catch(err => { console.error(err); process.exit(1) })
}

const haveCache = db.query(`SELECT DISTINCT block FROM sales order by block`).then(blocks => {
  return blocks.rows.map(r=>r.block)
})

const haveBlock = (n) => {
  return haveCache.then((blocks) => {
    return blocks.includes(n)
  }).catch(err => { console.error(`haveCache(${n}) Error: ${err}`); })
}

export { writeBlock, readBlock, haveBlock }
