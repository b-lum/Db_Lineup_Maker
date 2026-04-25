import { useState, useEffect, useMemo } from "react";
import { Person } from "./data_objects/Person.js";
import { Roster } from "./data_objects/Roster.js";
import { RaceLayout } from "./data_objects/boat_layouts/RaceLayout.js";
import { PracticeLayout } from "./data_objects/boat_layouts/PracticeLayout.js";
import RaceLayoutDisplay from "./react_components/RaceLayoutDisplay.jsx";
import CopyButton from "./react_components/CopyButton.jsx";
import PersonCounter from "./react_components/PersonCounter.jsx";
import Papa from "papaparse";
import "./App.css";

const TYPE_COLORS = { Open: '#2563eb', Womens: '#db2777', Mixed: '#9333ea' }

function makeLayout(boatName, numHeats, boatType, layoutMode) {
  if (layoutMode === "Practice") return new PracticeLayout(boatName, numHeats, boatType);
  return new RaceLayout(boatName, numHeats, boatType);
}

function App() {
  const [debouncedSheetURL, setDebouncedSheetURL] = useState("");
  const [sheetURL, setSheetURL] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSheetURL(sheetURL), 500);
    return () => clearTimeout(id);
  }, [sheetURL]);

  const buildCSVUrl = (url) => {
    if (!url) return null;
    if (url.includes("output=csv")) return url;
    return url.replace("/pubhtml", "/pub?output=csv");
  };

  const compareByWeight = (a, b) => a.weight - b.weight;

  const [roster, setRoster] = useState(() => new Roster([]));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPeople, setFilteredPeople] = useState(roster.getAll());

  useEffect(() => {
    if (!searchTerm) setFilteredPeople(roster.getAll());
    else setFilteredPeople(roster.filterByName(searchTerm));
  }, [searchTerm, roster]);

  const [boats, setBoats] = useState(() => new Map());
  const [boatInputs, setBoatInputs] = useState([{ name: "", type: "Open", layoutMode: "Race" }]);
  const [activeBoat, setActiveBoat] = useState(null);

  const populateRosterFromGoogleSheet = (csvURL) => {
    if (!csvURL) return;
    Papa.parse(csvURL, {
      header: true,
      download: true,
      complete: (results) => {
        let next = new Roster([], compareByWeight);
        results.data.forEach(row => {
          if (!row.Name || !row.Weight) return;
          const name = row.name ?? row.Name;
          const weight = parseFloat(row.weight ?? row.Weight);
          const gender = row.gender ?? row.Gender;
          const { name: _, weight: __, gender: ___, ...kwargs } = row;
          next = next.addPerson(new Person(name, weight, gender, kwargs));
        });
        setRoster(next);
      }
    });
  };

  useEffect(() => {
    const csvURL = buildCSVUrl(debouncedSheetURL);
    if (!csvURL) return;
    const load = () => populateRosterFromGoogleSheet(csvURL);
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [debouncedSheetURL]);

  const personCounts = useMemo(() => {
    const map = new Map();
    for (const boat of boats.values())
      for (const lineup of boat.lineups.values())
        for (const person of lineup.peopleMap.values())
          map.set(person.name, (map.get(person.name) ?? 0) + 1);
    return map;
  }, [boats]);

  // Original auto-append logic preserved, now with layoutMode added
  const updateBoatInput = (i, changes) => {
    setBoatInputs(prev => {
      const next = [...prev];
      next[i] = { ...next[i], ...changes };

      if (i === prev.length - 1 && next[i].name.trim() !== "") {
        next.push({ name: "", type: "Open", layoutMode: "Race" });
      }

      setBoats(prevBoats => {
        const nextBoats = new Map();
        for (const { name, type, layoutMode } of next) {
          const trimmed = name.trim();
          if (!trimmed) continue;
          if (prevBoats.has(trimmed)) {
            const prev = prevBoats.get(trimmed);
            const typeChanged = prev.boatType !== type;
            const modeChanged = (prev instanceof PracticeLayout ? "Practice" : "Race") !== layoutMode;
            if (typeChanged || modeChanged) {
              nextBoats.set(trimmed, makeLayout(trimmed, prev.lineups.size, type, layoutMode));
            } else {
              nextBoats.set(trimmed, prev);
            }
          } else {
            nextBoats.set(trimmed, makeLayout(trimmed, 3, type, layoutMode));
          }
        }
        return nextBoats;
      });

      return next;
    });
  };

  return (
    <div className="page">

      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-brand">
          <div className="topbar-brand-icon">🚣</div>
          LineupMaker
        </div>

        <div className="topbar-divider" />

        <input
          className="topbar-url-input"
          type="text"
          placeholder="Paste Google Sheets CSV link…"
          value={sheetURL}
          onChange={e => setSheetURL(e.target.value)}
        />

        <div className="topbar-divider" />

        <div className="boat-tabs">
          {Array.from(boats.entries()).map(([name, layout]) => {
            const isPractice = layout instanceof PracticeLayout;
            return (
              <button
                key={name}
                className={`boat-tab ${activeBoat === name ? "active" : ""}`}
                onClick={() => setActiveBoat(name)}
              >
                <span
                  className="boat-type-badge"
                  style={{
                    background: activeBoat === name
                      ? 'rgba(255,255,255,0.25)'
                      : `${TYPE_COLORS[layout.boatType]}18`,
                    color: activeBoat === name ? '#fff' : TYPE_COLORS[layout.boatType],
                  }}
                >
                  {layout.boatType}
                </span>
                {name}
                {isPractice && (
                  <span className="boat-mode-badge">P</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div className="app-main">

        {/* Left sidebar */}
        <div className="sidebar-left">
          <div className="sidebar-section-title">Boats</div>
          <div className="sidebar-scroll">
            {boatInputs.map((boat, i) => (
              <div key={i} className="boat-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <select
                      className="boat-type-select"
                      value={boat.type}
                      onChange={e => updateBoatInput(i, { type: e.target.value })}
                    >
                      <option value="Open">Open</option>
                      <option value="Womens">Womens</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                    <select
                      className="boat-type-select"
                      value={boat.layoutMode}
                      onChange={e => updateBoatInput(i, { layoutMode: e.target.value })}
                      title="Layout mode"
                    >
                      <option value="Race">Race</option>
                      <option value="Practice">Practice</option>
                    </select>
                  </div>
                  <input
                    className="boat-name-input"
                    value={boat.name}
                    placeholder={i === boatInputs.length - 1 ? "Add boat…" : ""}
                    onChange={e => updateBoatInput(i, { name: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          {activeBoat && boats.has(activeBoat) ? (
            <RaceLayoutDisplay
              lineupgrids={boats.get(activeBoat)}
              roster={roster}
              onUpdate={(newLayout) => {
                const next = new Map(boats);
                next.set(activeBoat, newLayout);
                setBoats(next);
              }}
              filteredPeople={filteredPeople}
              setFilteredPeople={setFilteredPeople}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🚣</div>
              <div className="empty-state-text">No boat selected</div>
              <div className="empty-state-sub">Add a boat on the left, then click its tab above</div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="sidebar-right">
          <div className="sidebar-section-title">Heat Counts</div>
          <div className="sidebar-scroll">
            <PersonCounter personCounts={personCounts} />
          </div>
          {activeBoat && boats.has(activeBoat) && (
            <CopyButton text={boats.get(activeBoat).mastersheetStr()} />
          )}
        </div>

      </div>
    </div>
  );
}

export default App;