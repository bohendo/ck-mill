////////////////////////////////////////
// My Imports
import { writeBlock } from './block'
import { writeKitty } from './kitty'

export default { 
  write: {
    kitty: writeKitty,
    block: writeBlock,
  }
}
