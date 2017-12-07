import { web3, ck } from '../ethereum/'
import db from '../db/'

const getKitty = (id) => {
  return db.query(`SELECT * FROM kitties WHERE id = ${parseInt(id)};`).then(res=>{
    if (res.rowCount !== 0) {
      console.log('Already saved this kitty')
      return (res.rows[0])
    } else {
      console.log('Have not saved this kitty')
      return fetchKitty(id).then(kitty=>{
        console.log(`Saving kitty: ${JSON.stringify(kitty, null, 2)}`)
        saveKitty(kitty).then(()=>{
          return (kitty)
        })
      })

    }
  }).catch(console.error)
}

const saveKitty = (k) => {
  return db.query(`INSERT INTO kitties VALUES (
    ${k.id}, ${k.isGestating}, ${k.isReady},
    to_timestamp(${k.birthTime}), to_timestamp(${k.nextActionAt}),
    ${k.cooldownIndex}, ${k.siringWithId}, ${k.matronId},
    ${k.sireId}, ${k.generation}, ${k.genes},
    ${k.forSale}, ${k.forSire}, ${k.currentPrice},
    ${k.startPrice}, ${k.endPrice}, ${k.duration},
    to_timestamp(${k.startedAt}), to_timestamp(${k.lastSynced}) );`
  ).then(res=>{
    console.log(`Successfully saved kitty: ${JSON.stringify(res)}`)
    return 'Success'
  }).catch(err=>{
    console.error(`Error saving kitty: ${err}`)
    return 'Error'
  })
}


const fetchKitty = (id) => {
  // We'll use these to store data across several scopes below
  var k = { id }
  var sale, sire

  // First: Get kitty data
  return ck.core.methods.getKitty(id).call().then(kitty=>{
    // Copy all kitty properties (skip fake-array indexed data)
    for (let prop in kitty) {
      if (isNaN(parseInt(prop))) {
        // genes is a huge number, keep that as a string
        // but other numbers should be numbers, not strings
        if (prop !== 'genes' && !isNaN(parseInt(kitty[prop]))) {
          k[prop] = parseInt(kitty[prop])
        } else {
          k[prop] = kitty[prop]
        }
      }
    }

    k.birthTime = k.birthTime*1000
    k.nextActionAt = k.nextActionAt*1000
    return ck.sale.methods.getAuction(id).call()

  // Can't get kitty data? That's a problem, exit & try again
  }).catch(err=>{
    console.error(err)
    process.exit(1)

  // Second: Get sale data (from prev return)
  }).then(s=>{
    sale = s // make this var available in other scopes
    return ck.sale.methods.getCurrentPrice(id).call()

  // If we get sale data, then add it to this kitty & we're DONE!
  }).then(price=>{
    console.log('GOT SALE DATA')
    k.forSale = true
    k.forSire = false
    k.currentPrice = price
    k.startPrice = sale.startingPrice
    k.endPrice = sale.endingPrice
    k.duration = sale.duration
    k.startedAt = sale.startedAt * 1000
    k.lastSynced = new Date().getTime()
    console.log('RETURNING SALE DATA')
    return (k)

  // Can't get sale data? Kitty must not be up for sale. Get sire data instead
  }).catch(()=>{
    return ck.sire.methods.getAuction(id).call().then(s=>{
      sire = s // make this var available in other scopes
      return ck.sire.methods.getCurrentPrice(id).call()

    // If we get sire data, then add it to this kitty & we're DONE!
    }).then(price=>{
      console.log('GOT SIRE DATA')
      k.forSale = false
      k.forSire = true
      k.currentPrice = price
      k.startPrice = sale.startingPrice
      k.endPrice = sale.endingPrice
      k.duration = sale.duration
      k.startedAt = sale.startedAt * 1000
      k.lastSynced = new Date().getTime()
      console.log('RETURNING SIRE DATA')
      return (k)

    // Can't get sire data? Kitty must not be up for sale OR sire
    // Fill in gaps w NULL and return
    }).catch(()=>{
      k.forSale = false
      k.forSire = false
      k.currentPrice = null
      k.startPrice = null
      k.endPrice = null
      k.duration = null
      k.startedAt = null
      k.lastSynced = new Date().getTime()
      return (k)
    })
  })
}

export { getKitty }
