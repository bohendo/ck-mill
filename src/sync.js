import { web3, ck, mn } from './ethereum/'
import db from './db/'

const printq = true

const syncAuctionCreated = (from) => {
}


// Define event listeners
const syncAuctions = (from) => {

  // sors for Sale or Sire, equals either 'sale' or 'sire'
  const dbinit = (sors) => {
    db.query(`CREATE TABLE IF NOT EXISTS ${sors}AuctionCreated (
      txhash     CHAR(66)    PRIMARY KEY,
      blockn     BIGINT      NOT NULL,
      kittyid    BIGINT      NOT NULL,
      startprice NUMERIC(78) NOT NULL,
      endprice   NUMERIC(78) NOT NULL,
      duration   BIGINT      NOT NULL);`)
    db.query(`CREATE TABLE IF NOT EXISTS ${sors}AuctionSuccessful (
      txhash     CHAR(66)    PRIMARY KEY,
      blockn     BIGINT      NOT NULL,
      kittyid    BIGINT      NOT NULL,
      price      NUMERIC(78) NOT NULL,
      winner     CHAR(42)    NOT NULL);`)
    db.query(`CREATE TABLE IF NOT EXISTS ${sors}AuctionCancelled (
      txhash     CHAR(66)    PRIMARY KEY,
      blockn     BIGINT      NOT NULL,
      kittyid    BIGINT      NOT NULL);`)
  }
  dbinit('sale')
  dbinit('sire')

  const saveAuction = (auction, sors, event) => {
    let q = `INSERT INTO ${sors}${event} VALUES (`
    if (event === 'AuctionCreated') {
      q += `'${auction.transactionHash}',
       ${auction.blockNumber}, ${auction.returnValues[0]}, ${auction.returnValues[1]},
       ${auction.returnValues[2]}, ${auction.returnValues[3]});`
    } else if (event === 'AuctionSuccessful') {
      q += `'${auction.transactionHash}',
       ${auction.blockNumber}, ${auction.returnValues[0]}, ${auction.returnValues[1]},
      '${auction.returnValues[2]}');`
    } else if (event === 'AuctionCancelled') {
      q += `'${auction.transactionHash}',
       ${auction.blockNumber}, ${auction.returnValues[0]});`
    }

    if (printq) { console.log(q) }
    db.query(q).catch(error=>{
      // I'll let postgres quietly sort out my duplicate queries for me
      if (error.code !== '23505') { console.error(error) }
    })
  }

  const listen = (from, sors, event) => {
    // get current/future events
    ck[sors].events[event]({ fromBlock: from }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      saveAuction(res, sors, event)
    })
  }
  listen(from, 'sale', 'AuctionCreated')
  listen(from, 'sire', 'AuctionCreated')
  listen(from, 'sale', 'AuctionSuccessful')
  listen(from, 'sire', 'AuctionSuccessful')
  listen(from, 'sale', 'AuctionCancelled')
  listen(from, 'sire', 'AuctionCancelled')

  // get past events | sors for Sale OR Sire
  const remember = (i, sors, event) => {
    if (i < mn.fromBlock) return ('done')
    ck[sors].getPastEvents(event, { fromBlock: i, toBlock: i }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      res.forEach(auction=>{
        saveAuction(auction, sors, event)
      })
    })
    // Move on to the next (give node a hot sec to clear the call stack)
    setTimeout(()=>{remember(i-1, sors, event)}, 0)
  }
  remember(from, 'sale', 'AuctionCreated')
  remember(from, 'sire', 'AuctionCreated')
  remember(from, 'sale', 'AuctionSuccessful')
  remember(from, 'sire', 'AuctionSuccessful')
  remember(from, 'sale', 'AuctionCancelled')
  remember(from, 'sire', 'AuctionCancelled')
}

// Activate!
web3.eth.getBlock('latest').then(res => {
  console.log(`Starting event watchers from block ${res.number}`)
  syncAuctions(res.number)
})

