
import { web3 } from './web3'

import AutobirtherData from '../../build/contracts/Autobirther'

import fs from 'fs'

// const Autobirther = AutobirtherData
const Autobirther = new web3.eth.Contract(AutobirtherData.abi, "0x88ef31d4a13d674bdc00ea367e36bab6d43648d6")

const unlock = () => {
  return web3.eth.getAccounts().then(accounts=>{
    return web3.eth.personal.unlockAccount(
      accounts[0],
      fs.readFileSync('/run/secrets/autobirther', { encoding: 'utf8' })
    )
  })
}

const executioner = (lokids, from, gasPrice, block) => {

  Autobirther.methods.breed(lokids).send({ from, gasPrice })

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

// lokids for List Of Kitty IDS
const autobirth = (lokids) => {

  var gasPrice = "10000000000"
  var addr
  var block

  // get accounts
  return web3.eth.getAccounts().then(accounts=>{ addr = accounts[0] 

    // get latest block number
    return web3.eth.getBlock('latest') }).then(latest=>{ block = Number(latest.number)

      // unlock our account
      return unlock()
    }).then(res=>{

    // if we unlocked our account then try to..
    if (res === true) { try {

        // execute our autobirther method & log the output
        executioner(lokids, addr, gasPrice, block)

      // did a race condition make us unlock together & then try to send two transactions?
      } catch (e) {
        // we might have lost that race, try one more time
        return unlock().then((res) => { if (res) executioner(lokids, addr, gasPrice, block) })
      }
    }
  })

}

export { Autobirther, autobirth }
