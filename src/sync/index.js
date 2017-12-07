import { web3, ck } from '../ethereum/'
import db from '../db/'
import { getKitty } from './getKitty'

const fromBlock = 4655167 //4605167
const toBlock = fromBlock + 10

getKitty(5).then(k=>{
  console.log(`Got kitty: ${JSON.stringify(k, null, 2)}`)
})


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
