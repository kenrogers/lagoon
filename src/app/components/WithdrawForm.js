"use client";

import { useState, useContext } from "react";
import {
  DevEnvHelper,
  sbtcWithdrawHelper,
  sbtcWithdrawMessage,
  TESTNET,
  TestnetHelper,
  WALLET_00,
} from "sbtc";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import * as btc from "@scure/btc-signer";
import { openSignatureRequestPopup } from "@stacks/connect";

import { UserContext } from "../UserContext";
import { StacksTestnet, StacksMocknet } from "@stacks/network";

export default function WithdrawForm() {
  const { userData, userSession } = useContext(UserContext);
  const [satoshis, setSatoshis] = useState("");
  const [signature, setSignature] = useState("");

  const handleInputChange = (event) => {
    setSatoshis(event.target.value);
  };

  const signMessage = async (e) => {
    e.preventDefault();

    // const testnet = new TestnetHelper();
    const testnet = new DevEnvHelper();

    // First we need to sign a Stacks message to prove we own the sBTC
    // The sbtc package can help us format this
    const bitcoinAccountA = await testnet.getBitcoinAccount(WALLET_00);
    const btcAddress = bitcoinAccountA.wpkh.address;

    // setting BTC address for testnet
    // here we are pulling directly from our authenticated wallet
    // const btcAddress = userData.profile.btcAddress.p2wpkh.testnet;

    const message = sbtcWithdrawMessage({
      // network: TESTNET,
      amountSats: satoshis,
      bitcoinAddress: btcAddress,
    });
    // Now we can use Leather to sign that message
    openSignatureRequestPopup({
      message,
      userSession,
      network: new StacksMocknet(),
      onFinish: (data) => {
        // Here we set the signature
        setSignature(data.signature);
      },
    });
  };

  const buildTransaction = async (e) => {
    // Once the signature has been set, we can build and broadcast the transaction
    e.preventDefault();
    // Helper for working with various API and RPC endpoints and getting and processing data
    // Change this depending on what network you are working with
    // const testnet = new TestnetHelper();
    const testnet = new DevEnvHelper();

    // setting BTC address for devnet
    // Because of some quirks with Leather, we need to pull our BTC wallet using the helper if we are on devnet
    const bitcoinAccountA = await testnet.getBitcoinAccount(WALLET_00);
    const btcAddress = bitcoinAccountA.wpkh.address;
    const btcPublicKey = bitcoinAccountA.publicKey.buffer.toString();

    // setting BTC address for testnet
    // here we are pulling directly from our authenticated wallet
    // const btcAddress = userData.profile.btcAddress.p2wpkh.testnet;
    // const btcPublicKey = userData.profile.btcPublicKey.p2wpkh;

    let utxos = await testnet.fetchUtxos(btcAddress);

    // If we are working via testnet
    // get sBTC deposit address from bridge API
    // const response = await fetch(
    //   "https://bridge.sbtc.tech/bridge-api/testnet/v1/sbtc/init-ui"
    // );
    // const data = await response.json();
    // const pegAddress = data.sbtcContractData.sbtcWalletAddress;

    // if we are working via devnet we can use the helper to get the peg address, which is associated with the first wallet
    const pegAccount = await testnet.getBitcoinAccount(WALLET_00);
    const pegAddress = pegAccount.tr.address;

    const tx = await sbtcWithdrawHelper({
      // comment this line out if working via devnet
      // network: TESTNET,
      pegAddress,
      bitcoinAddress: btcAddress,
      amountSats: satoshis,
      signature,
      feeRate: await testnet.estimateFeeRate("low"),
      fulfillmentFeeSats: 2000,
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
        className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 focus:outline-none"
        onClick={(e) => {
          signature ? buildTransaction(e) : signMessage(e);
        }}
      >
        {signature ? "Broadcast Withdraw Tx" : "Sign Withdraw Tx"}
      </button>
    </form>
  );
}
