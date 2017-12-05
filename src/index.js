
////////////////////////////////////////
// Magic Numbers
const kittyCoreAddress = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
const kittySaleAddress = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C"
const kittySireAddress = "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26"
const provider = `ws://${process.env.ETH_PROVIDER}`
const from = process.env.ETH_ADDRESS
const fromBlock = 4605167

////////////////////////////////////////
// 3rd Party Imports
import fs from 'fs'
import Web3 from 'web3'

////////////////////////////////////////
// My Imports
import sync from './sync'
import kittyCoreABI from '../imports/kittyCore.json'
import kittySaleABI from '../imports/kittySale.json'
import kittySireABI from '../imports/kittySire.json'

////////////////////////////////////////
// Initialize Variables/Instances
const web3   = new Web3(new Web3.providers.WebsocketProvider(provider))

global.ck = {
  core: new web3.eth.Contract(kittyCoreABI, kittyCoreAddress, {from}),
  sale: new web3.eth.Contract(kittySaleABI, kittySaleAddress, {from}),
  sire: new web3.eth.Contract(kittySireABI, kittySireAddress, {from}),
}


web3.eth.getBlock('latest').then(block=>{
  if (block === false) {
    console.log('Node up to date')
  } else {
    console.log(`Most recent block: ${
      Math.round((new Date() - new Date(block.timestamp * 1000))/3600000)
    } hours ago`)
  }

  sync.getPastSales()

}).catch(console.error)

