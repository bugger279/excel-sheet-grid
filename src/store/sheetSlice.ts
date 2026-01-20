import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  isFormula,
  extractDependencies,
  evaluateFormula,
} from "@/utils/formula";
import { recomputeCell } from "@/utils/recompute";
import { GridValues } from "@/types";

type SheetState = {
  cells: GridValues;
};

export const columns = ["A", "B", "C", "D", "E"];

const createInitialGrid = (): GridValues => {
  const cells: GridValues = {};

  for (let row = 1; row <= columns.length; row++) {
    for (let col = 0; col < columns.length; col++) {
      const id = `${columns[col]}${row}`;
      cells[id] = {
        id,
        raw: "",
        value: "",
        deps: [],
      };
    }
  }

  return cells;
};

const initialState: SheetState = {
  cells: createInitialGrid(),
};

const sheetSlice = createSlice({
  name: "sheet",
  initialState: initialState,
  reducers: {
    updateCellRaw(state, action: PayloadAction<{ id: string; raw: string }>) {
      const { id, raw } = action.payload;
      const cell = state.cells[id];

      cell.raw = raw;
      cell.deps = [];

      if (!isFormula(raw)) {
        const num = Number(raw);
        cell.value = isNaN(num) ? raw : num;
        delete cell.formula;
        recomputeCell(id, state.cells);
        return;
      }

      cell.formula = raw;
      cell.deps = extractDependencies(raw);
      cell.value = evaluateFormula(raw, state.cells);
      recomputeCell(id, state.cells);
    },
  },
});

export const { updateCellRaw } = sheetSlice.actions;
export default sheetSlice.reducer;
