
import { web3 } from './web3'

import AutobirtherData from '../../build/contracts/Autobirther'

import fs from 'fs'

const Autobirther = new web3.eth.Contract(AutobirtherData.abi, "0xF73DE4309DdB425Ee9B7E699ae34210a4dc2dc96")

// lokids for List Of Kitty IDS
const autobirth = (lokids) => {

  var addr

  return web3.eth.getBlock('latest').then(block=>{
    console.log(`Sending birth tx on block ${block.number}`)

    return web3.eth.getAccounts()

  }).then(accounts=>{
    
    addr = accounts[0]

    return web3.eth.personal.unlockAccount(
      addr,
      fs.readFileSync('/run/secrets/autobirther', { encoding: 'utf8' })
    )

  }).then(res=>{

    if (res === true) {
      console.log(`Yay, account unlocked`)

      Autobirther.methods.breed(lokids).send({ from: addr, gasPrice: "5000000000" })
      .on('transactionHash', (transactionHash) => { console.log('TransactionHash:', JSON.stringify(transactionHash)) })
      .on('receipt', (receipt) => { console.log('Receipt:', JSON.stringify(receipt)) })

    } else {
      console.log(`Oh no, unlock result=${res} aka ${JSON.stringify(res)}`)
    }
  })


}

export { autobirth }
