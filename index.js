
////////////////////////////////////////
// Magic Numbers
const kittyCoreAddress = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
const kittySaleAddress = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C"
const kittySireAddress = "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26"
const providerAddress = "ws://138.197.156.204:25727"
const kittyCore = require('./imports/kittyCore.json')
const kittySale = require('./imports/kittySale.json')
const kittySire = require('./imports/kittySire.json')

////////////////////////////////////////
const Web3 = require('web3')
const fs = require('fs')

const web3 = new Web3(new Web3.providers.WebsocketProvider(providerAddress))

// my metamask address
const me = "0x213fE7E177160991829a4d0a598a848D2448F384"
const from = "0x55Af77090042ce58fEC8C9EAa3eba99cda2B6FE1"
const BornBlock = 4605167
const ckCore = new web3.eth.Contract(require('./imports/kittyCore.json'), "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d", { from })
const ckSale = new web3.eth.Contract(ABI, "", { from })
const ckSire = new web3.eth.Contract(ABI, "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d", { from })

web3.eth.getBlock('latest').then(block=>{
  if (block === false) {
    console.log('Node up to date')
  } else {
    console.log(`Most recent block: ${
      Math.round((new Date() - new Date(block.timestamp * 1000))/3600000)
    } hours ago`)
  }
//}).then(res=>{
}).catch(console.error)

//
ckCore.getPastEvents('allEvents', { fromBlock: BornBlock, toBlock: BornBlock+100 }).then(event=>{

  event.forEach(e=>{
    let kitty = (e.event === "Transfer") ? e.returnValues[2] : e.returnValues[1]
    console.log(e.event, kitty)
  })

}).catch(console.error)

// If cooldown index === 11 then 50% probability of selling after born
