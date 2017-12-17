import { web3, ck, mn } from './ethereum/'
import db from './db/'

const printq = true

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

  // sors for Sale or Sire, equals either 'sale' or 'sire'
  const dbinit = (sors) => {
    db.query(`CREATE TABLE IF NOT EXISTS ${sors}AuctionSuccessful (
      txhash     CHAR(66)    PRIMARY KEY,
      blockn     BIGINT      NOT NULL,
      kittyid    BIGINT      NOT NULL,
      price      NUMERIC(78) NOT NULL,
      winner     CHAR(42)    NOT NULL);`)
  }
  dbinit('sale')
  dbinit('sire')

  const saveAuctionSuccessful = (event, sors) => {
    let q = `INSERT INTO ${sors}AuctionSuccessful VALUES (
      '${event.transactionHash}',
       ${event.blockNumber}, ${event.returnValues[0]}, ${event.returnValues[1]},
      '${event.returnValues[2]}');`
    if (printq) { console.log(q) }
    db.query(q).catch(error=>{
      if (error.code !== '23505') { console.error(error) }
    })
  }

  const getAuctionSuccessful = (sors) => {
    // get current/future events
    ck[sors].events.AuctionSuccessful({ fromBlock: from }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      saveAuctionSuccessful(res, sors)
    })
  }
  getAuctionSuccessful('sale')
  getAuctionSuccessful('sire')

  // get past events | sors for Sale OR Sire
  const pastEventLoop = (i, sors) => {
    if (i < mn.fromBlock) return ('done')
    ck[sors].getPastEvents('AuctionSuccessful', { fromBlock: i, toBlock: i }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      res.forEach(event=>{
        saveAuctionSuccessful(event, sors)
      })
    })
    // Move on to the next
    pastEventLoop(i-1, sors)
  }
  pastEventLoop(from, 'sale')
  pastEventLoop(from, 'sire')
}

// Activate!
web3.eth.getBlock('latest').then(res => {
  console.log(`Starting event watchers from block ${res.number}`)
  syncAuctionSuccessful(res.number)
})

