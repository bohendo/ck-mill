import { web3, core, sale, sire } from './eth/web3'
import db from './db/'

import { autobirth } from './eth/autobirther'

////////////////////////////////////////
// Global Variables

// Master list of kitties and when they'll be due to give birth
var DUEDATES

const printDD = (dd) => {
  console.log(`${new Date().toISOString()} Kitties (${dd[0].kittyid},${dd[1].kittyid},${dd[2].kittyid},${dd[3].kittyid},${dd[4].kittyid}) Due on (${dd[0].blockn},${dd[1].blockn},${dd[2].blockn},${dd[3].blockn},${dd[4].blockn})`)
}

////////////////////////////////////////
// Updates an existing (maybe []) duedates array based on arrays of pregnant and birth events
// pure function, no side effects
// (duedates, pregos, births) => duedates
// where
// - pregos[i] = { matronid: 123, blockn: 460, cooldownend: 464, ... }
//   if we got a pregnant event for kitty 123 at block 460
//   and it'll be ready to give birth at block 464
// - births[i] = { kittyid: 12345, blockn: 46400, ... }
//   if we got a birth event for kitty 12345 at block 46400
// - duedates[i] = { kittyid: 123, blockn: 464 }
//   if kitty123 is pregnant and due on block 464
const update = (duedates, pregos, births) => {

  // console.log(`${new Date().toISOString()} Updating list of ${duedates.length} duedates according to ${births.length} birth events and ${pregos.length} pregnant events`)

  pregos.forEach(preg=>{ // for each pregnancy event

    // translate results to proper types
    const matronid = Number(preg.matronid)
    const cooldownend = Number(preg.cooldownend)

    let isNew = true // does this kitty have an entry in duedates yet?
    
    // search through existing due dates
    for (let i=0; i<duedates.length; i++) {

       // does this matronid already have an entry in duedates?
      if (matronid === duedates[i].kittyid){
        isNew = false
        // if this one more recent, overwrite the old one
        if (cooldownend > duedates[i].blockn) {
          duedates[i].kittyid = cooldownend
        }
      }
    }

    // if this kitty doesn't have an entry in duedates yet, add one
    if (isNew) {
      duedates.push({ kittyid: matronid, blockn: cooldownend })
    }
  })

  births.forEach(birth=>{ // for each birth event

    // translate results to proper types
    const matronid = Number(birth.matronid)
    const block = Number(birth.blockn)

    // search through existing due dates
    for (let i=0; i<duedates.length; i++) {
      // remove any duedates that were before this kitty's most recent birth
      if (matronid === duedates[i].kittyid && block >= duedates[i].blockn) {
        duedates.splice(i, 1)
        i -= 1 // We removed an element from the list so this i now points to the next element
      }
    }
  })

  // Sort due dates so that most recent is on top
  duedates.sort((a,b) => { return a.blockn-b.blockn })

  // double check everything if we have too many due dates on our calendar
  return core.methods.pregnantKitties().call().then(res=>{
    // too many due dates? double check what we got
    if (res < duedates.length) {
      console.log(`${new Date().toISOString()} WARN: we have too many duedates, double checking with the blockchain...`)
      return doublecheck(duedates)
    } else {
      if (res < duedates.length) {
        console.log(`${new Date().toISOString()} WARN: we're missing ${duedates.length - res} due dates`)
      }
      printDD(duedates)
      return duedates
    }
  })
}

////////////////////////////////////////
// Double check each due date & remove any that expired w/out us noticing
const doublecheck = (duedates) => {

  // loop through the kitties we found and get the status of each
  const kittyPromises = duedates.map(dd => core.methods.getKitty(dd.kittyid).call())

  // wait for all our kitty data to return
  return (Promise.all(kittyPromises).then(kitties=>{

    // remove any kitties we found that aren't pregnant anymore
    for (let i=0; i<kitties.length; i++) {

      // if this kitty isn't pregnant...
      if (!kitties[i].isGestating) {
        console.log(`${new Date().toISOString()} WARN: we thought kitty ${duedates[i].kittyid} was pregnant but isGestating=${kitties[i].isGestating}, removing...`)

        // remove this index from both arrays
        duedates.splice(i, 1)
        kitties.splice(i, 1)
        i -= 1 // We removed an element from the list so the same index now points to the next element
      }

    } // done looping through pregnant kitties, any non-pregnant ones have been removed

    printDD(duedates)
    return (duedates)

  }).catch((err)=>{
    console.error(err)
    return (duedates) // return what we have so far
  }))

}


////////////////////////////////////////
// Pulls old events out of our database and calls update()
// to populate our duedates calendar
const init = (listen) => {
  web3.eth.getBlock('latest').then(res=>{

    const latest = Number(res.number)

    console.log(`${new Date().toISOString()} Initializing history before latest block: ${latest}`)

    const week = 4*60*24*7 // a week's worth of blocks

    // get all pregnancy events from the last week with most recent first
    const preg_query = `
      SELECT matronid,blockn,cooldownend
      FROM pregnant
      WHERE blockn > ${latest-week}
      ORDER BY blockn DESC;`

    // get only the most recent birth for each kitty this week
    const birth_query = `
      SELECT DISTINCT ON (matronid) matronid,blockn
      FROM birth
      WHERE blockn > ${latest-week}
      ORDER BY matronid DESC, blockn DESC;`

    db.query(preg_query).then(pregos => {
      db.query(birth_query).then(births => {

        // update empty erray w historic birth/pregnancy events
        update([], pregos.rows, births.rows).then(duedates=>{
          // save result to our global variable
          DUEDATES = duedates
          listen()
        })

      }).catch((error) => { console.error(birth_query, error); process.exit(1) })
    }).catch((error) => { console.error(preg_query, error); process.exit(1) })

  }).catch((error) => { console.error('web3.eth.getBlock error:', error); process.exit(1) })
}


////////////////////////////////////////
// Listens for new events and calls updateDueDates()
// to keep our DUEDATES calendar up-to-date
const listen = () => {

  // We'll manually get events each time we import a new block
  web3.eth.subscribe('newBlockHeaders', (err, header) => {
    if (err) { console.error(err); process.exit(1) }
    const block = Number(header.number)

    web3.eth.getAccounts().then(accounts => {
      web3.eth.getBalance(accounts[0]).then(balance => {
        console.log(`${new Date().toISOString()} --- Imported new block ${block}  (Current Balance: ${Math.round(Number(balance)/1000000000000)} uETH)`)
      })
    })

    // ethprovider's buggy & occasionally skips events and imported blocks
    // get events from several of the most recent blocks to partially solve this problem
    core.getPastEvents('Birth', { fromBlock: block-2, toBlock: block }, (err, pastBirths) => {
      if (err) { console.error(err); process.exit(1) }
      core.getPastEvents('Pregnant', { fromBlock: block-2, toBlock: block }, (err, pastPregos) => {
        if (err) { console.error(err); process.exit(1) }

          const births = pastBirths.map(e=>{
            return ({
              matronid: Number(e.returnValues[2]),
              blockn: Number(e.blockNumber),
            })
          })

          const pregos = pastPregos.map(e=>{
            return ({
              matronid: Number(e.returnValues[1]),
              blockn: Number(e.blockNumber),
              cooldownend: Number(e.returnValues[3]),
            })
          })

          // Update our global DUEDATES variable.
          update(DUEDATES, pregos, births).then(result => {
            DUEDATES = result


            // SEND GIVEBIRTH TRANSACTION?
            if (DUEDATES[0].blockn === block+2 || DUEDATES[1].blockn === block+2 || DUEDATES[2].blockn === block+2) {

              let i = 0
              const toBirth = []

              while (DUEDATES[i].blockn < block+5) {
                toBirth.push(DUEDATES[i].kittyid)
                i += 1
              }

              autobirth(toBirth) // Send Transaction

            }

          })
      })
    })

  })
}

////////////////////////////////////////
// Execute!
init(listen)

