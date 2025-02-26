import { GetStaticProps } from "next";
import { Idol, MonthlySaving } from "../types";
import Header from "../components/Header";
import SavingsCircle from "../components/SavingsCircle";
import IdolList from "../components/IdolList";
import SavingsList from "../components/SavingsList";
import Footer from "../components/Footer";
import AddSavingButton from "../components/AddSavingButton";

type HomeProps = {
  idols: Idol[];
  savings: MonthlySaving[];
};

export default function Home({ idols = [], savings = [] }: HomeProps) {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <div className="w-full md:w-1/2">
        <SavingsCircle />
      </div>
      <IdolList idols={idols} />
      <SavingsList savings={savings} />
      <Footer />
      <AddSavingButton />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const idols: Idol[] = [
    { id: "1", name: "BLACKPINK", image: "/images/idolA.jpg" },
    { id: "2", name: "BTS", image: "/images/idolB.jpg" },
  ];

  const savings: MonthlySaving[] = [
    { month: "2023-01", amount: 50000 },
    { month: "2023-02", amount: 60000 },
    { month: "2023-03", amount: 70000 },
    { month: "2023-04", amount: 80000 },
    { month: "2023-05", amount: 90000 },
    { month: "2023-06", amount: 100000 },
    { month: "2023-07", amount: 110000 },
    { month: "2023-08", amount: 120000 },
    { month: "2023-09", amount: 130000 },
    { month: "2023-10", amount: 140000 },
    { month: "2023-11", amount: 150000 },
    { month: "2023-12", amount: 160000 },
  ];

  return {
    props: {
      idols,
      savings,
    },
  };
};
