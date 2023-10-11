"use client";

import { useState, useContext } from "react";
import {
  DevEnvHelper,
  sbtcDepositHelper,
  TESTNET,
  TestnetHelper,
  WALLET_00,
  WALLET_01,
} from "sbtc";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import * as btc from "@scure/btc-signer";

import { UserContext } from "../UserContext";

export default function DepositForm() {
  const { userData } = useContext(UserContext);
  const [satoshis, setSatoshis] = useState("");

  const handleInputChange = (event) => {
    setSatoshis(event.target.value);
  };

  const buildTransaction = async (e) => {
    e.preventDefault();
    const testnet = new TestnetHelper();
    // const testnet = new DevEnvHelper();

    // setting BTC address for devnet
    // const bitcoinAccountA = await testnet.getBitcoinAccount(WALLET_00);
    // const btcAddress = bitcoinAccountA.wpkh.address;
    // const btcPublicKey = bitcoinAccountA.publicKey.buffer.toString();

    // setting BTC address for testnet
    const btcAddress = userData.profile.btcAddress.p2wpkh.testnet;
    const btcPublicKey = userData.profile.btcPublicKey.p2wpkh;

    let utxos = await testnet.fetchUtxos(btcAddress);

    // If we are working via testnet
    // get sBTC deposit address from bridge API
    const response = await fetch(
      "https://bridge.sbtc.tech/bridge-api/testnet/v1/sbtc/init-ui"
    );
    const data = await response.json();
    const pegAddress = data.sbtcContractData.sbtcWalletAddress;

    // if we are working via devnet
    // const pegAccount = await testnet.getBitcoinAccount(WALLET_00);
    // const pegAddress = pegAccount.tr.address;
    const tx = await sbtcDepositHelper({
      // comment this line out if working via devnet
      network: TESTNET,
      pegAddress,
      stacksAddress: userData.profile.stxAddress.testnet,
      amountSats: satoshis,
      feeRate: await testnet.estimateFeeRate("low"),
      utxos,
      bitcoinChangeAddress: btcAddress,
    });

    const psbt = tx.toPSBT();
    const requestParams = {
      publicKey: btcPublicKey,
      hex: bytesToHex(psbt),
    };
    const txResponse = await window.btc.request("signPsbt", requestParams);
    const formattedTx = btc.Transaction.fromPSBT(
      hexToBytes(txResponse.result.hex)
    );
    formattedTx.finalize();
    const finalTx = await testnet.broadcastTx(formattedTx);
    console.log(finalTx);
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
