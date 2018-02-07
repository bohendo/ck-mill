import net from 'net'
import Web3 from 'web3'

// cryptokitty contracts from etherscan
import { CoreData, SaleData, SireData } from './ck/'

// my autobirther contracts from truffle artifacts
import AutobirtherData from '../../build/contracts/Autobirther'

// connect to eth provider
const web3 = new Web3(new Web3.providers.IpcProvider(
  process.env.ETHPROVIDER_IPC,
  new net.Socket()
))

// initialize cryptokitty contract instances
const core = new web3.eth.Contract(CoreData.abi, CoreData.addr)
const sale = new web3.eth.Contract(SaleData.abi, SaleData.addr)
const sire = new web3.eth.Contract(SireData.abi, SireData.addr)

// initialize our contract instance
const Autobirther = new web3.eth.Contract(AutobirtherData.abi, "0xbed6b644203881aae28072620433524a66a37b87")

export { web3, core, sale, sire, Autobirther }
