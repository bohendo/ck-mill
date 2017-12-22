////////////////////////////////////////
// 3rd Party Imports
import net from 'net'
import Web3 from 'web3'

// My Imports
import ckdata from './ck/'

const web3 = new Web3(new Web3.providers.IpcProvider(
  process.env.ETH_PROVIDER,
  new net.Socket()
))

// ck for cryptokitties
const defaultFrom = { from: process.env.ETH_ADDRESS }
const ck = {
  core: new web3.eth.Contract(ckdata.core.abi, ckdata.core.addr, defaultFrom),
  sale: new web3.eth.Contract(ckdata.sale.abi, ckdata.sale.addr, defaultFrom),
  sire: new web3.eth.Contract(ckdata.sire.abi, ckdata.sire.addr, defaultFrom),
}

export { web3, ck }
