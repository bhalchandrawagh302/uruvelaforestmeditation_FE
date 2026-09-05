import React from 'react';

interface MahabodhiLogoProps {
  className?: string;
  size?: number;
}

export const MahabodhiLogo: React.FC<MahabodhiLogoProps> = ({ 
  className = "w-10 h-10", 
  size 
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Mahabodhi Meditation Centre Emblem"
    >
      <defs>
        {/* Curved text path for top Burmese text */}
        <path
          id="top-burmese-arc"
          d="M 100 240 A 155 155 0 0 1 400 240"
          fill="none"
        />
        {/* Curved text path for inner Mahabodhi text */}
        <path
          id="bottom-centre-arc"
          d="M 112 250 A 140 140 0 0 0 388 250"
          fill="none"
        />
        {/* Curved text path for bottom ribbon text */}
        <path
          id="ribbon-center-arc"
          d="M 175 425 Q 250 445 325 425"
          fill="none"
        />

        {/* Drop shadow filter for ribbon */}
        <filter id="ribbon-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer White Background Circle */}
      <circle cx="250" cy="235" r="195" fill="#FFFFFF" />

      {/* Outer Fine Border Line */}
      <circle cx="250" cy="235" r="162" stroke="#231a15" strokeWidth="2.5" fill="none" />

      {/* Bodhi Leaves Garlands - Left Side */}
      <g fill="#1b4d24" stroke="#0e2a14" strokeWidth="0.8">
        {/* Left garland stem */}
        <path
          d="M 85 240 Q 60 160 130 95"
          fill="none"
          stroke="#1b4d24"
          strokeWidth="1.8"
          strokeDasharray="3,3"
        />
        <path
          d="M 85 240 Q 60 320 120 375"
          fill="none"
          stroke="#1b4d24"
          strokeWidth="1.8"
          strokeDasharray="3,3"
        />
        
        {/* Left individual leaves */}
        {/* Leaf 1 (Top left) */}
        <path d="M 125 100 C 110 85 85 95 95 115 C 105 130 130 120 125 100 Z" />
        {/* Leaf 2 */}
        <path d="M 98 135 C 80 125 65 140 75 160 C 88 172 108 155 98 135 Z" />
        {/* Leaf 3 */}
        <path d="M 78 180 C 58 175 50 195 62 215 C 75 228 92 205 78 180 Z" />
        {/* Leaf 4 (Middle left) */}
        <path d="M 68 235 C 48 235 45 255 60 270 C 75 280 90 260 68 235 Z" />
        {/* Leaf 5 */}
        <path d="M 76 295 C 60 300 62 322 78 335 C 95 342 105 320 76 295 Z" />
        {/* Leaf 6 */}
        <path d="M 98 345 C 85 355 92 378 112 385 C 128 388 132 365 98 345 Z" />
      </g>

      {/* Bodhi Leaves Garlands - Right Side */}
      <g fill="#1b4d24" stroke="#0e2a14" strokeWidth="0.8">
        {/* Right garland stem */}
        <path
          d="M 415 240 Q 440 160 370 95"
          fill="none"
          stroke="#1b4d24"
          strokeWidth="1.8"
          strokeDasharray="3,3"
        />
        <path
          d="M 415 240 Q 440 320 380 375"
          fill="none"
          stroke="#1b4d24"
          strokeWidth="1.8"
          strokeDasharray="3,3"
        />

        {/* Right individual leaves */}
        {/* Leaf 1 (Top right) */}
        <path d="M 375 100 C 390 85 415 95 405 115 C 395 130 370 120 375 100 Z" />
        {/* Leaf 2 */}
        <path d="M 402 135 C 420 125 435 140 425 160 C 412 172 392 155 402 135 Z" />
        {/* Leaf 3 */}
        <path d="M 422 180 C 442 175 450 195 438 215 C 425 228 408 205 422 180 Z" />
        {/* Leaf 4 (Middle right) */}
        <path d="M 432 235 C 452 235 455 255 440 270 C 425 280 410 260 432 235 Z" />
        {/* Leaf 5 */}
        <path d="M 424 295 C 440 300 438 322 422 335 C 405 342 395 320 424 295 Z" />
        {/* Leaf 6 */}
        <path d="M 402 345 C 415 355 408 378 388 385 C 372 388 368 365 402 345 Z" />
      </g>

      {/* Top Burmese Inscription */}
      <text
        fill="#1a1d63"
        fontWeight="800"
        fontSize="24"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        <textPath
          href="#top-burmese-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          မဟာဗောဓိ  ဓမ္မရိပ်သာ  ဗုဒ္ဓဂယာ
        </textPath>
      </text>

      {/* Left & Right Red Accent Dots */}
      <circle cx="128" cy="256" r="6" fill="#ba0000" />
      <circle cx="372" cy="256" r="6" fill="#ba0000" />

      {/* Center Lotus Flower Base & Multi-Colored Petals */}
      <g transform="translate(250, 245)">
        {/* Petal 1: Yellow (Top-Left / Top) */}
        <path
          d="M 0 -20 C -45 -65 -45 -110 0 -115 C 10 -115 15 -110 0 -20 Z"
          fill="#FED500"
        />
        {/* Petal 2: Orange (Top-Right) */}
        <path
          d="M 0 -20 C 15 -110 55 -105 55 -65 C 55 -35 30 -20 0 -20 Z"
          fill="#FF7700"
        />
        {/* Petal 3: Bright Red (Right) */}
        <path
          d="M 0 -20 C 30 -20 85 -45 85 -5 C 85 35 45 40 0 -20 Z"
          fill="#D60000"
        />
        {/* Petal 4: Crimson Red (Bottom-Right) */}
        <path
          d="M 0 -20 C 45 40 50 85 0 85 C -25 85 -35 50 0 -20 Z"
          fill="#B71C1C"
        />
        {/* Petal 5: Deep Maroon (Bottom-Left) */}
        <path
          d="M 0 -20 C -35 50 -85 45 -85 0 C -85 -25 -40 -35 0 -20 Z"
          fill="#660000"
        />
        {/* Petal 6: Forest Green (Left) */}
        <path
          d="M 0 -20 C -40 -35 -85 -60 -55 -90 C -35 -105 -10 -70 0 -20 Z"
          fill="#00873D"
        />

        {/* Outer petal scalloped edge definition */}
        <path
          d="M 0 -115 C 20 -115 45 -100 55 -65 C 65 -40 85 -25 85 -5 C 85 25 65 55 40 75 C 20 85 0 85 -20 85 C -55 80 -85 50 -85 0 C -85 -40 -70 -75 -50 -95 C -30 -110 -10 -115 0 -115 Z"
          fill="none"
          stroke="#3b0000"
          strokeWidth="1.2"
          opacity="0.3"
        />

        {/* Central Buddha Meditator Silhouette */}
        <g fill="#0a0a0a">
          {/* Ushnisha / Top flame */}
          <path d="M 0 -76 C -2 -72 -1 -68 0 -66 C 1 -68 2 -72 0 -76 Z" />
          {/* Head & halo */}
          <circle cx="0" cy="-56" r="10.5" />
          {/* Neck & Shoulders */}
          <path d="M -5 -46 C -18 -42 -22 -35 -24 -20 C -25 -10 -22 5 -20 12 C -18 18 -15 22 -5 23 L 5 23 C 15 22 18 18 20 12 C 22 5 25 -10 24 -20 C 22 -35 18 -42 5 -46 Z" />
          {/* Folded Hands in Dhyana Mudra in Lap */}
          <ellipse cx="0" cy="15" rx="14" ry="6" />
          {/* Crossed Legs (Lotus Pose) */}
          <path d="M -34 22 C -32 12 -20 18 0 19 C 20 18 32 12 34 22 C 32 30 18 32 0 32 C -18 32 -32 30 -34 22 Z" />
          {/* Robe fold line hint */}
          <path d="M -12 -42 Q 2 -15 8 15" stroke="#222" strokeWidth="1" fill="none" />
        </g>
      </g>

      {/* Inner Circular Arc: MAHABODHI MEDITATION CENTRE */}
      <text
        fill="#8a0c0c"
        fontWeight="900"
        fontSize="17.5"
        fontFamily="sans-serif"
        letterSpacing="2.8"
      >
        <textPath
          href="#bottom-centre-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          MAHABODHI MEDITATION CENTRE
        </textPath>
      </text>

      {/* Bottom Red Banner / Ribbon */}
      <g filter="url(#ribbon-shadow)">
        {/* Left ribbon tail */}
        <path
          d="M 68 400 L 140 375 L 140 435 L 75 450 L 95 425 Z"
          fill="#780808"
        />
        {/* Left ribbon fold shadow */}
        <path
          d="M 135 375 L 160 395 L 140 435 Z"
          fill="#4a0404"
        />
        {/* Left ribbon text: Sīla */}
        <text
          x="105"
          y="420"
          fill="#FFFFFF"
          fontFamily="serif"
          fontWeight="bold"
          fontSize="17"
          transform="rotate(18, 105, 420)"
          textAnchor="middle"
        >
          Sīla
        </text>

        {/* Right ribbon tail */}
        <path
          d="M 432 400 L 360 375 L 360 435 L 425 450 L 405 425 Z"
          fill="#780808"
        />
        {/* Right ribbon fold shadow */}
        <path
          d="M 365 375 L 340 395 L 360 435 Z"
          fill="#4a0404"
        />
        {/* Right ribbon text: Paññā */}
        <text
          x="395"
          y="420"
          fill="#FFFFFF"
          fontFamily="serif"
          fontWeight="bold"
          fontSize="17"
          transform="rotate(-18, 395, 420)"
          textAnchor="middle"
        >
          Paññā
        </text>

        {/* Central main curved ribbon banner */}
        <path
          d="M 135 385 Q 250 415 365 385 L 365 440 Q 250 472 135 440 Z"
          fill="#8A0C0C"
          stroke="#690000"
          strokeWidth="1"
        />

        {/* Center ribbon text: Samādhi */}
        <text
          fill="#FFFFFF"
          fontFamily="serif"
          fontWeight="bold"
          fontSize="24"
          letterSpacing="1.5"
        >
          <textPath
            href="#ribbon-center-arc"
            startOffset="50%"
            textAnchor="middle"
          >
            Samādhi
          </textPath>
        </text>
      </g>
    </svg>
  );
};
