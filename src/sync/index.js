import { web3, ck } from '../ethereum/'
import db from '../db/'
import { getKitty } from './getKitty'

const fromBlock = 4655167 //4605167
const toBlock = fromBlock + 10

const syncAll = () => {
  ck.core.methods.totalSupply().call().then(max => {

    (function loop(i) {
      if (i >= 100) return ('Done') // artificially limit while debugging
      getKitty(i).then(k=>{
        const msg = k.forsale ? `(On sale for ${Math.round(web3.utils.fromWei(k.currentprice, 'ether'), 3)})` : ''
        console.log(`Got gen ${k.generation} kitty ${k.id} ${msg}`)
        loop(i+1)
      })
    })(0)

  }).catch(err => { console.error(err); process.exit(1) })
}
syncAll()


/*
ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: n, toBlock: n+1 }).then(events=>{
  events.forEach(e=>{
    let sale = {
      blockNumber: e.blockNumber,
      txhash: e.transactionHash,
      value: e.returnValues.totalPrice,
      kitty: e.returnValues.tokenId,
      buyer: e.returnValues.winner,
    }
    // console.log(JSON.stringify(sale, null, 2))
  })
})
*/
