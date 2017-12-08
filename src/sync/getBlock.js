import { web3, ck } from '../ethereum/'
import db from '../db/'

const fetchBlock = (n) => {
  const all = []

  return ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: n, toBlock: n+1 }).then((sales) => {
    return ck.sire.getPastEvents('AuctionSuccessful', { fromBlock: n, toBlock: n+1 }).then((sires) => {
      sales.forEach((e) => {
        all.push({
          txid: e.transactionHash,
          block: parseInt(e.blockNumber, 10),
          kittyid: parseInt(e.returnValues.tokenId, 10),
          sale: true,
          sire: false,
          value: e.returnValues.totalPrice,
          buyer: e.returnValues.winner,
          lastsynced: new Date().getTime(),
        })
      })

      sires.forEach((e) => {
        all.push({
          txid: e.transactionHash,
          block: parseInt(e.blockNumber, 10),
          kittyid: parseInt(e.returnValues.tokenId, 10),
          sale: false,
          sire: true,
          value: e.returnValues.totalPrice,
          buyer: e.returnValues.winner,
          lastsynced: new Date().getTime(),
        })
      })

      return (all)
    }).catch((err) => { console.error(err); process.exit(1) })
  }).catch((err) => { console.error(err); process.exit(1) })
}

const saveBlock = (block) => {
  return new Promise((resolve, reject) => {

    try {
      (function saveLoop(i) {
        // if we've saved everything, get outta here
        if (i >= block.length) resolve(block)
        const pay = block[i]
        return db.query(`INSERT INTO sales VALUES (
          '${pay.txid}', ${pay.block}, ${pay.kittyid},
          ${pay.sale}, ${pay.sire}, ${pay.value},
          '${pay.buyer}', to_timestamp(${pay.lastsynced}));`,
        ).then((res) => {
          // save the next one when we're done saving this one
          return saveLoop(i+1)
        }).catch((err) => {
          console.error(`Error saving block: ${err}`)
          process.exit(1)
        })
      })(0)
    } catch (err) {
      reject(err)
    }

  })
}

const getBlock = (n) => {
  return db.query(`SELECT * FROM sales WHERE block = ${n}`).then((res) => {
    if (res.rowCount !== 0) { return (res.rows) }
    return fetchBlock(n).then((block) => {
      return saveBlock(block).then(done => {
        return (done)
      }).catch(err => { console.error(err); process.exit(1) })
    }).catch(err => { console.error(err); process.exit(1) })
  }).catch(err => { console.error(err); process.exit(1) })
}

export { getBlock }
