import { web3, ck, mn } from './ethereum/'
import db from './db/'

const printq = true

// Activate event listeners
web3.eth.getBlock('latest').then(res => {
  console.log(`Starting event watchers from block ${res.number}`)
  syncAuctionSuccessful(res.number)
})

const syncAuctionCreated = (from) => {
  db.query(`CREATE TABLE IF NOT EXISTS saleAuctionCreated (
    txhash     CHAR(66)    PRIMARY KEY,
    blockn     BIGINT      NOT NULL,
    kittyid    BIGINT      NOT NULL,
    startprice NUMERIC(78) NOT NULL,
    endprice   NUMERIC(78) NOT NULL,
    duration   BIGINT      NOT NULL);`)
}

// Define event listeners
const syncAuctionSuccessful = (from) => {

  db.query(`CREATE TABLE IF NOT EXISTS saleAuctionSuccessful (
    txhash     CHAR(66)    PRIMARY KEY,
    blockn     BIGINT      NOT NULL,
    kittyid    BIGINT      NOT NULL,
    price      NUMERIC(78) NOT NULL,
    winner     CHAR(42)    NOT NULL);`)

  // get current/future events
  ck.sale.events.AuctionSuccessful({ fromBlock: from }, (err, res) => {
    if (err) { console.error(err); process.exit(1) }
    saveAuctionSuccessful(res)
  })

  // get past events
  ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: from-10, toBlock: from-1 }, (err, res) => {
    if (err) { console.error(err); process.exit(1) }
    res.forEach(event=>{
      saveAuctionSuccessful(event)
    })
  })
}

const saveAuctionSuccessful = (event) => {
  let q = `INSERT INTO saleAuctionSuccessful VALUES (
    '${event.transactionHash}',
     ${event.blockNumber},
     ${event.returnValues[0]},
     ${event.returnValues[1]},
    '${event.returnValues[2]}');`
  if (printq) { console.log(q) }
  db.query(q).catch(console.error)
}

