import { CORE, SALE, SIRE } from './ck/'

const core = eth.contract(CORE.abi).at(CORE.addr)
const sale = eth.contract(SALE.abi).at(SALE.addr)
const sire = eth.contract(SIRE.abi).at(SIRE.addr)

export { core, sale, sire }
