
import { web3 } from './web3'

import AutobirtherData from '../../build/contracts/Autobirther'

import fs from 'fs'

const Autobirther = new web3.eth.Contract(AutobirtherData.abi, "0xF73DE4309DdB425Ee9B7E699ae34210a4dc2dc96")

// lokids for List Of Kitty IDS
const autobirth = (lokids) => {

  var gasPrice = "10000000000"
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

        // log confirmed transaction
        console.log(`${new Date().toISOString()} Conf tx ${receipt.transactionHash}
                         on block ${receipt.blockNumber}. Spent ${Math.round(Number(receipt.gasUsed)*Number(gasPrice)/1000000000000)} uETH to birth: ${JSON.stringify(receipt.events)}`)

      })

    }
  })


}

export { autobirth }
