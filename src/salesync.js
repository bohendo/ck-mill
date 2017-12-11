import { web3, ck } from './ethereum/'
import db from './db/'

// Magic number: block at which cryptokitties was deployed
const fromBlock = 4605167 

const syncAll = () => {
  return db.query(`SELECT DISTINCT block FROM sales order by block`).then(blocks => {
    const ids = blocks.rows.map(r=>r.block)
    return web3.eth.getBlock('latest').then(latest => {
      console.log(`Syncing sales starting with block ${latest.number}`);
      (function blockLoop(i) {
        if (i <= fromBlock) return 'done'
        if (ids.includes(i)) {
          // gotta give node a chance to clear the call stack otherwise it'll overflow
          setTimeout(()=>{ blockLoop(i-1) }, 0)
        } else {
          saveSales(i).then(()=>{ blockLoop(i-1) }).catch(console.error)
        }
      })(parseInt(latest.number, 10))
    }).catch(console.error)
  }).catch(console.error)
}


const saveSales = (i) => {
  return ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: i, toBlock: i+1 }).then((sales) => {
    if (sales.length > 0) {
      let q = `INSERT INTO sales VALUES `
      sales.forEach((e) => {
        let sq = ' ('
        sq += `'${e.transactionHash}', `
        sq += `${e.blockNumber}, `
        sq += `${e.returnValues.tokenId}, `
        sq += `${e.returnValues.totalPrice}, `
        sq += `'${e.returnValues.winner}', `
        sq += `to_timestamp(${Math.round(new Date().getTime()/1000)}) ), `
        q += sq
      })
      q = q.slice(0,-2) + ';' // we're done, no more trailing commas needed
      console.log(q)
      return db.query(q).catch(()=>{/*almost certainly a duplicate key error, not worth logging*/})
    }
  }).catch((err) => { console.error(err); process.exit(1) })
}

syncAll()
