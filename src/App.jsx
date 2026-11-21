
import { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import DoorSchema from './components/DoorSchema';
import {
  calculateDoorHeight,
  calculateDoorHeightFromSpan,
  getRecommendedHinges,
  calculateHingeLocations,
  formatLength
} from './utils/calculations';

function App() {
  const [mode, setMode] = useState('shelf'); // 'shelf' | 'span'
  const [jobName, setJobName] = useState('');
  const exportRef = useRef();

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

  const handleExport = async () => {
    if (!exportRef.current) return;

    try {
      // Use html2canvas to capture the hidden print template
      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF - A4 size closely matches our template width usually, 
      // but let's just make the PDF match the canvas aspect ratio to be safe or standard A4.
      // Standard A4 at 72 DPI is 595 x 842 pixels.
      // We'll map the canvas to fit on an A4 page.
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = pdf.internal.pageSize.getHeight(); // Unused

      const contentWidth = canvas.width;
      const contentHeight = canvas.height;

      // Calculate scaling to fit width
      const ratio = pdfWidth / contentWidth;
      const scaledHeight = contentHeight * ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      pdf.save(jobName ? `${jobName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_hinge_layout.pdf` : 'door_hinge_layout.pdf');
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to create PDF export.");
    }
  };

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

          {/* Job Name Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Job Name (Optional)</label>
            <input
              type="text"
              className="input"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g. Kitchen Cabinets"
            />
          </div>

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
                1/2&quot; Reveal
              </div>
              <div
                className={`radio-option ${reveal === '0.4375' ? 'active' : ''}`}
                onClick={() => setReveal('0.4375')}
              >
                7/16&quot; Reveal (Half Overlay)
              </div>
              <div
                className={`radio-option ${reveal === '0.125' ? 'active' : ''}`}
                onClick={() => setReveal('0.125')}
              >
                1/8&quot; Reveal (Full Overlay)
              </div>
              <div
                className={`radio-option ${reveal === '0' ? 'active' : ''}`}
                onClick={() => setReveal('0')}
              >
                No Reveal (0&quot;)
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
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Results</h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-2"
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                <Download size={16} /> Export PDF
              </button>
            </div>

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

          {/* On-screen Visual Reference */}
          {locations.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginTop: '2rem' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Visual Reference</h2>
              <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem' }}>
                <DoorSchema doorHeight={doorHeight} locations={locations} />
              </div>
            </div>
          )}

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

      {/* HIDDEN EXPORT TEMPLATE - This is captured by html2canvas */}
      <div style={{ position: 'fixed', left: '-10000px', top: 0 }}>
        <div
          ref={exportRef}
          style={{
            width: '800px', // Fixed width for A4 ratio consistency
            padding: '40px',
            background: 'white',
            color: '#1e293b',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '24px' }}>
              {jobName ? `Job Name: ${jobName}` : 'Job Name:'}
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <div style={{ display: 'flex', gap: '40px' }}>
            {/* Left Column: Data */}
            <div style={{ flex: '1' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Specifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ color: '#64748b' }}>Door Height:</div>
                  <div style={{ fontWeight: 'bold' }}>{formatLength(doorHeight)}</div>

                  <div style={{ color: '#64748b' }}>Reveal:</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {reveal === '0.5' ? '1/2"' : reveal === '0.4375' ? '7/16" (Half Overlay)' : reveal === '0.125' ? '1/8" (Full Overlay)' : '0" (No Reveal)'}
                  </div>

                  <div style={{ color: '#64748b' }}>Hinge Count:</div>
                  <div style={{ fontWeight: 'bold' }}>{numHinges}</div>
                </div>
              </div>

              <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Hinge Locations</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>Location</th>
                    <th style={{ textAlign: 'right', padding: '10px', fontSize: '14px', borderBottom: '2px solid #e2e8f0' }}>Distance from Top</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 10px' }}>{l.note}</td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontFamily: 'monospace', fontSize: '14px' }}>
                        {formatLength(l.pos)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '40px', fontSize: '12px', color: '#94a3b8' }}>
                Designed & built by Farid
              </div>
            </div>

            {/* Right Column: Schema */}
            <div style={{ flex: '1', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ marginTop: 0, textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Schematic Diagram</h3>
              <DoorSchema doorHeight={doorHeight} locations={locations} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default App
