export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="my-love-rose" x1="8" y1="6" x2="39" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D884A1" />
          <stop offset="1" stopColor="#9B3159" />
        </linearGradient>
      </defs>
      <path d="M24 40.2 9.1 26.1C1.6 18.5 11.9 6.4 20.7 13.8L24 16.6l3.3-2.8c8.8-7.4 19.1 4.7 11.6 12.3L24 40.2Z" fill="url(#my-love-rose)" fillOpacity=".16" stroke="url(#my-love-rose)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15.2 11.1h12.3l6.7 6.1v18.2H15.2V11.1Z" fill="#FFF9F5" stroke="#9B3159" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M27.5 11.1v6.4h6.7M19.3 23.5h10M19.3 28h10" stroke="#B75D7B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m17.4 34.1 6.6 6.1 6.7-6.1" stroke="#9B3159" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
