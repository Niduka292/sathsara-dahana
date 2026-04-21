import Hero from "../../components/sections/hero/Hero";
import Timeline from "../../components/sections/timeline/Timeline";
import Memories from "../../components/sections/memories/Memories";
import Introduction from "../../components/sections/introduction/Introduction";

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <Timeline />
      <Memories />
    </>
  );
}