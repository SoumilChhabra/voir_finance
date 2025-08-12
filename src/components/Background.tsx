export default function Background() {
  return (
    <div className="bg-root" aria-hidden="true">
      {/* soft gradient wash */}
      <div className="bg-wash" />
      {/* top waves */}
      <svg
        className="bg-waves"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="glacier" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          fill="url(#glacier)"
          d="M0,64L48,58.7C96,53,192,43,288,64C384,85,480,139,576,149.3C672,160,768,128,864,112C960,96,1056,96,1152,122.7C1248,149,1344,203,1392,229.3L1440,256L1440,0L0,0Z"
          opacity="0.55"
        />
        <path
          fill="url(#glacier)"
          d="M0,160L60,149.3C120,139,240,117,360,128C480,139,600,181,720,176C840,171,960,117,1080,117.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L0,0Z"
          opacity="0.35"
        />
      </svg>
      {/* subtle film grain */}
      <div className="bg-noise" />
    </div>
  );
}
