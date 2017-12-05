
////////////////////////////////////////
// Magic Numbers
const kittyCoreAddress = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
const kittySaleAddress = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C"
const kittySireAddress = "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26"
const kittyCoreABI = require('./imports/kittyCore.json')
const kittySaleABI = require('./imports/kittySale.json')
const kittySireABI = require('./imports/kittySire.json')
const provider = `ws://${process.env.ETH_PROVIDER}`
const from = process.env.ETH_ADDRESS
const fromBlock = 4605167

////////////////////////////////////////
// 3rd Party Imports
const fs     = require('fs')
const Web3   = require('web3')

////////////////////////////////////////
// My Imports
const db = require('./db/')

////////////////////////////////////////
// Initialize Variables/Instances
const web3   = new Web3(new Web3.providers.WebsocketProvider(provider))
const ckCore = new web3.eth.Contract(kittyCoreABI, kittyCoreAddress, {from})
const ckSale = new web3.eth.Contract(kittySaleABI, kittySaleAddress, {from})
const ckSire = new web3.eth.Contract(kittySireABI, kittySireAddress, {from})


web3.eth.getBlock('latest').then(block=>{
  if (block === false) {
    console.log('Node up to date')
  } else {
    console.log(`Most recent block: ${
      Math.round((new Date() - new Date(block.timestamp * 1000))/3600000)
    } hours ago`)
  }

}).catch(console.error)

//
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

// If cooldown index === 11 then 50% probability of selling after born


