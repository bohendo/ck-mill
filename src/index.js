import { core, sale, sire } from './ck/'

const myGen0 = [25493]
const myGen1 = [228842, 117491, 113881, 85736, 3954]
const myKitties = [291628, 282323, 279505, 258963, 228842, 117491, 113881, 85736, 25856, 25493, 24111, 3954]

const fromBlock = 4605167

const getMyKitties = (addr) => {
  const myKitties = []
  let max = core.totalSupply.call()
  for (let i=0; i<max; i++) {
    if (i > 0 && i % 100 === 0) {
      console.log(`Looking for your kitties around block ${i}`)
    }
    if (addr === core.ownerOf(i)) {
      myKitties.push(i)
    }
  }
  return myKitties
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

export { core, sale, sire, fromBlock, getKitty, getMyKitties, myKitties }
