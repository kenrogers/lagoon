import LendForm from "../components/LendForm";

export const metadata = {
  title: "Lend",
  description: "A decentralized Bitcoin lending application",
};

export default function Lend() {
  return (
    <div className="min-h-screen text-white bg-gray-800">
      <h2 className="my-6 text-3xl text-center">Lend your sBTC</h2>
      <LendForm />
    </div>
  );
}
