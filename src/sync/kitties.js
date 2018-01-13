import { web3, core } from '../eth/web3'
import db from '../db/'

// Used to log the elapsed time spent syncing kitties
var START = new Date().getTime()/1000

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

      db.query(q1).then(res => {
        kitty = null // get garbage collected!
      }).catch(error =>{
        if (error.code !== '23505') { console.error(q, error) }

        // update kitty if inserting caused a duplicate key error
        let q2 = `UPDATE Kitties SET
          ispregnant=${kitty[0]}, isready=${kitty[1]}, cooldownindex=${kitty[2]},
          nextauctiontime=${kitty[3]}, siringwith=${kitty[4]} WHERE kittyid = ${id};`

        db.query(q2).then(res => {
          kitty = null // get garbage collected!
        }).catch(error => {
          kitty = null // get garbage collected!
          console.error(q1, q2, error)
        })
      })
    }

    // save new kitties when we detect a birth event!
    web3.eth.getBlock('latest').then(res => {
      const latest = Number(res.number)
      // start event listener & explicitly pass latest block number
      // https://github.com/ethereum/web3.js/issues/989
      core.events.Birth({ fromBlock: latest }, (err, birth) => {
        if (err) { console.error(err); process.exit(1) }
        const id = Number(birth.returnValues[1])
        const block = Number(birth.blockNumber)
        core.methods.getKitty(id).call().then(kitty => {
          saveKitty(id, kitty)
          console.log(`= Saving new kitty ${id} born on block ${block} (started listening ${block-latest} blocks ago)`)
        }).catch((error)=>{
          console.error(`Error getting new kitty ${id}: ${JSON.stringify(error)}`)
        })
      })
    }).catch((error) => {
      console.error(`KittySync Error: Couldn't get latest block ${JSON.stringify(error)}`)
      process.exit(1)
    })

    var COUNT = 1 // should be preserved across recursive kittyLoop() calls
    const kittyLoop = (id) => {
      if (id < 0) {
        console.log(`=== Done syncing kitties!`)
        return ('done')
      }

      core.methods.getKitty(id).call().then(kitty => {
        COUNT += 1

        // log a chunk of our progress
        if (COUNT >= 100) {
          console.log(`Synced all kitties over ${id} (${
            Math.round((totalSupply-id)/totalSupply*100)
          }% complete in ${
            Math.round(((new Date().getTime()/1000)-START)/60)
          } minutes)`)
          COUNT = 0
        }

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
