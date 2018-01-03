import { web3, core, sale, sire } from '../eth/web3'
import db from '../db/'

// Pause throttle milliseconds between each historical data request
// Because geth can't stay synced if we relentlessly request data from it
const syncEvents = (ck, firstBlock, throttle) => {

  web3.eth.getBlock('latest').then(res => {

    var fromBlock = Number(res.number)
    console.log(`Starting event watchers from block ${fromBlock}`)

    // Autobirther contracts often birth multiple kitties from one txhash
    // Therefore, we need to use something other than just txhash for a primary key
    // txhash plus kittyid is enough to ensure no duplicates AND no missed data

    db.query(`CREATE TABLE IF NOT EXISTS transfer (
      txhash     CHAR(66)    NOT NULL,
      blockn     BIGINT      NOT NULL,
      sender     CHAR(42)    NOT NULL,
      recipient  CHAR(42)    NOT NULL,
      kittyid    BIGINT      NOT NULL,
      PRIMARY KEY (txhash, kittyid) );`)

    db.query(`CREATE TABLE IF NOT EXISTS approval (
      txhash     CHAR(66)    NOT NULL,
      blockn     BIGINT      NOT NULL,
      owner      CHAR(42)    NOT NULL,
      approved   CHAR(42)    NOT NULL,
      kittyid    BIGINT      NOT NULL,
      PRIMARY KEY (txhash, kittyid) );`)

    db.query(`CREATE TABLE IF NOT EXISTS birth (
      txhash     CHAR(66)    NOT NULL,
      blockn     BIGINT      NOT NULL,
      owner      CHAR(42)    NOT NULL,
      kittyid    BIGINT      NOT NULL,
      matronid   BIGINT      NOT NULL,
      sireid     BIGINT      NOT NULL,
      genes      NUMERIC(78) NOT NULL,
      PRIMARY KEY (txhash, kittyid) );`)

    db.query(`CREATE TABLE IF NOT EXISTS pregnant (
      txhash      CHAR(66)    NOT NULL,
      blockn      BIGINT      NOT NULL,
      owner       CHAR(42)    NOT NULL,
      matronid    BIGINT      NOT NULL,
      sireid      BIGINT      NOT NULL,
      cooldownend NUMERIC(78) NOT NULL,
      PRIMARY KEY (txhash, matronid) );`)

    // contract [string] will be one of 'sale', or 'sire'
    const auctionTableInit = (contract) => {
      db.query(`CREATE TABLE IF NOT EXISTS ${contract}created (
        txhash     CHAR(66)    NOT NULL,
        blockn     BIGINT      NOT NULL,
        kittyid    BIGINT      NOT NULL,
        startprice NUMERIC(78) NOT NULL,
        endprice   NUMERIC(78) NOT NULL,
        duration   BIGINT      NOT NULL,
        PRIMARY KEY (txhash, kittyid) );`)
      db.query(`CREATE TABLE IF NOT EXISTS ${contract}successful (
        txhash     CHAR(66)    NOT NULL,
        blockn     BIGINT      NOT NULL,
        kittyid    BIGINT      NOT NULL,
        price      NUMERIC(78) NOT NULL,
        winner     CHAR(42)    NOT NULL,
        PRIMARY KEY (txhash, kittyid) );`)
      db.query(`CREATE TABLE IF NOT EXISTS ${contract}cancelled (
        txhash     CHAR(66)    NOT NULL,
        blockn     BIGINT      NOT NULL,
        kittyid    BIGINT      NOT NULL,
        PRIMARY KEY (txhash, kittyid) );`)
    }
    auctionTableInit('sale')
    auctionTableInit('sire')

    // contract [string] will be one of 'core', 'sale', or 'sire'
    // name [string] will be one of 'transfer', 'approval', 'birth', or 'pregnant'
    // data [object] will contain tx receipt and return values from event
    const saveEvent = (contract, name, data) => {
      let table = ''
      if (contract === 'sale' || contract === 'sire') {
        // table name should be eg salecreated
        table += contract + name.replace('Auction', '')
      } else {
        table += name
      }

      // pay attention to which ${} are strings that need to be enclosed in quotes eg '${}'
      // and which are numbers that don't need single quotes eg ${}
      let q = `INSERT INTO ${table} VALUES ('${data.transactionHash}', ${data.blockNumber}, ` 
      if (name === 'AuctionCreated') {
        q += `${data.returnValues[0]}, ${data.returnValues[1]}, ${data.returnValues[2]}, ${data.returnValues[3]});`
      } else if (name === 'AuctionSuccessful') {
        q += `${data.returnValues[0]}, ${data.returnValues[1]}, '${data.returnValues[2]}');`
      } else if (name === 'AuctionCancelled') {
        q += `${data.returnValues[0]});`
      // These two events return the same number of the same data types, how convenient
      } else if (name === 'Transfer' || name === 'Approval') {
        q += `'${data.returnValues[0]}', '${data.returnValues[1]}', ${data.returnValues[2]});`
      } else if (name === 'Birth') {
        q += `'${data.returnValues[0]}', ${data.returnValues[1]}, ${data.returnValues[2]}, ${data.returnValues[3]}, ${data.returnValues[4]});`
      } else if (name === 'Pregnant') {
        q += `'${data.returnValues[0]}', ${data.returnValues[1]}, ${data.returnValues[2]}, ${data.returnValues[3]});`
      }

      db.query(q).then(res=>{
        data = null // get garbage collected!
      }).catch(error=>{
        // I'll let postgres quietly sort out my duplicate queries for me
        if (error.code !== '23505') { console.error(error) }
      })
    }

    // fromBlock [int] start listening from this block number
    // contract [string] will be one of 'core', 'sale', or 'sire'
    // name [string] of event to listen for
    const sync = (fromBlock, contract, name) => {

      // some variables used to keep track of stats worth logging
      var NEW = 0
      var OLD = 0
      var FROMI = fromBlock

      // get current/future events
      ck[contract].events[name]({ fromBlock }, (err, data) => {
        if (err) { console.error(err); process.exit(1) }
        saveEvent(contract, name, data)
        fromBlock = Number(data.blockNumber)
        NEW += 1
      })

      // i [int] remember past events from block number i
      // contract [string] will be one of 'core', 'sale', or 'sire'
      // name [string] of event to remember
      const remember = (i, contract, name) => {
        if (i < firstBlock) {
          console.log(`=== Finished syncing ${name} events from ${contract}`)
          return('done')
        }

        // log a chunk of our progress
        if (OLD > 250) {
          console.log(`Found ${OLD} old ${name} events from ${contract} in blocks ${
            FROMI}-${i} (${Math.round(15*(fromBlock-i)/60/60)} hours ago)`)
          OLD = 0
          FROMI = i
        }
        if (NEW > 10) {
          console.log(`= Disovered ${NEW} new ${name} events from ${contract} around ${fromBlock} <--- most recent block`)
          NEW = 0
        }

        ck[contract].getPastEvents(name, { fromBlock: i, toBlock: i }, (err, pastEvents) => {
          if (err) { console.error(err); process.exit(1) }
          OLD += pastEvents.length
          pastEvents.forEach(data=>{ saveEvent(contract, name, data) })

          // give node a sec to clear the call stack & give geth a sec to stay synced
          setTimeout(()=>{
            pastEvents = null // get garbage collected!
            remember(i-1, contract, name)
          }, throttle)
        })
      }

      remember(fromBlock, contract, name)
    }

    sync(fromBlock, 'core', 'Transfer')
    sync(fromBlock, 'core', 'Approval')
    sync(fromBlock, 'core', 'Birth')
    sync(fromBlock, 'core', 'Pregnant')

    sync(fromBlock, 'sale', 'AuctionCreated')
    sync(fromBlock, 'sale', 'AuctionSuccessful')
    sync(fromBlock, 'sale', 'AuctionCancelled')

    sync(fromBlock, 'sire', 'AuctionCreated')
    sync(fromBlock, 'sire', 'AuctionSuccessful')
    sync(fromBlock, 'sire', 'AuctionCancelled')
  })
}

export default syncEvents;
