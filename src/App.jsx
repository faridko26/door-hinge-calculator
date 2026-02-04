
import { useState, useMemo } from 'react';
import {
  calculateDoorHeight,
  getRecommendedHinges,
  calculateHingeLocations,
  formatLength
} from './utils/calculations';

function App() {

  // Inputs
  const [topShelf, setTopShelf] = useState('');
  const [bottomShelf, setBottomShelf] = useState('');
  const [reveal, setReveal] = useState('0.5'); // '0.5', '0.125', '0'
  const [numHinges, setNumHinges] = useState(2);

  // Derived
  const doorHeight = useMemo(() => {
    return calculateDoorHeight(topShelf || 0, bottomShelf || 0, reveal);
  }, [topShelf, bottomShelf, reveal]);

  const recommendedHinges = useMemo(() => {
    return getRecommendedHinges(doorHeight);
  }, [doorHeight]);

  const locations = useMemo(() => {
    return calculateHingeLocations(doorHeight, reveal, numHinges);
  }, [doorHeight, reveal, numHinges]);

  return (
    <div className="container">
      <h1>Hinge Cup Calculator</h1>

      <div className="card">

        {/* Height Inputs */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
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
        Design By Farid
      </div>
    </div>
  )
}

export default App
