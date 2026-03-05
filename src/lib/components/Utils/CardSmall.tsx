import React from 'react';

interface CardSmallProps {
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 骰子战斗 - 小型卡牌不规则遮罩边框
 * * 包含两个核心功能：
 * 1. 渲染出一个带不规则镂空的实体边框
 * 2. 提供了一个 id 为 `card-inner-cutout` 的裁剪路径，用于裁剪卡牌内部画作
 */
const CardSmall: React.FC<CardSmallProps> = ({
  width = 200,
  height = 260,
  fill = "#f4f6fc", // 图像中极其淡的蓝灰色底板
  stroke = "#dbe0ea", // 淡淡的边缘描边
  className,
  style,
}) => {
  return (
    <svg 
      viewBox="0 0 200 260" 
      width={width} 
      height={height} 
      className={className}
      style={{ overflow: 'visible', ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 核心魔法 1：裁剪路径 (Clip Path) 
          如果你有卡牌角色图片，加上 clipPath="url(#card-inner-cutout)" 即可完美契合这个框的形状
        */}
        <clipPath id="card-inner-cutout">
          <path d="
            M 184 8 
            A 8 8 0 0 1 192 16 
            V 210 
            A 6 6 0 0 1 189 215 
            L 155 245 
            A 8 8 0 0 1 150 248 
            H 50 
            A 8 8 0 0 1 45 245 
            L 11 215 
            A 6 6 0 0 1 8 210 
            V 56 
            A 48 48 0 0 0 56 8 
            H 184 
            Z
          " />
        </clipPath>
      </defs>

      {/* 核心魔法 2：奇偶填充规则镂空边框
        前一半是顺时针的外围圆角矩形，后一半是逆时针的内部多边形。
        fillRule="evenodd" 会自动将内部图形掏空。
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        d="
          M 16 0
          H 184 A 16 16 0 0 1 200 16
          V 244 A 16 16 0 0 1 184 260
          H 16 A 16 16 0 0 1 0 244
          V 16 A 16 16 0 0 1 16 0
          Z
          M 184 8
          H 56
          A 48 48 0 0 1 8 56
          V 210
          A 6 6 0 0 0 11 215
          L 45 245
          A 8 8 0 0 0 50 248
          H 150
          A 8 8 0 0 0 155 245
          L 189 215
          A 6 6 0 0 0 192 210
          V 16
          A 8 8 0 0 0 184 8
          Z
        "
      />
    </svg>
  );
};

export default CardSmall;