/** Demo sample CSV payloads for the Migration Center */

export const SAMPLE_DRIVERS_CSV = `Driver Name,Phone,Email,CDL Number,CDL State,CDL Class,License Expires,Medical Expires,Hire Date,Status,Location
James Rivera,210-555-0142,james.rivera@example.com,TX-CDL-990112,TX,A,2028-04-15,2027-02-01,2022-06-12,active,San Antonio, TX
Priya Nair,512-555-0198,priya.nair@example.com,TX-CDL-881203,TX,A,2027-11-30,2026-10-12,2023-01-08,active,Austin, TX
Devon Clark,713-555-0177,devon.clark@example.com,TX-CDL-770441,TX,A,2026-09-01,2026-08-20,2024-03-22,onboarding,Houston, TX
Maria Gomez,210-555-0133,maria.gomez@example.com,TX-CDL-660228,TX,A,2029-01-10,2027-05-05,2021-09-14,active,San Antonio, TX
`;

export const SAMPLE_TRUCKS_CSV = `Unit #,VIN,Make,Model,Year,License Plate,State,Mileage,Status,Location
201,1FUJGBDV8NLBT2011,Freightliner,Cascadia,2021,TX-MIG201,TX,98000,available,San Antonio, TX
204,1XKYD49X2MJ204882,Kenworth,T680,2020,TX-MIG204,TX,145200,on_load,Dallas, TX
208,4V4NC9EH5LN208441,Volvo,VNL 760,2019,TX-MIG208,TX,210400,in_shop,Austin, TX
`;

export const SAMPLE_LOADS_CSV = `Load #,Origin City,Origin State,Destination City,Destination State,Pickup Date,Delivery Date,Rate,Broker,Customer,Status
LD-M-1001,Dallas,TX,Atlanta,GA,2025-03-02,2025-03-04,2450,Echo Global,FreshFoods Co,delivered
LD-M-1002,Houston,TX,Chicago,IL,2025-06-11,2025-06-13,3100,TQL,Midwest Parts,delivered
LD-M-1003,San Antonio,TX,Phoenix,AZ,2024-11-20,2024-11-21,1800,Coyote,Desert Retail,delivered
LD-M-1004,Austin,TX,Denver,CO,2023-08-05,2023-08-07,2650,CH Robinson,Rocky Pack,delivered
`;

export const SAMPLE_BROKERS_CSV = `Broker Name,MC Number,DOT Number,Phone,Email,City,State
Echo Global,MC-123456,DOT-987654,800-555-0100,ops@echo.example,Chicago,IL
TQL,MC-234567,DOT-876543,800-555-0200,carriers@tql.example,Cincinnati,OH
Coyote,MC-345678,DOT-765432,800-555-0300,freight@coyote.example,Chicago,IL
`;

export type MigrationSampleFile = {
  id: string;
  name: string;
  categoryHint: string;
  description: string;
  csv: string;
  year: number;
};

export const MIGRATION_SAMPLE_FILES: MigrationSampleFile[] = [
  {
    id: "sample-drivers",
    name: "sample-drivers-2024.csv",
    categoryHint: "Drivers",
    description: "Four drivers with CDL and medical columns",
    csv: SAMPLE_DRIVERS_CSV,
    year: 2024,
  },
  {
    id: "sample-trucks",
    name: "sample-trucks-2025.csv",
    categoryHint: "Trucks",
    description: "Three trucks with VIN and unit numbers",
    csv: SAMPLE_TRUCKS_CSV,
    year: 2025,
  },
  {
    id: "sample-loads",
    name: "sample-loads-history.csv",
    categoryHint: "Loads",
    description: "Multi-year load history with brokers and rates",
    csv: SAMPLE_LOADS_CSV,
    year: 2025,
  },
  {
    id: "sample-brokers",
    name: "sample-brokers.csv",
    categoryHint: "Brokers",
    description: "Broker roster with MC/DOT",
    csv: SAMPLE_BROKERS_CSV,
    year: 2025,
  },
];

export function sampleFileToFile(sample: MigrationSampleFile): File {
  return new File([sample.csv], sample.name, { type: "text/csv" });
}
