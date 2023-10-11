"use client";

import React, { useState } from "react";
import { uintCV, PostConditionMode } from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { StacksMocknet, StacksTestnet } from "@stacks/network";

export default function LendForm() {
  const [amount, setAmount] = useState(0);

  const handleDeposit = async () => {
    const functionArgs = [
      uintCV(amount), // Convert the amount to uintCV
    ];

    const contractAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; // Replace with your contract address
    const contractName = "lagoon"; // Replace with your contract name
    const functionName = "deposit"; // Function for deposit

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      network: new StacksTestnet(),
      // network: new StacksMocknet(),
      postConditionMode: PostConditionMode.Allow,
      appDetails: {
        name: "Lagoon",
        icon: "https://freesvg.org/img/bitcoin.png", // You can provide an icon URL for your application
      },
      onFinish: (data) => {
        console.log(data);
      },
    };

    await openContractCall(options);
  };

  return (
    <form
      className="flex items-center justify-center space-x-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleDeposit();
      }}
    >
      <input
        type="number"
        placeholder="Amount to lend"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-1/3 px-4 py-2 text-gray-300 bg-gray-700 rounded focus:outline-none focus:border-orange-500"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 focus:outline-none"
      >
        Lend sBTC
      </button>
    </form>
  );
}
