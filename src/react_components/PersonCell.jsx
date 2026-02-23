import { useState, useEffect, useRef } from "react"
import PCStyle from "./PersonCell.module.css"

/**
 * A React component that represents a single person cell in a lineup or roster.
 * Supports drag-and-drop, selection, and inline replacement via a searchable input.
 * 
 * Features:
 * - Double-click to replace a person (clears previous value)
 * - Autocomplete dropdown for searching available people
 * - Keyboard navigation with arrow keys, Enter to select, Escape to cancel
 * - Drag-and-drop support for moving/swapping people
 *
 * @param {Object} props - Component props
 * @param {Object} props.person - The person object displayed in this cell
 * @param {string} [props.variant="default"] - Visual variant (default behavior only)
 * @param {string|number} [props.position] - Optional badge/position to display
 * @param {Object} props.dragProps - Props for drag-and-drop behavior (from parent)
 * @param {function} props.onClick - Callback when cell is clicked
 * @param {boolean} [props.selected=false] - Whether this cell is currently selected
 * @param {Array<Object>} [props.allPeople=[]] - List of all available people for autocomplete
 * @param {Set<string>} [props.selectedNames=new Set()] - Set of currently selected person names to prevent duplicates
 * @param {function} [props.onReplace] - Callback when a person is replaced via autocomplete
 * @param {boolean} [props.isLocked=false] - If true, disables editing and double-click replacement
 * 
 * @returns {JSX.Element} Rendered PersonCell component
 */
export default function PersonCell({ 
  person,
  variant = "default",
  position,
  dragProps,
  onClick,
  selected = false,
  allPeople = [],
  selectedNames = new Set(),
  onReplace,
  isLocked = false
}) {

  /** Whether the cell is in edit mode (autocomplete input visible) */
  const [isEditing, setIsEditing] = useState(false)

  /** Current input value for searching/replacing a person */
  const [inputValue, setInputValue] = useState(person?.name || "")

  /** Filtered results for autocomplete based on inputValue */
  const [filtered, setFiltered] = useState([])

  /** Index of the currently highlighted option in the dropdown */
  const [highlightIndex, setHighlightIndex] = useState(0)

  /** Ref to the input element, used for focus */
  const inputRef = useRef(null)

  /** Ref for debouncing input changes to avoid too many filter computations */
  const debounceRef = useRef(null)

  /**
   * Sync input value when person changes externally.
   * Keeps input value updated if the underlying person object changes.
   */
  useEffect(() => {
    setInputValue(person?.name || "")
  }, [person])

  /**
   * Debounced filtering for autocomplete.
   * Filters `allPeople` based on inputValue and removes already selected names.
   */
  useEffect(() => {
    if (!isEditing) return

    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const results = allPeople
        .filter(p =>
          p.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(p =>
          !selectedNames.has(p.name) || p.name === person?.name
        )

      setFiltered(results)
      setHighlightIndex(0)
    }, 100)

  }, [inputValue, allPeople, selectedNames, isEditing, person])

  /**
   * Handles selection of a person from the dropdown.
   * Calls the onReplace callback and exits editing mode.
   * @param {Object} p - The selected person object
   */
  const handleSelect = (p) => {
    setIsEditing(false)
    onReplace?.(p)
  }

  /**
   * Handles keyboard navigation for the autocomplete dropdown.
   * Arrow keys move selection, Enter selects, Escape cancels editing.
   * @param {KeyboardEvent} e - Keydown event
   */
  const handleKeyDown = (e) => {
    if (!filtered.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex(i => (i + 1) % filtered.length)
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex(i => (i - 1 + filtered.length) % filtered.length)
    }

    if (e.key === "Enter") {
      e.preventDefault()
      handleSelect(filtered[highlightIndex])
    }

    if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  /**
   * Highlights the portion of a name that matches the current input value.
   * @param {string} name - The name to highlight
   * @returns {JSX.Element|string} JSX with <strong> highlighting
   */
  const highlightMatch = (name) => {
    const index = name.toLowerCase().indexOf(inputValue.toLowerCase())
    if (index === -1) return name

    const before = name.slice(0, index)
    const match = name.slice(index, index + inputValue.length)
    const after = name.slice(index + inputValue.length)

    return (
      <>
        {before}
        <strong>{match}</strong>
        {after}
      </>
    )
  }

  return (
    <div 
      className={`${PCStyle.cell} ${selected ? PCStyle.selected : ""}`}
      draggable={!!person && !isEditing}
      onClick={onClick}
      onDoubleClick={() => {
        if (!isLocked) {
          setIsEditing(true)
          setInputValue("") // clear previous name for replacement
        }
      }}
      {...(isEditing ? {} : dragProps)}
    >
      {position && (
        <div className={PCStyle.positionBadge}>
          {position}
        </div>
      )}

      {isEditing ? (
        <div className={PCStyle.autocompleteWrapper}>
          <input
            ref={inputRef}
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setIsEditing(false), 150)}
            className={PCStyle.input}
          />

          {filtered.length > 0 && (
            <div className={PCStyle.dropdown}>
              {filtered.map((p, i) => (
                <div
                  key={p.name}
                  className={`${PCStyle.option} ${
                    i === highlightIndex ? PCStyle.activeOption : ""
                  }`}
                  onMouseDown={() => handleSelect(p)}
                >
                  {highlightMatch(p.name)}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <span className={PCStyle.name}>
          {person?.name || ""}
        </span>
      )}
    </div>
  )
}