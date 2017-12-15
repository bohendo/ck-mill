import ck from './ck/'

// When this function returns, it will be executed again after a short delay
const heartbeat = (n) => {
  ck.core.totalSupply((err, max) => {
    console.log(`There are ${max} cryptokitties in the world`)
    var now = new Date().getTime()/1000
    const kittyLoop = (i) => {
      // Print something helpful
      if (i > 0 && i % 10 === 0) {
        let then = now
        now = new Date().getTime()/1000
        console.log(`Got kitties ${i-10}-${i} in ${now-then} seconds`)
      }
      // Stop once we get to the last kitty
      if (i > max) { return 'Done' } // replace artificial cap w max

      let kitty = getKitty(i)

      kittyLoop(i+1)

    }
    kittyLoop(0)
    console.log('loop skipped')
  })
}

const getKitty = (id) => {

  let k = ck.core.getKitty.call(id)

  const kitty = {
    id: id,
    isGestating: k[0],
    isReady: k[1],
    cooldownIndex: k[4],
    nextActionAt: k[3],
    siringWithId: k[5],
    birthTime: k[2],
    matronId: k[6],
    sireId: k[7],
    generation: k[8],
    genes: k[9],
  }

  let sale = ck.sale.getAuction.call(id)
  if (sale[0] !== '0x') {
    kitty.forSale = true
    kitty.forSire = false
    kitty.startPrice = sale[1]
    kitty.endPrice = sale[2]
    kitty.duration = sale[3]
    kitty.startedAt = sale[4]
    kitty.currentPrice = ck.sale.getCurrentPrice.call(id)
    return (kitty)
  }

  let sire = ck.sire.getAuction.call(id)
  if (sire[0] !== '0x') {
    kitty.forSale = false
    kitty.forSire = true
    kitty.startPrice = sire[1]
    kitty.endPrice = sire[2]
    kitty.duration = sire[3]
    kitty.startedAt = sire[4]
    kitty.currentPrice = ck.sire.getCurrentPrice.call(id)
    return (kitty)
  }

  kitty.forSale = false
  kitty.forSire = false
  kitty.startPrice = null
  kitty.endPrice = null
  kitty.duration = null
  kitty.startedAt = null
  kitty.currentPrice = null
  return kitty
}

// Ensure this geth node never exits,
// it should sync repeatedly instead
(function stayalive(n, interval, fn) {
  let now = new Date().getTime()/1000

  heartbeat(n)

  let then = now
  now = new Date().getTime()/1000
  console.log(`heartbeat ${n} finished in ${now-then} seconds`)
  admin.sleep(interval)
  stayalive(n+1, interval, fn)
}(1, 10, heartbeat))

/*
const syncKitties = () => {
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
        console.log(q)
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
          console.log(q)
        }).catch(console.error)

      // Can't get sire data? Kitty must not be up for sale OR sire
      }).catch(() => {
        q += `forsale=false, forsire=false, `
        q += `startprice=NULL, endprice=NULL, `
        q += `duration=NULL, startedat=NULL, `
        q += `currentprice=NULL, `
        q += `lastsynced=to_timestamp(${Math.round(new Date().getTime()/1000)}) WHERE id=${id};`
        console.log(q)
      })
    })

  // Couldn't get kitty data? That's not something we can recover from
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
*/

/*

    // SECOND indentation: Try to get sale data or error & try getting sire data
    return ck.sale.getAuction(id, (err, sale) => {
      if (err) {

      } else {
        q += `true, false, ` // forSale, forSire
        q += `${sale.startingPrice}, `
        q += `${sale.endingPrice}, `
        q += `${sale.duration}, `
        q += `to_timestamp(${sale.startedAt}), `
        return ck.sale.methods.getCurrentPrice(id).call().then((price) => {
          q += `${price}, `
          q += `to_timestamp(${Math.round(new Date().getTime()/1000)}));`
          console.log(q)
        })
      }

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
        }).catch(console.error)

      // Can't get sire data? Kitty must not be up for sale OR sire
      }).catch(() => {
        q += `false, false, ` // forSale, forSire
        q += `NULL, NULL, NULL, NULL, NULL, `
        q += `to_timestamp(${Math.round(new Date().getTime()/1000)}));`
        console.log(q)
      })
    })

  })
}
*/
