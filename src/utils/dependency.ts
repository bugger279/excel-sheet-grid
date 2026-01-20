import type { GridValues } from "@/types";

export const findDependents = (
  targetId: string,
  cells: GridValues,
): string[] => {
  return Object.values(cells)
    .filter((cell) => cell.deps.includes(targetId))
    .map((cell) => cell.id);
};
