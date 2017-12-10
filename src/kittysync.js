import { web3, ck } from './ethereum/'
import db from './db/'

const syncKitties = () => {

  db.query(`SELECT id FROM kitties order by id;`).then(res=>{
    const ids = res.rows.map(r=>r.id)
    ck.core.methods.totalSupply().call().then(max => {

      (function kittyLoop(i) {
        // Stop once we get to the last kitty
        if (i > max) { return 'Done' } // replace artificial cap w max
        // Skip any kitties we already downloaded
        if (ids.includes(i)) {
          kittyLoop(i+1)
        } else {
          saveKitty(i).then(()=>{
            kittyLoop(i+1)
          }).catch(console.error)
        }
      })(0)

    }).catch(console.error)
  }).catch(console.error)
}

const saveKitty = (id) => {
  // q for query, we'll use this to accumulate data across several scopes below
  let q = `INSERT INTO kitties VALUES (${id}, `

  // FIRST indentation: Get kitty data or die trying
  return ck.core.methods.getKitty(id).call().then((kitty) => {
    q += `${kitty.isGestating}, `
    q += `${kitty.isReady}, `
    q += `to_timestamp(${kitty.birthTime}), `
    q += `to_timestamp(${kitty.nextActionAt}), `
    q += `${kitty.cooldownIndex}, `
    q += `${kitty.siringWithId}, `
    q += `${kitty.matronId}, `
    q += `${kitty.sireId}, `
    q += `${kitty.generation}, `
    q += `${kitty.genes}, `

    // SECOND indentation: Try to get sale data or error & try getting sire data
    return ck.sale.methods.getAuction(id).call().then((sale) => {
      q += `true, false, ` // forSale, forSire
      q += `${sale.startingPrice}, `
      q += `${sale.endingPrice}, `
      q += `${sale.duration}, `
      q += `to_timestamp(${sale.startedAt}), `
      return ck.sale.methods.getCurrentPrice(id).call().then((price) => {
        q += `${price}, `
        q += `to_timestamp(${Math.round(new Date().getTime()/1000)}));`
        console.log(q)
        return db.query(q).catch(console.error)
      }).catch(console.error)

    }).catch(() => {

      // THIRD indentation: Get sire data or error & submit query w NULL for sale/sire data
      return ck.sire.methods.getAuction(id).call().then((sire) => {
        q += `false, true, ` // forSale, forSire
        q += `${sire.startingPrice}, `
        q += `${sire.endingPrice}, `
        q += `${sire.duration}, `
        q += `to_timestamp(${sire.startedAt}), `
        return ck.sire.methods.getCurrentPrice(id).call().then((price) => {
          q += `${price}, `
          q += `to_timestamp(${Math.round(new Date().getTime()/1000)}));`
          console.log(q)
          return db.query(q).catch(console.error)
        }).catch(console.error)

      // Can't get sire data? Kitty must not be up for sale OR sire
      }).catch(() => {
        q += `false, false, ` // forSale, forSire
        q += `NULL, NULL, NULL, NULL, NULL, `
        q += `to_timestamp(${Math.round(new Date().getTime()/1000)}));`
        console.log(q)
        return db.query(q)
      })
    })

  // Couldn't get kitty data? That's not something we can recover from
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
syncKitties()
