import { GetStaticProps } from "next";
import { Idol, MonthlySaving } from "../types";
import Header from "../components/Header";
import SavingsCircle from "../components/SavingsCircle";
import IdolList from "../components/IdolList";
import SavingsList from "../components/SavingsList";
import Footer from "../components/Footer";

type HomeProps = {
  idols: Idol[];
  savings: MonthlySaving[];
};

export default function Home({ idols = [], savings = [] }: HomeProps) {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <SavingsCircle />
      <IdolList idols={idols} />
      <SavingsList savings={savings} />
      <Footer />
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
  ];

  return {
    props: {
      idols,
      savings,
    },
  };
};
