import { web3, core } from '../eth/web3'
import db from '../db/'

// Used to log the elapsed time spent syncing kitties
var START = new Date().getTime()/1000

// Pause throttle milliseconds between each historical data request
// Because ethprovider can't stay synced if we relentlessly request data from it
const syncKitties = (throttle) => {

  // Which kitty was most recently born? We'll start syncing back from there
  core.methods.totalSupply().call().then(totalSupply => {

    console.log(`Total supply = ${totalSupply} kitties`)

    // There will be one and only one kitty with each kitty id
    db.query(`CREATE TABLE IF NOT EXISTS kitties (
      kittyid         BIGINT      PRIMARY KEY,
      ispregnant      BOOLEAN     NOT NULL,
      isready         BOOLEAN     NOT NULL,
      cooldownindex   BIGINT      NOT NULL,
      nextauctiontime BIGINT      NOT NULL,
      siringwith      BIGINT      NOT NULL,
      birthtime       BIGINT      NOT NULL,
      matronid        BIGINT      NOT NULL,
      sireid          BIGINT      NOT NULL,
      generation      BIGINT      NOT NULL,
      genes           NUMERIC(78) NOT NULL);`)

    // kitty = [ ispregnant, isready, cooldownindex, nextactiontime,
    //   siringwith, birthtime, matronid, sireid, generation, genes ]
    const saveKitty = (id, kitty) => {

      let q1 = `INSERT INTO Kitties VALUES (${id},
        ${kitty[0]}, ${kitty[1]}, ${kitty[2]}, ${kitty[3]}, ${kitty[4]},
        ${kitty[5]}, ${kitty[6]}, ${kitty[7]}, ${kitty[8]}, ${kitty[9]});`

      return db.query(q1).then(res => {
        kitty = null // get garbage collected!
        return (0)
      }).catch(error =>{
        if (error.code !== '23505') { console.error(q1, error) }

        // update kitty if inserting caused a duplicate key error
        let q2 = `UPDATE Kitties SET
          ispregnant=${kitty[0]}, isready=${kitty[1]}, cooldownindex=${kitty[2]},
          nextauctiontime=${kitty[3]}, siringwith=${kitty[4]} WHERE kittyid = ${id};`

        return db.query(q2).then(res => {
          kitty = null // get garbage collected!
          return (1)
        }).catch(error => {
          kitty = null // get garbage collected!
          console.error(q1, q2, error)
          return (1)
        })
      })
    }

    // save new kitties when we detect a birth event!
    web3.eth.subscribe('newBlockHeaders', (err, header) => {
      if (err) { console.error(err); process.exit(1) }
      const block = Number(header.number)

      // our subscription occasionally skips blocks, get events from the 5 most recent blocks to protect against this
      core.getPastEvents('Birth', { fromBlock: block-5, toBlock: block }, (err, pastEvents) => {
        if (err) { console.error(err); process.exit(1) }

        pastEvents.forEach(event=>{
          const id = Number(event.returnValues[1])
          core.methods.getKitty(id).call().then(kitty => {
            saveKitty(id, kitty).then(ret=>{
              if (ret === 0) { // if this kitty was newly inserted, not updated
                console.log(`${new Date().toISOString()} K=> Saved kitty ${id} born on block ${block}`)
              }
            })
          }).catch((error)=>{
            console.error(`Error getting new kitty ${id}: ${JSON.stringify(error)}`)
          })
        })

      })
    })

    var OLD = 0 // keep track of how many old kitties we sync
    const kittyLoop = (id) => {

      if (id < 0) {
        console.log(`${new Date().toISOString()} === Done syncing kitties!`)
        return ('done')
      }

      core.methods.getKitty(id).call().then(kitty => {

        // log a chunk of our progress
        if (OLD >= 100) {
          console.log(`${new Date().toISOString()} [K] Synced kitties ${id-OLD}-${id} (${
            Math.round((totalSupply-id)/totalSupply*100)
          }% complete in ${
            Math.round(((new Date().getTime()/1000)-START)/60)
          } minutes)`)
          OLD = 0
        }
        OLD += 1
        saveKitty(id, kitty)
        setTimeout(() => { kittyLoop(id-1) }, throttle);

      }).catch((error)=>{
        console.error(`Error getting old kitty ${id}: ${JSON.stringify(error)}`)
        // we still want to move on and sync the next kitty if this one fails
        setTimeout(() => { kittyLoop(id-1) }, throttle);
      })
    }
    kittyLoop(totalSupply)
  })
}

export default syncKitties;
