import PersonCell from "./PersonCell.jsx";

export default function LineupGrid({
  title,
  grid,
  gridType,
  dragHandler
}) {
  return (
    <div className="lineup-grid">
      <p>{title}</p>
      {grid.map((row, i) => (
        <div className="lineup-row" key={i}>
          {row.map((p, j) => (
            <PersonCell
              key={j}
              person={p}
              dragProps={dragHandler(gridType, i, j)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}