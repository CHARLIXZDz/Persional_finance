import React from 'react';

/**
 * Pixel-perfect SVG Flag Components for Laos, Vietnam, and English (UK/US)
 * Avoids OS emoji rendering discrepancies (e.g. Windows rendering country codes like "LA", "VN", "US").
 */

export const LaosFlag = ({ className = 'w-5 h-3.5', rounded = true }) => (
  <svg
    viewBox="0 0 36 24"
    className={`${className} ${rounded ? 'rounded-[3px] overflow-hidden' : ''} shadow-xs flex-shrink-0 inline-block`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top Red Stripe */}
    <rect width="36" height="24" fill="#CE1126" />
    {/* Middle Blue Stripe */}
    <rect y="6" width="36" height="12" fill="#002868" />
    {/* White Moon Circle */}
    <circle cx="18" cy="12" r="4.6" fill="#FFFFFF" />
  </svg>
);

export const VietnamFlag = ({ className = 'w-5 h-3.5', rounded = true }) => (
  <svg
    viewBox="0 0 36 24"
    className={`${className} ${rounded ? 'rounded-[3px] overflow-hidden' : ''} shadow-xs flex-shrink-0 inline-block`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Red Background */}
    <rect width="36" height="24" fill="#DA251D" />
    {/* Yellow 5-Pointed Star */}
    <polygon
      fill="#FFFF00"
      points="18,4.8 20.22,10.63 26.36,10.63 21.39,14.24 23.29,20.07 18,16.46 12.71,20.07 14.61,14.24 9.64,10.63 15.78,10.63"
    />
  </svg>
);

export const EnglishFlag = ({ className = 'w-5 h-3.5', rounded = true }) => (
  <svg
    viewBox="0 0 60 40"
    className={`${className} ${rounded ? 'rounded-[3px] overflow-hidden' : ''} shadow-xs flex-shrink-0 inline-block`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* UK Union Jack - Standard Global English Flag */}
    <rect width="60" height="40" fill="#012169" />
    {/* Diagonal White Cross */}
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="square" />
    {/* Diagonal Red Cross */}
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" strokeLinecap="square" />
    {/* Horizontal & Vertical White Cross */}
    <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="12" />
    {/* Horizontal & Vertical Red Cross */}
    <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7.2" />
  </svg>
);

export const USAFlag = ({ className = 'w-5 h-3.5', rounded = true }) => (
  <svg
    viewBox="0 0 60 40"
    className={`${className} ${rounded ? 'rounded-[3px] overflow-hidden' : ''} shadow-xs flex-shrink-0 inline-block`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="60" height="40" fill="#B22234" />
    <path d="M0,6.15 h60 M0,12.3 h60 M0,18.45 h60 M0,24.6 h60 M0,30.75 h60 M0,36.9 h60" stroke="#FFFFFF" strokeWidth="3.08" />
    <rect width="25" height="21.5" fill="#3C3B6E" />
    <circle cx="5" cy="4" r="1.1" fill="#FFFFFF" />
    <circle cx="10" cy="4" r="1.1" fill="#FFFFFF" />
    <circle cx="15" cy="4" r="1.1" fill="#FFFFFF" />
    <circle cx="20" cy="4" r="1.1" fill="#FFFFFF" />
    <circle cx="7.5" cy="8" r="1.1" fill="#FFFFFF" />
    <circle cx="12.5" cy="8" r="1.1" fill="#FFFFFF" />
    <circle cx="17.5" cy="8" r="1.1" fill="#FFFFFF" />
    <circle cx="5" cy="12" r="1.1" fill="#FFFFFF" />
    <circle cx="10" cy="12" r="1.1" fill="#FFFFFF" />
    <circle cx="15" cy="12" r="1.1" fill="#FFFFFF" />
    <circle cx="20" cy="12" r="1.1" fill="#FFFFFF" />
    <circle cx="7.5" cy="16" r="1.1" fill="#FFFFFF" />
    <circle cx="12.5" cy="16" r="1.1" fill="#FFFFFF" />
    <circle cx="17.5" cy="16" r="1.1" fill="#FFFFFF" />
  </svg>
);

/**
 * FlagIcon helper component
 * Selects the appropriate SVG based on language code ('lo', 'vi', 'en', 'us', etc.)
 */
export const FlagIcon = ({ code = 'lo', className = 'w-5 h-3.5', rounded = true }) => {
  const normalized = (code || '').toLowerCase();

  switch (normalized) {
    case 'lo':
    case 'la':
    case 'laos':
      return <LaosFlag className={className} rounded={rounded} />;
    case 'vi':
    case 'vn':
    case 'vietnam':
      return <VietnamFlag className={className} rounded={rounded} />;
    case 'en':
    case 'uk':
    case 'gb':
    case 'english':
      return <EnglishFlag className={className} rounded={rounded} />;
    case 'us':
    case 'usa':
      return <USAFlag className={className} rounded={rounded} />;
    default:
      return <LaosFlag className={className} rounded={rounded} />;
  }
};

export default FlagIcon;
