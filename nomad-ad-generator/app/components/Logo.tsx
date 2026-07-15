export default function Logo({ size = 48, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <rect width="36" height="36" rx="8" fill="white" />
      <circle cx="18" cy="18" r="10" stroke="#1B2A4A" strokeWidth="1.5" fill="none" />
      <circle cx="18" cy="18" r="4" stroke="#1B2A4A" strokeWidth="1.2" fill="none" />
      <line x1="18" y1="5" x2="18" y2="8" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="28" x2="18" y2="31" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="18" x2="8" y2="18" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="18" x2="31" y2="18" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9.5" y1="9.5" x2="11.6" y2="11.6" stroke="#1B2A4A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="24.4" y1="24.4" x2="26.5" y2="26.5" stroke="#1B2A4A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26.5" y1="9.5" x2="24.4" y2="11.6" stroke="#1B2A4A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11.6" y1="24.4" x2="9.5" y2="26.5" stroke="#1B2A4A" strokeWidth="1.2" strokeLinecap="round" />
      <polygon points="18,10 19.2,17 18,16 16.8,17" fill="#1B2A4A" />
      <polygon points="18,26 16.8,19 18,20 19.2,19" fill="#1B2A4A" opacity="0.4" />
    </svg>
  );
}
