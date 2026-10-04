export type Developer = {
  id: string;
  name: string;
  role: "Web Developer";
  /** Local path in public/images/developers, e.g. /images/developers/name.webp. */
  image: string;
  github: string;
  linkedin: string;
  email: string;
};

// Replace these four placeholders with your team's details.
// Leave unknown URLs empty: the card displays a disabled control, never a fake link.
export const developers: Developer[] = [
  { id: "developer-1", name: "Niduka Jayathunga", role: "Web Developer", image: "/images/developers/niduka.jpg", github: "https://github.com/Niduka292", linkedin: "https://linkedin.com/in/niduka-jayathunga", email: "nidukajayathunga886@gmail.com" },
  { id: "developer-2", name: "Nisadu Nimsitha", role: "Web Developer", image: "/images/developers/Nisadu.jpeg", github: "https://github.com/nisa2003-ops", linkedin: "https://www.linkedin.com/in/nisadu-nimsitha-512a24348", email: "nisadu2003@gmail.com" },
  { id: "developer-3", name: "Nandun Prasad", role: "Web Developer", image: "/images/developers/nandun.jpg", github: "https://github.com/DNandun", linkedin: "https://www.linkedin.com/in/nandun-prasad-232a39316/", email: "nandunprasad310@gmail.com" },
  { id: "developer-4", name: "Rusira Sandul", role: "Web Developer", image: "/images/developers/rusira.jpg", github: "https://github.com/rusirasandul", linkedin: "https://www.linkedin.com/in/rusira-sandul-b6bb87292", email: "rusirasandulhw@gmail.com" },
];
