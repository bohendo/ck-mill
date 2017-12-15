import coreAbi from './kittyCore.json'
import saleAbi from './kittySale.json'
import sireAbi from './kittySire.json'

const firstBlock = 4605167
const core = eth.contract(coreAbi).at("0x06012c8cf97BEaD5deAe237070F9587f8E7A266d")
const sale = eth.contract(saleAbi).at("0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C")
const sire = eth.contract(sireAbi).at("0xC7af99Fe5513eB6710e6D5f44F9989dA40F27F26")

export { firstBlock, core, sale, sire }
