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

export const physicalOceanographyData = [
  { date: "2025-08-01", waveHeight: 1.21, tide: 1.15, temperature: 27.53, salinity: 34.68 },
  { date: "2025-08-02", waveHeight: 2.25, tide: 0.92, temperature: 28, salinity: 34.58 },
  { date: "2025-08-03", waveHeight: 1.87, tide: 1.14, temperature: 28.19, salinity: 34.74 },
  { date: "2025-08-04", waveHeight: 1.43, tide: 0.9, temperature: 27.49, salinity: 34.6 },
  { date: "2025-08-05", waveHeight: 1.5, tide: 1.06, temperature: 27.39, salinity: 34.59 },
  { date: "2025-08-06", waveHeight: 1.67, tide: 0.99, temperature: 27.58, salinity: 34.54 },
  { date: "2025-08-07", waveHeight: 2.37, tide: 0.81, temperature: 27.93, salinity: 34.74 },
  { date: "2025-08-08", waveHeight: 1.11, tide: 0.97, temperature: 27.91, salinity: 34.72 },
  { date: "2025-08-09", waveHeight: 0.9, tide: 0.91, temperature: 28.02, salinity: 34.67 },
  { date: "2025-08-10", waveHeight: 1.3, tide: 0.7, temperature: 27.96, salinity: 34.58 },
  { date: "2025-08-11", waveHeight: 1.34, tide: 0.61, temperature: 27.98, salinity: 34.6 },
  { date: "2025-08-12", waveHeight: 1.59, tide: 0.83, temperature: 28.14, salinity: 34.64 },
  { date: "2025-08-13", waveHeight: 1.82, tide: 0.3, temperature: 27.5, salinity: 34.57 },
  { date: "2025-08-14", waveHeight: 1.71, tide: 0.34, temperature: 27.72, salinity: 34.64 },
  { date: "2025-08-15", waveHeight: 0.81, tide: 0.47, temperature: 27.57, salinity: 34.66 },
  { date: "2025-08-16", waveHeight: 2.3, tide: 0.26, temperature: 27.66, salinity: 34.61 },
  { date: "2025-08-17", waveHeight: 1.12, tide: 0.32, temperature: 27.81, salinity: 34.61 },
  { date: "2025-08-18", waveHeight: 1.09, tide: 0.3, temperature: 27.6, salinity: 34.73 },
  { date: "2025-08-19", waveHeight: 1.38, tide: 0.12, temperature: 27.82, salinity: 34.63 },
  { date: "2025-08-20", waveHeight: 1.78, tide: 0.06, temperature: 27.42, salinity: 34.54 },
  { date: "2025-08-21", waveHeight: 1.83, tide: 0.02, temperature: 27.71, salinity: 34.63 },
  { date: "2025-08-22", waveHeight: 1.13, tide: 0.02, temperature: 27.72, salinity: 34.63 },
  { date: "2025-08-23", waveHeight: 1.55, tide: 0.16, temperature: 27.76, salinity: 34.61 },
  { date: "2025-08-24", waveHeight: 1.32, tide: 0.05, temperature: 27.59, salinity: 34.51 },
  { date: "2025-08-25", waveHeight: 1.37, tide: 0, temperature: 27.73, salinity: 34.64 },
  { date: "2025-08-26", waveHeight: 1.5, tide: -0.01, temperature: 27.83, salinity: 34.61 },
  { date: "2025-08-27", waveHeight: 1.36, tide: -0.13, temperature: 27.67, salinity: 34.66 },
  { date: "2025-08-28", waveHeight: 0.87, tide: 0.05, temperature: 27.86, salinity: 34.66 },
  { date: "2025-08-29", waveHeight: 0.88, tide: 0.12, temperature: 27.88, salinity: 34.57 },
  { date: "2025-08-30", waveHeight: 2.02, tide: 0.09, temperature: 27.64, salinity: 34.65 },
];
