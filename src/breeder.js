import { web3, ck } from './ethereum/'
import db from './db/'

const printQuery = true

// bp for breeding pair, define which groups of cats should be bred together
const bpA = [228824, 117491] 
const bpB = [113881, 85736, 3954]

Promise.all([
  ck.core.methods.getKitty(bpA[0]).call(),
  ck.core.methods.getKitty(bpA[1]).call(),
  ck.core.methods.getKitty(bpB[0]).call(),
  ck.core.methods.getKitty(bpB[1]).call(),
  ck.core.methods.getKitty(bpB[2]).call(),
]).then(values=>{

  console.log(JSON.stringify(values))

})


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
