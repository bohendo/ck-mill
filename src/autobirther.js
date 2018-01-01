import { web3, core, sale, sire } from './eth/web3'
import db from './db/'

////////////////////////////////////////
// Global Variables

// A day/week's worth of blocks
const DAY = 4*60*24
const WEEK = 4*60*24*7

// master list of duedates
// duedates[i] = { block: 40123, due: [20456, 20789] }
// if kitties 20456 and 20789 are due to give birth at block 40123
const DUEDATES = []

let TIME = new Date().getTime()/1000

////////////////////////////////////////
// Function Definitions

// pregos[i] = { matronid: 123, blockn: 460, cooldownend: 464 }
// if we got a pregnant event for kitty 123 at block 460
// and it'll be ready to give birth at block 464
// births[i] = { kittyid: 12345, blockn: 46400 }
// if we got a birth event for kitty 12345 at block 46400
const updateDueDates = (pregos, births) => {

  console.log(`Analyzing ${pregos.length} pregnancies and ${births.length} births...`)

  // for each pregnancy event, save the due date to our DUEDATE calendar
  pregos.forEach(preg=>{
    const cooldownend = Number(preg.cooldownend)
    const matronid = Number(preg.matronid)

    // find the entry in duedates for the cooldownend block
    let isNew = true
    for (let i=0; i<DUEDATES.length; i++) {
      if (DUEDATES[i].block == cooldownend) {
        isNew = false
        // add this due date if we haven't already
        if (!DUEDATES[i].due.includes(matronid)) {
          DUEDATES[i].due.push(matronid)
        }
        break
      }
    }
    // no due dates for this block yet?
    // add a square to our calendar and pencil in this kittyid
    if (isNew) {
      DUEDATES.push({ block: cooldownend, due: [matronid] })
    }
  })

  // remove all due dates that have already resulted in a birth
  births.forEach(birth=>{
    const block = Number(birth.blockn)
    const matronid = Number(birth.matronid)

    // for all our due dates..
    for (let i=0; i<DUEDATES.length; i++) {
      // If this birth comes after a date at which this kitty was due..
      if (DUEDATES[i] && DUEDATES[i].block <= block && DUEDATES[i].due.includes(matronid)) {
        // remove this due date
        DUEDATES[i].due.splice(DUEDATES[i].due.indexOf(matronid), 1)
      }
      // If this due date is empty now, get rid of it
      if (DUEDATES[i].due.length === 0) {
        DUEDATES.splice(i, 1)
      }
    }
  })

  // Sort due dates so that most recent is on top
  DUEDATES.sort((a,b) => { return a.block-b.block })

  console.log('DUEDATES:')
  for (let i=0; i<15; i++) {
    console.log(`${JSON.stringify(DUEDATES[i])}`)
  }

}

const initializeDueDates = (callback) => {
  web3.eth.getBlock('latest').then(res=>{

    const latest = Number(res.number)
    console.log(`Starting from latest block: ${latest}`)

    // get all pregnancy events from the last week with most recent first
    const preg_query = `
      SELECT matronid,blockn,cooldownend
      FROM pregnant
      WHERE blockn > ${latest-WEEK-1}
      ORDER BY blockn DESC;`

    // get only the most recent birth for each kitty this week
    const birth_query = `
      SELECT DISTINCT ON (matronid) matronid,blockn
      FROM birth
      WHERE blockn > ${latest-WEEK-1}
      ORDER BY matronid DESC, blockn DESC;`

    db.query(preg_query).then(pregos => {

      db.query(birth_query).then(births => {

        updateDueDates(pregos.rows, births.rows)
        console.log(`Done initializing due dates in ${(new Date().getTime()/1000)-TIME} seconds`)
        callback()

      }).catch((error) => {
        console.error(birth_query, error)
        process.exit(1)
      })

    }).catch((error) => {
      console.error(preg_query, error)
      process.exit(1)
    })

  }).catch((error) => {
    console.error('web3.eth.getBlock error:', error)
    process.exit(1)
  })
}

const heartbeat = () => {
  console.log('thump thump')
}

////////////////////////////////////////
// Execute
initializeDueDates(heartbeat)

