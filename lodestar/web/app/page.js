import Nav from "../components/Nav";
import Hero from "../components/Hero";
import Problem from "../components/Problem";
import MeetVega from "../components/MeetVega";
import DailyLoop from "../components/DailyLoop";
import Science from "../components/Science";
import LifeMap from "../components/LifeMap";
import Proof from "../components/Proof";
import Pricing from "../components/Pricing";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <MeetVega />
        <DailyLoop />
        <Science />
        <LifeMap />
        <Proof />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
