import React from "react";
import RoundedSkewRect from "./RoundedSkewRect";

interface RoundedTrapezoidProps {
  x?: number;
  y?: number;
  width?: number; // 梯形底部的总宽度
  height?: number;
  rx?: number;
  skewX?: number; // 侧边的倾斜角度
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 这是一个圆角等腰梯形组件，通过组合两个对称的圆角平行四边形实现。
 * 常用于星穹铁道风格的 UI。
 */
const RoundedTrapezoid: React.FC<RoundedTrapezoidProps> = ({
  x = 0,
  y = 0,
  width = 200,
  height = 40,
  rx = 10,
  skewX = -15,
  fill = "white",
  className,
  style,
}) => {
  // 计算倾斜带来的偏移量
  const angleInRads = (Math.abs(skewX) * Math.PI) / 180;
  const offset = height * Math.tan(angleInRads);
  
  // 为了形成一个完美的等腰梯形，我们将两个平行四边形重叠。
  // 每个平行四边形的宽度至少要能覆盖一半的宽度加上偏移量。
  // 这里我们参考用户提供的数值比例，计算一个合适的子矩形宽度。
  // 用户数据中：总宽 288.4, 子矩形宽 168.4, 比例约 0.584
  const rectWidth = width / 2 + offset * 0.9; // 稍微重叠多一点以确保中间没有缝隙

  return (
    <g className={className} style={style}>
      {/* 左侧半部分 */}
      <RoundedSkewRect
        x={x}
        y={y}
        width={rectWidth}
        height={height}
        rx={rx}
        skewX={skewX}
        fill={fill}
      />
      {/* 右侧半部分（水平镜像） */}
      <RoundedSkewRect
        x={x + width - rectWidth}
        y={y}
        width={rectWidth}
        height={height}
        rx={rx}
        skewX={skewX}
        mirror={true}
        fill={fill}
      />
    </g>
  );
};

export default RoundedTrapezoid;
