export type Cell = {
  id: string; // "A1"
  raw: string; // user input
  value: string | number; // evaluated value
  formula?: string; // "=A1+B2"
  deps: string[]; // ["A1", "B2"]
};

export type GridValues = Record<string, Cell>;
