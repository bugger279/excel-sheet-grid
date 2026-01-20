const CELL_REF_REGEX = /[A-E][1-5]/g;

export const isFormula = (input: string) => input.startsWith("=");

export const extractDependencies = (formula: string): string[] => {
  const matches = formula.match(CELL_REF_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
};
// This gives us "=A1+B2" → ["A1", "B2"]

export const evaluateFormula = (
  formula: string,
  cells: Record<string, { value: string | number }>,
): string | number => {
  let expression = formula.slice(1); // remove "="

  expression = expression.replace(CELL_REF_REGEX, (cellId) => {
    const cellValue = cells[cellId]?.value ?? 0;
    return typeof cellValue === "number" ? cellValue.toString() : cellValue;
  });

  try {
    return eval(expression);
  } catch {
    return "ERROR";
  }
};
