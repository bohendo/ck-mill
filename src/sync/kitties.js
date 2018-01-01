import { web3, core, sale, sire } from '../eth/web3'
import db from '../db/'

var START = new Date().getTime()/1000

const syncKitties = (ck, firstBlock, throttle) => {

  ck.core.methods.totalSupply().call().then(totalKitty => {

    console.log(`Total supply = ${totalKitty} kitties`)

    db.query(`CREATE TABLE IF NOT EXISTS Kitties (
      kittyId         BIGINT      PRIMARY KEY,
      isPregnant      BOOLEAN     NOT NULL,
      isReady         BOOLEAN     NOT NULL,
      coolDownIndex   BIGINT      NOT NULL,
      nextAuctionTime BIGINT      NOT NULL,
      siringWith      BIGINT      NOT NULL,
      birthTime       BIGINT      NOT NULL,
      matronId        BIGINT      NOT NULL,
      sireId          BIGINT      NOT NULL,
      generation      BIGINT      NOT NULL,
      genes           NUMERIC(78) NOT NULL);`)

    // kitty = [ispregnant, isready, cooldownindex, nextactiontime, siringwith, birthtime, matronid, sireid, generation, genes]
    const saveKitty = (id, kitty) => {
      let q = `INSERT INTO Kitties VALUES (${id}, ${kitty[0]}, ${kitty[1]}, ${kitty[2]}, ${kitty[3]}, ${kitty[4]}, ${kitty[5]}, ${kitty[6]}, ${kitty[7]}, ${kitty[8]}, ${kitty[9]});`
      db.query(q).then(res => {
        console.log(q)
        COUNT += 1
        kitty = null // get garbage collected!
      }).catch(error =>{
        if (error.code !== '23505') { console.error(q, error) }
        // update kitty if inserting caused a duplicate key error
        let q = `UPDATE Kitties SET ispregnant=${kitty[0]}, isready=${kitty[1]}, cooldownindex=${kitty[2]}, nextauctiontime=${kitty[3]}, siringwith=${kitty[4]} WHERE kittyid = ${id};`
        db.query(q).then(res => {
          COUNT += 1
          kitty = null // get garbage collected!
        }).catch(error => {
          console.error(q, error)
        })
      })
    }

    // save new kitties when we detect a birth event!
    web3.eth.getBlock('latest').then(res => {
      const latest = Number(res.number)

      // start event listener
      ck.core.events.Birth({ fromBlock: latest }, (err, birth) => {
        if (err) { console.error(err); process.exit(1) }
        let id = Number(birth.returnValues[1])

        ck.core.methods.getKitty(id).call().then(kitty => {
          saveKitty(id, kitty)
        }).catch((error)=>{
          console.error(`Error getting new kitty ${id}: ${JSON.stringify(error)}`)
        })

      })

    }).catch(console.error)

    var COUNT = 1
    const kittyLoop = (id) => {
      if (id < 0) {
        console.log(`===== Done syncing kitties!`)
        return ('done')
      }

      ck.core.methods.getKitty(id).call().then(kitty => {

        // log a chunk of our progress
        if (COUNT > 25) {
          console.log(`=== Synced kitties higher than ${id} (${
            Math.round((totalKitty-id)/totalKitty*100)
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
    kittyLoop(totalKitty)
  })
}

export default syncKitties;
