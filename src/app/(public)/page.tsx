import Hero from "../../components/sections/hero/Hero";
import Countdown from "../../components/sections/countdown/Countdown";
import Timeline from "../../components/sections/timeline/Timeline";
import Memories from "../../components/sections/memories/Memories";
import Introduction from "../../components/sections/introduction/Introduction";
import Team from "../../components/sections/team/Team";
import Sponsors from "../../components/sections/sponsors/Sponsors";

export default function Home() {
  return (
    <>
      <Hero />
      <Countdown />
      <Introduction />
      <Timeline />
      <Memories />
      <Team />
      <Sponsors />
    </>
  );
}