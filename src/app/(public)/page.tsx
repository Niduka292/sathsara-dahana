import Hero from "../../components/sections/hero/Hero";
import ResultsAnnouncement from "../../components/results/ResultsAnnouncement";
import Timeline from "../../components/sections/timeline/Timeline";
import Introduction from "../../components/sections/introduction/Introduction";
import Artists from "../../components/sections/artists/Artists";
import Orchestra from "../../components/sections/orchestra/Orchestra";

export default function Home() {
  return (
    <>
      <ResultsAnnouncement />
      <Hero />
      <Introduction />
      <Artists />
      <Orchestra />
      <Timeline />
    </>
  );
}
