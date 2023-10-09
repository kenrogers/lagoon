import { showConnect } from "@stacks/connect";
import { StacksMocknet, StacksTestnet } from "@stacks/network";

export default function ConnectWallet({ userSession, userData, setUserData }) {
  const connectWallet = () => {
    showConnect({
      userSession,
      network: StacksTestnet,
      appDetails: {
        name: "BitLoan",
        icon: "https://freesvg.org/img/bitcoin.png",
      },
      onFinish: () => {
        window.location.reload();
      },
      onCancel: () => {
        // handle if user closed connection prompt
      },
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut(window.location.origin);
    setUserData({});
  };
  return (
    <button
      className="px-4 py-2 font-bold text-white transition duration-500 ease-in-out rounded bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-orange-500"
      onClick={() => {
        userData.profile ? disconnectWallet() : connectWallet();
      }}
    >
      {userData.profile ? "Disconnect" : "Connect Wallet"}
    </button>
  );
}
