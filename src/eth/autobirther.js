
import { web3 } from './web3'

import AutobirtherData from '../../build/contracts/Autobirther'

import fs from 'fs'

// const Autobirther = AutobirtherData
const Autobirther = new web3.eth.Contract(AutobirtherData.abi, "0x88ef31d4a13d674bdc00ea367e36bab6d43648d6")

// lokids for List Of Kitty IDS
const autobirth = (lokids) => {

  var gasPrice = "20000000000"
  var block
  var addr

  return web3.eth.getBlock('latest').then(latest=>{
    block = Number(latest.number)

    return web3.eth.getAccounts()

  }).then(accounts=>{
    
    addr = accounts[0]

    return web3.eth.personal.unlockAccount(
      addr,
      fs.readFileSync('/run/secrets/autobirther', { encoding: 'utf8' })
    )

  }).then(res=>{

    if (res === true) {

      Autobirther.methods.breed(lokids).send({ from: addr, gasPrice })
      .on('transactionHash', (transactionHash) => {

        // log sent transaction
        console.log(`${new Date().toISOString()} Sent tx ${transactionHash}
                         on block ${block}. Paying gasprice=${Math.round(Number(gasPrice)/1000000)} Mwei to try to birth: ${lokids}`)

      })
      .on('receipt', (receipt) => {

        let nBirths = 0
        if (receipt.events["1"]) nBirths += 1 
        if (receipt.events["3"]) nBirths += 1 
        if (receipt.events["5"]) nBirths += 1 

        // log confirmed transaction
        console.log(`${new Date().toISOString()} Conf tx ${receipt.transactionHash}
                         on block ${receipt.blockNumber}. Spent ${Math.round(Number(receipt.gasUsed)*Number(gasPrice)/1000000000000)} uETH to birth ${Math.round(nBirths)} kitties`)

      })

    }
  })

}

export { Autobirther, autobirth }
