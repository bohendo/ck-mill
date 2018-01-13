////////////////////////////////////////
// 3rd Party Imports
import net from 'net'
import Web3 from 'web3'

// My Imports
import { CORE, SALE, SIRE } from './ck/'

const web3 = new Web3(new Web3.providers.IpcProvider(
  '/tmp/ipc/eth.ipc',
  new net.Socket()
))

const defaultFrom = (process.env.ETH_ADDRESS) ? { from: process.env.ETH_ADDRESS } : {}

const core = new web3.eth.Contract(CORE.abi, CORE.addr, defaultFrom)
const sale = new web3.eth.Contract(SALE.abi, SALE.addr, defaultFrom)
const sire = new web3.eth.Contract(SIRE.abi, SIRE.addr, defaultFrom)

export { web3, core, sale, sire }
