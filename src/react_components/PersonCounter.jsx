import "../App.css";

export default function PersonCounter({ personCounts }) {
   const entries = Array.from(personCounts.entries());

   return (
      <div className="count-table">
         <div className="grid-header">Person</div>
         <div className="grid-header">Count</div>

         {entries.map(([name, count]) => (
            <>
               <div className="grid-cell" key={`${name}-name`}>{name}</div>
               <div className="grid-cell" key={`${name}-count`}>{count}</div>
            </>
         ))}
      </div>
   )
}