
////////////////////////////////////////
// 3rd Party Imports
import Web3 from 'web3'
// Etherscan Data
import kittyCoreABI from '../../imports/kittyCore.json'
import kittySaleABI from '../../imports/kittySale.json'
import kittySireABI from '../../imports/kittySire.json'

////////////////////////////////////////
// Magic Numbers
const kittyCoreAddress = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
const kittySaleAddress = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C"
const kittySireAddress = "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26"
const provider = `ws://${process.env.ETH_PROVIDER}`
const from = process.env.ETH_ADDRESS
const fromBlock = 4605167

////////////////////////////////////////
// Initialize Web3 & Contract connections
const web3 = new Web3(new Web3.providers.WebsocketProvider(provider))
const ck = {
  core: new web3.eth.Contract(kittyCoreABI, kittyCoreAddress, {from}),
  sale: new web3.eth.Contract(kittySaleABI, kittySaleAddress, {from}),
  sire: new web3.eth.Contract(kittySireABI, kittySireAddress, {from}),
}

export default { web3, ck }
