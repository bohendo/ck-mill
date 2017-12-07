
import { web3, ck } from './ethereum/'
import './sync' // starts sync daemon in background

console.log(`Starting with process.env=${JSON.stringify(process.env)}`)

web3.eth.getBlock('latest').then(block=>{
  if (block === false) {
    console.log('Node up to date')
  } else {
    console.log(`Most recent block: ${
      Math.round((new Date() - new Date(block.timestamp * 1000))/3600000)
    } hours ago`)
  }

}).catch(console.error)

