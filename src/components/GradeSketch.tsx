export const paintRuns = [
  { x: 77, y: 169, length: 31, radius: 2.4, root: 7, drift: -1.8, delay: 0.62, duration: 2.9 },
  { x: 119, y: 172, length: 87, radius: 3.3, root: 9, drift: 1.2, delay: 0.28, duration: 3.5 },
  { x: 159, y: 169, length: 52, radius: 4.1, root: 11, drift: -2, delay: 0.91, duration: 4.2 },
  { x: 194, y: 132, length: 19, radius: 1.5, root: 4, drift: 0.8, delay: 0.45, duration: 2.2 },
];

// The wet edge advances while the deposited trail stays attached to the blot.
export function paintRunPath(run: typeof paintRuns[number], progress: number) {
  const { x, y, length, radius, root, drift } = run;
  const tipX = x + drift * progress;
  const tipY = y + length * progress;
  const bulb = radius * (0.35 + 0.65 * Math.min(progress * 3, 1));
  const neck = radius * 0.3;
  const shoulderY = y + length * progress * 0.3;
  return `M${x - root / 2} ${y}
    C${x - neck} ${shoulderY},${tipX - neck} ${tipY - bulb * 2},${tipX - neck} ${tipY - bulb}
    C${tipX - bulb * 1.4} ${tipY},${tipX - bulb} ${tipY + bulb},${tipX} ${tipY + bulb}
    C${tipX + bulb} ${tipY + bulb},${tipX + bulb * 1.4} ${tipY},${tipX + neck} ${tipY - bulb}
    C${tipX + neck} ${tipY - bulb * 2},${x + neck} ${shoulderY},${x + root / 2} ${y} Z`;
}

// Each satellite has its own silhouette, position and travel time.
const droplets = [
  { x: 41, y: 39, duration: 0.28, d: "M-6 -8 C-12 -10 -11 2 -5 7 C1 12 8 7 5 2 C3 -2 -1 -2 -6 -8Z" },
  { x: 30, y: 70, duration: 0.34, d: "M-13 -8 C-9 -9 -5 -3 0 -1 C10 3 11 9 5 9 C-3 8 -8 -3 -13 -8Z" },
  { x: 22, y: 48, duration: 0.39, d: "M-2 -2 C1 -4 5 0 2 3 C0 5 -4 1 -2 -2Z" },
  { x: 89, y: 18, duration: 0.22, d: "M-3 -9 C1 -16 5 -8 3 0 C2 8 -1 12 -3 9 C-5 5 -3 -3 -3 -9Z" },
  { x: 161, y: 24, duration: 0.3, d: "M-2 6 C-1 0 6 -8 11 -8 C14 -3 7 2 -2 6Z" },
  { x: 209, y: 47, duration: 0.27, d: "M-5 -2 C-6 -9 2 -10 5 -6 C12 -9 14 0 8 4 C2 7 -3 6 -5 -2Z" },
  { x: 226, y: 36, duration: 0.41, d: "M-1 -1 L2 -3 L4 0 L1 2Z" },
  { x: 219, y: 73, duration: 0.33, d: "M-6 2 C-3 -5 7 -5 10 -1 C7 4 0 4 -6 2Z" },
  { x: 234, y: 125, duration: 0.46, d: "M-3 0 C-1 -2 5 -2 6 0 C5 2 0 2 -3 0Z" },
  { x: 217, y: 178, duration: 0.37, d: "M-1 -7 C2 -5 1 0 5 3 C11 8 6 15 1 11 C-4 9 -1 3 -3 0 C-6 -5 -5 -9 -1 -7Z" },
  { x: 181, y: 200, duration: 0.42, d: "M-2 -5 C3 -8 9 -3 7 4 C5 11 -4 12 -6 6 C-8 1 -3 0 -2 -5Z" },
  { x: 45, y: 198, duration: 0.48, d: "M7 -11 C5 -3 -1 0 -7 8 C-12 13 -17 10 -12 5 C-5 1 0 -4 7 -11Z" },
  { x: 27, y: 216, duration: 0.52, d: "M-1 -3 C4 -4 3 1 0 3 C-5 4 -4 0 -1 -3Z" },
  { x: 30, y: 142, duration: 0.25, d: "M-8 1 C-12 -4 -5 -9 1 -7 C9 -6 9 1 3 4 C-2 7 -4 1 -8 1Z" },
  { x: 15, y: 160, duration: 0.4, d: "M-1 -2 C3 -2 3 2 0 3 C-4 2 -3 0 -1 -2Z" },
];

export default function GradeSketch() {
  return (
    <svg className="grade-sketch" viewBox="0 0 250 285" role="img" aria-label="95 out of 100, questioned: are good grades enough?">
      <g fill="#bf2748" aria-hidden="true">
        <g className="grade-paint">
          <path d="M100 57 C105 61 109 57 109 52 C110 45 101 26 108 21 C119 16 116 47 122 51 C126 56 130 53 132 47 C139 30 137 6 143 9 C151 13 143 41 144 51 C145 60 150 61 156 55 C163 46 165 40 174 39 C191 38 188 57 179 63 C174 66 165 65 166 72 C169 78 181 77 185 82 C190 87 181 91 186 96 C194 104 210 83 222 90 C237 99 211 110 197 110 C187 110 183 114 189 119 C193 121 196 115 201 119 C207 124 195 126 198 131 C202 138 219 140 231 147 C235 151 231 154 224 150 C212 142 199 142 193 141 C183 140 184 146 188 150 C200 160 204 165 198 171 C192 177 187 168 180 163 C171 157 167 161 168 170 C171 183 164 193 155 185 C149 181 154 174 147 171 C141 169 142 179 137 178 C132 176 135 170 128 172 C123 173 122 185 116 185 C109 186 113 176 106 175 C101 173 100 180 96 178 C91 176 95 171 89 170 C82 169 83 184 75 185 C62 186 61 174 67 164 C72 155 63 154 58 159 C46 171 38 183 29 188 C24 190 21 187 27 181 C37 174 44 163 48 158 C54 150 52 146 47 144 C42 142 37 150 34 145 C31 140 42 135 48 132 C54 128 52 124 47 123 C32 120 26 113 32 106 C39 98 46 111 52 107 C58 103 55 98 48 95 C38 91 33 87 37 83 C40 78 48 88 53 86 C58 84 50 78 55 75 C59 72 63 78 68 76 C74 73 59 65 56 55 C50 42 61 34 69 43 C76 51 74 62 83 65 C91 68 85 54 89 51 C94 48 94 60 100 57Z" />
        </g>
        {paintRuns.map((run, index) => <path key={index} className="grade-drip" d={paintRunPath(run, 1)} />)}
        {droplets.map(({ x, y, duration, d }, index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <path className="grade-splash" data-x={x} data-y={y} data-flight={duration} d={d} />
          </g>
        ))}
      </g>
      <g transform="rotate(-7 120 120)">
        <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <path className="grade-stroke grade-score" pathLength="1" d="M99 42 C87 29 65 36 64 52 C63 72 85 74 98 56 M100 38 C100 58 98 78 82 94" />
          <path className="grade-stroke grade-score" pathLength="1" d="M157 35 L124 37 L120 62 C133 54 154 58 154 75 C154 94 130 101 116 88" />
          <path className="grade-stroke grade-score" pathLength="1" d="M40 114 C82 111 129 113 176 108" />
          <path className="grade-stroke grade-score" pathLength="1" d="M44 151 L58 137 L55 190 M43 191 L69 189" />
          <path className="grade-stroke grade-score" pathLength="1" d="M99 135 C75 136 73 190 93 193 C115 195 122 137 101 135 L99 135" />
          <path className="grade-stroke grade-score" pathLength="1" d="M149 133 C126 135 124 187 144 190 C166 192 172 135 151 133 L149 133" />
        </g>
        <g className="grade-stamp">
          <g fill="none" stroke="#ff555f" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" transform="rotate(12 165 115)">
            <path d="M137 76 C140 48 180 44 195 64 C214 89 187 100 173 111 C165 117 165 125 166 132" />
            <path d="M166 154 L166 156" />
          </g>
        </g>
      </g>
    </svg>
  );
}
