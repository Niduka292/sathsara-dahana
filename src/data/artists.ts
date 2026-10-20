export interface Artist {
  id: string;
  name: string;
  role: string;
  category: "Special Guest" | "Vocal" | "Dancing" | "Instrumental";
  image: string;
  description: string;
  performanceTime?: string;
  badge?: string;
}

export const artistsData: Artist[] = [
  {
    id: "artist-1",
    name: "Sanka Dineth",
    role: "Featured Guest Vocalist",
    category: "Special Guest",
    image: "/images/artists/artist-2.png",
    description:
      "Bringing soulful melodies and grand orchestral arrangements to Sathsara Dahana 2026. An unforgettable live performance echoing through time.",
    performanceTime: "Main Stage • 8:30 PM",
    badge: "Headliner",
  },
  {
    id: "artist-2",
    name: "Adithya Waliwatta",
    role: "Guest Vocal Ensemble",
    category: "Vocal",
    image: "/images/artists/artist-3.png",
    description:
      "A captivating vocal prowess and dynamic stage presence, weaving contemporary power with timeless musical harmonies.",
    performanceTime: "Main Stage • 9:15 PM",
    badge: "Featured Act",
  },
  {
    id: "artist-3",
    name: "Suneera Sumanga",
    role: "Contemporary & Pop Performance",
    category: "Vocal",
    image: "/images/artists/artist-1.png",
    description:
      "Renowned for vibrant pop-fusion tracks and electric energy that illuminates the celestial stage.",
    performanceTime: "Main Stage • 7:45 PM",
    badge: "Special Guest",
  },
  {
    id: "artist-4",
    name: "Lahiru Perera",
    role: "Fusion & Experimental Lead",
    category: "Instrumental",
    image: "/images/artists/artist-4.png",
    description:
      "Merging eastern traditional roots with modern sonic textures for an immersive performance experience.",
    performanceTime: "Grand Finale • 10:00 PM",
    badge: "Finale Act",
  },
];
