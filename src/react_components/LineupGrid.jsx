import PersonCell from "./PersonCell.jsx";

export default function LineupGrid({
  title,
  grid,
  gridMeta,
  dragHandler
}) {
  return (
    <div className="lineup-grid">
      <p>{title}</p>

      {grid.map((row, i) => (
        <div className="lineup-row" key={i}>

          {gridMeta.type === "heat" && (
            i === 0 ? (
               <div className = "lineup-label">Caller</div>
            ) : (
              <div className = "lineup-label">L {i}</div>
            )
          )}

          {row.map((p, j) => (
            <PersonCell
              key={j}
              person={p}
              dragProps={dragHandler(gridMeta, i, j)}
            />
          ))}

          {gridMeta.type === "heat" && (
            i === 0 ? (
              <div className = "lineup-label">Steer</div>
            ) : ( 
              <div className = "lineup-label">R {i}</div>
            )
          )}

        </div>
      ))}
    </div>
  );
}