import React, { useState } from "react";
import styles from "./Header.module.css";
import RoundedSkewRect from "../Utils/RoundedSkewRect";
import ZigzagBracket from "../Utils/ZigzagBracket";

function Header() {
  const [isRight, setIsRight] = useState(false);
  const THEME_BLUE = "#8ca6ff";

  const toggleHandler = () => {
    setIsRight(!isRight);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.diceCombatIcon}></div>
        <span className={styles.subTitle}>上骰了！战力党！</span>
        <span className={styles.mainTitle}>银河收集册</span>
      </div>
      <div className={styles.headerBottom}>
        <svg
          className={styles.splitLine}
          xmlns="http://www.w3.org/2000/svg"
        >
          <ZigzagBracket x="0" y="0" width="0.6rem" height="0.9rem" fill="currentColor" />
          <rect
            x="calc(0.6rem + 8px)"
            y="calc(50% - 1px)"
            width="calc(100% - 1.2rem - 16px)"
            height="2"
            fill="currentColor"
          />
          <ZigzagBracket 
            x="calc(100% - 0.6rem)" 
            y="0" 
            width="0.6rem" 
            height="0.9rem" 
            mirror 
            fill="currentColor"
          />
        </svg>

        <div 
          className={`${styles.deckToggle} ${isRight ? styles.isRight : ""}`} 
          onClick={toggleHandler}
        >
          <svg viewBox="0 0 600 60">
            <g transform="translate(32, 0)">
              <RoundedSkewRect
                x={4}
                y={12}
                width={552}
                height={44}
                rx={12}
                fill="#4574f7"
              />
              <RoundedSkewRect
                x={0}
                y={8}
                width={552}
                height={44}
                rx={12}
                fill="#2d2f39"
              />
              <g className={styles.slider}>
                <RoundedSkewRect
                  x={0}
                  y={8}
                  width={276}
                  height={44}
                  rx={10}
                  fill="#ffffff"
                />
              </g>
            </g>

            <g transform="translate(0, 30)">
              <g className="icon-left">
                <ZigzagBracket 
                  x="64" 
                  y="-9" 
                  size="12"
                  fill={THEME_BLUE}
                />
                <ZigzagBracket 
                  x="254" 
                  y="-9" 
                  size="12"
                  mirror 
                  fill={THEME_BLUE}
                />
              </g>

              <text
                className={styles.textLeft}
                x="162"
                y="0"
                dominantBaseline="central"
                textAnchor="middle"
                style={{ fontSize: "18px" }}
              >
                卡牌图鉴
              </text>

              <g className="icon-right">
                <ZigzagBracket 
                  x="340" 
                  y="-9" 
                  size="12"
                  fill={THEME_BLUE}
                />
                <ZigzagBracket 
                  x="530" 
                  y="-9" 
                  size="12"
                  mirror 
                  fill={THEME_BLUE}
                />
              </g>

              <text
                className={styles.textRight}
                x="438"
                y="0"
                dominantBaseline="central"
                textAnchor="middle"
                style={{ fontSize: "18px" }}
              >
                曜彩骰图鉴
              </text>
            </g>
          </svg>
        </div>

        <svg
          className={styles.splitLine}
          xmlns="http://www.w3.org/2000/svg"
        >
          <ZigzagBracket x="0" y="0" width="0.6rem" height="0.9rem" fill="currentColor" />
          <rect
            x="calc(0.6rem + 8px)"
            y="calc(50% - 1px)"
            width="calc(100% - 1.2rem - 16px)"
            height="2"
            fill="currentColor"
          />
          <ZigzagBracket 
            x="calc(100% - 0.6rem)" 
            y="0" 
            width="0.6rem" 
            height="0.9rem" 
            mirror 
            fill="currentColor"
          />
        </svg>
      </div>
    </header>
  );
}

export default Header;
