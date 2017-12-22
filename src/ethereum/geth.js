import ckdata from './ck/'

const core = eth.contract(ckdata.core.abi).at(ckdata.core.addr)
const sale = eth.contract(ckdata.sale.abi).at(ckdata.sale.addr)
const sire = eth.contract(ckdata.sire.abi).at(ckdata.sire.addr)

export { core, sale, sire }
