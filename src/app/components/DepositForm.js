"use client";

import { useState, useContext } from "react";
import { buildDepositPayload, buildDepositTransaction } from "sbtc-bridge-lib";
import { hex } from "@scure/base";

import { UserContext } from "../UserContext";

export default function DepositForm() {
  const userData = useContext(UserContext);
  const [satoshis, setSatoshis] = useState("");

  const handleInputChange = (event) => {
    setSatoshis(event.target.value);
  };

  const buildTransaction = async (e) => {
    e.preventDefault();
    // The first thing we need to do is build our deposit payload
    // In order to do that we just need to pass in the network we are using
    // our authenticated Stacks principal
    // whether or not we are using OP_DROP, no in this case, and the amount of satoshis we are depositing
    if (userData) {
      // const payload = await buildDepositPayload(
      //   "testnet",
      //   userData.profile.stxAddress.testnet
      // );
      // console.log(hex.decode(payload));

      // get utxos from esplora API
      const utxoResponse = await fetch(
        `https://mempool.space/testnet/api/address/${userData.profile.btcAddress.p2wpkh.testnet}/utxo`
      );
      const utxos = await utxoResponse.json();

      // get sBTC deposit address from bridge API
      const response = await fetch(
        "https://bridge.sbtc.tech/bridge-api/testnet/v1/sbtc/init-ui"
      );
      const data = await response.json();

      const payload = {
        principal: userData.profile.stxAddress.testnet,
        amountSats: satoshis,
        bitcoinAddress: userData.profile.btcAddress.p2wpkh.testnet,
      };

      console.log(utxos);

      // next we need to build the transaction itself
      const mintTx = await buildDepositTransaction(
        "testnet",
        data.sbtcContractData.sbtcWalletPublicKey,
        payload,
        data.btcFeeRates,
        utxos
      );
      console.log(mintTx);
    }
  };

  return (
    <form className="flex items-center justify-center space-x-4">
      <input
        type="number"
        placeholder="Amount of BTC to deposit"
        className="w-1/3 px-4 py-2 text-gray-300 bg-gray-700 rounded focus:outline-none focus:border-orange-500"
        value={satoshis}
        onChange={handleInputChange}
      />
      <button
        type="submit"
        className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 focus:outline-none"
        onClick={buildTransaction}
      >
        Deposit BTC
      </button>
    </form>
  );
}
