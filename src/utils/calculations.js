
export const MM_PER_INCH = 25.4;
export const INC_32MM = 32 / MM_PER_INCH; // True 32mm in inches (approx 1.26")

export function toMM(inches) {
    return (inches * MM_PER_INCH).toFixed(1);
}

function decimalToFraction(val) {
    const d = 32; // Precision 1/32
    const whole = Math.floor(val);
    const decimal = val - whole;
    const n = Math.round(decimal * d);

    if (n === 0) return `${whole}"`;
    if (n === d) return `${whole + 1}"`;

    // Simplify n/d
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const common = gcd(n, d);
    const num = n / common;
    const den = d / common;

    if (whole === 0) return `${num}/${den}"`;
    return `${whole} ${num}/${den}"`;
}

export function formatLength(inches) {
    const mm = Math.round(inches * MM_PER_INCH);
    const fraction = decimalToFraction(inches);
    return `${Number(inches).toFixed(3).replace(/\.?0+$/, '')}" (${fraction}) (${mm} mm)`;
}

export function calculateDoorHeight(topShelf, bottomShelf, reveal) {
    const height = parseFloat(topShelf) - parseFloat(bottomShelf) + 0.75 - (2 * parseFloat(reveal));
    return Math.max(0, height);
}

export function calculateDoorHeightFromSpan(span, reveal) {
    const height = parseFloat(span) - (2 * parseFloat(reveal));
    return Math.max(0, height);
}

export function getRecommendedHinges(height) {
    if (height < 36) return 2;
    if (height < 72) return 3;
    return 4;
}

export function getOffsets(reveal) {
    // reveal is string "0.5", "0.125", "0"
    switch (reveal) {
        case "0.5": return 3.00;
        case "0.125": return 3.375;
        case "0": return 3.50;
        default: return 3.00; // Default or error
    }
}

export function calculateHingeLocations(doorHeight, reveal, numHinges) {
    const offset = getOffsets(reveal);
    const topHinge = offset;
    const bottomHinge = doorHeight - offset;

    if (numHinges <= 0) return [];
    if (numHinges === 1) return [{ note: 'Top/Center', pos: doorHeight / 2 }]; // Edge case, unlikely

    const locations = [];

    // Top Hinge
    locations.push({ note: 'Top hinge', pos: topHinge });

    // Intermediate
    if (numHinges > 2) {
        const start = topHinge;
        const end = bottomHinge;
        const totalSpan = end - start;
        const count = numHinges - 2;
        // Distribute evenly
        // Ideal positions: start + (i+1) * (totalSpan / (count + 1)) ??
        // No, calculate N-1 intervals?
        // If N=3, 1 intermediate.
        // Normalized t from 0 to 1.
        // For i=1 to count:
        // ideal = start + (totalSpan * i / (count + 1))
        // Snap relative to start (Top Hinge)

        for (let i = 1; i <= count; i++) {
            const fraction = i / (numHinges - 1); // 1/(N-1), 2/(N-1)...
            // wait: first is index 0 (0/(N-1)), last is index N-1 (1).
            // intermediate k is index k. t = k / (N-1).
            // ideal = start + t * totalSpan
            const idealDistFromTopHinge = fraction * totalSpan;

            // Snap to nearest 1.25
            const snappedDist = Math.round(idealDistFromTopHinge / INC_32MM) * INC_32MM;

            locations.push({
                note: 'Middle hinge',
                pos: start + snappedDist
            });
        }
    }

    // Bottom Hinge
    // Only add if N >= 2
    if (numHinges >= 2) {
        locations.push({ note: 'Bottom hinge', pos: bottomHinge });
    }

    return locations;
}
