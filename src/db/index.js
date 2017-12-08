////////////////////////////////////////
// My Imports
import { writeBlock, readBlock, haveBlock } from './block'
import { writeKitty, readKitty, haveKitty } from './kitty'

const have = {
  kitty: haveKitty,
  block: haveBlock,
}

const read = {
  kitty: readKitty,
  block: readBlock,
}

const write = {
  kitty: writeKitty,
  block: writeBlock,
}

export { read, write, have }
