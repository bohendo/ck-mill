pragma solidity ^0.4.17;

import "./KittyCore.sol";

contract Autobirther {

  address kittyCoreAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
  KittyCore internal core = KittyCore(kittyCoreAddress);

  address owner = 0x213fE7E177160991829a4d0a598a848D2448F384;

  function breed(uint[] kitties) external {
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

}

