/**
 * A stand-in for the KHQR payment card a Cambodian shop shows its customers.
 *
 * Modelled on the real thing — red KHQR banner with its folded corner, the
 * merchant's name, the amount, a dashed tear line, and the emblem sitting in
 * the middle of the code — so the landing page looks like the app a visitor
 * already pays with.
 *
 * The code itself is drawn from a fixed formula, not encoded: a scannable one
 * on a marketing page would send strangers' money to whoever's account was
 * photographed. Computed rather than randomised, so the server and the client
 * render identical markup. Bank branding is left off deliberately — KHQR is
 * the standard every Cambodian bank issues, and a bank's logo here would read
 * as a partnership that does not exist.
 */

const MODULES = 33; // A version-4 code: dense enough to read as real.
const QUIET = 2;
const SIDE = MODULES + QUIET * 2;

/** The three big corner squares that make a QR look like a QR. */
const FINDERS = [
  [0, 0],
  [MODULES - 7, 0],
  [0, MODULES - 7],
] as const;

/** The smaller square near the opposite corner, on codes this size. */
const ALIGNMENT: readonly [number, number] = [MODULES - 9, MODULES - 9];

function reserved(x: number, y: number) {
  const inFinder = FINDERS.some(
    ([fx, fy]) => x >= fx && x < fx + 8 && y >= fy && y < fy + 8,
  );
  const inAlignment =
    x >= ALIGNMENT[0] && x < ALIGNMENT[0] + 5 &&
    y >= ALIGNMENT[1] && y < ALIGNMENT[1] + 5;
  // Row and column 6 carry the timing pattern, drawn separately.
  return inFinder || inAlignment || x === 6 || y === 6;
}

const CELLS: [number, number][] = [];
for (let y = 0; y < MODULES; y++) {
  for (let x = 0; x < MODULES; x++) {
    if (reserved(x, y)) continue;
    if ((x * 29 + y * 47 + ((x * y) % 13)) % 7 < 3) CELLS.push([x, y]);
  }
}

/** One finder square: a 7×7 ring with a 3×3 core. */
function Finder({ x, y }: { x: number; y: number }) {
  return (
    <>
      {/* Four bars, not a stroked rect — a stroke scales with the viewBox and
          turns to mush at the sizes this renders at. */}
      <rect x={x} y={y} width={7} height={1} />
      <rect x={x} y={y + 6} width={7} height={1} />
      <rect x={x} y={y} width={1} height={7} />
      <rect x={x + 6} y={y} width={1} height={7} />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </>
  );
}

export function QrMock({ className = "" }: { className?: string }) {
  const [ax, ay] = ALIGNMENT;
  const centre = QUIET + MODULES / 2;

  return (
    <svg
      viewBox={`0 0 ${SIDE} ${SIDE}`}
      className={className}
      role="img"
      aria-label="Payment QR code"
    >
      <rect width={SIDE} height={SIDE} fill="#fff" />
      <g fill="#0a0a0a" transform={`translate(${QUIET} ${QUIET})`}>
        {CELLS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}

        {FINDERS.map(([x, y]) => (
          <Finder key={`f${x}-${y}`} x={x} y={y} />
        ))}

        {/* Alignment square — a 5×5 ring with a single dark centre. */}
        <rect x={ax} y={ay} width={5} height={1} />
        <rect x={ax} y={ay + 4} width={5} height={1} />
        <rect x={ax} y={ay} width={1} height={5} />
        <rect x={ax + 4} y={ay} width={1} height={5} />
        <rect x={ax + 2} y={ay + 2} width={1} height={1} />

        {/* Timing patterns: alternating modules joining the finders. */}
        {Array.from({ length: MODULES - 16 }, (_, i) => i + 8)
          .filter((i) => i % 2 === 0)
          .map((i) => (
            <g key={`t${i}`}>
              <rect x={i} y={6} width={1} height={1} />
              <rect x={6} y={i} width={1} height={1} />
            </g>
          ))}
      </g>

      {/* KHQR emblem, centred over the code exactly as the banks print it.
          Its own white pad, so it reads as an overlay and not as data. */}
      <circle cx={centre} cy={centre} r={5.2} fill="#fff" />
      <circle cx={centre} cy={centre} r={4.4} fill="#e11b22" />
      <g fill="#fff" transform={`translate(${centre} ${centre})`}>
        {[0, 45, 90, 135].map((angle) => (
          <rect
            key={angle}
            x={-2.4}
            y={-0.5}
            width={4.8}
            height={1}
            rx={0.5}
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r={1.5} fill="#e11b22" />
      </g>
    </svg>
  );
}

/**
 * The card as a customer receives it. `compact` fits it inside the phone
 * mockup, where every dimension has to come down together or the code turns
 * into a grey smudge.
 */
export function QrCard({
  shopName,
  amount,
  currency,
  hint,
  compact = false,
}: {
  shopName: string;
  amount: string;
  currency: string;
  hint: string;
  compact?: boolean;
}) {
  const s = compact
    ? {
        card: "w-[92px] rounded-md",
        band: "h-3.5 text-[6px] tracking-[0.12em]",
        body: "px-1.5 pt-1",
        name: "text-[5px]",
        amount: "text-[9px]",
        currency: "text-[5px]",
        rule: "my-1",
        code: "pb-1.5",
        hint: "mt-1 text-[5px]",
      }
    : {
        card: "w-[126px] rounded-md",
        band: "h-5 text-[8px] tracking-[0.18em]",
        body: "px-2 pt-1",
        name: "text-[7px]",
        amount: "text-sm",
        currency: "text-[8px]",
        rule: "my-1",
        code: "pb-2",
        hint: "mt-1 text-[7px]",
      };

  return (
    <div>
      <div className={`overflow-hidden bg-white shadow-sm ${s.card}`}>
        {/* Banner. The notch below its right edge is the folded corner every
            KHQR card carries — the detail that makes it recognisable. */}
        <div className="relative">
          <div
            className={`flex items-center justify-center bg-[#e11b22] font-bold text-white ${s.band}`}
          >
            KHQR
          </div>
          <div
            className={`absolute right-0 top-full bg-[#e11b22] ${compact ? "h-1.5 w-2.5" : "h-2.5 w-3.5"}`}
            style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          />
        </div>

        <div className={s.body}>
          <p
            className={`truncate font-medium uppercase tracking-wide text-neutral-600 ${s.name}`}
          >
            {shopName}
          </p>
          <p className={`font-bold leading-tight text-neutral-900 ${s.amount}`}>
            {amount}
            <span className={`ml-1 font-medium text-neutral-500 ${s.currency}`}>
              {currency}
            </span>
          </p>
          <div className={`border-t border-dashed border-neutral-300 ${s.rule}`} />
        </div>

        <div className={`${s.body} ${s.code} pt-0`}>
          <QrMock className="w-full" />
        </div>
      </div>

      {/* Sits outside the card on the bubble, where the bank prints it. */}
      <p className={`text-center leading-tight text-white/80 ${s.hint}`}>
        {hint}
      </p>
    </div>
  );
}
