import { evaluateFormula } from "./formula";
import { findDependents } from "./dependency";
import { GridValues } from "@/types";

export const recomputeCell = (
  id: string,
  cells: GridValues,
  visited = new Set<string>(),
) => {
  if (visited.has(id)) return;
  visited.add(id);

  const cell = cells[id];
  if (cell.formula) {
    cell.value = evaluateFormula(cell.formula, cells);
  }

  const dependents = findDependents(id, cells);
  dependents.forEach((depId) => recomputeCell(depId, cells, visited));
};
