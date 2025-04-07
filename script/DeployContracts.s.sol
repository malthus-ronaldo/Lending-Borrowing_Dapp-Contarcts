// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/LendingBorrowing.sol";

contract DeployContracts is Script {
    function run() external {
        // Charge la clé privée depuis .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Commence la transaction de déploiement
        vm.startBroadcast(deployerPrivateKey);

        // Déploie les deux tokens
        Token collateralToken = new Token("Collateral Token", "CT");
        Token lendingToken = new Token("Lending Token", "LT");

        // Déploie le contrat de prêt/emprunt avec un collateralFactor de 80
        LendingBorrowing lending = new LendingBorrowing(
            IERC20(address(collateralToken)),
            IERC20(address(lendingToken)),
            80
        );

        console.log("Collateral Token deployed at:", address(collateralToken));
        console.log("Lending Token deployed at:", address(lendingToken));
        console.log("LendingBorrowing deployed at:", address(lending));

        vm.stopBroadcast();
    }
}
