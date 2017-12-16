import { core, sale, sire } from './ck/'

const myKitties = [291628, 282323, 279505, 258963, 228842, 117491, 113881, 85736, 25856, 25493, 24111, 3954]
const fromBlock = 4605167
const bg = {
  A: [228842, 117491],
  B: [113881, 85736, 3954],
}

const breedGroup = (lok) => {
  let ready = []
  for (let i=0; i<lok.length; i++) {
    // Do you own this kitty?
    if (eth.accounts[0] !== core.ownerOf(lok[i])) {
      return(`Error: you don't own kitty ${lok[i]}`)
    }
    if (core.getKitty(lok[i])[1]) {
      ready.push(lok[i])
    }
    // Can this kitty breed with the others in the group?
    for (let j=i+1; j<lok.length; j++) {
      if (!core.canBreedWith(lok[i], lok[j])) {
        return(`Error: kitty ${lok[i]} and kitty ${lok[j]} can't breed`)
      }
    }
  }

  const kitties = []
  for (let i=0; i<ready.length; i++) {
    kitties.push(core.getKitty(ready[i]))
  }

  kitties.sort((a,b)=>a[2]-b[2])

  console.log(`Confirm siring kitty ${ready[1]} (gen=${kitties[1][8]},cdi=${kitties[1][2]}) with matron kitty ${ready[0]} (gen=${kitties[0][8]},cdi=${kitties[0][2]})`)

  // (matron, sire)
  const tx = {
    from: eth.accounts[0],
    to: core.address,
    value: core.autoBirthFee(),
    gas: 150000,
    gasPrice: eth.gasPrice * 0.9,
    data: core.breedWithAuto.getData(ready[0], ready[1]),
  }
  console.log(JSON.stringify(tx, null, 2))
  personal.unlockAccount(eth.accounts[0])
  var txhash = eth.sendTransaction(tx)
  personal.lockAccount(eth.accounts[0])
  return eth.getTransaction(txhash)
}


const status = () => {
  if (eth.syncing) {
    return `On block ${eth.syncing.currentBlock} (latest is ${eth.syncing.highestBlock-eth.syncing.currentBlock} blocks ahead)`
  } else {
    return `On block ${eth.blockNumber} (we're up to date!)`
  }
}

const sellKitty = (id, milli) => {
  personal.unlockAccount(eth.accounts[0])
  core.createSaleAuction.sendTransaction(
    id,
    web3.toWei(milli,'milli'),
    0,
    129600,
    {
      from: eth.accounts[0],
      to: core.address,
      value: 0,
      gas: 250000,
    },
    (error, txhash) => {
      if (error) {
        console.error(JSON.stringify(error, null, 2))
      } else {
        console.log(JSON.stringify(eth.getTransaction(txhash), null, 2))
      }
    }
  )
  personal.lockAccount(eth.accounts[0]) // don't accidently sell twice!
  return status()
}

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

 export { core, sale, sire, fromBlock, getKitty, getMyKitties, myKitties, sellKitty, status, bg, breedGroup }
