export default function PersonCell({ person, dragProps }) {
    return (
      <div className="lineup-cell" draggable={!!person} {...dragProps}>
        {person ? (
          <>
            <span className="person-name">{person.name}</span><br />
            {person.weight} lbs
          </>
        ) : (
          "empty"
        )}
      </div>
    );
  }