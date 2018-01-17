import { web3, core, sale, sire } from '../eth/web3'
import db from '../db'

const addr = (process.env.ETH_ADDRESS) ? Promise.resolve(process.env.ETH_ADDRESS) : web3.eth.getAccounts()

// re-implementation of core's canBreedWith method to avoid blockchain call
// https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#code
const canBreed = (m, s) => { // m for matron, s for sire
  if (
    // kitty can't breed w itself
    m.kittyid === s.kittyid || 
    // kitties can't breed w their parents
    m.kittyid === s.matronid || m.kittyid === s.sireid ||
    s.kittyid === m.matronid || s.kittyid === m.sireid ||
    // both kitties need to be well rested
    !m.isready || !s.isready
  ) {
    return (false)
  }

  if (m.kittyid === 0 || s.kittyid === 0) {
    return (true)
  }

  if (m.matronid === s.matronid || m.sireid === s.sireid ||
      s.matronid === m.sireid || s.sireid === m.matronid) {
    return (false)
  }

  return (true)
}


// lok for List of Kitty ids
// lok = [435843, 428593, 250842]
const findBreedingPair = (lok) => {

  // this will store a list of promises
  let p = []

  // Get all our kitty data from our list of kitty ids
  const kittyPromises = []
  for (let i=0; i<lok.length; i++) {
    kittyPromises.push(db.query(`select * from kitties where kittyid = ${lok[i]};`))
  }

  Promise.all(kittyPromises).then(res=>{
    const kitties = res.map(r=>r.rows[0])

    // bps for Breeding PairS
    let bps = []

    // compile a list of all valid mating pairs
    for (let i=0; i<kitties.length; i++) {
      for (let j=i+1; j<kitties.length; j++) {
        if (canBreed(kitties[i], kitties[j])) {
          if (kitties[i].cooldownIndex > kitties[j].cooldownIndex) {
            bps.push([j, i]) // lower cooldown comes first
          } else {
            bps.push([i, j])
          }
        }
      }
    }

    // breed the slowest sire with the fastest matron
    bps.sort((a,b)=>{
      // da for Delta A or cooldown difference in pair a
      let da = Math.abs(kitties[a[0]].cooldownindex-kitties[a[1]].cooldownindex)
      let db = Math.abs(kitties[b[0]].cooldownindex-kitties[b[1]].cooldownindex)
      // return -1 if a should come before b
      return db-da // sort so greatest differences are in front
    })

    // get list of recommended breedings
    // no recommendations should be mutually exclusive
    const output = []
    while (bps.length) {
      output.push([lok[bps[0][0]], lok[bps[0][1]]])
      bps = bps.filter((pair)=>{
        for (let p=0; p<output.length; p++) {
          if (lok[pair[0]] === output[p][0] || lok[pair[0]] === output[p][1] ||
              lok[pair[1]] === output[p][0] || lok[pair[1]] === output[p][1]) {
            return (false)
          }
        }
        return (true)
      })
    }

    return (output)
  })
}

const breedGroup = (lok) => {
/*
  let ready = []
  addr.then(a=>{
    for (let i=0; i<lok.length; i++) {

      // Do you own this kitty?
      if (a !== core.ownerOf(lok[i])) {
        return(`Error: you don't own kitty ${lok[i]}`)
      }

    }
    if (ready.length < 2) {
      return (`Error: not enough kitties are ready`)
    }

    console.log(`Kitties ready to breed: ${JSON.stringify(ready)}`)
  })

  const kitties = []
  for (let i=0; i<ready.length; i++) {
    kitties.push(core.getKitty(ready[i]))
  }

  kitties.sort((a,b)=>a[2]-b[2])

  console.log(`Confirm siring kitty ${ready[1]} (gen=${kitties[1][8]},cdi=${kitties[1][2]}) with matron kitty ${ready[0]} (gen=${kitties[0][8]},cdi=${kitties[0][2]})`)

  // (matron, sire)
  const tx = {
    from: web3.eth.accounts[0],
    to: core.address,
    value: core.autoBirthFee(),
    gas: 150000,
    gasPrice: web3.eth.gasPrice * 0.9,
    data: core.breedWithAuto.getData(ready[0], ready[1]),
  }
  console.log(JSON.stringify(tx, null, 2))
  personal.unlockAccount(web3.eth.accounts[0])
  var txhash = web3.eth.sendTransaction(tx)
  personal.lockAccount(web3.eth.accounts[0])
  return web3.eth.getTransaction(txhash)

*/
}

const breed = (lok) => {
  return (breedGroup(findBreedingPair(lok)[0]))
}

export { breed }
