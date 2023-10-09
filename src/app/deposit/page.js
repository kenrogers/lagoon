import DepositForm from "../components/DepositForm";

export const metadata = {
  title: "Deposit",
  description: "A decentralized Bitcoin lending application",
};

export default function Deposit() {
  return (
    <div className="min-h-screen text-white bg-gray-800">
      <h2 className="my-6 text-3xl text-center">Deposit BTC to Mint sBTC</h2>
      <DepositForm />
    </div>
  );
}
