import { web3, ck } from './ethereum/'
import db from './db/'

console.log(JSON.stringify(process.env, null, 2))
web3.eth.getBlock('latest', console.log)

const printQuery = true

const syncKitties = () => {
  db.query(`SELECT id FROM kitties order by id;`).then(res=>{
    const ids = res.rows.map(r=>r.id)
    ck.core.methods.totalSupply().call().then(max => {
      var now = new Date().getTime()/1000
      var prev = 0
      (function kittyLoop(i) {
        // Print something helpful
        if (i % 100 === 0) {
          let then = now
          now = new Date().getTime()/1000
          console.log(`Synced kitties ${prev}-${i} in ${now-then} seconds`)
        }
        // Stop once we get to the last kitty
        if (i > max) { return 'Done' } // replace artificial cap w max
        // Skip any kitties we already downloaded
        if (ids.includes(i)) {
          updateKitty(i).then(()=>{
            kittyLoop(i+1)
          }).catch(console.error)
          // give node a chance to clear the call stack otherwise it'll overflow
          // setTimeout(()=>{ kittyLoop(i+1) }, 0)
        } else {
          saveKitty(i).then(()=>{
            kittyLoop(i+1)
          }).catch(console.error)
        }
      })(0)
    }).catch(console.error)
  }).catch(console.error)
}
syncKitties()


// Activate event listeners
web3.eth.getBlock('latest').then(res => {
  console.log(`Starting event watchers from block ${res.number}`)
  ck.core.events.Birth({ fromBlock: res.number }, (err, res)=>{
    saveKitty(res.returnValues.kittyId)
  })
  ck.core.events.Pregnant({ fromBlock: res.number }, (err, res)=>{
    updateKitty(res.returnValues.matronId)
    updateKitty(res.returnValues.sireId)
  })
  ck.sale.events.allEvents({ fromBlock: res.number }, (err, res)=>{
    updateKitty(res.returnValues.tokenId)
  })
  ck.sire.events.allEvents({ fromBlock: res.number }, (err, res)=>{
    updateKitty(res.returnValues.tokenId)
  })
})


const updateKitty = (id) => {
  // q for query, we'll use this to accumulate data across several scopes below
  let q = `UPDATE kitties SET `

  // FIRST indentation: Get kitty data or die trying
  return ck.core.methods.getKitty(id).call().then((kitty) => {
    q += `isgestating=${kitty.isGestating}, `
    q += `isready=${kitty.isReady}, `
    q += `nextactionat=to_timestamp(${kitty.nextActionAt}), `
    q += `cooldownindex=${kitty.cooldownIndex}, `
    q += `siringwithid=${kitty.siringWithId}, `

    // SECOND indentation: Try to get sale data or error & try getting sire data
    return ck.sale.methods.getAuction(id).call().then((sale) => {
      q += `forsale=false, forsire=false, `
      q += `startprice=${sale.startingPrice}, `
      q += `endprice=${sale.endingPrice}, `
      q += `duration=${sale.duration}, `
      q += `startedat=to_timestamp(${sale.startedAt}), `
      return ck.sale.methods.getCurrentPrice(id).call().then((price) => {
        q += `currentprice=${price}, `
        q += `lastsynced=to_timestamp(${Math.round(new Date().getTime()/1000)}) WHERE id=${id};`
        if (printQuery) { console.log(q) }
        return db.query(q).catch(console.error)
      }).catch(console.error)

    }).catch(() => {

      // THIRD indentation: Get sire data or error & submit query w NULL for sale/sire data
      return ck.sire.methods.getAuction(id).call().then((sire) => {
        q += `forsale=false, forsire=false, `
        q += `startprice=${sire.startingPrice}, `
        q += `endprice=${sire.endingPrice}, `
        q += `duration=${sire.duration}, `
        q += `startedat=to_timestamp(${sire.startedAt}), `
        return ck.sire.methods.getCurrentPrice(id).call().then((price) => {
          q += `currentprice=${price}, `
          q += `lastsynced=to_timestamp(${Math.round(new Date().getTime()/1000)}) WHERE id=${id};`
          if (printQuery) { console.log(q) }
          return db.query(q).catch(console.error)
        }).catch(console.error)

      // Can't get sire data? Kitty must not be up for sale OR sire
      }).catch(() => {
        q += `forsale=false, forsire=false, `
        q += `startprice=NULL, endprice=NULL, `
        q += `duration=NULL, startedat=NULL, `
        q += `currentprice=NULL, `
        q += `lastsynced=to_timestamp(${Math.round(new Date().getTime()/1000)}) WHERE id=${id};`
        if (printQuery) { console.log(q) }
        return db.query(q).catch(console.error)
      })
    })

  // Couldn't get kitty data? That's not something we can recover from
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })
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
        if (printQuery) { console.log(q) }
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
          if (printQuery) { console.log(q) }
          return db.query(q).catch(console.error)
        }).catch(console.error)

      // Can't get sire data? Kitty must not be up for sale OR sire
      }).catch(() => {
        q += `false, false, ` // forSale, forSire
        q += `NULL, NULL, NULL, NULL, NULL, `
        q += `to_timestamp(${Math.round(new Date().getTime()/1000)}));`
        if (printQuery) { console.log(q) }
        return db.query(q).catch(console.error)
      })
    })

  // Couldn't get kitty data? That's not something we can recover from
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
