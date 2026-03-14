import React, { useState } from "react";
import styles from "./LeftDrawer.module.css";
import StarLogo from "../Utils/StarLogo";
import RoundedSkewRect from "../Utils/RoundedSkewRect";
import RoundedTrapezoid from "../Utils/RoundedTrapezoid";
import CardSmall from "../Utils/CardSmall";

interface LeftDrawerProps {
  style?: React.CSSProperties;
}

// ---------------------------------------------------- header --------------------------------------------------- //

// 基础布局常量
const BASE_WIDTH = 400;
const BASE_HEIGHT = 130;
const LEFT_X = 100;
const TOP_Y = 0;
const SHADOW_OFFSET_X = 10;
const SHADOW_OFFSET_Y = 10;
const SKEW_ANGLE_DEG = 15;
const STAR_LOGO_SCALE = 0.9;

const COLORS = {
  ACTIVE: "white",
  INACTIVE: "#2a365f",
  SHADOW: "black",
};

// 计算工具：计算因倾斜产生的偏移量 (用于居中对齐 Logo)
const angleRad = SKEW_ANGLE_DEG * (Math.PI / 180);
const skewOffset = Math.tan(angleRad) * BASE_HEIGHT;

// --- 三星部分 (左侧) ---
const threeStarBaseX = LEFT_X;
const threeStarLogoCenterY = TOP_Y + (BASE_HEIGHT - STAR_LOGO_SCALE * 100) / 2;
const threeStarLogoCenterX = threeStarBaseX + (BASE_WIDTH - skewOffset) / 2 - STAR_LOGO_SCALE * 50;

// --- 二星部分 (中间) ---
const twoStarBaseX = LEFT_X + BASE_WIDTH + SHADOW_OFFSET_X;
const twoStarLogoCenterY = TOP_Y + (BASE_HEIGHT - STAR_LOGO_SCALE * 100) / 2;
const twoStarLogoX1 = twoStarBaseX + (BASE_WIDTH - skewOffset) / 2 - STAR_LOGO_SCALE * 100;

// --- 一星部分 (右侧) ---
const oneStarBaseX = twoStarBaseX + BASE_WIDTH + SHADOW_OFFSET_X;
const oneStarLogoCenterY = TOP_Y + (BASE_HEIGHT - STAR_LOGO_SCALE * 100) / 2;
const oneStarLogoX = oneStarBaseX + (BASE_WIDTH - skewOffset) / 2 - STAR_LOGO_SCALE * 50;

// 以实际图形边界定义 viewBox，确保视觉中心与容器中心一致
const VIEWBOX_MIN_X = LEFT_X - skewOffset;
const VIEWBOX_MAX_X = oneStarBaseX + BASE_WIDTH;
const VIEWBOX_WIDTH = VIEWBOX_MAX_X - VIEWBOX_MIN_X;
const VIEWBOX_HEIGHT = BASE_HEIGHT + SHADOW_OFFSET_Y;

const LeftDrawer: React.FC<LeftDrawerProps> = () => {
  const [selectedStar, setSelectedStar] = useState(3);

  return (
    <dialog className={styles.dialog}>
      <header className={styles.header}>
        <svg
          className={styles.headerSvg}
          viewBox={`${VIEWBOX_MIN_X} 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 背景阴影层 */}
          <RoundedSkewRect
            x={threeStarBaseX + SHADOW_OFFSET_X}
            y={TOP_Y + SHADOW_OFFSET_Y}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            rx={15}
            fill={COLORS.SHADOW}
          />
          <RoundedTrapezoid
            x={twoStarBaseX}
            y={TOP_Y + SHADOW_OFFSET_Y}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            rx={15}
            fill={COLORS.SHADOW}
          />
          <RoundedSkewRect
            x={oneStarBaseX - SHADOW_OFFSET_X}
            y={TOP_Y + SHADOW_OFFSET_Y}
            width={BASE_WIDTH}
            height={BASE_HEIGHT}
            rx={15}
            mirror={true}
            fill={COLORS.SHADOW}
          />

          {/* 三星交互层 */}
          <g onClick={() => setSelectedStar(3)} style={{ cursor: "pointer" }}>
            <RoundedSkewRect
              x={threeStarBaseX}
              y={TOP_Y}
              width={BASE_WIDTH}
              height={BASE_HEIGHT}
              rx={15}
              fill={selectedStar === 3 ? COLORS.ACTIVE : COLORS.INACTIVE}
            />
            <StarLogo x={threeStarLogoCenterX - 100 * STAR_LOGO_SCALE} y={threeStarLogoCenterY} scale={STAR_LOGO_SCALE} />
            <StarLogo x={threeStarLogoCenterX} y={threeStarLogoCenterY} scale={STAR_LOGO_SCALE} />
            <StarLogo x={threeStarLogoCenterX + 100 * STAR_LOGO_SCALE} y={threeStarLogoCenterY} scale={STAR_LOGO_SCALE} />
          </g>

          {/* 二星交互层 */}
          <g onClick={() => setSelectedStar(2)} style={{ cursor: "pointer" }}>
            <RoundedTrapezoid
              x={twoStarBaseX}
              y={TOP_Y}
              width={BASE_WIDTH}
              height={BASE_HEIGHT}
              rx={15}
              fill={selectedStar === 2 ? COLORS.ACTIVE : COLORS.INACTIVE}
            />
            <StarLogo x={twoStarLogoX1} y={twoStarLogoCenterY} scale={STAR_LOGO_SCALE} />
            <StarLogo x={twoStarLogoX1 + 100 * STAR_LOGO_SCALE} y={twoStarLogoCenterY} scale={STAR_LOGO_SCALE} />
          </g>

          {/* 一星交互层 */}
          <g onClick={() => setSelectedStar(1)} style={{ cursor: "pointer" }}>
            <RoundedSkewRect
              x={oneStarBaseX}
              y={TOP_Y}
              width={BASE_WIDTH}
              height={BASE_HEIGHT}
              rx={15}
              mirror={true}
              fill={selectedStar === 1 ? COLORS.ACTIVE : COLORS.INACTIVE}
            />
            <StarLogo 
              x={oneStarLogoX} 
              y={oneStarLogoCenterY} 
              scale={STAR_LOGO_SCALE} 
              inverted={selectedStar === 1}
            />
          </g>
        </svg>

        <div className={styles.headerDiv}>卡牌收集度 1/14</div>
      </header>

      <section className={styles.section}>
        <CardSmall fill="black" width="auto" height="auto" />
      </section>
    </dialog>
  );
};

export default LeftDrawer;
