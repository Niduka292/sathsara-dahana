export interface OrchestraMember {
  id: string;
  name: string;
  role: string;
  category: "Strings" | "Percussion" | "Wind & Brass" | "Keyboards & Rhythm";
  image: string;
  bio: string;
  experience?: string;
  stagePosition: {
    // Desktop stage coordinates & layering
    desktop: {
      left: string;
      bottom: string;
      zIndex: number;
      width: string;
      height: string;
    };
    // Mobile stage coordinates & layering
    mobile: {
      left: string;
      bottom: string;
      zIndex: number;
      width: string;
      height: string;
    };
  };
}

export const ORCHESTRA_CATEGORIES = [
  "All",
  "Strings",
  "Percussion",
  "Wind & Brass",
] as const;

export type OrchestraCategory = (typeof ORCHESTRA_CATEGORIES)[number];

export const orchestraMembers: OrchestraMember[] = [
  {
    id: "guitarist",
    name: "Kasun Perera",
    role: "Lead & Rhythm Guitarist",
    category: "Strings",
    image: "/images/orchestra/guitarist-removebg-preview.png",
    bio: "Weaving electrifying guitar melodies and intricate rhythm riffs that power the band's acoustic-fusion sound.",
    experience: "Lead Guitarist • Sathsara Ensemble",
    stagePosition: {
      desktop: { left: "10%", bottom: "0%", zIndex: 30, width: "240px", height: "360px" },
      mobile: { left: "2%", bottom: "0%", zIndex: 30, width: "140px", height: "230px" },
    },
  },
  {
    id: "flutist",
    name: "Bhanuka Wijesinghe",
    role: "Bansuri & Flute Soloist",
    category: "Wind & Brass",
    image: "/images/orchestra/flute_player-removebg-preview.png",
    bio: "Master flutist crafting ethereal, serene melodies that touch the heart of every classical piece.",
    experience: "Principal Flutist • 8 Years",
    stagePosition: {
      desktop: { left: "26%", bottom: "10%", zIndex: 20, width: "220px", height: "330px" },
      mobile: { left: "20%", bottom: "14%", zIndex: 20, width: "130px", height: "210px" },
    },
  },
  {
    id: "drummer",
    name: "Pradeep Ranasinghe",
    role: "Master Drummer & Percussionist",
    category: "Percussion",
    image: "/images/orchestra/drummer-removebg-preview.png",
    bio: "The rhythmic heartbeat of the band, orchestrating explosive drum grooves and dynamic climaxes.",
    experience: "Band Rhythm Director",
    stagePosition: {
      desktop: { left: "44%", bottom: "16%", zIndex: 10, width: "260px", height: "350px" },
      mobile: { left: "40%", bottom: "22%", zIndex: 10, width: "150px", height: "220px" },
    },
  },
  {
    id: "percussionist",
    name: "Ravindu Bandara",
    role: "Traditional Percussionist",
    category: "Percussion",
    image: "/images/orchestra/percussionist-removebg-preview.png",
    bio: "Preserving traditional Sri Lankan folk rhythms and intricate acoustic percussion cycles.",
    experience: "Heritage Percussion Specialist",
    stagePosition: {
      desktop: { left: "62%", bottom: "8%", zIndex: 20, width: "230px", height: "340px" },
      mobile: { left: "58%", bottom: "12%", zIndex: 20, width: "135px", height: "215px" },
    },
  },
  {
    id: "violinist",
    name: "Shenali Fernando",
    role: "Virtuoso Violinist",
    category: "Strings",
    image: "/images/orchestra/violinist-removebg-preview.png",
    bio: "Symphonic violinist bringing intense emotional depth and soaring classical harmonies to the stage.",
    experience: "First Violinist • Sathsara Orchestra",
    stagePosition: {
      desktop: { left: "78%", bottom: "0%", zIndex: 30, width: "230px", height: "360px" },
      mobile: { left: "72%", bottom: "0%", zIndex: 30, width: "140px", height: "230px" },
    },
  },
];
