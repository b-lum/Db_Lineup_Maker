import PersonCell from "./PersonCell.jsx";
import LGStyles from './LineupGrid.module.css';

/**
 * React component that renders a simple roster as a vertical list.
 *
 * @param {Object} props
 * @param {string} props.title - Title above the roster
 * @param {Person[]} props.people - Array of Person objects to display
 * @param {function} props.dragHandler - Function returning drag props (optional)
 * @param {function} props.onCellClick - Click handler for each cell
 * @param {Object} props.selected - Optional currently selected person
 *
 * @returns {JSX.Element}
 */
export default function Roster({
   title, 
   people, 
   dragHandler, 
   onCellClick, 
   selected }) {
  return (
    <div className={LGStyles.grid}>

      {people.map((person, i) => {
        const isSelected = selected?.type === "sorted" && selected.row === i;

        return (
          <div className={LGStyles.row} key={i}>
            <PersonCell
              person={person}
              variant="roster"
              dragProps={dragHandler ? dragHandler({ type: "sorted" }, i, 0) : {}}
              onClick={() => onCellClick({ type: "sorted" }, i, 0, person)}
              selected={isSelected}
            />

            <div className={LGStyles.label}>
              {person?.weight ?? 0}
            </div>
          </div>
        );
      })}
    </div>
  );
}