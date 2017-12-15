pragma solidity ^0.4.0;


contract KittyCore {

    function getKitty(uint256 _id) external view returns (bool isGestating, bool isReady, uint256 cooldownIndex, uint256 nextActionAt, uint256 siringWithId, uint256 birthTime, uint256 matronId, uint256 sireId, uint256 generation, uint256 genes);

}

contract KittyTest {

    function getKittyNumber(uint256 _id) public view returns (bool isGestating, bool isReady, uint256 cooldownIndex, uint256 nextActionAt, uint256 siringWithId, uint256 birthTime, uint256 matronId, uint256 sireId, uint256 generation, uint256 genes) {
        address kittyCore = '';
        return KittyCore(kittyCore).getKitty(_id);
    }

}

