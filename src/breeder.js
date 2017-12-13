import fs from 'fs'
import { web3, ck, mn } from './ethereum/'

////////////////////////////////////////
// Magic Numbers
const secret = fs.readFileSync('/run/secrets/geth', 'utf8')
// bg for breeding groups, defines which groups of cats should be bred together
const bgA = [228842, 117491] 
const bgB = [113881, 85736, 3954]



const breeder = (bgA, bgB) => {

  console.log(`Breeder started w bgA=${bgA} and bgB=${bgB}`)

  setInterval(()=>{
    web3.eth.syncing().then(syncing=>{
      if (syncing) {
        console.log(`Waiting for eth provider to finish syncing... ${JSON.stringify(syncing)}`)
        return (0);
      }
      console.log(`We're synced with the network ${JSON.stringify(syncing)}`)
      // breedGroup(bgA)
      // breedGroup(bgB)
    })

  }, 60*1000)

}

breeder(bgA, bgB)


const breedGroup = (bg) => {

  const ownerChecks = []
  bg.forEach(kid=>{
    ownerChecks.push(ck.core.methods.ownerOf(kid).call())
  })

  Promise.all(ownerChecks).then(owners=>{
    // console.log(JSON.stringify(values, null, 2))

    for (let i=0; i<owners.length; i++) {
      if (mn.from !== owners[i]) {
        console.error(`Sanity check failure: You can't breed kitties you don't own:`)
        console.error(`Your address: ${mn.from} does not match owner of ${bg[i]} (${owners[i]})`)
        process.exit(1)
      }
    }

    // Compare all unique kitty breeding permutations, are ANY of these kitties related?
    // This loop just builds an array of promises
    const canBreedChecks = []
    for (let i=0; i<bg.length; i++) {
      for (let j=i+1; j<bg.length; j++) {
        canBreedChecks.push(ck.core.methods.canBreedWith(bg[i], bg[j]).call())
      }
    }

    return Promise.all(canBreedChecks)

  }).then(res=>{

    // Check each of our kitty breeding combos & abort if any kitties in this group can't breed
    for (let i=0; i<res.length; i++) {
      if (!res[i]) {
        console.error(`Sanity check failure: This breeding group is not completely unrelated`)
        process.exit(1)
      }
    }
    // The given breeding group is valid, we're ready to start breeding!

    const kittyPromises = []
    bg.forEach(kid=>{
      kittyPromises.push(ck.core.methods.getKitty(kid).call())
    })
    return Promise.all(kittyPromises)

  }).then(kitties=>{

    console.log('Sanity Checks passed, ready to breed!')

    // get list of all kitties in this breeding group who are ready to breed
    const areReady = []
    for (let i=0; i<kitties.length; i++) {
      if (kitties[i].isReady) {
        kitties[i].id = bg[i]
        areReady.push(kitties[i])
      }
    }
    // sort so quick-cooldown cats are bred first
    areReady.sort((a,b) => a.cooldownIndex-b.cooldownIndex)

    if (areReady.length < 2) {
      console.log('Not enough kitties are ready.. exiting')
      return (false)
    }

    console.log(`Breeding kitties ${areReady[0].id} and ${areReady[1].id}...`)
    return ck.core.methods.autoBirthFee().call().then(fee=>{
      console.log(`Breeding w fee ${fee}`)

      return web3.eth.personal.unlockAccount(mn.from, secret, 5).then(()=> {
        console.log(`Account is unlocked & ready to go!`)
        // return ck.core.methods.breedWithAuto(areReady[0].id, areReady[1].id).send({ from: mn.from, value: fee })
      })
    }).catch(console.error)

  }).then(receipt=>{

    console.log(`Successful breeding: ${JSON.stringify(receipt, null, 2)}`)

  }).catch(console.error)
}


