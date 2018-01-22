import { web3, core, sale, sire } from '../eth/web3'
import db from '../db/'

// Pause throttle milliseconds between each historical data request
// Because ethprovider can't stay synced if we relentlessly request data from it
const syncEvents = (throttle) => {

  // transalate 'latest' -> block number
  // bc web3 event watchers behave better if we tell them when exactly to start watching
  // https://github.com/ethereum/web3.js/issues/989
  web3.eth.getBlock('latest').then(res => {
    var fromBlock = Number(res.number)

    console.log(`Starting event watchers from block ${fromBlock}`)

    // cryptokitty actions can be batched with a contract resulting in multiple
    // events with the same txhash (especially thanks to autobirther contracts)
    // it's almost always sufficient to use the combo of txhash/kittyid as an
    // effective primary key instead.

    // WARNING: It's possible but very unlikely that two rows of the transfer table
    // will be idential and yet both valid. I'm ignoring this edge case for now
    db.query(`CREATE TABLE IF NOT EXISTS transfer (
      txhash     CHAR(66)    NOT NULL,
      blockn     BIGINT      NOT NULL,
      sender     CHAR(42)    NOT NULL,
      recipient  CHAR(42)    NOT NULL,
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

    db.query(`CREATE TABLE IF NOT EXISTS approval (
      txhash     CHAR(66)    NOT NULL,
      blockn     BIGINT      NOT NULL,
      owner      CHAR(42)    NOT NULL,
      approved   CHAR(42)    NOT NULL,
      kittyid    BIGINT      NOT NULL,
      PRIMARY KEY (txhash, kittyid) );`)

    db.query(`CREATE TABLE IF NOT EXISTS pregnant (
      txhash      CHAR(66)    NOT NULL,
      blockn      BIGINT      NOT NULL,
      owner       CHAR(42)    NOT NULL,
      matronid    BIGINT      NOT NULL,
      sireid      BIGINT      NOT NULL,
      cooldownend NUMERIC(78) NOT NULL,
      PRIMARY KEY (txhash, matronid) );`)

    // here, contract will be one of 'sale', or 'sire'
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
    // name [string] will be one of 'transfer', 'approval', 'birth', 'pregnant', etc
    // event [object] will contain tx receipt and return values from event
    const saveEvent = (contract, name, event) => {

      // Get the name of the table storing this type of event eg birth or saleCreated
      const table = (contract === 'core') ? name : contract + name.replace('Auction', '')

      // pay attention to which ${} are strings that need to be enclosed in quotes eg '${}'
      // and which are numbers that don't need single quotes eg ${}
      // see README for cheatsheet regarding data types returned by each event
      let q = `INSERT INTO ${table} VALUES ('${event.transactionHash}', ${event.blockNumber}, `
      if (name === 'AuctionCreated') {
        q += `${event.returnValues[0]}, ${event.returnValues[1]}, ${event.returnValues[2]}, ${event.returnValues[3]});`
      } else if (name === 'AuctionSuccessful') {
        q += `${event.returnValues[0]}, ${event.returnValues[1]}, '${event.returnValues[2]}');`
      } else if (name === 'AuctionCancelled') {
        q += `${event.returnValues[0]});`
      // These two events return the same number of the same data types, how convenient
      } else if (name === 'Transfer' || name === 'Approval') {
        q += `'${event.returnValues[0]}', '${event.returnValues[1]}', ${event.returnValues[2]});`
      } else if (name === 'Birth') {
        q += `'${event.returnValues[0]}', ${event.returnValues[1]}, ${event.returnValues[2]}, ${event.returnValues[3]}, ${event.returnValues[4]});`
      } else if (name === 'Pregnant') {
        q += `'${event.returnValues[0]}', ${event.returnValues[1]}, ${event.returnValues[2]}, ${event.returnValues[3]});`
      }

      return db.query(q).then(res=>{
        return(0)
      }).catch(error=>{
        // I'll let postgres quietly filter out my duplicate queries for me
        if (error.code !== '23505') { console.error(error) }
        return(1)
      })
    }

    // To get contract instance from string eg 'core' w/out using global
    // each sync instance can share this one ck object
    const ck = { core, sale, sire }

    // fromBlock [int] start listening from this block number
    // contract [string] will be one of 'core', 'sale', or 'sire'
    // name [string] of event to listen for
    const sync = (fromBlock, contract, name) => {

      // watch for new blocks
      // a vanilla event watcher only seems to notice one event per txhash
      // We'll manually get ALL events using getPastEvents instead

      web3.eth.subscribe('newBlockHeaders', (err, header) => {
        if (err) { console.error(err); process.exit(1) }
        const block = Number(header.number)
        if (name === 'Birth') { console.log(`${new Date().toISOString()}     Imported new block ${block} (${db.pending()} pending db requests)`) }

        // our subscription occasionally skips blocks
        // get events from several of the most recent blocks to protect against this
        ck[contract].getPastEvents(name, { fromBlock: block-10, toBlock: block }, (err, pastEvents) => {
          if (err) { console.error(err); process.exit(1) }
          pastEvents.forEach(event=>{
            saveEvent(contract, name, event).then(ret=>{
              if (ret === 0) { // if this event wasn't a duplicate..
                console.log(`${new Date().toISOString()} E-> ${name} event discovered from ${contract} at block ${block}`)
              }
            })
          })
        })
      })

      // counter used to keep track of stats worth logging
      var OLD = 0

      // i [int] remember past events from block number i
      // contract [string] will be one of 'core', 'sale', or 'sire'
      // name [string] of event to remember
      const remember = (i, contract, name) => {
        if (i < 4605167) { // block at which cryptokitties was deployed
          console.log(`${new Date().toISOString()} ===== Finished syncing ${name} events from ${contract}`)
          return('done')
        }

        // log a chunk of our progress?
        if (OLD >= 100) {
          console.log(`${new Date().toISOString()} [E] Found ${OLD} old ${name} events from ${contract} at/before block ${i} (${Math.round(15*(fromBlock-i)/60/60)} hours ago)`)
          OLD = 0
        }

        ck[contract].getPastEvents(name, { fromBlock: i, toBlock: i }).then(pastEvents => {
          OLD += pastEvents.length
          pastEvents.forEach(event=>{ saveEvent(contract, name, event) })

          // give node a sec to clear the call stack & give ethprovider a sec to stay synced
          setTimeout(()=>{
            pastEvents = null // get garbage collected!
            remember(i-1, contract, name)
          }, throttle)
        }).catch(err=>{
          console.error(err)
          process.exit(1)
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
