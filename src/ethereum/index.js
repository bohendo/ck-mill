////////////////////////////////////////
// 3rd Party Imports
import net from 'net'
import Web3 from 'web3'

// Etherscan Data
import kittyCoreABI from '../../imports/kittyCore.json'
import kittySaleABI from '../../imports/kittySale.json'
import kittySireABI from '../../imports/kittySire.json'

////////////////////////////////////////
// Magic Numbers
const mn = {
  coreAddress: "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
  saleAddress: "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C",
  sireAddress: "0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26",
  provider: process.env.ETH_PROVIDER,
  from: process.env.ETH_ADDRESS,
  fromBlock: 4605167
}

////////////////////////////////////////
// Initialize Web3 & Contract connections

const ipc = new net.Socket()
const web3 = new Web3(new Web3.providers.IpcProvider(mn.provider,ipc))

// ck for cryptokitties
const ck = {
  core: new web3.eth.Contract(kittyCoreABI, mn.coreAddress, { from: mn.from }),
  sale: new web3.eth.Contract(kittySaleABI, mn.saleAddress, { from: mn.from }),
  sire: new web3.eth.Contract(kittySireABI, mn.sireAddress, { from: mn.from }),
}
export { web3, ck, mn }
