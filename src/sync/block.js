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

const getBlock = (n) => {
  return db.query(`SELECT * FROM sales WHERE block = ${n}`).then((res) => {
    if (res.rowCount !== 0) { return (res.rows) }
    return fetchBlock(n).then((block) => {
      return db.saveBlock(block).then(done => {
        return (done)
      }).catch(err => { console.error(err); process.exit(1) })
    }).catch(err => { console.error(err); process.exit(1) })
  }).catch(err => { console.error(err); process.exit(1) })
}

export default { getBlock }
