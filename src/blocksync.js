import { web3, ck } from './ethereum/'
import { getBlock } from './sync/block'
import { have } from './db/'

// Magic number: block at which cryptokitties as deployed
const fromBlock = 4605167 

const syncAll = () => {

  web3.eth.getBlock('latest').then(latest => {

    (function blockLoop(n) {
      if (n <= fromBlock) return 'done'

      have.block(n).then(has => {
        if (!has) {
          getBlock(n).then(tx=>{
            if (tx) {
              console.log(`Got ${tx.length} transactions from block ${n}`)
              blockLoop(n-1)
            }
          }).catch(err => { console.error(err); process.exit(1) })
        } else {
          console.log(`Already have block ${n}`)
          blockLoop(n-1)
        }
      })

    })(parseInt(latest.number, 10))

  }).catch(err => { console.error(err); process.exit(1) })
}
syncAll()

