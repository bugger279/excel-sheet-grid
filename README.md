<!-- Excel like application -->

1. Lets define the types for our cells and grid.

```typescript
export type Cell = {
  id: string;
  raw: string; // The raw input from the user
  value: string | number; // The computed value of the cell
  formula?: string; // The formula if the cell contains one
  deps: string[]; // List of cell IDs this cell depends on
}

export type GridValues = Record<string, Cell>;
```

2. Now, we create redux slice to manage state of the grid.

2A. We initialize the grid with empty cells and define actions to update cell values and formulas, for that we define type for entire sheet state.
```typescript
export type SheetState = {
  cells: GridValues;
}
```

2B. We create the slice with initial state and populate initial state.

```typescript
const initialState: SheetState = {
  cells: {},
};
export const columns = ["A", "B", "C", "D", "E"];

for (let row = 1; row <= 5; row++) {
  for (let col = 0; col < 5; col++) {
    const cellId = `${columns[col]}${row}`; // A1, B1, ..., E5
    initialState.cells[cellId] = {
      id: cellId,
      raw: "",
      value: "",
      deps: [],
    };
  }
}
```
This sets up a 5x5 grid with cells from A1 to E5.


3. Next, we implement formula evaluation and dependency tracking.

    3B. We create utility functions to evaluate formulas and extract dependencies from them.

```typescript
export const isFormula = (input: string) => input.startsWith("=");
export const extractDependencies = (formula: string): string[] => {
  const matches = formula.match(CELL_REF_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
};
export const evaluateFormula = (
  formula: string,
  cells: Record<string, { value: string | number; raw: string }>,
): string | number => {
  let expression = formula.slice(1); // remove "=" and returns "A1+B2"
  expression = expression.replace(CELL_REF_REGEX, (cellId) => {
    const cellValue = cells[cellId]?.value ?? 0;
    return typeof cellValue === "number" ? cellValue.toString() : cellValue;
  });

  try {
    // Using Function constructor to evaluate the expression safely
    // In production, consider using a proper math expression parser
    // to avoid security risks associated with eval-like functions.
    // Here it's simplified for demonstration purposes.
    // eslint-disable-next-line no-new-func
    const func = new Function(`return ${expression};`);
    return func();
  } catch {
    return "ERROR";
  }
};
```

4. Finally, we implement recompute logic to update dependent cells when a cell value changes.

```typescript
export const recomputeCell = (
  id: string,
  cells: GridValues,
  visited: Set<string> = new Set(),
) => {
  if (visited.has(id)) return; // Prevent circular dependencies
  visited.add(id); // Mark this cell as visited

  const cell = cells[id];
  if (cell.formula) {
    cell.value = evaluateFormula(cell.formula, cells);
  }

  // Recompute dependent cells
  for (const dependentId in cells) {

    if (cells[dependentId].deps.includes(id)) {
      recomputeCell(dependentId, cells, visited);
    }
  }
};
```
5. With these implementations, we have a basic structure for an Excel-like application that can handle cell updates, formula evaluations, and dependency tracking using Redux for state management.

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isFormula, extractDependencies } from "@/utils/formula";
import { evaluateFormula } from "@/utils/formula";
import { recomputeCell } from "@/utils/recompute";
import { SheetState } from "@/types";

const initialState: SheetState = {
  cells: {},
};
export const columns = ["A", "B", "C", "D", "E"];

for (let row = 1; row <= 5; row++) {
  for (let col = 0; col < 5; col++) {
    const cellId = `${columns[col]}${row}`; // A1, B1, ..., E5
    initialState.cells[cellId] = {
      id: cellId,
      raw: "",
      value: "",
      deps: [],
    };
  }
}

export const sheetSlice = createSlice({
  name: "sheet",
  initialState,
  reducers: {
    updateCell: (state, action: PayloadAction<{ id: string; raw: string }>) => {
      const { id, raw } = action.payload;
      const cell = state.cells[id];

      if (!cell) return;

      if (!isFormula(raw)) {
        cell.raw = raw;
        cell.value = raw;
        cell.formula = undefined;
        cell.deps = [];
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

export const { updateCell } = sheetSlice.actions;

export default sheetSlice.reducer;

```

6. This code provides a foundational structure for an Excel-like application with basic functionalities. Further enhancements can include better error handling, support for more complex formulas, and a user interface to interact with the grid.

```tsx
import { Provider } from "react-redux";
import store from "./store";
import Sheet from "./components/Sheet";
const App = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <h1>Excel-like Application</h1>
        <Sheet />
      </div>
    </Provider>
  );
};

export default App;
```

```tsx
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateCell } from "@/store/sheetSlice";
import { columns } from "@/store/sheetSlice";

const Sheet = () => {
  const cells = useSelector((state: RootState) => state.sheet.cells);
  const dispatch = useDispatch();

  const handleChange = (id: string, raw: string) => {
    dispatch(updateCell({ id, raw }));
  };

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }, (_, rowIndex) => {
          const rowNumber = rowIndex + 1;
          return (
            <tr key={rowNumber}>
              <th>{rowNumber}</th>
              {columns.map((col) => {
                const cellId = `${col}${rowNumber}`;
                const cell = cells[cellId];
                return (
                  <td key={cellId}>
                    <input
                      type="text"
                      value={cell.raw}
                      onChange={(e) => handleChange(cellId, e.target.value)}
                    />
                    <div>Value: {cell.value}</div>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Sheet;

```