import { web3, ck, mn } from './ethereum/'
import db from './db/'

const printq = true

// Pause $throttle seconds between recalling events from previous blocks
// Geth can't stay synced if we relentlessly request data from it
const throttle = 1

const syncKitties = (fromBlock) => {

  db.query(`CREATE TABLE IF NOT EXISTS Transfer (
    txhash     CHAR(66)    PRIMARY KEY,
    blockn     BIGINT      NOT NULL,
    sender     CHAR(42)    NOT NULL,
    recipient  CHAR(42)    NOT NULL,
    kittyid    BIGINT      NOT NULL);`)
  db.query(`CREATE TABLE IF NOT EXISTS Approval (
    txhash     CHAR(66)    PRIMARY KEY,
    blockn     BIGINT      NOT NULL,
    owner      CHAR(42)    NOT NULL,
    approved   CHAR(42)    NOT NULL,
    kittyid    BIGINT      NOT NULL);`)
  db.query(`CREATE TABLE IF NOT EXISTS Birth (
    txhash     CHAR(66)    PRIMARY KEY,
    blockn     BIGINT      NOT NULL,
    owner      CHAR(42)    NOT NULL,
    kittyid    BIGINT      NOT NULL,
    matronid   BIGINT      NOT NULL,
    sireid     BIGINT      NOT NULL,
    genes      NUMERIC(78) NOT NULL);`)
  db.query(`CREATE TABLE IF NOT EXISTS Pregnant (
    txhash      CHAR(66)    PRIMARY KEY,
    blockn      BIGINT      NOT NULL,
    owner       CHAR(42)    NOT NULL,
    matronid    BIGINT      NOT NULL,
    sireid      BIGINT      NOT NULL,
    cooldownend NUMERIC(78) NOT NULL);`)

  // Event will be one of 'transfer', 'approval', 'birth', or 'pregnant'
  const saveEvent = (name, data) => {
    let q = `INSERT INTO ${name} VALUES ('${data.transactionHash}', 
      ${data.blockNumber}, ` // q for Query

    // These two events return the same number of the same data types, how convenient
    // pay attention to which ${} are strings that need to be enclosed in quotes eg '${}'
    if (name === 'Transfer' || name === 'Approval') {
      q += `'${data.returnValues[0]}', '${data.returnValues[1]}',
      ${data.returnValues[2]});`
    } else if (name === 'Birth') {
      q += `'${data.returnValues[0]}',
      ${data.returnValues[1]}, ${data.returnValues[2]}, ${data.returnValues[3]},
      ${data.returnValues[4]});`
    } else if (name === 'Pregnant') {
      q += `'${data.returnValues[0]}',
      ${data.returnValues[1]}, ${data.returnValues[2]}, ${data.returnValues[3]});`
    }

    if (printq) { console.log(q) }
    db.query(q).catch(error=>{
      // I'll let postgres quietly sort out my duplicate queries for me
      if (error.code !== '23505') { console.error(error) }
    })
  }


  const listen = (fromBlock, event) => {
    // get current/future events
    ck.core.events[event]({ fromBlock }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      saveEvent(event, res)
    })
  }
  listen(fromBlock, 'Transfer')
  listen(fromBlock, 'Approval')
  listen(fromBlock, 'Birth')
  listen(fromBlock, 'Pregnant')

  const remember = (i, event) => {
    // mn for Magic Numbers, this magic fromBlock is the one at which ck was deployed
    if (i < mn.fromBlock) return ('done')
    ck.core.getPastEvents(event, { fromBlock: i, toBlock: i }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      res.forEach(data=>{
        saveEvent(event, data)
      })
    })
    // give node a sec to clear the call stack & give geth a sec to stay synced
    setTimeout(()=>{remember(i-1, event)}, throttle)
  }
  remember(fromBlock, 'Transfer')
  remember(fromBlock, 'Approval')
  remember(fromBlock, 'Birth')
  remember(fromBlock, 'Pregnant')

 }

// Define event listeners
const syncAuctions = (fromBlock) => {

  // sors for Sale or Sire, equals one of 'sale' or 'sire'
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

  const listen = (fromBlock, sors, event) => {
    // get current/future events
    ck[sors].events[event]({ fromBlock }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      saveAuction(res, sors, event)
    })
  }
  listen(fromBlock, 'sale', 'AuctionCreated')
  listen(fromBlock, 'sire', 'AuctionCreated')
  listen(fromBlock, 'sale', 'AuctionSuccessful')
  listen(fromBlock, 'sire', 'AuctionSuccessful')
  listen(fromBlock, 'sale', 'AuctionCancelled')
  listen(fromBlock, 'sire', 'AuctionCancelled')

  // get past events
  const remember = (i, sors, event) => {
    // mn for Magic Numbers, this magic fromBlock is the one at which ck was deployed
    if (i < mn.fromBlock) return ('done')
    ck[sors].getPastEvents(event, { fromBlock: i, toBlock: i }, (err, res) => {
      if (err) { console.error(err); process.exit(1) }
      res.forEach(auction=>{
        saveAuction(auction, sors, event)
      })
    })
    // Move on to the next (give node a hot sec to clear the call stack)
    setTimeout(()=>{remember(i-1, sors, event)}, throttle)
  }
  remember(fromBlock, 'sale', 'AuctionCreated')
  remember(fromBlock, 'sire', 'AuctionCreated')
  remember(fromBlock, 'sale', 'AuctionSuccessful')
  remember(fromBlock, 'sire', 'AuctionSuccessful')
  remember(fromBlock, 'sale', 'AuctionCancelled')
  remember(fromBlock, 'sire', 'AuctionCancelled')
}

// Activate!
web3.eth.getBlock('latest').then(res => {
  console.log(`Starting event watchers from block ${res.number}`)
  syncAuctions(res.number)
  syncKitties(res.number)
})

