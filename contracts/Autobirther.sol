pragma solidity ^0.4.17;

import "./KittyCore.sol";

contract Autobirther {

  address owner = 0xeb56b369ddaa70034f94ba195f4377e895b919cf;

  address kittyCoreAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;

  KittyCore internal core = KittyCore(kittyCoreAddress);

  // Add some more efficient breeding functions
  function breed1(uint32 kittyid, uint32 blockn) external {
    bool preg; bool ready;
    if (block.number <= blockn) { (preg, ready, , , , , , , , ) = core.getKitty(kittyid); if (preg && ready) { core.giveBirth(kittyid); } }
  }

  function breed2(uint32 kittyid1, uint32 blockn1,
                  uint32 kittyid2, uint32 blockn2) external {
    bool preg; bool ready;
    if (block.number <= blockn1) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid1); if (preg && ready) { core.giveBirth(kittyid1); } }
    if (block.number <= blockn2) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid2); if (preg && ready) { core.giveBirth(kittyid2); } }
  }

  function breed3(uint32 kittyid1, uint32 blockn1,
                  uint32 kittyid2, uint32 blockn2,
                  uint32 kittyid3, uint32 blockn3) external {
    bool preg; bool ready;
    if (block.number <= blockn1) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid1); if (preg && ready) { core.giveBirth(kittyid1); } }
    if (block.number <= blockn2) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid2); if (preg && ready) { core.giveBirth(kittyid2); } }
    if (block.number <= blockn3) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid3); if (preg && ready) { core.giveBirth(kittyid3); } }
  }

  function breed4(uint32 kittyid1, uint32 blockn1,
                  uint32 kittyid2, uint32 blockn2,
                  uint32 kittyid3, uint32 blockn3,
                  uint32 kittyid4, uint32 blockn4) external {
    bool preg; bool ready;
    if (block.number <= blockn1) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid1); if (preg && ready) { core.giveBirth(kittyid1); } }
    if (block.number <= blockn2) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid2); if (preg && ready) { core.giveBirth(kittyid2); } }
    if (block.number <= blockn3) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid3); if (preg && ready) { core.giveBirth(kittyid3); } }
    if (block.number <= blockn4) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid4); if (preg && ready) { core.giveBirth(kittyid4); } }
  }

  function breed5(uint32 kittyid1, uint32 blockn1,
                  uint32 kittyid2, uint32 blockn2,
                  uint32 kittyid3, uint32 blockn3,
                  uint32 kittyid4, uint32 blockn4,
                  uint32 kittyid5, uint32 blockn5) external {
    bool preg; bool ready;
    if (block.number <= blockn1) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid1); if (preg && ready) { core.giveBirth(kittyid1); } }
    if (block.number <= blockn2) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid2); if (preg && ready) { core.giveBirth(kittyid2); } }
    if (block.number <= blockn3) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid3); if (preg && ready) { core.giveBirth(kittyid3); } }
    if (block.number <= blockn4) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid4); if (preg && ready) { core.giveBirth(kittyid4); } }
    if (block.number <= blockn5) { (preg, ready,,,,,,,, ) = core.getKitty(kittyid5); if (preg && ready) { core.giveBirth(kittyid5); } }
  }

  function breedMore(uint[] kitties) external {
    bool preg;
    bool ready;

    for (uint i=0; i< kitties.length; i++) {
      uint kid = kitties[i];
      (preg, ready, , , , , , , , ) = core.getKitty(kid);
      if (preg && ready) {
        core.giveBirth(kid);
      }
    }

    owner.transfer(this.balance);
  }

  function kill() public {
    if (msg.sender == owner) selfdestruct(owner);
  }

  function () public payable {}

}

