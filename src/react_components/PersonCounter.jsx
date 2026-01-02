import React from "react";
import "../App.css";

export default function PersonCounter({ personCounts }) {
   const entries = Array.from(personCounts.entries());

   return (
      <div className="count-table">
         <div className="grid-header">Person</div>
         <div className="grid-header">Count</div>

         {entries.map(([name, count]) => (
            <React.Fragment key={name}>
               <div className="grid-cell">{name}</div>
               <div className="grid-cell">{count}</div>
            </React.Fragment>
         ))}
      </div>
   )
}