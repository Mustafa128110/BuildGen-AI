export function SessionLoadingScreen({
  title = "Checking Session",
  subtitle = "Verifying architectural credentials...",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="tactile-editorial-root min-h-screen w-full bg-[#FDF8F0] text-[#212121] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      <style>{`
        .buildgen-loader-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background-color: #FFFBF3;
          border: 1px solid rgba(33, 33, 33, 0.2);
          padding: 2.25rem 2rem;
          box-shadow: 4px 4px 0px rgba(33, 33, 33, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .buildgen-loader-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem 0;
        }
        .buildgen-loader-bar {
          width: 240px;
          height: 4px;
          background-color: rgba(33, 33, 33, 0.08);
          border: 1px solid rgba(33, 33, 33, 0.15);
          overflow: hidden;
          position: relative;
          margin-top: 1.25rem;
        }
        .buildgen-loader-indicator {
          height: 100%;
          background-color: #3B60C5;
          position: absolute;
          width: 40%;
          animation: buildgenProgress 1.5s ease-in-out infinite;
        }
        @keyframes buildgenProgress {
          0% { left: -40%; }
          50% { left: 40%; }
          100% { left: 100%; }
        }
      `}</style>

      {/* Architectural Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(33, 33, 33, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(33, 33, 33, 0.05) 1px, transparent 1px),
            linear-gradient(to right, rgba(33, 33, 33, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(33, 33, 33, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 24px 24px, 120px 120px, 120px 120px",
        }}
      />

      {/* Architectural Blueprint Framing Marks */}
      <div className="absolute top-6 left-6 font-mono text-[10px] tracking-widest text-[#5B5B5B] flex items-center space-x-2">
        <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-[#212121]" />
        <span>BUILDGEN</span>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] tracking-widest text-[#5B5B5B] flex items-center space-x-2">
        <span>ARCHITECTURAL STUDIO</span>
        <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-[#212121]" />
      </div>

      {/* Center Architectural Chamber Card */}
      <div className="buildgen-loader-card">
        {/* Card Corner Ticks */}
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#212121]" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#212121]" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#212121]" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#212121]" />

        {/* Animated Architectural Drafting Reticle */}
        <div className="buildgen-loader-icon">
          <svg
            width="76"
            height="76"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            {/* Outer Rotating Coordinate Reticle */}
            <circle
              cx="36"
              cy="36"
              r="31"
              stroke="#3B60C5"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 36 36"
                to="360 36 36"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Inner Counter-Rotating Ring */}
            <circle
              cx="36"
              cy="36"
              r="23"
              stroke="#212121"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.35"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 36 36"
                to="0 36 36"
                dur="12s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Crosshair Alignment Guides */}
            <line x1="36" y1="2" x2="36" y2="10" stroke="#212121" strokeWidth="1.5" />
            <line x1="36" y1="62" x2="36" y2="70" stroke="#212121" strokeWidth="1.5" />
            <line x1="2" y1="36" x2="10" y2="36" stroke="#212121" strokeWidth="1.5" />
            <line x1="62" y1="36" x2="70" y2="36" stroke="#212121" strokeWidth="1.5" />

            {/* Central Isometric Drafting Diamond */}
            <rect
              x="27"
              y="27"
              width="18"
              height="18"
              stroke="#3B60C5"
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 36 36"
                to="360 36 36"
                dur="6s"
                repeatCount="indefinite"
              />
            </rect>

            {/* Center Cadmium Vermilion Beacon */}
            <circle cx="36" cy="36" r="3.5" fill="#EC633D">
              <animate attributeName="r" values="2.5;4.5;2.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Readout Typography */}
        <h2 className="font-mono text-sm uppercase tracking-wider text-[#212121] font-semibold mt-2">
          {title}
        </h2>
        <p role="status" className="font-mono text-[11px] text-[#5B5B5B] uppercase tracking-wide mt-1">
          {subtitle}
        </p>

        {/* Precision Progress Bar */}
        <div className="buildgen-loader-bar">
          <div className="buildgen-loader-indicator" />
        </div>
      </div>
    </div>
  );
}
