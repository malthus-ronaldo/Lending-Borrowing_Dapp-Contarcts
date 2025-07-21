import { ethers } from "ethers";
import { useState } from "react";
import lendingAbi from "./abis/LendingBorrowing.json";
import tokenAbi from "./abis/Token.json";

const lendingAddress = import.meta.env.VITE_LENDING_ADDRESS;
const ctAddress = import.meta.env.VITE_CT_ADDRESS;
const ltAddress = import.meta.env.VITE_LT_ADDRESS;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [lending, setLending] = useState(null);
  const [ct, setCT] = useState(null);
  const [lt, setLT] = useState(null);
  const [amount, setAmount] = useState("");
  const [loanInfo, setLoanInfo] = useState(null);

  const connect = async () => {
    if (!window.ethereum) return alert("Install Metamask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const accounts = await provider.send("eth_requestAccounts", []);

    const lending = new ethers.Contract(lendingAddress, lendingAbi.abi, signer);
    const ct = new ethers.Contract(ctAddress, tokenAbi.abi, signer);
    const lt = new ethers.Contract(ltAddress, tokenAbi.abi, signer);

    setProvider(provider);
    setSigner(signer);
    setAccount(accounts[0]);
    setLending(lending);
    setCT(ct);
    setLT(lt);
  };

  const approveAndDeposit = async () => {
    const value = ethers.parseUnits(amount, 18);
    await ct.approve(lendingAddress, value);
    await lending.depositCollateral(value);
  };

  const borrow = async () => {
    const value = ethers.parseUnits(amount, 18);
    await lending.takeLoan(value);
  };

  const repay = async () => {
    const value = ethers.parseUnits(amount, 18);
    await lt.approve(lendingAddress, value);
    await lending.repayLoan(value);
  };

  const withdraw = async () => {
    const value = ethers.parseUnits(amount, 18);
    await lending.withdrawCollateral(value);
  };

  const fetchLoan = async () => {
    const loan = await lending.getLoanDetails(account);
    setLoanInfo({
      amount: ethers.formatUnits(loan[0], 18),
      collateral: ethers.formatUnits(loan[1], 18),
      active: loan[2],
    });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Lending & Borrowing dApp</h1>
      <button className="btn btn-primary mb-3" onClick={connect}>Connect Wallet</button>
      {account && <p>Connected: {account}</p>}

      <input
        className="form-control mb-2"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />

      <button className="btn btn-success me-2" onClick={approveAndDeposit}>Deposit Collateral</button>
      <button className="btn btn-warning me-2" onClick={borrow}>Take Loan</button>
      <button className="btn btn-info me-2" onClick={repay}>Repay Loan</button>
      <button className="btn btn-danger me-2" onClick={withdraw}>Withdraw Collateral</button>
      <button className="btn btn-secondary mt-3" onClick={fetchLoan}>Get Loan Info</button>

      {loanInfo && (
        <div className="mt-3">
          <p><strong>Collateral:</strong> {loanInfo.collateral}</p>
          <p><strong>Loan:</strong> {loanInfo.amount}</p>
          <p><strong>Status:</strong> {loanInfo.active ? "Active" : "Inactive"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
