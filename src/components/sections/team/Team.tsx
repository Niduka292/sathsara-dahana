"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import team1 from "../../../../assets/team-1.png";
import team2 from "../../../../assets/team-2.png";
import team3 from "../../../../assets/team-3.png";
import sisi1 from "../../../../assets/sisi-1.jpg";
import sisi2 from "../../../../assets/sisi-2.jpg";
import sisi3 from "../../../../assets/sisi-3.jpg";
import sisi4 from "../../../../assets/sisi-4.jpg";
import sisi5 from "../../../../assets/sisi-5.jpg";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Arun De Silva",
    role: "Visionary Lead",
    image: team1.src,
    description: "Leading the journey with passion.",
  },
  {
    id: "2",
    name: "Sisi Kumara",
    role: "Creative Director",
    image: team2.src,
    description: "Architect of visual experiences.",
  },
  {
    id: "3",
    name: "Niduka Perera",
    role: "Tech Architect",
    image: team3.src,
    description: "Building digital universes.",
  },
  {
    id: "4",
    name: "Kasun Jay",
    role: "UX Strategist",
    image: sisi1.src,
    description: "Designing seamless interactions.",
  },
  {
    id: "5",
    name: "Dilini Rose",
    role: "Visual Artist",
    image: sisi2.src,
    description: "Creating digital masterpieces.",
  },
  {
    id: "6",
    name: "Malith K",
    role: "Backend Lead",
    image: sisi3.src,
    description: "Optimizing the core systems.",
  },
  { id: "7", name: "Sara W", role: "Comm Lead", image: sisi4.src, description: "Voice of the vision." },
  {
    id: "8",
    name: "Ruwan P",
    role: "Operations",
    image: sisi5.src,
    description: "Managing the flow of energy.",
  },
];

export default function Team() {
  // Double the team members for seamless infinite scroll
  const doubledMembers = [...teamMembers, ...teamMembers];

  return (
    <section className="relative w-full py-40 bg-[#000511] overflow-hidden flex flex-col items-center justify-center min-h-[900px] perspective-[2000px]">
      {/* Background Starfield effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZyBmaWxsPSIjMWQ0ZWQ4IiBmaWxsLW9wYWNpdHk9IjAuNCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgLz48Y2lyY2xlIGN4PSIzODAiIGN5PSI4MCIgcj0iMS41IiAvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjMyMCIgcj0iMSIgLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSIyNTAigcj0iMS41IiAvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjkwIiByPSIwLjUiIC8+PC9nPjwvc3ZnPg==')] opacity-20" />
      </div>

      <div className="text-center mb-16 md:mb-24 relative z-10 px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold font-cinzel text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] mb-4"
        >
          The Visionaries
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-blue-200/60 font-serif italic text-base md:text-lg max-w-2xl mx-auto"
        >
          Orbiting the core of innovation and artistic excellence
        </motion.p>
      </div>

      {/* 3D Perspective Marquee Container */}
      <div className="relative w-full overflow-hidden py-10 md:py-16 px-4">
        <div className="flex animate-team-orbit whitespace-nowrap hover:[animation-play-state:paused] transition-all transform-gpu will-change-transform">
          {doubledMembers.map((member, index) => (
            <div
              key={`${member.id}-${index}`}
              className="inline-block mx-4 md:mx-6 min-w-[220px] max-w-[220px] md:min-w-[280px] md:max-w-[280px] perspective-[1000px] transform-gpu"
            >
              <div className="group relative transition-all duration-400 ease-[0.16,1,0.3,1] hover:scale-105">
                {/* 3D Card Content */}
                <div className="relative flex flex-col h-full bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-cyan-500/50 transition-all duration-400 ease-[0.16,1,0.3,1] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  
                  {/* Image Container with inner glow */}
                  <div className="relative h-[240px] md:h-[320px] w-full overflow-hidden transform-gpu">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
                    />
                    {/* Artistic Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000511] via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 border-[1px] border-white/5 m-2 rounded-xl pointer-events-none" />
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-6 flex flex-col items-center text-center whitespace-normal relative z-10">
                    <div className="w-12 h-[1px] bg-cyan-500/50 mb-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 ease-[0.16,1,0.3,1]" />
                    <h3 className="text-lg md:text-xl font-bold font-cinzel text-white mb-1 tracking-wide group-hover:text-cyan-400 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-cyan-500/80 font-medium text-[9px] md:text-[10px] tracking-[0.3em] uppercase mb-3">
                      {member.role}
                    </p>
                    <p className="text-blue-200/40 text-[10px] md:text-xs leading-relaxed italic group-hover:text-blue-100/60 transition-colors duration-300 line-clamp-2">
                      "{member.description}"
                    </p>
                  </div>

                  {/* Decorative Scanline Effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cinematic Depth Masks */}
        <div className="absolute inset-y-0 left-0 w-[10%] md:w-[25%] bg-gradient-to-r from-[#000511] via-[#000511]/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[10%] md:w-[25%] bg-gradient-to-l from-[#000511] via-[#000511]/90 to-transparent z-10 pointer-events-none" />
      </div>

      <style jsx global>{`
        @keyframes team-orbit {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-team-orbit {
          animation: team-orbit 60s linear infinite;
        }
        
        /* Perspective Curve Simulation */
        .animate-team-orbit > div {
          transition: transform 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}
