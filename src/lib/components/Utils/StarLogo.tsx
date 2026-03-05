import React from "react";

interface StarLogoProps {
  x?: number;
  y?: number;
  scale?: number;
  inverted?: boolean; // 新增：是否反转颜色
  className?: string;
  style?: React.CSSProperties;
}

const StarLogo: React.FC<StarLogoProps> = ({ 
  x = 0, 
  y = 0, 
  scale = 1, 
  inverted = false,
  className,
  style 
}) => {
  const primaryColor = inverted ? "#bac0d3" : "#2d2f39";
  const secondaryColor = inverted ? "#2d2f39" : "#bac0d3";

  return (
    <g 
      transform={`translate(${x}, ${y}) scale(${scale})`} 
      className={className}
      style={style}
    >
      <circle cx="50" cy="50" r="50" fill={secondaryColor} />
      <circle cx="50" cy="50" r="42" fill={primaryColor} />
      <circle cx="50" cy="50" r="30" fill={secondaryColor} />
      <path
        d="
          M 50 20 
          Q 50 50 80 50 
          Q 50 50 50 80 
          Q 50 50 20 50 
          Q 50 50 50 20 
          Z
        "
        fill={primaryColor}
      />
    </g>
  );
};

export default StarLogo;
