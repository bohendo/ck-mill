
import { web3, ck } from './ethereum/'
import db from './db/'
import { getKitty } from './sync/kitty'

const syncKitties = () => {

  ck.core.methods.totalSupply().call().then(max => {

    (function kittyLoop(i) {
      if (i >= max) return
      getKitty(i).then(k=>{
        const msg = k.forsale ? `(On sale for ${Math.round(web3.utils.fromWei(k.currentprice, 'milli'), 3)} mETH)` : ''
        console.log(`Got gen ${k.generation} kitty ${k.id} ${msg}`)
        kittyLoop(i+1)
      }).catch(err => { console.error(err); process.exit(1) })
    })(0)

  }).catch(err => { console.error(err); process.exit(1) })

}

syncKitties()
