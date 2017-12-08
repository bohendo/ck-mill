
import { web3, ck } from './ethereum/'
import db from './db/'
import { getBlock } from './sync/getBlock'

const fromBlock = 4605167
const toBlock = fromBlock + 100

const syncAll = () => {

  web3.eth.getBlock('latest').then(latest => {

    (function blockLoop(n) {
      if (n >= latest.blockNumber) return // artificially limit while debugging
      getBlock(n).then(tx=>{
        console.log(`Got tx ${JSON.stringify(tx)}`)
        blockLoop(n+1)
      }).catch(err => { console.error(err); process.exit(1) })
    })(fromBlock)

  }).catch(err => { console.error(err); process.exit(1) })
}
syncAll()

