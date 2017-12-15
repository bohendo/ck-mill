pragma solidity ^0.4.4;


contract KittyCore {
    
    function getKitty(uint256 _id) external returns (
        bool isGestating, bool isReady, uint256 cooldownIndex, uint256 nextActionAt, uint256 siringWithId, 
        uint256 birthTime, uint256 matronId, uint256 sireId, uint256 generation, uint256 genes );

    function giveBirth(uint256 _matronId) external returns ( uint256 );

}


contract KittyBirther {
    address kittyCoreAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
    address ownerAddress = 0x5673A779D66d008053A846b29Ab6A506567fba90;

    KittyCore internal c = KittyCore(kittyCoreAddress);

    function breedQuick(uint256[] kittiesIds) external {
        uint256 bID;
        bool preg;
        bool ready;
        
        for (uint i=0; i < kittiesIds.length; i++) {
            uint256 kitID = kittiesIds[i];
            (preg, ready, , bID, , , , , , ) = c.getKitty(kitID);
            if (preg && ready){
                c.giveBirth(kitID);
            }
        }
    }

    function payMe() external payable {
        ownerAddress.transfer(this.balance);
    }
}
