// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {Test, console} from "forge-std/Test.sol";
import {LendingBorrowing} from "../src/LendingBorrowing.sol";
import {Token} from "../src/Token.sol";

contract LendingTest is Test {
    LendingBorrowing public lending;
    Token public collateral;
    Token public lendingToken;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public user3 = makeAddr("user3");

    function setUp() public {
        collateral = new Token("collateralToken", "ct");
        lendingToken = new Token("lendingToken", "lt");
        lending = new LendingBorrowing(collateral, lendingToken, 80);
        collateral.mint(user1, 100 ether);
        lendingToken.mint(address(lending), 1000 ether);
    }

    function testDepositCollateral() public {
        vm.startPrank(user1);
        collateral.approve(address(lending), 100 ether);
        lending.depositCollateral(50 ether);

        assert(collateral.balanceOf(user1) == 50 ether);
        assert(collateral.balanceOf(address(lending)) == 50 ether);
    }

    function TEST_takeLoan() public {
        vm.startPrank(user1);
        collateral.approve(address(lending), 100 ether);
        lending.depositCollateral(50 ether);
        vm.expectRevert();
        lending.takeLoan(100 ether);
        vm.expectRevert();
        lending.takeLoan(49 ether);
        lending.takeLoan(40 ether);
        assert(lendingToken.balanceOf(user1) == 40 ether);
    }

    function test_RepayLoan() public {
        vm.startPrank(user1);
        collateral.approve(address(lending), 100 ether);
        lending.depositCollateral(50 ether);
        lending.takeLoan(40 ether);
        lendingToken.approve(address(lending), 40 ether);
        lending.repayLoan(40 ether);
        assert(lendingToken.balanceOf(user1) == 0 ether);
    }

    function test_WithdrawCollateral() public {
        vm.startPrank(user1);
        collateral.approve(address(lending), 100 ether);
        lending.depositCollateral(50 ether);
        lending.takeLoan(40 ether);
        lendingToken.approve(address(lending), 40 ether);
        lending.repayLoan(40 ether);
        lending.withdrawCollateral(50 ether);
        assert(lendingToken.balanceOf(user1) == 0 ether);
        assert(collateral.balanceOf(user1) == 100 ether);
    }
}
