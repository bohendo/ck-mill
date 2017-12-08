import { web3, ck } from './ethereum/'
import { have } from './db/'
import { getKitty } from './sync/kitty'

const syncKitties = () => {

  ck.core.methods.totalSupply().call().then(max => {

    (function kittyLoop(i) {
      if (i >= max) return 'Done'

      have.kitty(i).then(has=>{
        if (!has) {

          getKitty(i).then(k=>{
            console.log(`Got new kitty ${k.id}`)
            kittyLoop(i+1)
          }).catch(err => { console.error(err); process.exit(1) })

        } else {
          console.log(`Already have kitty ${i}`)
          kittyLoop(i+1)
        }

      }).catch(console.error)
    })(0)

  }).catch(err => { console.error(err); process.exit(1) })

}

syncKitties()
