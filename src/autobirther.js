import { web3, core, sale, sire } from './eth/web3'

const handleBirth = (error, birth) => {
  if (error) {
    console.error(error)
    return (1)
  }

  console.log(`handling birth from block ${birth.blockNumber}...`)

  var dup = false
  for (let i=0; i<birthed.length; i++) {
    // if this is the most recent birth for this kitty...
    if (birthed[i].kittyId === Number(birth.args.kittyId)) {
      console.log(`dup kitty birth for ${birthed[i].kittyId}!`)
      dup = true
      if(birthed[i].block < Number(births.blockNumber)) {
        birthed[i].block = Number(births.blockNumber)
      }
      break
    }
  }
  if (!dup) {
    console.log(`new kitty birth for ${birth.args.kittyId}!`)
    birthed.push({
      kittyId: Number(birth.args.kittyId),
      block: Number(birth.blockNumber),
    })
  }

  for (let i=0; i<preg.length; i++) {
    if (preg[i].kittyId === Number(birth.args.kittyId) && Number(birth.blockNumber) > preg[i].end) {
      console.log(`Removing old pregnancy`)
      preg.splice(i, 1) // removes 1 element from array at position i
    }
  }
  console.log(`Done handling birth for ${birth.args.kittyId} from block ${birth.blockNumber}`)
  return (0)
}

const handlePregnancy = (error, pregnancy) => {
  if (error) {
    console.error(error)
    return (1)
  }

  console.log(`handling pregnancy ${JSON.stringify(pregnancy.args)} from block ${pregnancy.blockNumber}...`)

  // don't record this pregnancy if this kitty has already given birth
  for (let i=0; i<birthed.length; i++) {
    if (birthed[i].kittyId === Number(pregnancy.args.matronId)) {
      if (birthed[i].block > Number(pregnancy.args.cooldownEndBlock)) {
        console.log(`Not recording pregnancy, kitty ${pregnancy.args.matronId} already gave birth`)
        return (0)
      }
    }
  }

  // don't record this pregnancy if it's older than one we already have
  var dup = false
  for (let i=0; i<preg.length; i++) {
    if (preg[i].kittyId === Number(pregnancy.args.matronId)) {
      console.log(`dup pregnancy detected for kitty ${pregnancy.args.matronId}`)
      dup = true
      if (preg[i].end < Number(pregnancy.blockNumber)) {
        preg[i].start = Number(pregnancy.blockNumber)
        preg[i].end = Number(pregnancy.args.cooldownEndBlock)
      }
      break
    }
  }

  if (!dup) {
    console.log(`new pregnancy detected for kitty ${pregnancy.args.matronId}`)
    preg.push({
      kittyId: Number(pregnancy.args.matronId),
      start: Number(pregnancy.blockNumber),
      end: Number(pregnancy.args.cooldownEndBlock)
    })
  }
  console.log(`Done handling pregnancy for ${pregnancy.args.matronId} from block ${pregnancy.blockNumber}`)
  return (0)
}


const toBlock = eth.getBlock('latest').number
const fromBlock = toBlock - (4*60*24) // No need to look more than a week into the past

// listen for current/future events
//core.Pregnant(handlePregnancy)
//core.Birth(handleBirth)

// search for past events
//core.Pregnant({ fromBlock, toBlock }, handlePregnancy)
//core.Birth({ fromBlock, toBlock }, handleBirth)

