import "../App.css";
import LineupGrid from "./LineupGrid.jsx";

export default function BoatHeats({
  heats,
  roster,
  onUpdate
}) {

  const movePerson = ({ from, to }) => {
    const next = heats.clone();
    next.movePerson({ from, to }, roster);
    onUpdate(next);
  }

  const dragHandler = (meta, row, col) => ({
    onDragStart: e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ ...meta, row, col })
      )
    },

    onDragEnter: e => e.preventDefault(),
    onDragOver: e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },

    onDrop: e => {
      e.preventDefault();

      const from = JSON.parse(
        e.dataTransfer.getData("application/json")
      )

      movePerson({
        from,
        to: { ...meta, row, col }
      })
    }
  })


  const getPeopleGrid = sorted => {
    const people = sorted.getAll();
    const cols = 2;
    const rows = Math.ceil(people.length / cols);
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => people[r * cols + c] ?? null)
    );
  };

  return (
    <div className="boat-heats">

      <div className="lineup-container">
        {Array.from(heats.lineups.entries()).map(([idx, lineup]) => (
          <div className="item" key={idx}>
            <LineupGrid
              title={`Heat ${idx + 1}`}
              grid={lineup.grid}
              gridMeta={{ type: "heat", heatIdx: idx }}
              dragHandler={dragHandler}
            />
            <div className="lineup-row weight-row">
              <div className="lineup-label" />
                Left Weight:
              <div>
                {lineup.leftWeight}
              </div>

              <div className="lineup-label" />
                Right Weight:
              <div>
                {lineup.rightWeight}
              </div>

            </div>
          </div>
        ))}

        <div className="scroll-container">

          <div className="item people-item">
            <LineupGrid
              title="Roster"
              grid={getPeopleGrid(roster)}
              gridMeta={{ type: "sorted" }}
              dragHandler={dragHandler}
            />
          </div>
        </div>
      </div>

    </div>
  )
}