export type SelectionResult = {
  indexNumber: string;
  name: string;
  registrationNumber: string;
  category: ResultCategory;
  status: SelectionStatus;
  instrument?: string;
};

export type ResultCategory = "dancing" | "singing" | "instrumental";
export type SelectionStatus = "selected" | "reserve";

/**
 * Public Dancing Crew selection results.
 *
 * Only add fields that are safe to publish. Never include phone numbers,
 * email addresses, identity numbers, addresses, marks, or private notes.
 * The search and table update automatically when this array is replaced.
 */
const dancingRows = [
  { indexNumber: "AS2022170", name: "G.A. Imadhi", registrationNumber: "S011" },
  { indexNumber: "AS2022271", name: "H.S.Aluthduwehewage", registrationNumber: "S062" },
  { indexNumber: "AS2023027", name: "K.G. Vidanagamage", registrationNumber: "S047" },
  { indexNumber: "AS2023049", name: "H.C.D.Sayuri Madushalki", registrationNumber: "S048" },
  { indexNumber: "AS2023053", name: "T.P.T.Fernando", registrationNumber: "S049" },
  { indexNumber: "AS2023073", name: "M.C. Rathnayaka", registrationNumber: "S016" },
  { indexNumber: "AS2023124", name: "K.D.C.Fernando", registrationNumber: "S056" },
  { indexNumber: "AS2023125", name: "M.K. Ishadi Sanjana", registrationNumber: "S007" },
  { indexNumber: "AS2023214", name: "E.M.S Shashikala Mudalige", registrationNumber: "S057" },
  { indexNumber: "AS2023221", name: "K.A. Rashmini Yasanjalee", registrationNumber: "S017" },
  { indexNumber: "AS2023232", name: "A.T.R. Fernando", registrationNumber: "S015" },
  { indexNumber: "AS2023285", name: "Sayumi Sithara Palliyage", registrationNumber: "S067" },
  { indexNumber: "AS2023292", name: "S.A.H.S. Gunarathna", registrationNumber: "S014" },
  { indexNumber: "AS2023303", name: "H.D.K. Karunarathne", registrationNumber: "S068" },
  { indexNumber: "AS2023309", name: "G. H. Ekanayaka", registrationNumber: "S038" },
  { indexNumber: "AS2023375", name: "Hiruni Athapaththu", registrationNumber: "S069" },
  { indexNumber: "AS2023445", name: "Vihara Bandara", registrationNumber: "S023" },
  { indexNumber: "AS2023470", name: "S.S.Ranaweera", registrationNumber: "S030" },
  { indexNumber: "AS2023480", name: "Isuri Ekanayake", registrationNumber: "S025" },
  { indexNumber: "AS2023489", name: "W.V. Tharunika", registrationNumber: "S024" },
  { indexNumber: "AS2023490", name: "P.D.S.I. Kavindya", registrationNumber: "S042" },
  { indexNumber: "AS2023569", name: "M.A.A.S.Marasingha", registrationNumber: "S036" },
  { indexNumber: "AS2023578", name: "M.H.S.Mallawarachchi", registrationNumber: "S044" },
  { indexNumber: "AS2023580", name: "M.L.S.C. Thathsarani", registrationNumber: "S034" },
  { indexNumber: "AS2023612", name: "H.M.V.G.P.N.Abeyrathna", registrationNumber: "S041" },
  { indexNumber: "AS2023613", name: "P.U.A.H. Fernando", registrationNumber: "S022" },
  { indexNumber: "AS2023621", name: "U.C.N. Nethumila", registrationNumber: "S001" },
  { indexNumber: "AS2023636", name: "D.N. Vidanage", registrationNumber: "S003" },
  { indexNumber: "AS2023676", name: "M H W S M S S Herath", registrationNumber: "S029" },
  { indexNumber: "AS2023678", name: "D. N. C. Fernando", registrationNumber: "S059" },
  { indexNumber: "AS2023728", name: "M.D.T. Pathmasena", registrationNumber: "S035" },
  { indexNumber: "AS2023947", name: "K. G. Lakshani", registrationNumber: "S052" },
  { indexNumber: "AS2023953", name: "G.K.T. Perera", registrationNumber: "S012" },
  { indexNumber: "AS2023954", name: "A.M.A.C.C. Alagiyawanna", registrationNumber: "S045" },
  { indexNumber: "AS2023963", name: "M.K.D.P.A. Miriyagalla", registrationNumber: "S013" },
  { indexNumber: "AS2023965", name: "A.M.D.D. Alagiyawanna", registrationNumber: "S046" },
  { indexNumber: "AS2023973", name: "A.P.N. Perera", registrationNumber: "S063" },
  { indexNumber: "AS20240013", name: "N.G.Deshani Geethika", registrationNumber: "S053" },
  { indexNumber: "AS20240030", name: "A.C.B.D. Samansooriya", registrationNumber: "S004" },
  { indexNumber: "AS20240051", name: "Niyunika Shalani Wijesooriya", registrationNumber: "S027" },
  { indexNumber: "AS20240071", name: "H.M. Bhagya Sewmini", registrationNumber: "S051" },
  { indexNumber: "AS20240083", name: "K.S.S. De Abrew", registrationNumber: "S058" },
  { indexNumber: "AS20240103", name: "A.P. Binura Chathumina", registrationNumber: "S050" },
  { indexNumber: "AS20240144", name: "M.J.N. Himansa", registrationNumber: "S032" },
  { indexNumber: "AS20240146", name: "B.A.V. Deminthi", registrationNumber: "S009" },
  { indexNumber: "AS20240177", name: "O.V.Y.W. Dulmanthee", registrationNumber: "S008" },
  { indexNumber: "AS20240243", name: "S.A.S.H.T. Upathissa", registrationNumber: "S010" },
  { indexNumber: "AS20240291", name: "M. D. S. Himansa", registrationNumber: "S028" },
  { indexNumber: "AS20240293", name: "K.V.S.A. Samarasinghe", registrationNumber: "S064" },
  { indexNumber: "AS20240373", name: "J.M.M.N. Jayasingha", registrationNumber: "S061" },
  { indexNumber: "AS20240380", name: "M. Nathasha Hermian", registrationNumber: "S065" },
  { indexNumber: "AS20240397", name: "K.A.D.S. Umasha", registrationNumber: "S055" },
  { indexNumber: "AS20240418", name: "P. H. D. Dilshan", registrationNumber: "S060" },
  { indexNumber: "AS20240453", name: "W.P.V.N. Pathirana", registrationNumber: "S040" },
  { indexNumber: "AS20240498", name: "N.N. Thennakoon", registrationNumber: "S031" },
  { indexNumber: "AS20240509", name: "T.N. Kaluarachchi", registrationNumber: "S039" },
  { indexNumber: "AS20240510", name: "D.E. Sandupama", registrationNumber: "S033" },
  { indexNumber: "AS20240512", name: "Nethmi Nimansana", registrationNumber: "S002" },
  { indexNumber: "AS20240517", name: "Nethma.M.Abeysirigunawardhana", registrationNumber: "S021" },
  { indexNumber: "AS20240593", name: "T.D.Rushini Keshani", registrationNumber: "S019" },
  { indexNumber: "AS20240596", name: "Olu Thewarapperuma", registrationNumber: "S006" },
  { indexNumber: "AS20240631", name: "T.U.P. Ranchagoda", registrationNumber: "S020" },
  { indexNumber: "AS20240642", name: "V. Chamika dewmini", registrationNumber: "S054" },
  { indexNumber: "AS20240643", name: "H. H. Hirushima", registrationNumber: "S018" },
  { indexNumber: "AS20240648", name: "Hasal Nawarathne", registrationNumber: "S066" },
  { indexNumber: "AS20240665", name: "P.K.S.V. Wijerathne", registrationNumber: "S037" },
  { indexNumber: "AS20240709", name: "R.S.S. Samarakkody", registrationNumber: "S005" },
  { indexNumber: "AS20240975", name: "R.A.A.D.Morathota", registrationNumber: "S026" },
  { indexNumber: "AS20241007", name: "K.D. Sasini Gavindya", registrationNumber: "S043" },
] satisfies Array<Pick<SelectionResult, "indexNumber" | "name" | "registrationNumber">>;

export const dancingCrewResults: SelectionResult[] = dancingRows.map((row) => ({
  ...row,
  category: "dancing",
  status: "selected",
}));
