import React from "react";

interface ZigzagBracketProps extends React.SVGProps<SVGSVGElement> {
  /** 是否水平镜像翻转（改变开口方向） */
  mirror?: boolean;
  /** 
   * 快捷控制大小。
   * 如果传入数字，将作为宽度，高度会自动按 2:3 比例计算。
   * 如果不传，则回退到使用原生的 width 和 height 属性。
   */
  size?: number | string;
  /** 快捷控制颜色，等同于 fill */
  color?: string;
}

/**
 * 这是一个锯齿状的装饰支架组件，常见于星穹铁道 UI 的分割线末端。
 * 默认 viewBox 为 "0 0 2 3"。
 */
const ZigzagBracket: React.FC<ZigzagBracketProps> = ({
  mirror = false,
  size,
  color,
  fill,
  width,
  height,
  ...props
}) => {
  // 逻辑：如果提供了 size，则自动计算 2:3 的比例
  // size 作为基准宽度
  const finalWidth = size || width || "100%";
  const finalHeight = size 
    ? (typeof size === "number" ? (size * 3) / 2 : `calc(${size} * 1.5)`) 
    : (height || "100%");

  // 只有当明确传入 color 或 fill 时才设置该属性
  const finalFill = color || fill;

  return (
    <svg 
      viewBox="0 0 2 3" 
      fill={finalFill} 
      width={finalWidth} 
      height={finalHeight} 
      {...props}
    >
      <g>
        {mirror ? (
          // 右侧开口 (用于分割线末端)
          <>
            <rect x="1" y="0" width="1" height="1" />
            <rect x="0" y="1" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
          </>
        ) : (
          // 左侧开口 (用于分割线起始)
          <>
            <rect x="0" y="0" width="1" height="1" />
            <rect x="1" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
          </>
        )}
      </g>
    </svg>
  );
};

export default ZigzagBracket;
