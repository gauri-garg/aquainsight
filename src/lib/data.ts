export type Dataset = {
  id: string;
  name: string;
  type: "Oceanographic" | "Fisheries" | "Molecular";
  submittedBy: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
  records: number;
};

export const datasets: Dataset[] = [
  {
    id: "DS001",
    name: "Antarctic Krill Survey 2023",
    type: "Fisheries",
    submittedBy: "Dr. Anya Sharma",
    status: "Approved",
    date: "2023-11-20",
    records: 15203,
  },
  {
    id: "DS002",
    name: "Southern Ocean Salinity Profile",
    type: "Oceanographic",
    submittedBy: "Dr. Ben Carter",
    status: "Approved",
    date: "2023-10-05",
    records: 8940,
  },
  {
    id: "DS003",
    name: "Ross Sea eDNA Metabarcoding",
    type: "Molecular",
    submittedBy: "Dr. Chloe Garcia",
    status: "Pending",
    date: "2024-01-15",
    records: 34560,
  },
  {
    id: "DS004",
    name: "Otolith Microchemistry - Icefish",
    type: "Fisheries",
    submittedBy: "Dr. David Lee",
    status: "Approved",
    date: "2023-09-12",
    records: 2100,
  },
  {
    id: "DS005",
    name: "Weddell Sea Phytoplankton Bloom",
    type: "Oceanographic",
    submittedBy: "Dr. Emily White",
    status: "Approved",
    date: "2023-12-01",
    records: 12500,
  },
  {
    id: "DS006",
    name: "Patagonian Toothfish Genetics",
    type: "Molecular",
    submittedBy: "Dr. Frank Miller",
    status: "Rejected",
    date: "2024-01-02",
    records: 5800,
  },
  {
    id: "DS007",
    name: "Amundsen Sea Current Metrics",
    type: "Oceanographic",
    submittedBy: "Dr. Grace Hall",
    status: "Pending",
    date: "2024-01-22",
    records: 11230,
  },
];

export const speciesDistributionData = [
  { species: "Antarctic Krill", count: 450, fill: "var(--color-chart-1)" },
  { species: "Icefish", count: 280, fill: "var(--color-chart-2)" },
  { species: "Silverfish", count: 200, fill: "var(--color-chart-3)" },
  { species: "Toothfish", count: 180, fill: "var(--color-chart-4)" },
  { species: "Other", count: 150, fill: "var(--color-chart-5)" },
];

export const oceanParameterData = [
  { month: "Jan", temp: 0.5, salinity: 34.1 },
  { month: "Feb", temp: 0.2, salinity: 34.2 },
  { month: "Mar", temp: -0.5, salinity: 34.3 },
  { month: "Apr", temp: -1.0, salinity: 34.5 },
  { month: "May", temp: -1.5, salinity: 34.7 },
  { month: "Jun", temp: -1.8, salinity: 34.8 },
  { month: "Jul", temp: -2.0, salinity: 34.9 },
  { month: "Aug", temp: -2.1, salinity: 34.8 },
  { month: "Sep", temp: -1.7, salinity: 34.6 },
  { month: "Oct", temp: -1.2, salinity: 34.4 },
  { month: "Nov", temp: -0.5, salinity: 34.2 },
  { month: "Dec", temp: 0.1, salinity: 34.1 },
];
