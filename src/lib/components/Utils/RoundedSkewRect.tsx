import React from "react";

interface RoundedSkewRectProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  skewX?: number;
  fill?: string;
  mirror?: boolean; // 新增：是否沿垂直中线翻转
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 这是一个通用的圆角平行四边形组件，常用于星穹铁道风格的 UI。
 * 支持通过 mirror 属性进行完美的原位水平翻转。
 */
const RoundedSkewRect: React.FC<RoundedSkewRectProps> = ({
  x = 0,
  y = 0,
  width = 100,
  height = 40,
  rx = 10,
  skewX = -15,
  fill = "white",
  mirror = false, // 默认不翻转
  className,
  style,
}) => {
  // 1. 基础倾斜变换
  let transformStr = `skewX(${skewX})`;

  // 2. 如果开启了翻转
  if (mirror) {
    // 将倾斜角度转换为弧度
    const angleInRads = (skewX * Math.PI) / 180;
    
    // 计算图形倾斜后的绝对视觉中心点 X 坐标
    // 公式：基础中心 X + (中心高度 Y * 倾斜带来的横向位移)
    const skewedCenterX = x + width / 2 + (y + height / 2) * Math.tan(angleInRads);

    // SVG transform 的执行顺序是自右向左的！
    // 逻辑：先倾斜 -> 将中心点移到坐标原点 0 -> 水平翻转 -> 再移回中心点
    transformStr = `translate(${skewedCenterX}, 0) scale(-1, 1) translate(${-skewedCenterX}, 0) ${transformStr}`;
  }

  return (
    <g transform={transformStr} className={className} style={style}>
      <rect x={x} y={y} width={width} height={height} rx={rx} fill={fill} />
    </g>
  );
};

export default RoundedSkewRect;