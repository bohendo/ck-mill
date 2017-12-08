import { web3, ck } from '../ethereum/'
import db from '../db/'
import { getKitty } from './getKitty'
import { getBlock } from './getBlock'

const fromBlock = 4605167
const toBlock = fromBlock + 100

const syncAll = () => {

  ck.core.methods.totalSupply().call().then(max => {

    (function kittyLoop(i) {
      if (i >= max) return
      getKitty(i).then(k=>{
        const msg = k.forsale ? `(On sale for ${Math.round(web3.utils.fromWei(k.currentprice, 'ether'), 3)})` : ''
        console.log(`Got gen ${k.generation} kitty ${k.id} ${msg}`)
        kittyLoop(i+1)
      }).catch(err => { console.error(err); process.exit(1) })
    })(0)

  }).catch(err => { console.error(err); process.exit(1) })


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

