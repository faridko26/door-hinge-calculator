
import { useState, useMemo } from 'react';
import {
  calculateDoorHeight,
  calculateDoorHeightFromSpan,
  getRecommendedHinges,
  calculateHingeLocations,
  formatLength
} from './utils/calculations';

function App() {
  const [mode, setMode] = useState('shelf'); // 'shelf' | 'span'

  // Inputs
  const [topShelf, setTopShelf] = useState('');
  const [bottomShelf, setBottomShelf] = useState('');
  const [totalSpan, setTotalSpan] = useState('');
  const [reveal, setReveal] = useState('0.5'); // '0.5', '0.125', '0'
  const [numHinges, setNumHinges] = useState(2);

  // Derived
  const doorHeight = useMemo(() => {
    if (mode === 'span') {
      return calculateDoorHeightFromSpan(totalSpan || 0, reveal);
    }
    return calculateDoorHeight(topShelf || 0, bottomShelf || 0, reveal);
  }, [mode, topShelf, bottomShelf, totalSpan, reveal]);

  const recommendedHinges = useMemo(() => {
    return getRecommendedHinges(doorHeight);
  }, [doorHeight]);

  const locations = useMemo(() => {
    return calculateHingeLocations(doorHeight, reveal, numHinges);
  }, [doorHeight, reveal, numHinges]);

  return (
    <div className="container app-layout">

      {/* LEFT PANEL: INSTRUCTIONS */}
      <div className="side-panel">
        <div className="info-card">
          <h3 className="info-title">System & Instructions</h3>
          <div className="info-content">
            <p style={{ marginBottom: '1rem' }}>
              Designed for the <strong className="text-primary">32mm Cabinet System</strong>.
              Calculates precise Euro hinge cup locations for full-overlay doors.
            </p>

            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>How to Use:</h4>
            <ul className="bullet-list">
              <li>Choose <strong>Shelf Height</strong> (opening) or <strong>Total Height</strong> mode.</li>
              <li>Enter measurements in inches (decimals accepted).</li>
              <li>Select your top/bottom <strong>Reveal</strong>.</li>
              <li>Select <strong>Number of Hinges</strong> (or use recommendation).</li>
              <li>Results update instantly.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CENTER PANEL: CALCULATOR */}
      <div className="calculator-wrapper">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="app-title" style={{ marginBottom: '0.25rem' }}>32mm Hinge Layout Tool</h1>
          <div style={{ fontSize: '0.875rem', opacity: 0.6, letterSpacing: '0.025em' }}>
            Designed & built by Farid
          </div>
        </div>

        <div className="card">

          {/* Mode Switcher */}
          <div className="radio-group" style={{ marginBottom: '1.5rem' }}>
            <div
              className={`radio-option ${mode === 'shelf' ? 'active' : ''}`}
              onClick={() => setMode('shelf')}
            >
              By Shelf Height
            </div>
            <div
              className={`radio-option ${mode === 'span' ? 'active' : ''}`}
              onClick={() => setMode('span')}
            >
              By Total Height
            </div>
          </div>

          {/* Height Inputs */}
          <div style={{ marginBottom: '1.5rem' }}>
            {mode === 'shelf' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Top Shelf Height (in)</label>
                  <input
                    type="number"
                    className="input"
                    step="0.0625"
                    value={topShelf}
                    onChange={(e) => setTopShelf(e.target.value)}
                    placeholder="e.g. 54"
                  />
                </div>
                <div>
                  <label className="label">Bottom Shelf Height (in)</label>
                  <input
                    type="number"
                    className="input"
                    step="0.0625"
                    value={bottomShelf}
                    onChange={(e) => setBottomShelf(e.target.value)}
                    placeholder="e.g. 18"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="label">Total Vertical Height (Top to Bottom)</label>
                <input
                  type="number"
                  className="input"
                  step="0.0625"
                  value={totalSpan}
                  onChange={(e) => setTotalSpan(e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
            )}
          </div>

          {/* Reveal Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Reveal (Top & Bottom)</label>
            <div className="radio-group">
              <div
                className={`radio-option ${reveal === '0.5' ? 'active' : ''}`}
                onClick={() => setReveal('0.5')}
              >
                1/2" Reveal
              </div>
              <div
                className={`radio-option ${reveal === '0.125' ? 'active' : ''}`}
                onClick={() => setReveal('0.125')}
              >
                1/8" Reveal
              </div>
              <div
                className={`radio-option ${reveal === '0' ? 'active' : ''}`}
                onClick={() => setReveal('0')}
              >
                No Reveal (0")
              </div>
            </div>
          </div>

          {/* Hinge Count */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center">
              <label className="label" style={{ marginBottom: 0 }}>Number of Hinges</label>
              <span
                className="text-primary text-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setNumHinges(recommendedHinges)}
              >
                Recommended: {recommendedHinges} (Click to set)
              </span>
            </div>
            <input
              type="number"
              className="input"
              min="2"
              max="10"
              value={numHinges}
              onChange={(e) => setNumHinges(parseInt(e.target.value) || 2)}
            />
          </div>

          {/* Results */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Results</h2>

            <div className="result-row">
              <span className="text-muted">Calculated Door Height</span>
              <span className="font-bold">{formatLength(doorHeight)}</span>
            </div>
            <div className="result-row">
              <span className="text-muted">Hinges</span>
              <span className="font-bold">{numHinges}</span>
            </div>

            <div className="hinge-list">
              {locations.map((loc, idx) => (
                <div key={idx} className="hinge-item">
                  <span className="font-bold" style={{ color: '#fff' }}>{loc.note}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>
                    {formatLength(loc.pos)}
                  </span>
                </div>
              ))}
              {locations.length === 0 && (
                <div className="text-muted" style={{ textAlign: 'center' }}>
                  Enter valid heights to see locations
                </div>
              )}
            </div>
          </div>

        </div>



        <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.875rem' }}>
          Designed & built by Farid
        </div>
      </div>

      {/* RIGHT PANEL: RECOMMENDATIONS */}
      <div className="side-panel">
        <div className="info-card">
          <h3 className="info-title">Bore Quantity Recommendations</h3>
          <ul className="info-list">
            <li>
              <span>Up to 35.99"</span>
              <span className="info-highlight">2 Bores</span>
            </li>
            <li>
              <span>36" to 71.99"</span>
              <span className="info-highlight">3 Bores</span>
            </li>
            <li>
              <span>72" and Up</span>
              <span className="info-highlight">4 Bores</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  )
}

export default App
