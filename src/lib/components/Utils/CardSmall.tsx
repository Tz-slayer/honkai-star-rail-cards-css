import React from "react";
import { withBase } from "../../helpers/assets";
import styles from "./CardSmall.module.css";

interface CardSmallProps {
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
  className?: string;
  style?: React.CSSProperties;
  hp?: number | string;
  attack?: number | string;
  defense?: number | string;
}

const DEFAULT_AVATAR_SRC =
  "https://cdn2.dicloud.work/static/apps/hkstarrail/spriteoutput/avataricon/avatar/1310.png";

const CardSmall: React.FC<CardSmallProps> = ({
  width = 200,
  height = 260,
  fill = "#f4f6fc",
  stroke = "#dbe0ea",
  className,
  style,
  hp = 0,
  attack = 0,
  defense = 0,
}) => {
  const rootClassName = className
    ? `${styles.cardRoot} ${className}`
    : styles.cardRoot;

  const frameStyle = {
    backgroundImage: `url("${withBase("/img/DiceCombatCardItemSmallColorBg.png")}")`,
    WebkitMaskImage: `url("${withBase("/img/DiceCombatCardItemSmallComFrameMask.svg")}")`,
    maskImage: `url("${withBase("/img/DiceCombatCardItemSmallComFrameMask.svg")}")`,
  } as React.CSSProperties;

  const avatarBgStyle = {
    backgroundImage: `url("${withBase("/img/DiceCombatCardItemSmallColorBg.png")}")`,
  } as React.CSSProperties;

  const avatarMaskStyle = {
    WebkitMaskImage: `url("${withBase("/img/DiceCombatCardItemSmallComAvatarMask.svg")}")`,
    maskImage: `url("${withBase("/img/DiceCombatCardItemSmallComAvatarMask.svg")}")`,
  } as React.CSSProperties;

  return (
    <div className={styles.cardContainer} style={{ width, height, ...style }}>
      <div className={styles.cardBoard}>
        <div className={styles.hp}>
          {" "}
          <span className={styles.hpValue}>{hp}</span>
          <img
            src={withBase("/img/DiceCombatCardItemSmallHpIcon.svg")}
            alt=""
            className={styles.hpIcon}
          />
        </div>

        <img
          src={withBase("/img/DiceCombatCardItemSmallAttackIcon.svg")}
          alt=""
          className={styles.attackIcon}
        />
        <span className={styles.attackValue}>{attack}</span>

        <img
          src={withBase("/img/DiceCombatCardItemSmallDefIcon.svg")}
          alt=""
          className={styles.defenseIcon}
        />
        <span className={styles.defenseValue}>{defense}</span>
      </div>
      <img
        src="https://cdn2.dicloud.work/static/apps/hkstarrail/spriteoutput/avataricon/avatar/1310.png"
        alt=""
        className={styles.avatar}
      />
    </div>
  );
};

export default CardSmall;
