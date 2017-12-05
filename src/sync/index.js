
import db from '../db/'

const fromBlock = 4655167 //4605167
const toBlock = fromBlock + 10


const getPastSales = () => {
  for (let i=fromBlock; i<toBlock; i++) {

    if (db.hasSales(i)) {
      console.log(`Already saved events for block ${i}`)
      continue

    } else {
      ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: i, toBlock: i+1 }).then(events=>{
        console.log(`Fetched ${events.length} events from block ${i}`)
        db.saveSales(events)
      })
    }

  }
}

export default {
  getPastSales,
}


/*
ckSale.getPastEvents('AuctionSuccessful', { fromBlock, toBlock: fromBlock+2000 }).then(event=>{
  event.forEach(e=>{
    console.log(e)
    let id = e.returnValues[0]
    let val = Math.round(web3.utils.fromWei(e.returnValues[1],'micro'))
    console.log(`Kitty #${
      e.returnValues[0]
    } purchased for ${
      Math.round(web3.utils.fromWei(e.returnValues[1],'micro'))
    } uETH`)
  })
}).catch(console.error)
*/

