import React from "react";
import PCStyle from "./PersonCounter.module.css";

export default function PersonCounter({ personCounts }) {
   const entries = Array.from(personCounts.entries());

   return (
      <div className={PCStyle.table}>
         <div className={PCStyle.header}>Person</div>
         <div className={PCStyle.header}>Count</div>

         {entries.map(([name, count]) => (
            <React.Fragment key={name}>
               <div className={PCStyle.cell}>{name}</div>
               <div className={PCStyle.cell}>{count}</div>
            </React.Fragment>
         ))}
      </div>
   )
}