import { useDispatch, useSelector } from "react-redux";
import { columns, updateCellRaw } from "./store/sheetSlice";
import { RootState } from "./store";
import { useState } from "react";
import { Cell } from "./types";
import "./App.css";

export const App = () => {
  const dispatch = useDispatch();
  const cells = useSelector((state: RootState) => state.sheet.cells);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getDisplayValue = (cell: Cell, id: string) => {
    if (editingId === id) return cell.raw;
    if (hoveredId === id && cell.formula) return `${cell.raw} (${cell.value})`;
    return String(cell.value);
  };

  return (
    <div className="sheet">
      {/* Column headers */}
      <div className="row header">
        <div className="corner" />
        {columns.map((col) => (
          <div key={col} className="col-header">
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <div key={rowIdx} className="row">
          <div className="row-header">{rowIdx + 1}</div>

          {columns.map((col) => {
            const id = `${col}${rowIdx + 1}`;
            const cell = cells[id];

            return (
              <input
                key={id}
                className={`cell ${cell.formula ? "derived" : ""}`}
                value={getDisplayValue(cell, id)}
                onFocus={() => setEditingId(id)}
                onBlur={() => setEditingId(null)}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                onChange={(e) =>
                  dispatch(updateCellRaw({ id, raw: e.target.value }))
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
