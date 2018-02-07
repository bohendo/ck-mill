import fs from 'fs'
import { web3, Autobirther } from './web3'

const unlock = () => {
  return web3.eth.getAccounts().then(accounts=>{
    return web3.eth.personal.unlockAccount(
      accounts[0],
      fs.readFileSync('/run/secrets/autobirther', { encoding: 'utf8' })
    )
  })
}

// lodd for List Of Due Dates
const executioner = (lodd, tx) => {

  var tx
  if (lodd.length === 1) {
    tx = Autobirther.methods.breed1(lodd[0].kittyid, lodd[0].blockn).send(tx)

  } else if (lodd.length === 2) {
    tx = Autobirther.methods.breed2(lodd[0].kittyid, lodd[0].blockn,
                                    lodd[1].kittyid, lodd[1].blockn).send(tx)

  } else if (lodd.length === 3) {
    tx = Autobirther.methods.breed3(lodd[0].kittyid, lodd[0].blockn,
                                    lodd[1].kittyid, lodd[1].blockn,
                                    lodd[2].kittyid, lodd[2].blockn).send(tx)

  } else if (lodd.length === 4) {
    tx = Autobirther.methods.breed4(lodd[0].kittyid, lodd[0].blockn,
                                    lodd[1].kittyid, lodd[1].blockn,
                                    lodd[2].kittyid, lodd[2].blockn,
                                    lodd[3].kittyid, lodd[3].blockn).send(tx)

  } else if (lodd.length === 5) {
    tx = Autobirther.methods.breed5(lodd[0].kittyid, lodd[0].blockn,
                                    lodd[1].kittyid, lodd[1].blockn,
                                    lodd[2].kittyid, lodd[2].blockn,
                                    lodd[3].kittyid, lodd[3].blockn,
                                    lodd[4].kittyid, lodd[4].blockn).send(tx)
  } else {
    tx = Autobirther.methods.breedMore(lodd.map(dd=>dd.kittyid)).send(tx)
  }

  // What have we done? Log it so the user knows
  tx
  .on('transactionHash', (transactionHash) => {
    // log sent transaction
    console.log(`${new Date().toISOString()} Sent tx ${transactionHash}`)
  })

  .on('receipt', (receipt) => {
    let earn = 0
    if (receipt.events["1"]) earn += 8000
    if (receipt.events["3"]) earn += 8000 
    if (receipt.events["5"]) earn += 8000 
    // log confirmed transaction
    console.log(`${new Date().toISOString()} Conf tx ${receipt.transactionHash}
                     on block ${receipt.blockNumber}. Spent ${Math.round(Number(receipt.gasUsed)*Number(gasPrice)/1000000000000)} uETH to earn ${earn} uETH`)
  })

}

// lodd for List Of Due Dates
const autobirth = (lodd) => {

  var tx = { gasPrice: "50000000000" }

  // get our from address
  return web3.eth.getAccounts().then(accounts=>{ tx.from = accounts[0]

    // unlock our account
    return unlock()
  }).then(res=>{

    // if we unlocked our account then execute our autobirther method & log the output
    if (res) executioner(lodd, tx)

  })

}

export { Autobirther, AutobirtherData, autobirth }
