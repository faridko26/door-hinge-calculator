
import React from 'react';

// Using actual inches for coordinates thanks to SVG viewBox scaling.
// We'll set a standard width of 18" for the drawing if none provided.
const DOOR_WIDTH = 18;
const CUP_DIAMETER = 35 / 25.4; // 35mm in inches (~1.38")
const CUP_RADIUS = CUP_DIAMETER / 2;
const PILOT_OFFSET = 37 / 25.4; // 37mm setback for hinge plate on cabinet side usually, but heavily depends on hinge. 
// For door cup, standard bore distance (tab C) is usually 3-6mm from edge. Let's assume standard ~22mm to center from edge.
const CUP_CENTER_FROM_EDGE = 22.5 / 25.4; // Approx 7/8"

export default function DoorSchema({ doorHeight, locations }) {
    // Ensure valid numbers
    const height = Math.max(doorHeight, 1);

    // Calculate viewBox to include some padding for dimensions
    // Dynamic right padding based on number of hinges to avoid cutoff
    // Base offset (2) + step (1.5) per hinge + buffer
    const baseOffset = 2;
    const step = 1.5;
    const requiredRightPadding = Math.max(6, baseOffset + (Math.max(0, locations.length - 1) * step) + 2);

    const PADDING = { top: 4, right: requiredRightPadding, bottom: 4, left: 6 };
    const viewBoxWidth = DOOR_WIDTH + PADDING.left + PADDING.right;
    const viewBoxHeight = height + PADDING.top + PADDING.bottom;

    // Coordinate system: (0,0) is top-left of the viewBox.
    // Door starts at (PADDING.left, PADDING.top).
    const doorX = PADDING.left;
    const doorY = PADDING.top;

    // Format helper
    const fmt = (n) => n.toFixed(3).replace(/\.?0+$/, '') + '"';

    return (
        <div className="door-schema-container" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <svg
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                style={{ width: '100%', height: 'auto', border: '1px solid #ddd', background: '#fff' }}
            >
                {/* Defs for markers */}
                <defs>
                    <marker
                        id="arrowhead-start"
                        markerWidth="4"
                        markerHeight="4"
                        refX="4"
                        refY="2"
                        orient="auto"
                    >
                        <path d="M0,2 L4,0 L4,4 Z" fill="#666" />
                    </marker>
                    <marker
                        id="arrowhead-end"
                        markerWidth="4"
                        markerHeight="4"
                        refX="0"
                        refY="2"
                        orient="auto"
                    >
                        <path d="M0,0 L4,2 L0,4 Z" fill="#666" />
                    </marker>
                </defs>

                {/* Door Outline */}
                <rect
                    x={doorX}
                    y={doorY}
                    width={DOOR_WIDTH}
                    height={height}
                    fill="#f8f9fa"
                    stroke="#333"
                    strokeWidth="0.1"
                />

                {/* Hinge Cups */}
                {locations.map((loc, i) => {
                    const cy = doorY + loc.pos;
                    const cx = doorX + DOOR_WIDTH - (22.5 / 25.4); // 22.5mm from edge

                    // Stagger dimensions: 1st closest, 2nd further out, etc.
                    const dimX = doorX + DOOR_WIDTH + baseOffset + (i * step);

                    return (
                        <g key={i}>
                            {/* Cup Circle */}
                            <circle
                                cx={cx}
                                cy={cy}
                                r={17.5 / 25.4} // 35mm diameter / 2
                                fill="#fff"
                                stroke="#d00"
                                strokeWidth="0.05"
                            />
                            {/* Crosshair */}
                            <line x1={cx - 0.3} y1={cy} x2={cx + 0.3} y2={cy} stroke="#d00" strokeWidth="0.02" />
                            <line x1={cx} y1={cy - 0.3} x2={cx} y2={cy + 0.3} stroke="#d00" strokeWidth="0.02" />

                            {/* Extension line from Top */}
                            <line
                                x1={doorX + DOOR_WIDTH + 0.5}
                                y1={doorY}
                                x2={dimX + 0.5}
                                y2={doorY}
                                stroke="#999"
                                strokeWidth="0.02"
                                strokeDasharray="0.2,0.2"
                            />

                            {/* Extension line from Hinge Center */}
                            <line
                                x1={doorX + DOOR_WIDTH + 0.5}
                                y1={cy}
                                x2={dimX + 0.5}
                                y2={cy}
                                stroke="#999"
                                strokeWidth="0.02"
                                strokeDasharray="0.2,0.2"
                            />

                            {/* Vertical Dimension Line */}
                            <line
                                x1={dimX}
                                y1={doorY}
                                x2={dimX}
                                y2={cy}
                                stroke="#333"
                                strokeWidth="0.04"
                            />

                            {/* Arrowheads (manual simple lines for now) */}
                            {/* Top arrow */}
                            <line x1={dimX} y1={doorY} x2={dimX - 0.15} y2={doorY + 0.3} stroke="#333" strokeWidth="0.04" />
                            <line x1={dimX} y1={doorY} x2={dimX + 0.15} y2={doorY + 0.3} stroke="#333" strokeWidth="0.04" />

                            {/* Bottom arrow */}
                            <line x1={dimX} y1={cy} x2={dimX - 0.15} y2={cy - 0.3} stroke="#333" strokeWidth="0.04" />
                            <line x1={dimX} y1={cy} x2={dimX + 0.15} y2={cy - 0.3} stroke="#333" strokeWidth="0.04" />

                            {/* Text Label */}
                            <text
                                x={dimX - 0.2}
                                y={doorY + (cy - doorY) / 2}
                                fontSize="0.8"
                                fill="#333"
                                textAnchor="middle"
                                transform={`rotate(-90, ${dimX - 0.2}, ${doorY + (cy - doorY) / 2})`}
                            >
                                {loc.pos.toFixed(3).replace(/\.?0+$/, '')}"
                            </text>
                        </g>
                    );
                })}

                {/* Total Height Dimension on Left */}
                <line
                    x1={doorX - 0.5}
                    y1={doorY}
                    x2={doorX - 2.5}
                    y2={doorY}
                    stroke="#666"
                    strokeWidth="0.02"
                />
                <line
                    x1={doorX - 0.5}
                    y1={doorY + height}
                    x2={doorX - 2.5}
                    y2={doorY + height}
                    stroke="#666"
                    strokeWidth="0.02"
                />
                <line
                    x1={doorX - 2}
                    y1={doorY}
                    x2={doorX - 2}
                    y2={doorY + height}
                    stroke="#666"
                    strokeWidth="0.02"
                    markerStart="url(#arrowhead-start)"
                    markerEnd="url(#arrowhead-end)"
                />
                <text
                    x={doorX - 2.5}
                    y={doorY + height / 2}
                    fontSize="1"
                    fill="#333"
                    textAnchor="middle"
                    transform={`rotate(-90, ${doorX - 2.5}, ${doorY + height / 2})`}
                >
                    {fmt(height)} Height
                </text>

            </svg>
        </div>
    );
}
