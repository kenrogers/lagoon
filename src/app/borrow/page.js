import BorrowForm from "../components/BorrowForm";

export const metadata = {
  title: "Borrow",
  description: "A decentralized Bitcoin lending application",
};

export default function Borrow() {
  return (
    <div className="min-h-screen text-white bg-gray-800">
      <h2 className="my-6 text-3xl text-center">Borrow sBTC</h2>
      <BorrowForm />
    </div>
  );
}
