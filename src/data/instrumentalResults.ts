import { normalizeInstrumentalResult, type RawResultRow } from "@/src/services/results.normalizers";

// The source "Final List" tab has no header row. Its populated columns are:
// role/group, name, index number, registration number. Repeated group blanks
// inherit the preceding role. Only these public fields are retained below.
const selectedRows: RawResultRow[] = [
  { Instrument: "Keyboardist", Name: "B.Y.N. Seneviratne", "Index Number": "AS2023310", "Reg. No.": "I022" },
  { Instrument: "Keyboardist", Name: "H.K. Daham Nethsara", "Index Number": "AS20240165", "Reg. No.": "I011" },
  { Instrument: "Guitarist", Name: "M.K. Pulindu Ransaka", "Index Number": "AS20240565", "Reg. No.": "I010" },
  { Instrument: "Guitarist", Name: "W.A.T. Dhananjaya", "Index Number": "AS2023942", "Reg. No.": "I006" },
  { Instrument: "Acoustic Guitarist", Name: "E.A.D.N. Jayasinghe", "Index Number": "AS2023378", "Reg. No.": "I005" },
  { Instrument: "Bass Guitarist", Name: "H.M.R.T. Herath", "Index Number": "AS20240623", "Reg. No.": "I009" },
  { Instrument: "Flautist", Name: "W.M.D.I. Wanninayake", "Index Number": "AS20240741", "Reg. No.": "I007" },
  { Instrument: "Violinist", Name: "H.W.T. Sewwandi", "Index Number": "AS2023662", "Reg. No.": "I004" },
  { Instrument: "Violinist", Name: "A.V. Dinith Chanuka Madhubhashana", "Index Number": "AS20240736", "Reg. No.": "I013" },
  { Instrument: "Violinist", Name: "P.L. Wijerathne", "Index Number": "AS20240447", "Reg. No.": "I008" },
  { Instrument: "Drummer", Name: "H.R.A. Dilshan", "Index Number": "AS20240548", "Reg. No.": "I016" },
  { Instrument: "Drummer", Name: "N.S. Kulathunga", "Index Number": "AS2023203", "Reg. No.": "I017" },
  { Instrument: "Drummer", Name: "D.M.R.S. Medhawa", "Index Number": "AS2023902", "Reg. No.": "I020" },
  { Instrument: "Percussionist", Name: "H.D. Binusha Hewage", "Index Number": "AS2023391", "Reg. No.": "I021" },
  { Instrument: "Percussionist", Name: "L.M.D.T. Senadheera", "Index Number": "AS20241029", "Reg. No.": "I019" },
];

// These rows are under the source sheet's "Reserve Performers" section.
const reserveRows: RawResultRow[] = [
  { Instrument: "Pianist", Name: "M.T.H.M. Perera", "Index Number": "AS20240909", "Reg. No.": "I003" },
  { Instrument: "Violinist", Name: "M.N. Premakumar", "Index Number": "AS20240457", "Reg. No.": "I001" },
  { Instrument: "Guitarist", Name: "G.W.S. Chamathkara", "Index Number": "AS20240094", "Reg. No.": "I012" },
];

export const instrumentalResults = [
  ...selectedRows.map((row) => normalizeInstrumentalResult(row, "selected")),
  ...reserveRows.map((row) => normalizeInstrumentalResult(row, "reserve")),
];
