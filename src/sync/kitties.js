import { web3, core, sale, sire } from '../eth/web3'
import db from '../db/'

const syncKitties = (ck, firstBlock, throttle) => {

  ck.core.methods.totalSupply().call().then((error,totalKitty) => {
    if (error)
    {
      console.error(error);
      return error;
    }
    console.log(`Total Supply = ${totalKitty}`)
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
      }).catch(error =>{
        if (error.code !== '23505') { console.error(q, error) }
        // update kitty if inserting caused a duplicate key error
        let q = `UPDATE Kitties SET ispregnant=${kitty[0]}, isready=${kitty[1]}, cooldownindex=${kitty[2]}, nextauctiontime=${kitty[3]}, siringwith=${kitty[4]} WHERE kittyid = ${id};`
        db.query(q).then(res => {
          COUNT += 1
          kitty = null // get garbage collected!
        }).catch(error =>{ console.error(q, error) })
      })
    }

    // save new kitties when we detect a birth event!
    web3.eth.getBlock('latest').then(res => {
      const latest = Number(res.number)
      ck.core.events.Birth({ fromBlock: latest }, (err, birth) => {
        if (err) { console.error(err); process.exit(1) }
        let id = Number(birth.returnValues[1])
        ck.core.methods.getKitty(id).call().then((err, kitty) => {
          saveKitty(id, kitty)
        }).catch(console.error)
      })
    }).catch(console.error)

    var COUNT = 0
    var OLDI = 1
    const kittyLoop = (i) => {
      if (i > totalKitty) {
        console.log(`===== Done syncing kitties!`)
        return ('done')
      }

      ck.core.methods.getKitty(i).call().then((error,kitty) => {
        if (error) { return (error) }

        // log a chunk of our progress
        if (COUNT == 25) {
          console.log(`=== Synced kitties to ${i} (${Math.round(i/totalKitty*100)}% complete)`)
          COUNT = 0
          OLDI = i
        }

        saveKitty(i, kitty)

        setTimeout(() => {
          kittyLoop(i+1)
        }, throttle);

      })
    }
    kittyLoop(1)
  })
}

export default syncKitties
