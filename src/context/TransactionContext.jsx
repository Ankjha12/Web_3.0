import React, { useEffect } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [connectedAccount, setConnectedAccount] = React.useState("");
  const [formData, setFormData] = React.useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [trasactionsCount, setTransactionsCount] = React.useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = React.useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransaction = async () => {
    try {
      if (!ethereum) alert("Please Install Metamask to connect your wallet");
      const transactionContract = getEthereumContract();

      console.log("TrnsactionContract", transactionContract);

      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18, // cause transaction amount are stored in the form of hex and converted into GWEI
        })
      );
      setTransactions(structuredTransactions);

      console.log(
        "Available Trasactions",
        structuredTransactions,
        availableTransactions
      );
    } catch (error) {
      console.log("error in getting available Transactions", error);
    }
  };

  const checkIfWalletConnected = async () => {
    try {
      if (!ethereum) alert("Please Install Metamask to connect your wallet");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts && accounts.length) {
        setConnectedAccount(accounts[0]);

        //getAllTransaction Function Logic will go here
        getAllTransaction();
      } else {
        console.log("no Account Found");

        alert("No Account Found");
      }

      console.log("Ethereum account", accounts);
    } catch (error) {
      console.log("Error: ", error);

      throw new Error("no account available");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log("Error", error);

      throw new Error("no trasaction count");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) alert("Please Install metamask to access your Account");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setConnectedAccount(accounts[0]);
    } catch (error) {
      console.log("error", error);

      throw new Error("No Ethereum account found");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) alert("Please install Metamask to Send transactions");

      const { addressTo, amount, keyword, message } = formData;
      // this below code is parsing the amount into GWEI amount and then trasaction will be stored in the blockchain network also then below in value we have to convert the parseAmount into hexadecimal value
      const parsedAmount = ethers.utils.parseEther(amount);

      const transactionContract = getEthereumContract();

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: connectedAccount,
            to: addressTo,
            gas: "0x5208", // this is the gas fee for every trasaction its unit in GWEI which is a subunit of ethreum
            value: parsedAmount._hex,
          },
        ],
      });

      // Here  we are calling the addToBlockchain function that we created in the solidity file and deployed it on blockchain network

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`loading ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`${isLoading} Success ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionsCount(transactionCount);

      window.location.reload();
    } catch (error) {
      console.log("Error in Send Transaction", error);
      throw new Error("Error in Send Transaction");
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
    checkIfTransactionsExist();
  }, []);
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        connectedAccount,
        handleChange,
        formData,
        setFormData,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
