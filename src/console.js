import { web3, core, sale, sire } from './eth/web3'
import db from './db'

import { breed } from './util/breed'
import { ls } from './util/ls'

console.log('ckmill console is loaded!')

// TODO: don't hardcode my kitties...
// bg1 for gen 1 breeding group
const bg0 = [25493, 403350]
const bg1 = [3954, 85736, 113881, 117491, 228842, 418037]
const bg2 = [258963, 279505, 282323, 344576, 345869, 375866, 381126, 382851, 382857, 392928]

const sellKitty = (id, milli) => {
  personal.unlockAccount(web3.eth.accounts[0])
  core.createSaleAuction.sendTransaction(
    id,
    web3.toWei(milli,'milli'),
    0,
    129600,
    {
      from: web3.eth.accounts[0],
      to: core.address,
      value: 0,
      gas: 250000,
    },
    (error, txhash) => {
      if (error) {
        console.error(JSON.stringify(error, null, 2))
      } else {
        console.log(JSON.stringify(web3.eth.getTransaction(txhash), null, 2))
      }
    }
  )
  personal.lockAccount(web3.eth.accounts[0]) // don't accidently sell twice!
  return status()
}

// Helpful function for getting all kitty data
const getKitty = (id) => {

  let out = core.getKitty.call(id)

  const kitty = {
    id: id,
    isGestating: out[0],
    isReady: out[1],
    cooldownIndex: out[2],
    nextActionAt: out[3],
    siringWithId: out[4],
    birthTime: out[5],
    matronId: out[6],
    sireId: out[7],
    generation: out[8],
    genes: out[9],
    owner: core.ownerOf.call(id)
  }

  out = sale.getAuction.call(id)
  if (out[0] !== '0x') {
    kitty.forSale = true
    kitty.forSire = false
    kitty.startPrice = out[1]
    kitty.endPrice = out[2]
    kitty.duration = out[3]
    kitty.startedAt = out[4]
    kitty.currentPrice = sale.getCurrentPrice.call(id)
    return (kitty)
  }

  out = sire.getAuction.call(id)
  if (out[0] !== '0x') {
    kitty.forSale = false
    kitty.forSire = true
    kitty.startPrice = out[1]
    kitty.endPrice = out[2]
    kitty.duration = out[3]
    kitty.startedAt = out[4]
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

const log = (a,b,c,d,e) => {
  if (a) console.log(JSON.stringify(a,null,2))
  if (b) console.log(JSON.stringify(b,null,2))
  if (c) console.log(JSON.stringify(c,null,2))
  if (d) console.log(JSON.stringify(d,null,2))
  if (e) console.log(JSON.stringify(e,null,2))
}

const from = (f) => { return ({ fromBlock: f, toBlock: f }) }

const ck = { web3, db, core, sale, sire, breed, ls, bg0, bg1, bg2, from, log }

export default ck
