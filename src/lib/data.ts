

export type DatasetType =
  | "Physical Oceanography"
  | "Chemical Oceanography"
  | "Marine Weather"
  | "Ocean Atmosphere"
  | "Fisheries"
  | "eDNA";


export type Dataset = {
  id: string;
  name: string;
  type: DatasetType;
  submittedBy: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
  records: number;
  description?: string;
  summary?: string;
};

export const physicalOceanographyData = [
  { date: "2025-08-01", latitude: 10.8975, longitude: 72.2076, temperature: 27.53, salinity: 34.68, density: 1025.15, ventSpeed: 0.2, waveHeight: 1.21, tide: 1.15, velAnomaly: -1.91, mixingIndex: 0.41 },
  { date: "2025-08-02", latitude: 10.5217, longitude: 72.1706, temperature: 28, salinity: 34.58, density: 1024.97, ventSpeed: 0.48, waveHeight: 2.25, tide: 0.92, velAnomaly: 2.05, mixingIndex: 0.41 },
  { date: "2025-08-03", latitude: 10.353, longitude: 72.5702, temperature: 28.19, salinity: 34.74, density: 1025.09, ventSpeed: 0.58, waveHeight: 1.87, tide: 1.14, velAnomaly: 1.07, mixingIndex: 0.74 },
  { date: "2025-08-04", latitude: 10.8975, longitude: 72.2076, temperature: 27.49, salinity: 34.6, density: 1025.23, ventSpeed: 0.21, waveHeight: 1.43, tide: 0.9, velAnomaly: 3.2, mixingIndex: 0 },
  { date: "2025-08-05", latitude: 10.5217, longitude: 72.1706, temperature: 27.39, salinity: 34.59, density: 1025.26, ventSpeed: 0.47, waveHeight: 1.5, tide: 1.06, velAnomaly: 1.96, mixingIndex: 0.56 },
  { date: "2025-08-06", latitude: 10.353, longitude: 72.5702, temperature: 27.58, salinity: 34.54, density: 1025.09, ventSpeed: 0.61, waveHeight: 1.67, tide: 0.99, velAnomaly: 8.5, mixingIndex: 0.58 },
  { date: "2025-08-07", latitude: 10.8975, longitude: 72.2076, temperature: 27.93, salinity: 34.74, density: 1024.91, ventSpeed: 0.29, waveHeight: 2.37, tide: 0.81, velAnomaly: 4.39, mixingIndex: 0.71 },
  { date: "2025-08-08", latitude: 10.5217, longitude: 72.1706, temperature: 27.91, salinity: 34.72, density: 1025.2, ventSpeed: 0.71, waveHeight: 1.11, tide: 0.97, velAnomaly: 4.96, mixingIndex: 0.23 },
  { date: "2025-08-09", latitude: 10.353, longitude: 72.5702, temperature: 28.02, salinity: 34.67, density: 1025.03, ventSpeed: 0.45, waveHeight: 0.9, tide: 0.91, velAnomaly: 5.27, mixingIndex: 0.33 },
  { date: "2025-08-10", latitude: 10.8975, longitude: 72.2076, temperature: 27.96, salinity: 34.58, density: 1024.84, ventSpeed: 0.71, waveHeight: 1.3, tide: 0.7, velAnomaly: 3.08, mixingIndex: 0.18 },
  { date: "2025-08-11", latitude: 10.5217, longitude: 72.1706, temperature: 27.98, salinity: 34.6, density: 1025.21, ventSpeed: 0.66, waveHeight: 1.34, tide: 0.61, velAnomaly: 3.29, mixingIndex: 0.26 },
  { date: "2025-08-12", latitude: 10.353, longitude: 72.5702, temperature: 28.14, salinity: 34.64, density: 1025.12, ventSpeed: 0.25, waveHeight: 1.59, tide: 0.83, velAnomaly: 4.09, mixingIndex: 0.71 },
  { date: "2025-08-13", latitude: 10.8975, longitude: 72.2076, temperature: 27.5, salinity: 34.57, density: 1025.18, ventSpeed: 0.42, waveHeight: 1.82, tide: 0.3, velAnomaly: 6.4, mixingIndex: 1 },
  { date: "2025-08-14", latitude: 10.5217, longitude: 72.1706, temperature: 27.72, salinity: 34.64, density: 1025.11, ventSpeed: 0.13, waveHeight: 1.71, tide: 0.34, velAnomaly: 4.12, mixingIndex: 0.75 },
  { date: "2025-08-15", latitude: 10.353, longitude: 72.5702, temperature: 27.57, salinity: 34.66, density: 1025.22, ventSpeed: 0.56, waveHeight: 0.81, tide: 0.47, velAnomaly: 8.89, mixingIndex: 0.09 },
  { date: "2025-08-16", latitude: 10.8975, longitude: 72.2076, temperature: 27.66, salinity: 34.61, density: 1025.12, ventSpeed: 0.65, waveHeight: 2.3, tide: 0.26, velAnomaly: 6.6, mixingIndex: 0.6 },
  { date: "2025-08-17", latitude: 10.5217, longitude: 72.1706, temperature: 27.81, salinity: 34.61, density: 1024.98, ventSpeed: 0.28, waveHeight: 1.12, tide: 0.32, velAnomaly: 6.49, mixingIndex: 0.56 },
  { date: "2025-08-18", latitude: 10.353, longitude: 72.5702, temperature: 27.6, salinity: 34.73, density: 1025.26, ventSpeed: 0.43, waveHeight: 1.09, tide: 0.3, velAnomaly: 7.51, mixingIndex: 0.57 },
  { date: "2025-08-19", latitude: 10.8975, longitude: 72.2076, temperature: 27.82, salinity: 34.63, density: 1025.12, ventSpeed: 0.81, waveHeight: 1.38, tide: 0.12, velAnomaly: 5.26, mixingIndex: 0.56 },
  { date: "2025-08-20", latitude: 10.5217, longitude: 72.1706, temperature: 27.42, salinity: 34.54, density: 1025.06, ventSpeed: 0.53, waveHeight: 1.78, tide: 0.06, velAnomaly: 7.51, mixingIndex: 0.47 },
  { date: "2025-08-21", latitude: 10.353, longitude: 72.5702, temperature: 27.71, salinity: 34.63, density: 1025.11, ventSpeed: 0.64, waveHeight: 1.83, tide: 0.02, velAnomaly: 7.8, mixingIndex: 0.28 },
  { date: "2025-08-22", latitude: 10.8975, longitude: 72.2076, temperature: 27.72, salinity: 34.63, density: 1024.99, ventSpeed: 0.48, waveHeight: 1.13, tide: 0.02, velAnomaly: 5.14, mixingIndex: 0.79 },
  { date: "2025-08-23", latitude: 10.5217, longitude: 72.1706, temperature: 27.76, salinity: 34.61, density: 1025.05, ventSpeed: 0.53, waveHeight: 1.55, tide: 0.16, velAnomaly: 7.12, mixingIndex: 0.43 },
  { date: "2025-08-24", latitude: 10.353, longitude: 72.5702, temperature: 27.59, salinity: 34.51, density: 1025.08, ventSpeed: 0.3, waveHeight: 1.32, tide: 0.05, velAnomaly: 4.68, mixingIndex: 0.49 },
  { date: "2025-08-25", latitude: 10.8975, longitude: 72.2076, temperature: 27.73, salinity: 34.64, density: 1025.11, ventSpeed: 0.15, waveHeight: 1.37, tide: 0, velAnomaly: 3.03, mixingIndex: 0.46 },
  { date: "2025-08-26", latitude: 10.5217, longitude: 72.1706, temperature: 27.83, salinity: 34.61, density: 1025.29, ventSpeed: 0.64, waveHeight: 1.5, tide: -0.01, velAnomaly: 3.54, mixingIndex: 0.32 },
  { date: "2025-08-27", latitude: 10.353, longitude: 72.5702, temperature: 27.67, salinity: 34.66, density: 1025.16, ventSpeed: 0.62, waveHeight: 1.36, tide: -0.13, velAnomaly: 2.38, mixingIndex: 0.82 },
  { date: "2025-08-28", latitude: 10.8975, longitude: 72.2076, temperature: 27.86, salinity: 34.66, density: 1024.99, ventSpeed: 0.5, waveHeight: 0.87, tide: 0.05, velAnomaly: 2.45, mixingIndex: 0.43 },
  { date: "2025-08-29", latitude: 10.5217, longitude: 72.1706, temperature: 27.88, salinity: 34.57, density: 1024.98, ventSpeed: 0.23, waveHeight: 0.88, tide: 0.12, velAnomaly: -0.26, mixingIndex: 0.65 },
  { date: "2025-08-30", latitude: 10.353, longitude: 72.5702, temperature: 27.64, salinity: 34.65, density: 1025.14, ventSpeed: 0.41, waveHeight: 2.02, tide: 0.09, velAnomaly: 4.13, mixingIndex: 0.46 },
];

export const chemicalOceanographyData = [
  { date: "2025-08-02", latitude: 10.8975, longitude: 72.2076, salinity: 34.7, pH: 8.09, nitrate: 0.63, phosphate: 0.28, silicate: 0.93 },
  { date: "2025-08-03", latitude: 10.5217, longitude: 72.1706, salinity: 34.66, pH: 8.11, nitrate: 0.65, phosphate: 0.18, silicate: 1.16 },
  { date: "2025-08-04", latitude: 10.353, longitude: 72.5702, salinity: 34.65, pH: 8.09, nitrate: 0.55, phosphate: 0.1, silicate: 0.48 },
  { date: "2025-08-05", latitude: 10.8975, longitude: 72.2076, salinity: 34.65, pH: 8.08, nitrate: 0.56, phosphate: 0.15, silicate: 0.58 },
  { date: "2025-08-06", latitude: 10.5217, longitude: 72.1706, salinity: 34.75, pH: 8.09, nitrate: 0.51, phosphate: 0.13, silicate: 0.84 },
  { date: "2025-08-07", latitude: 10.353, longitude: 72.5702, salinity: 34.68, pH: 8.08, nitrate: 0.58, phosphate: 0.17, silicate: 0.91 },
  { date: "2025-08-08", latitude: 10.8975, longitude: 72.2076, salinity: 34.64, pH: 8.11, nitrate: 0.5, phosphate: 0.15, silicate: 1.25 },
  { date: "2025-08-09", latitude: 10.5217, longitude: 72.1706, salinity: 34.61, pH: 8.09, nitrate: 0.11, phosphate: 0.13, silicate: 1.06 },
  { date: "2025-08-10", latitude: 10.353, longitude: 72.5702, salinity: 34.71, pH: 8.09, nitrate: 0.48, phosphate: 0.18, silicate: 0.56 },
  { date: "2025-08-11", latitude: 10.8975, longitude: 72.2076, salinity: 34.64, pH: 8.09, nitrate: 0.71, phosphate: 0.22, silicate: 0.47 },
  { date: "2025-08-12", latitude: 10.5217, longitude: 72.1706, salinity: 34.69, pH: 8.09, nitrate: 0.36, phosphate: 0.23, silicate: 1.31 },
  { date: "2025-08-13", latitude: 10.353, longitude: 72.5702, salinity: 34.72, pH: 8.08, nitrate: 0.44, phosphate: 0.22, silicate: 1.29 },
  { date: "2025-08-14", latitude: 10.8975, longitude: 72.2076, salinity: 34.65, pH: 8.09, nitrate: 0.28, phosphate: 0.14, silicate: 1.24 },
  { date: "2025-08-15", latitude: 10.5217, longitude: 72.1706, salinity: 34.74, pH: 8.09, nitrate: 0.7, phosphate: 0.22, silicate: 0.81 },
  { date: "2025-08-16", latitude: 10.353, longitude: 72.5702, salinity: 34.69, pH: 8.11, nitrate: 0.49, phosphate: 0.28, silicate: 0.21 },
  { date: "2025-08-17", latitude: 10.8975, longitude: 72.2076, salinity: 34.71, pH: 8.09, nitrate: 0.44, phosphate: 0.2, silicate: 0.4 },
  { date: "2025-08-18", latitude: 10.5217, longitude: 72.1706, salinity: 34.66, pH: 8.1, nitrate: 0.8, phosphate: 0.17, silicate: 0.76 },
  { date: "2025-08-19", latitude: 10.353, longitude: 72.5702, salinity: 34.65, pH: 8.1, nitrate: 0.57, phosphate: 0.17, silicate: 1.15 },
  { date: "2025-08-20", latitude: 10.8975, longitude: 72.2076, salinity: 34.68, pH: 8.1, nitrate: 0.36, phosphate: 0.18, silicate: 0.88 },
  { date: "2025-08-21", latitude: 10.5217, longitude: 72.1706, salinity: 34.6, pH: 8.09, nitrate: 0.55, phosphate: 0.2, silicate: 0.93 },
  { date: "2025-08-22", latitude: 10.353, longitude: 72.5702, salinity: 34.6, pH: 8.09, nitrate: 0.43, phosphate: 0.16, silicate: 0.95 },
  { date: "2025-08-23", latitude: 10.8975, longitude: 72.2076, salinity: 34.69, pH: 8.11, nitrate: 0.53, phosphate: 0.21, silicate: 0.98 },
  { date: "2025-08-24", latitude: 10.5217, longitude: 72.1706, salinity: 34.57, pH: 8.09, nitrate: 0.51, phosphate: 0.32, silicate: 0.94 },
  { date: "2025-08-25", latitude: 10.353, longitude: 72.5702, salinity: 34.68, pH: 8.09, nitrate: 0.27, phosphate: 0.26, silicate: 1.23 },
  { date: "2025-08-26", latitude: 10.8975, longitude: 72.2076, salinity: 34.71, pH: 8.08, nitrate: 0.78, phosphate: 0.13, silicate: 1.18 },
  { date: "2025-08-27", latitude: 10.5217, longitude: 72.1706, salinity: 34.78, pH: 8.08, nitrate: 0.39, phosphate: 0.2, silicate: 0.85 },
  { date: "2025-08-28", latitude: 10.353, longitude: 72.5702, salinity: 34.59, pH: 8.09, nitrate: 0.29, phosphate: 0.22, silicate: 0.72 },
  { date: "2025-08-29", latitude: 10.8975, longitude: 72.2076, salinity: 34.75, pH: 8.08, nitrate: 0.44, phosphate: 0.24, silicate: 0.63 },
  { date: "2025-08-30", latitude: 10.5217, longitude: 72.1706, salinity: 34.68, pH: 8.11, nitrate: 0.18, phosphate: 0.21, silicate: 1.08 },
  { date: "2025-08-31", latitude: 10.353, longitude: 72.5702, salinity: 34.71, pH: 8.08, nitrate: 0.24, phosphate: 0.23, silicate: 1.09 },
];

export const oceanAtmosphereData = [
  { date: '2025-08-01', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.62, airTemp3m: 27.54, ventTemp: 27.32, ventSpeed: 0.61, pressure: 1009.85 },
  { date: '2025-08-02', latitude: 10.5217, longitude: 72.1706, skinTemp: 28.08, airTemp3m: 27.96, ventTemp: 27.27, ventSpeed: 0.43, pressure: 1008.18 },
  { date: '2025-08-03', latitude: 10.353, longitude: 72.5702, skinTemp: 27.35, airTemp3m: 27.31, ventTemp: 26.8, ventSpeed: 0.55, pressure: 1008.17 },
  { date: '2025-08-04', latitude: 10.8975, longitude: 72.2076, skinTemp: 28.13, airTemp3m: 27.93, ventTemp: 27.42, ventSpeed: 0.69, pressure: 1009.61 },
  { date: '2025-08-05', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.72, airTemp3m: 27.62, ventTemp: 26.85, ventSpeed: 0.42, pressure: 1009.59 },
  { date: '2025-08-06', latitude: 10.353, longitude: 72.5702, skinTemp: 27.77, airTemp3m: 27.69, ventTemp: 27.05, ventSpeed: 0.52, pressure: 1009.59 },
  { date: '2025-08-07', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.47, airTemp3m: 27.38, ventTemp: 27.41, ventSpeed: 0.21, pressure: 1009.73 },
  { date: '2025-08-08', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.57, airTemp3m: 27.44, ventTemp: 27.18, ventSpeed: 0.57, pressure: 1007.2 },
  { date: '2025-08-09', latitude: 10.353, longitude: 72.5702, skinTemp: 27.76, airTemp3m: 27.68, ventTemp: 27.51, ventSpeed: 0.39, pressure: 1008.4 },
  { date: '2025-08-10', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.67, airTemp3m: 27.55, ventTemp: 27.52, ventSpeed: 0.5, pressure: 1008.81 },
  { date: '2025-08-11', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.52, airTemp3m: 27.42, ventTemp: 26.8, ventSpeed: 0.32, pressure: 1009.61 },
  { date: '2025-08-12', latitude: 10.353, longitude: 72.5702, skinTemp: 27.71, airTemp3m: 27.64, ventTemp: 27.17, ventSpeed: 0.22, pressure: 1010.09 },
  { date: '2025-08-13', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.62, airTemp3m: 27.51, ventTemp: 27.09, ventSpeed: 0.49, pressure: 1007.3 },
  { date: '2025-08-14', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.65, airTemp3m: 27.52, ventTemp: 26.98, ventSpeed: 0.47, pressure: 1010.13 },
  { date: '2025-08-15', latitude: 10.353, longitude: 72.5702, skinTemp: 27.74, airTemp3m: 27.68, ventTemp: 27.52, ventSpeed: 0.67, pressure: 1009.2 },
  { date: '2025-08-16', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.77, airTemp3m: 27.66, ventTemp: 27.6, ventSpeed: 0.45, pressure: 1009.29 },
  { date: '2025-08-17', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.77, airTemp3m: 27.63, ventTemp: 27.2, ventSpeed: 0.45, pressure: 1007.51 },
  { date: '2025-08-18', latitude: 10.353, longitude: 72.5702, skinTemp: 27.54, airTemp3m: 27.38, ventTemp: 26.94, ventSpeed: 0.61, pressure: 1007.99 },
  { date: '2025-08-19', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.55, airTemp3m: 27.4, ventTemp: 27.67, ventSpeed: 0.12, pressure: 1008.37 },
  { date: '2025-08-20', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.83, airTemp3m: 27.73, ventTemp: 27.89, ventSpeed: 0.96, pressure: 1008.63 },
  { date: '2025-08-21', latitude: 10.353, longitude: 72.5702, skinTemp: 27.56, airTemp3m: 27.5, ventTemp: 26.58, ventSpeed: 0.73, pressure: 1007.29 },
  { date: '2025-08-22', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.84, airTemp3m: 27.7, ventTemp: 27.06, ventSpeed: 0.34, pressure: 1008.12 },
  { date: '2025-08-23', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.65, airTemp3m: 27.5, ventTemp: 27.84, ventSpeed: 0.57, pressure: 1009.14 },
  { date: '2025-08-24', latitude: 10.353, longitude: 72.5702, skinTemp: 27.47, airTemp3m: 27.29, ventTemp: 27.97, ventSpeed: 0.63, pressure: 1007.39 },
  { date: '2025-08-25', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.66, airTemp3m: 27.61, ventTemp: 26.94, ventSpeed: 0.36, pressure: 1009.35 },
  { date: '2025-08-26', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.58, airTemp3m: 27.47, ventTemp: 27.01, ventSpeed: 0.46, pressure: 1006.65 },
  { date: '2025-08-27', latitude: 10.353, longitude: 72.5702, skinTemp: 27.77, airTemp3m: 27.6, ventTemp: 27.23, ventSpeed: 0.48, pressure: 1009.15 },
  { date: '2025-08-28', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.33, airTemp3m: 27.3, ventTemp: 27.58, ventSpeed: 0.43, pressure: 1006.05 },
  { date: '2025-08-29', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.26, airTemp3m: 27.14, ventTemp: 27.86, ventSpeed: 0.37, pressure: 1007.02 },
  { date: '2025-08-30', latitude: 10.353, longitude: 72.5702, skinTemp: 27.52, airTemp3m: 27.44, ventTemp: 27.63, ventSpeed: 0.07, pressure: 1007.98 },
  { date: '2025-08-31', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.98, airTemp3m: 27.84, ventTemp: 27.34, ventSpeed: 0.58, pressure: 1008.75 },
  { date: '2025-09-01', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.48, airTemp3m: 27.46, ventTemp: 27.51, ventSpeed: 0.62, pressure: 1006.89 },
  { date: '2025-09-02', latitude: 10.353, longitude: 72.5702, skinTemp: 27.67, airTemp3m: 27.61, ventTemp: 27.95, ventSpeed: 0.26, pressure: 1007.72 },
  { date: '2025-09-03', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.72, airTemp3m: 27.62, ventTemp: 27.31, ventSpeed: 1.06, pressure: 1008.59 },
  { date: '2025-09-04', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.1, airTemp3m: 26.94, ventTemp: 27.51, ventSpeed: 0.34, pressure: 1005.14 },
  { date: '2025-09-05', latitude: 10.353, longitude: 72.5702, skinTemp: 27.8, airTemp3m: 27.62, ventTemp: 27.01, ventSpeed: 0.37, pressure: 1007.8 },
  { date: '2025-09-06', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.64, airTemp3m: 27.53, ventTemp: 27.46, ventSpeed: 0.32, pressure: 1007.37 },
  { date: '2025-09-07', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.43, airTemp3m: 27.3, ventTemp: 27.44, ventSpeed: 0.68, pressure: 1007.04 },
  { date: '2025-09-08', latitude: 10.353, longitude: 72.5702, skinTemp: 27.31, airTemp3m: 27.27, ventTemp: 27.31, ventSpeed: 0.39, pressure: 1009.35 },
  { date: '2025-09-09', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.57, airTemp3m: 27.48, ventTemp: 27.39, ventSpeed: 0.24, pressure: 1007.02 },
  { date: '2025-09-10', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.65, airTemp3m: 27.48, ventTemp: 27.28, ventSpeed: 0.32, pressure: 1006.7 },
  { date: '2025-09-11', latitude: 10.353, longitude: 72.5702, skinTemp: 27.38, airTemp3m: 27.26, ventTemp: 26.86, ventSpeed: 0.79, pressure: 1005.71 },
  { date: '2025-09-12', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.64, airTemp3m: 27.47, ventTemp: 27.5, ventSpeed: 0.53, pressure: 1008.14 },
  { date: '2025-09-13', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.47, airTemp3m: 27.43, ventTemp: 27.43, ventSpeed: 0.45, pressure: 1006.14 },
  { date: '2025-09-14', latitude: 10.353, longitude: 72.5702, skinTemp: 27.76, airTemp3m: 27.63, ventTemp: 27.1, ventSpeed: 0.04, pressure: 1007.31 },
  { date: '2025-09-15', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.75, airTemp3m: 27.65, ventTemp: 27.43, ventSpeed: 0.4, pressure: 1007.68 },
  { date: '2025-09-16', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.81, airTemp3m: 27.74, ventTemp: 27, ventSpeed: 0.6, pressure: 1006.5 },
  { date: '2025-09-17', latitude: 10.353, longitude: 72.5702, skinTemp: 27.29, airTemp3m: 27.15, ventTemp: 27.55, ventSpeed: 0.3, pressure: 1008.37 },
  { date: '2025-09-18', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.53, airTemp3m: 27.36, ventTemp: 27.16, ventSpeed: 0.4, pressure: 1007.34 },
  { date: '2025-09-19', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.54, airTemp3m: 27.44, ventTemp: 27.62, ventSpeed: 0.46, pressure: 1009.52 },
  { date: '2025-09-20', latitude: 10.353, longitude: 72.5702, skinTemp: 27.61, airTemp3m: 27.51, ventTemp: 27.33, ventSpeed: 0.88, pressure: 1007.53 },
  { date: '2025-09-21', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.48, airTemp3m: 27.41, ventTemp: 27.4, ventSpeed: 0.43, pressure: 1005.34 },
  { date: '2025-09-22', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.57, airTemp3m: 27.45, ventTemp: 27.65, ventSpeed: 0.77, pressure: 1009.28 },
  { date: '2025-09-23', latitude: 10.353, longitude: 72.5702, skinTemp: 27.97, airTemp3m: 27.85, ventTemp: 27.15, ventSpeed: 0.67, pressure: 1007.84 },
  { date: '2025-09-24', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.64, airTemp3m: 27.59, ventTemp: 27.16, ventSpeed: 0.51, pressure: 1007.47 },
  { date: '2025-09-25', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.7, airTemp3m: 27.62, ventTemp: 27.79, ventSpeed: 0.54, pressure: 1007.33 },
  { date: '2025-09-26', latitude: 10.353, longitude: 72.5702, skinTemp: 27.36, airTemp3m: 27.22, ventTemp: 27.23, ventSpeed: 0.41, pressure: 1007.16 },
  { date: '2025-09-27', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.74, airTemp3m: 27.61, ventTemp: 27, ventSpeed: 0.8, pressure: 1008.19 },
  { date: '2025-09-28', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.39, airTemp3m: 27.3, ventTemp: 26.74, ventSpeed: 0.15, pressure: 1006.9 },
  { date: '2025-09-29', latitude: 10.353, longitude: 72.5702, skinTemp: 27.79, airTemp3m: 27.63, ventTemp: 27.04, ventSpeed: 0.43, pressure: 1008.04 },
  { date: '2025-09-30', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.62, airTemp3m: 27.51, ventTemp: 26.95, ventSpeed: 0.61, pressure: 1007.6 },
  { date: '2025-09-08', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.62, airTemp3m: 27.53, ventTemp: 27.66, ventSpeed: 0.53, pressure: 1007.6 },
  { date: '2025-09-08', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.43, airTemp3m: 27.35, ventTemp: 27.21, ventSpeed: 0.33, pressure: 1010.25 },
  { date: '2025-09-08', latitude: 10.353, longitude: 72.5702, skinTemp: 27.57, airTemp3m: 27.48, ventTemp: 27, ventSpeed: 0.42, pressure: 1006.82 },
  { date: '2025-09-09', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.61, airTemp3m: 27.48, ventTemp: 27.63, ventSpeed: 0.19, pressure: 1008.87 },
  { date: '2025-09-09', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.88, airTemp3m: 27.82, ventTemp: 27.54, ventSpeed: 0.76, pressure: 1006.14 },
  { date: '2025-09-09', latitude: 10.353, longitude: 72.5702, skinTemp: 27.19, airTemp3m: 27.16, ventTemp: 27.86, ventSpeed: 0.7, pressure: 1006.69 },
  { date: '2025-09-10', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.54, airTemp3m: 27.45, ventTemp: 27.35, ventSpeed: 0.57, pressure: 1009.15 },
  { date: '2025-09-10', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.41, airTemp3m: 27.3, ventTemp: 27.88, ventSpeed: 0.31, pressure: 1007.91 },
  { date: '2025-09-10', latitude: 10.353, longitude: 72.5702, skinTemp: 27.78, airTemp3m: 27.73, ventTemp: 27.96, ventSpeed: 0.8, pressure: 1009.25 },
  { date: '2025-09-11', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.69, airTemp3m: 27.61, ventTemp: 27.67, ventSpeed: 0.47, pressure: 1007.83 },
  { date: '2025-09-11', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.64, airTemp3m: 27.62, ventTemp: 27.64, ventSpeed: 0.49, pressure: 1007.38 },
  { date: '2025-09-11', latitude: 10.353, longitude: 72.5702, skinTemp: 27.34, airTemp3m: 27.29, ventTemp: 27.57, ventSpeed: 0.78, pressure: 1006.29 },
  { date: '2025-09-12', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.28, airTemp3m: 27.12, ventTemp: 27.62, ventSpeed: 0.79, pressure: 1006.46 },
  { date: '2025-09-12', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.69, airTemp3m: 27.53, ventTemp: 27.37, ventSpeed: 0.55, pressure: 1007.24 },
  { date: '2025-09-12', latitude: 10.353, longitude: 72.5702, skinTemp: 27.24, airTemp3m: 27.2, ventTemp: 27.13, ventSpeed: 0.63, pressure: 1006.97 },
  { date: '2025-09-13', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.46, airTemp3m: 27.39, ventTemp: 27.83, ventSpeed: 0.34, pressure: 1008.56 },
  { date: '2025-09-13', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.71, airTemp3m: 27.64, ventTemp: 27.17, ventSpeed: 0.55, pressure: 1008.64 },
  { date: '2025-09-13', latitude: 10.353, longitude: 72.5702, skinTemp: 27.22, airTemp3m: 27.14, ventTemp: 27.01, ventSpeed: 0.22, pressure: 1009.94 },
  { date: '2025-09-14', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.31, airTemp3m: 27.17, ventTemp: 27.35, ventSpeed: 0.04, pressure: 1006.92 },
  { date: '2025-09-14', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.58, airTemp3m: 27.51, ventTemp: 27.46, ventSpeed: 0.34, pressure: 1008.27 },
  { date: '2025-09-14', latitude: 10.353, longitude: 72.5702, skinTemp: 27.68, airTemp3m: 27.52, ventTemp: 27.71, ventSpeed: 0.51, pressure: 1006.15 },
  { date: '2025-09-15', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.59, airTemp3m: 27.54, ventTemp: 27.35, ventSpeed: 0.54, pressure: 1006.57 },
  { date: '2025-09-15', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.28, airTemp3m: 27.18, ventTemp: 27.48, ventSpeed: 0.75, pressure: 1007.45 },
  { date: '2025-09-15', latitude: 10.353, longitude: 72.5702, skinTemp: 27.51, airTemp3m: 27.45, ventTemp: 27.64, ventSpeed: 0.54, pressure: 1008.97 },
  { date: '2025-09-16', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.49, airTemp3m: 27.4, ventTemp: 26.96, ventSpeed: 0.64, pressure: 1006.44 },
  { date: '2025-09-16', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.24, airTemp3m: 27.12, ventTemp: 27.98, ventSpeed: 0.17, pressure: 1007.4 },
  { date: '2025-09-16', latitude: 10.353, longitude: 72.5702, skinTemp: 27.41, airTemp3m: 27.29, ventTemp: 27.51, ventSpeed: 0.72, pressure: 1008.3 },
  { date: '2025-09-17', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.5, airTemp3m: 27.36, ventTemp: 28.09, ventSpeed: 0.06, pressure: 1007.07 },
  { date: '2025-09-17', latitude: 10.5217, longitude: 72.1706, skinTemp: 27.37, airTemp3m: 27.21, ventTemp: 27.32, ventSpeed: 0.7, pressure: 1007.21 },
  { date: '2025-09-17', latitude: 10.353, longitude: 72.5702, skinTemp: 27.49, airTemp3m: 27.43, ventTemp: 27.29, ventSpeed: 0.44, pressure: 1007.54 },
  { date: '2025-09-18', latitude: 10.8975, longitude: 72.2076, skinTemp: 27.15, airTemp3m: 27.1, ventTemp: 27.44, ventSpeed: 0.56, pressure: 1005.97 },
];

export const marineWeatherData = [
  { date: "2025-08-21", latitude: 10.9, longitude: 72.21, sstSkin: 28.08, airTemp: 27.48, currentSpeed: 0.47, airPressure: 1010.82, humidity: 79.04, windSpeed: 21.07, windDirection: 282.62, waveHeight: 1.92, waveDirection: 258.5, wavePeriod: 9.1, currentDirection: 104.75 },
  { date: "2025-08-22", latitude: 10.9, longitude: 72.21, sstSkin: 28.1, airTemp: 27.55, currentSpeed: 0.59, airPressure: 1010.6, humidity: 81, windSpeed: 16.68, windDirection: 299.62, waveHeight: 1.93, waveDirection: 252.54, wavePeriod: 9.76, currentDirection: 143.29 },
  { date: "2025-08-23", latitude: 10.9, longitude: 72.21, sstSkin: 28.09, airTemp: 27.66, currentSpeed: 0.39, airPressure: 1010.16, humidity: 79.75, windSpeed: 16.68, windDirection: 301.46, waveHeight: 1.76, waveDirection: 240.38, wavePeriod: 9.63, currentDirection: 158.21 },
  { date: "2025-08-24", latitude: 10.9, longitude: 72.21, sstSkin: 28.22, airTemp: 27.54, currentSpeed: 0.54, airPressure: 1010.92, humidity: 79.83, windSpeed: 14.18, windDirection: 293.54, waveHeight: 1.63, waveDirection: 224.92, wavePeriod: 10.01, currentDirection: 114.67 },
  { date: "2025-08-25", latitude: 10.9, longitude: 72.21, sstSkin: 28.26, airTemp: 27.72, currentSpeed: 0.49, airPressure: 1010.02, humidity: 76.12, windSpeed: 13.32, windDirection: 296.33, waveHeight: 1.52, waveDirection: 223.33, wavePeriod: 9.93, currentDirection: 183.62 },
  { date: "2025-08-26", latitude: 10.9, longitude: 72.21, sstSkin: 28.18, airTemp: 27.49, currentSpeed: 0.75, airPressure: 1010.03, humidity: 82.17, windSpeed: 21.21, windDirection: 264.42, waveHeight: 1.52, waveDirection: 244.71, wavePeriod: 7.81, currentDirection: 103.75 },
  { date: "2025-08-27", latitude: 10.9, longitude: 72.21, sstSkin: 28.09, airTemp: 27.25, currentSpeed: 1.03, airPressure: 1009.24, humidity: 85.83, windSpeed: 25.22, windDirection: 273.88, waveHeight: 1.96, waveDirection: 263.12, wavePeriod: 7.1, currentDirection: 145.67 },
  { date: "2025-08-28", latitude: 10.9, longitude: 72.21, sstSkin: 27.99, airTemp: 27.2, currentSpeed: 0.71, airPressure: 1009.04, humidity: 86.75, windSpeed: 30.62, windDirection: 276.67, waveHeight: 2.59, waveDirection: 268.17, wavePeriod: 7.69, currentDirection: 139.46 },
  { date: "2025-08-29", latitude: 10.9, longitude: 72.21, sstSkin: 27.92, airTemp: 26.92, currentSpeed: 1.15, airPressure: 1008.95, humidity: 87.04, windSpeed: 28.78, windDirection: 275.83, waveHeight: 2.84, waveDirection: 265.92, wavePeriod: 8.33, currentDirection: 140.25 },
  { date: "2025-08-30", latitude: 10.9, longitude: 72.21, sstSkin: 27.87, airTemp: 27.7, currentSpeed: 0.6, airPressure: 1010.17, humidity: 82.42, windSpeed: 29.36, windDirection: 277.71, waveHeight: 2.69, waveDirection: 258.08, wavePeriod: 8.79, currentDirection: 127.5 },
  { date: "2025-08-31", latitude: 10.9, longitude: 72.21, sstSkin: 27.89, airTemp: 27.39, currentSpeed: 0.92, airPressure: 1010.1, humidity: 84.67, windSpeed: 25.65, windDirection: 288.92, waveHeight: 2.48, waveDirection: 256.46, wavePeriod: 8.79, currentDirection: 118.25 },
  { date: "2025-09-01", latitude: 10.9, longitude: 72.21, sstSkin: 27.89, airTemp: 27.7, currentSpeed: 1.02, airPressure: 1008.96, humidity: 79.83, windSpeed: 30.14, windDirection: 299.42, waveHeight: 2.46, waveDirection: 260.21, wavePeriod: 8.79, currentDirection: 156.38 },
  { date: "2025-09-02", latitude: 10.9, longitude: 72.21, sstSkin: 27.88, airTemp: 27.86, currentSpeed: 0.59, airPressure: 1008.67, humidity: 76.88, windSpeed: 25.58, windDirection: 282.62, waveHeight: 2.32, waveDirection: 250.04, wavePeriod: 9.39, currentDirection: 127.75 },
  { date: "2025-09-03", latitude: 10.9, longitude: 72.21, sstSkin: 27.91, airTemp: 27.71, currentSpeed: 1.08, airPressure: 1008.62, humidity: 80.08, windSpeed: 24.78, windDirection: 282.62, waveHeight: 2.16, waveDirection: 253, wavePeriod: 8.54, currentDirection: 117.17 },
  { date: "2025-09-04", latitude: 10.9, longitude: 72.21, sstSkin: 27.92, airTemp: 27.5, currentSpeed: 0.92, airPressure: 1009.15, humidity: 81.83, windSpeed: 25.79, windDirection: 289.12, waveHeight: 2.33, waveDirection: 263.42, wavePeriod: 7.9, currentDirection: 151.75 },
  { date: "2025-09-05", latitude: 10.9, longitude: 72.21, sstSkin: 27.89, airTemp: 27.33, currentSpeed: 0.52, airPressure: 1009.87, humidity: 83.54, windSpeed: 22.22, windDirection: 291.46, waveHeight: 2.01, waveDirection: 262.42, wavePeriod: 8.35, currentDirection: 139.54 },
  { date: "2025-09-06", latitude: 10.9, longitude: 72.21, sstSkin: 27.93, airTemp: 27.51, currentSpeed: 0.75, airPressure: 1010.18, humidity: 82.08, windSpeed: 19.55, windDirection: 290.33, waveHeight: 1.78, waveDirection: 257.33, wavePeriod: 8.44, currentDirection: 113.71 },
  { date: "2025-09-07", latitude: 10.9, longitude: 72.21, sstSkin: 27.94, airTemp: 27.19, currentSpeed: 0.6, airPressure: 1010.2, humidity: 83.79, windSpeed: 20.2, windDirection: 294.42, waveHeight: 1.6, waveDirection: 252.75, wavePeriod: 8.47, currentDirection: 140.54 },
  { date: "2025-09-08", latitude: 10.9, longitude: 72.21, sstSkin: 27.94, airTemp: 27.78, currentSpeed: 0.55, airPressure: 1009.42, humidity: 79.67, windSpeed: 19.09, windDirection: 295.96, waveHeight: 1.52, waveDirection: 250.79, wavePeriod: 8.4, currentDirection: 131.67 },
  { date: "2025-09-09", latitude: 10.9, longitude: 72.21, sstSkin: 28.04, airTemp: 27.35, currentSpeed: 0.34, airPressure: 1009.68, humidity: 82, windSpeed: 15.95, windDirection: 306.71, waveHeight: 1.47, waveDirection: 241.38, wavePeriod: 9.21, currentDirection: 124.88 },
  { date: "2025-09-10", latitude: 10.9, longitude: 72.21, sstSkin: 28.12, airTemp: 27.48, currentSpeed: 0.45, airPressure: 1009.95, humidity: 82.92, windSpeed: 16.28, windDirection: 310.54, waveHeight: 1.4, waveDirection: 232.96, wavePeriod: 9.76, currentDirection: 175.88 },
  { date: "2025-09-11", latitude: 10.9, longitude: 72.21, sstSkin: 28.08, airTemp: 27.58, currentSpeed: 0.47, airPressure: 1010.03, humidity: 80.96, windSpeed: 18.24, windDirection: 311.38, waveHeight: 1.47, waveDirection: 229.08, wavePeriod: 9.78, currentDirection: 194.38 },
  { date: "2025-09-12", latitude: 10.9, longitude: 72.21, sstSkin: 28.17, airTemp: 27.67, currentSpeed: 0.36, airPressure: 1009.79, humidity: 80.92, windSpeed: 19.18, windDirection: 315.25, waveHeight: 1.52, waveDirection: 235.42, wavePeriod: 9.67, currentDirection: 176.12 },
  { date: "2025-09-13", latitude: 10.9, longitude: 72.21, sstSkin: 28.21, airTemp: 27.27, currentSpeed: 0.26, airPressure: 1009.99, humidity: 83.08, windSpeed: 16.42, windDirection: 302.96, waveHeight: 1.49, waveDirection: 236.71, wavePeriod: 9.75, currentDirection: 138.75 },
  { date: "2025-09-14", latitude: 10.9, longitude: 72.21, sstSkin: 28.3, airTemp: 27.24, currentSpeed: 0.28, airPressure: 1010.2, humidity: 82.79, windSpeed: 15.78, windDirection: 302.38, waveHeight: 1.44, waveDirection: 231.17, wavePeriod: 9.77, currentDirection: 80.62 },
  { date: "2025-09-15", latitude: 10.9, longitude: 72.21, sstSkin: 28.31, airTemp: 27.45, currentSpeed: 0.52, airPressure: 1010.18, humidity: 82.04, windSpeed: 17.79, windDirection: 306.12, waveHeight: 1.47, waveDirection: 229.29, wavePeriod: 9.51, currentDirection: 70.04 },
  { date: "2025-09-16", latitude: 10.9, longitude: 72.21, sstSkin: 28.22, airTemp: 27.32, currentSpeed: 0.46, airPressure: 1009.83, humidity: 83.96, windSpeed: 18.52, windDirection: 304.21, waveHeight: 1.51, waveDirection: 232.79, wavePeriod: 9.1, currentDirection: 124.04 },
  { date: "2025-09-17", latitude: 10.9, longitude: 72.21, sstSkin: 28.25, airTemp: 27.02, currentSpeed: 0.34, airPressure: 1009.93, humidity: 85.46, windSpeed: 19.16, windDirection: 304.21, waveHeight: 1.51, waveDirection: 239.29, wavePeriod: 8.36, currentDirection: 96.75 },
  { date: "2025-09-18", latitude: 10.9, longitude: 72.21, sstSkin: 28.27, airTemp: 27.22, currentSpeed: 0.49, airPressure: 1009.99, humidity: 83.88, windSpeed: 19.06, windDirection: 299.83, waveHeight: 1.47, waveDirection: 229.38, wavePeriod: 8.72, currentDirection: 108.42 },
  { date: "2025-09-19", latitude: 10.9, longitude: 72.21, sstSkin: 28.38, airTemp: 27.3, currentSpeed: 0.37, airPressure: 1010.53, humidity: 83.12, windSpeed: 14.62, windDirection: 292.29, waveHeight: 1.32, waveDirection: 209.83, wavePeriod: 9.32, currentDirection: 108.38 },
  { date: "2025-09-20", latitude: 10.9, longitude: 72.21, sstSkin: 28.42, airTemp: 27.77, currentSpeed: 0.5, airPressure: 1010.21, humidity: 78.75, windSpeed: 14.19, windDirection: 295.33, waveHeight: 1.27, waveDirection: 198.67, wavePeriod: 10.21, currentDirection: 88.79 }
];

export const dataCollectionTrends = [
  { month: 'Jan', oceanographic: 18, fisheries: 12, molecular: 8 },
  { month: 'Feb', oceanographic: 22, fisheries: 15, molecular: 10 },
  { month: 'Mar', oceanographic: 25, fisheries: 18, molecular: 14 },
  { month: 'Apr', oceanographic: 23, fisheries: 20, molecular: 16 },
  { month: 'May', oceanographic: 28, fisheries: 22, molecular: 18 },
  { month: 'Jun', oceanographic: 30, fisheries: 25, molecular: 20 },
];

export const dataQualityDistribution = [
  { name: 'High Quality', value: 125, fill: 'hsl(var(--chart-2))' },
  { name: 'Medium Quality', value: 80, fill: 'hsl(var(--chart-3))' },
  { name: 'Low Quality', value: 35, fill: 'hsl(var(--chart-4))' },
  { name: 'Preliminary', value: 45, fill: 'hsl(var(--chart-5))' },
];

export const geographicDistribution = [
    { name: "Station A", x: 25, y: 40 },
    { name: "Station B", x: 35, y: 60 },
    { name: "Station C", x: 55, y: 30 },
    { name: "Station D", x: 75, y: 55 },
];

    

    

