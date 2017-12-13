import { web3, ck } from './ethereum/'
import db from './db/'

const printQuery = true

////////////////////////////////////////
// Magic Numbers
// bg for breeding groups, defines which groups of cats should be bred together
const bgA = [228824, 117491] 
const bgB = [113881, 85736, 3954]


const breedGroup = (bg) => {

  const sanityChecks = []
  bg.forEach(kid=>{
    sanityChecks.push(ck.core.methods.getKitty(kid).call()),
    sanityChecks.push(ck.core.methods.ownerOf(kid).call())
  })

  Promise.all(sanityChecks).then(values=>{

    console.log(JSON.stringify(values, null, 2))
    for (let i=0; i<values.length; i+=2) {
      console.log(`Owner: ${values[i+1]}`)
    }

    // sanity check: is process.env.ETH_ADDRESS the owner of all kitties?
    

    // sanity check: can all kitties within a breeding group breed w each other?

    // Are any kitties within either breeding group ready to breed w each other?

    // Listen for birth events

    // console.log(JSON.stringify(values))

  })
}

breedGroup(bgA)


/*
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
})
*/
