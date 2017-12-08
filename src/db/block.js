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
    // Probably tried to add duplicate
    // Not a problem worth crashing over
    console.error(`Error saving tx: ${err}`)
  })
}

const writeBlock = (block) => {
  return new Promise((resolve, reject) => {
    try {
      (function writeLoop(i) {
        // if we've written everything, get outta here
        if (i >= block.length) resolve(block)
        writeTx(block[i]).then(() => {
          return writeLoop(i+1)
        }).catch((err) => {
          console.error(`Error in tx write loop: ${err}`)
        })
      })(0)
    } catch (err) {
      reject(err)
    }
  })
}

export default { writeBlock }
