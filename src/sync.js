import { web3, ck, mn } from './ethereum/'
import db from './db/'

// Activate event listeners
web3.eth.getBlock('latest').then(res => {
  console.log(`Starting event watchers from block ${res.number}`)
  syncAuctionSuccessful(res.number)
})

// Define event listeners
const syncAuctionSuccessful = (from) => {
  ck.sale.events.AuctionSuccessful({ fromBlock: from }, (err, res) => {
    console.log(`new Event: ${JSON.stringify(res)}`)
  })
  ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: from-10, toBlock: from-1 }, (err, res) => {
    console.log(`Past Event: ${JSON.stringify(res)}`)
  })
}

