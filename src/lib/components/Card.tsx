import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import { clamp, round, adjust } from "../helpers/Math";
import { useActiveCard } from "../stores/useActiveCard";
import { useOrientation } from "../stores/useOrientation";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
function useImagesLoaded(urls: string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    const promises = urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // 失败也算“完成”
        }),
    );

    Promise.all(promises).then(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [urls]);

  return loaded;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CardProps {
  id?: string;
  name?: string;
  number?: string;
  set?: string;
  types?: string | string[];
  subtypes?: string | string[];
  supertype?: string;
  rarity?: string;
  img?: string;
  back?: string;
  foil?: string;
  mask?: string;
  showcase?: boolean;
}

// ---------------------------------------------------------------------------
// Spring configs – tuned to approximate the Svelte spring feel
// ---------------------------------------------------------------------------
// useSpring config（不含 type 字段，供 useSpring() 使用）
// ζ = damping / (2 * sqrt(stiffness)) = 25/(2*20) ≈ 0.625，轻微欠阻尼，手感灵动但无突变
const USE_SPRING_INTERACT = { stiffness: 400, damping: 25 } as const;
const SPRING_INTERACT = {
  type: "spring",
  stiffness: 400,
  damping: 25,
} as const;
const SPRING_POPOVER = { type: "spring", stiffness: 200, damping: 30 } as const;
const SPRING_SNAP = { type: "spring", stiffness: 30, damping: 8 } as const;

// ---------------------------------------------------------------------------
// Helper – fire an animation and return the controls
// ---------------------------------------------------------------------------
function springTo(
  mv: MotionValue<number>,
  target: number,
  cfg: typeof SPRING_INTERACT | typeof SPRING_POPOVER | typeof SPRING_SNAP,
): AnimationPlaybackControls {
  return animate(mv, target, cfg);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Card: React.FC<CardProps> = ({
  id = "",
  name = "",
  number = "",
  set = "",
  types = "",
  subtypes = "basic",
  supertype = "pokémon",
  rarity = "hsr holo",
  img = "",
  back = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg",
  foil = "",
  mask = "",
  showcase = false,
}) => {
  const thisCard = useRef<HTMLDivElement>(null);
  const { activeCard, setActiveCard } = useActiveCard();
  const { orientation, resetBaseOrientation } = useOrientation();

  // 多张前景图片需要加载
  const [loading, setLoading] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [firstPop, setFirstPop] = useState(true);
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined"
      ? document.visibilityState === "visible"
      : true,
  );

  // ── statics ──────────────────────────────────────────────────────────────
  const randomSeed = useMemo(
    () => ({ x: Math.random(), y: Math.random() }),
    [],
  );
  const cosmosPosition = useMemo(
    () => ({
      x: Math.floor(randomSeed.x * 734),
      y: Math.floor(randomSeed.y * 1280),
    }),
    [randomSeed],
  );

  const imgBase = img.startsWith("http") ? "" : "https://images.pokemontcg.io/";
  const frontImg = imgBase + img;
  // 前景图片相关
  const bgImg =
    "https://cdn2.dicloud.work/static/apps/hkstarrail/dicecombat/ui3davatarcard/DiceCombatAvatarCardFigure_1310_Bg.png";
  const boardImg =
    "https://cdn2.dicloud.work/static/apps/hkstarrail/dicecombat/avatarcard/frame/DiceCombatCardItemBig_Color_Dice3.png";
  const effGradientImg = "public/img/Eff_Gradient_Dcie.png";
  // const effNoiseImg = "public/img/Eff_Nosie_Dice_Color.png";
  const effNoiseImg = "public/img/Eff_Noise_Dice.png";
  const charImg =
    "https://cdn2.dicloud.work/static/apps/hkstarrail/dicecombat/ui3davatarcard/DiceCombatAvatarCardFigure_1310.png";
  const charMaskImg =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/CardFigureMask.png";
  const textDarkImg =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/CardDarkBg.png";
  const hpImg =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/CardHp.png";
  const atkImg =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/CardAttack.png";
  const defImg =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/CardDef.png";
  const dice1Img =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/dice1.png";
  const dice2Img =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/dice2.png";
  const dice4Img =
    "https://mihoyo-tools.dicloud.work/img/hsr/ui/dicecombat/dice4.png";
  const artImg = "public/img/Eff_Aura_05.png";

  const boardMaskImg = "/img/DiceCombatCardItemBig_ColorMask_Dice3.png";
  // 只要把需要等待的 URL 全部列出来即可
  const frontUrls = useMemo(
    () =>
      [
        bgImg,
        boardImg,
        charImg,
        charMaskImg,
        textDarkImg,
        frontImg,
        hpImg,
        atkImg,
        defImg,
        dice1Img,
        dice2Img,
        dice4Img,
      ].filter(Boolean),
    [
      bgImg,
      boardImg,
      charImg,
      charMaskImg,
      textDarkImg,
      frontImg,
      hpImg,
      atkImg,
      defImg,
      dice1Img,
      dice2Img,
      dice4Img,
    ],
  );

  const allFrontLoaded = useImagesLoaded(frontUrls);

  useEffect(() => {
    if (allFrontLoaded) setLoading(false);
  }, [allFrontLoaded]);

  // ── processed data ────────────────────────────────────────────────────────
  const processedRarity = rarity.toLowerCase();
  const processedSupertype = supertype.toLowerCase();
  const processedNumber = number.toLowerCase();
  const processedTypes = Array.isArray(types)
    ? types.join(" ").toLowerCase()
    : types.toLowerCase();
  const processedSubtypes = Array.isArray(subtypes)
    ? subtypes.join(" ").toLowerCase()
    : subtypes.toLowerCase();
  const isTrainerGallery =
    !!processedNumber.match(/^[tg]g/i) ||
    id === "swshp-SWSH076" ||
    id === "swshp-SWSH077";

  // ── motion values ─────────────────────────────────────────────────────────
  // Raw targets：interact 时直接 .set()，无 animate() 打断开销
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateDX = useMotionValue(0); // delta from popover spin
  const rotateDY = useMotionValue(0);
  const glareXRaw = useMotionValue(50);
  const glareYRaw = useMotionValue(50);
  const glareORaw = useMotionValue(0);
  const bgXRaw = useMotionValue(50);
  const bgYRaw = useMotionValue(50);

  // Spring 平滑输出：downstream 的 transform / CSS 变量全部消费这一层
  // useSpring 持续跟踪 Raw 值，不会因 animate() 被打断而产生速度突变
  const rotateX = useSpring(rotateXRaw, USE_SPRING_INTERACT);
  const rotateY = useSpring(rotateYRaw, USE_SPRING_INTERACT);
  const glareX = useSpring(glareXRaw, USE_SPRING_INTERACT);
  const glareY = useSpring(glareYRaw, USE_SPRING_INTERACT);
  const glareO = useSpring(glareORaw, USE_SPRING_INTERACT);
  const bgX = useSpring(bgXRaw, USE_SPRING_INTERACT);
  const bgY = useSpring(bgYRaw, USE_SPRING_INTERACT);

  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);
  const scale = useMotionValue(1);

  // ── CSS variable transforms ───────────────────────────────────────────────
  // --rotate-x = clamp(rotateX) + rotateDX  (matches Svelte: springRotate.x + springRotateDelta.x)
  // --rotate-y = clamp(rotateY) + rotateDY  (matches Svelte: springRotate.y + springRotateDelta.y)
  // The clamp is only applied to the interaction component to prevent showing the card back;
  // rotateDX is intentionally unclamped so the first-click 360° spin can play through.
  const cssRotateX = useTransform(
    [rotateX, rotateDX],
    ([rx, rdx]) => `${clamp(rx as number, -35, 35) + (rdx as number)}deg`,
  );
  const cssRotateY = useTransform(
    [rotateY, rotateDY],
    ([ry, rdy]) => `${clamp(ry as number, -35, 35) + (rdy as number)}deg`,
  );
  const cssPointerX = useTransform(glareX, (v) => `${v}%`);
  const cssPointerY = useTransform(glareY, (v) => `${v}%`);
  const cssPointerFromCenter = useTransform([glareX, glareY], ([gx, gy]) =>
    clamp(
      Math.sqrt(((gy as number) - 50) ** 2 + ((gx as number) - 50) ** 2) / 50,
      0,
      1,
    ),
  );
  const cssPointerFromTop = useTransform(glareY, (v) => v / 100);
  const cssPointerFromLeft = useTransform(glareX, (v) => v / 100);

  // ── Parallax MotionValues（直接驱动 transform，不经 CSS calc，更丝滑）
  const parallaxBgX = useTransform(glareX, (v) => (v / 100 - 0.5) * -14);
  const parallaxBgY = useTransform(glareY, (v) => (v / 100 - 0.5) * -14);
  const parallaxCharX = useTransform(glareX, (v) => (v / 100 - 0.5) * 22);
  const parallaxCharY = useTransform(glareY, (v) => (v / 100 - 0.5) * 22);
  // 定义一个独立的视差偏移（比人物稍微快一点点）
  const parallaxArtX = useTransform(glareX, (v) => (v / 100 - 0.5) * 28);
  const parallaxArtY = useTransform(glareY, (v) => (v / 100 - 0.5) * 28);
  const cssBgX = useTransform(bgX, (v) => `${v}%`);
  const cssBgY = useTransform(bgY, (v) => `${v}%`);
  const cssTranslateX = useTransform(translateX, (v) => `${v}px`);
  const cssTranslateY = useTransform(translateY, (v) => `${v}px`);

  // ── helpers ───────────────────────────────────────────────────────────────
  const updateSprings = useCallback(
    (
      bg: { x: number; y: number },
      rotate: { x: number; y: number },
      glare: { x: number; y: number; o: number },
    ) => {
      // 直接 .set() Raw 值，useSpring 在下一帧平滑跟踪，无动画打断
      bgXRaw.set(bg.x);
      bgYRaw.set(bg.y);
      rotateXRaw.set(rotate.x);
      rotateYRaw.set(rotate.y);
      glareXRaw.set(glare.x);
      glareYRaw.set(glare.y);
      glareORaw.set(glare.o);
    },
    [bgXRaw, bgYRaw, rotateXRaw, rotateYRaw, glareXRaw, glareYRaw, glareORaw],
  );

  const snapBack = useCallback(
    (delay = 500) => {
      if (snapTimer.current !== null) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => {
        snapTimer.current = null;
        setInteracting(false);
        // 用 SPRING_SNAP 缓慢将 Raw 目标归零，useSpring 层会平滑跟随
        animate(rotateXRaw, 0, SPRING_SNAP);
        animate(rotateYRaw, 0, SPRING_SNAP);
        animate(glareXRaw, 50, SPRING_SNAP);
        animate(glareYRaw, 50, SPRING_SNAP);
        animate(glareORaw, 0, SPRING_SNAP);
        animate(bgXRaw, 50, SPRING_SNAP);
        animate(bgYRaw, 50, SPRING_SNAP);
      }, delay);
    },
    [rotateXRaw, rotateYRaw, glareXRaw, glareYRaw, glareORaw, bgXRaw, bgYRaw],
  );

  // ── setCenter ─────────────────────────────────────────────────────────────
  const setCenter = useCallback(() => {
    if (!thisCard.current) return;
    const rect = thisCard.current.getBoundingClientRect();
    const view = document.documentElement;
    springTo(
      translateX,
      round(view.clientWidth / 2 - rect.x - rect.width / 2),
      SPRING_POPOVER,
    );
    springTo(
      translateY,
      round(view.clientHeight / 2 - rect.y - rect.height / 2),
      SPRING_POPOVER,
    );
  }, [translateX, translateY]);

  // ── pointer interaction ───────────────────────────────────────────────────
  const rafId = useRef<number | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdate = useRef<null | {
    bg: { x: number; y: number };
    rot: { x: number; y: number };
    glare: { x: number; y: number; o: number };
  }>(null);
  const showcaseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const showcaseEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  ); // 展示结束句柄
  const showcaseStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  ); // 延迟展示开始句柄
  const showcaseRunning = useRef(showcase);

  // 结束展示动画，同时取消启动 timer
  const endShowcase = useCallback(() => {
    if (showcaseStartTimerRef.current !== null) {
      clearTimeout(showcaseStartTimerRef.current);
      showcaseStartTimerRef.current = null;
    }
    if (showcaseRunning.current) {
      if (showcaseIntervalRef.current !== null)
        clearInterval(showcaseIntervalRef.current);
      if (showcaseEndTimerRef.current !== null)
        clearTimeout(showcaseEndTimerRef.current);
      showcaseRunning.current = false;
      showcaseIntervalRef.current = null;
      showcaseEndTimerRef.current = null;
    }
  }, []);

  const interact = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      endShowcase();
      if (!isVisible) {
        setInteracting(false);
        return;
      }
      if (activeCard && activeCard !== thisCard.current) {
        setInteracting(false);
        return;
      }

      // cancel any pending snap-back so it doesn't fire while still interacting
      if (snapTimer.current !== null) {
        clearTimeout(snapTimer.current);
        snapTimer.current = null;
      }

      setInteracting(true);

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (!rect) return;

      const px = clamp(round((100 / rect.width) * (clientX - rect.left)));
      const py = clamp(round((100 / rect.height) * (clientY - rect.top)));
      const cx = px - 50;
      const cy = py - 50;

      pendingUpdate.current = {
        bg: { x: adjust(px, 0, 100, 37, 63), y: adjust(py, 0, 100, 33, 67) },
        rot: { x: round(-(cx / 3.5)), y: round(cy / 3.5) },
        glare: { x: round(px), y: round(py), o: 1 },
      };

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (pendingUpdate.current) {
            const u = pendingUpdate.current;
            updateSprings(u.bg, u.rot, u.glare);
            pendingUpdate.current = null;
          }
          rafId.current = null;
        });
      }
    },
    [isVisible, activeCard, updateSprings, endShowcase],
  );

  const interactEnd = useCallback(
    (delay = 500) => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      pendingUpdate.current = null;
      snapBack(delay);
    },
    [snapBack],
  );

  // ── activate / deactivate ─────────────────────────────────────────────────
  const activate = useCallback(() => {
    if (activeCard === thisCard.current) {
      setActiveCard(null);
    } else {
      setActiveCard(thisCard.current);
      resetBaseOrientation();
    }
  }, [activeCard, setActiveCard, resetBaseOrientation]);

  // ── popover / retreat ─────────────────────────────────────────────────────
  const popover = useCallback(() => {
    if (!thisCard.current) return;
    const rect = thisCard.current.getBoundingClientRect();
    const scaleW = (window.innerWidth / rect.width) * 0.9;
    const scaleH = (window.innerHeight / rect.height) * 0.9;
    setCenter();
    if (firstPop) {
      springTo(rotateDX, 360, SPRING_POPOVER);
      interactEnd(1000);
    } else {
      interactEnd(100);
    }
    setFirstPop(false);
    springTo(scale, Math.min(scaleW, scaleH, 1.75), SPRING_POPOVER);
  }, [firstPop, setCenter, interactEnd, rotateDX, scale]);

  const retreat = useCallback(() => {
    springTo(scale, 1, SPRING_POPOVER);
    springTo(translateX, 0, SPRING_POPOVER);
    springTo(translateY, 0, SPRING_POPOVER);
    springTo(rotateDX, 0, SPRING_POPOVER);
    springTo(rotateDY, 0, SPRING_POPOVER);
    interactEnd(100);
  }, [scale, translateX, translateY, rotateDX, rotateDY, interactEnd]);

  // ── react to active state ─────────────────────────────────────────────────
  // NOTE: must check activeCard !== null to avoid null === null being true on
  // initial render before the ref is attached, which would cause every card
  // to think it is active and trigger popover() / the spin animation.
  const isActive = activeCard !== null && activeCard === thisCard.current;

  useEffect(() => {
    if (isActive) {
      popover();
    } else {
      retreat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // ── device orientation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const { relative } = orientation;
    const limit = { x: 16, y: 18 };
    const dx = clamp(relative.gamma, -limit.x, limit.x);
    const dy = clamp(relative.beta, -limit.y, limit.y);

    setInteracting(true);
    updateSprings(
      {
        x: adjust(dx, -limit.x, limit.x, 37, 63),
        y: adjust(dy, -limit.y, limit.y, 33, 67),
      },
      { x: round(dx * -1), y: round(dy) },
      {
        x: adjust(dx, -limit.x, limit.x, 0, 100),
        y: adjust(dy, -limit.y, limit.y, 0, 100),
        o: 1,
      },
    );
  }, [orientation, isActive, updateSprings]);

  // ── visibility change ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      const visible = document.visibilityState === "visible";
      setIsVisible(visible);
      if (!visible) {
        const instant = { duration: 0 };
        setInteracting(false);
        animate(scale, 1, instant);
        animate(translateX, 0, instant);
        animate(translateY, 0, instant);
        animate(rotateDX, 0, instant);
        animate(rotateX, 0, instant);
        animate(rotateY, 0, instant);
        animate(glareO, 0, instant);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [scale, translateX, translateY, rotateDX, rotateX, rotateY, glareO]);

  // ── scroll reposition ─────────────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (activeCard === thisCard.current) setCenter();
      }, 300);
    };
    window.addEventListener("scroll", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      clearTimeout(timer);
    };
  }, [activeCard, setCenter]);

  // ── showcase animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!showcase || document.visibilityState !== "visible") return;
    showcaseStartTimerRef.current = setTimeout(() => {
      showcaseStartTimerRef.current = null;
      // re-check visibility after the 2s delay, same as original Svelte
      if (document.visibilityState !== "visible") {
        setInteracting(false);
        return;
      }
      setInteracting(true);
      let r = 0;
      const instant = { duration: 0 };
      showcaseIntervalRef.current = setInterval(() => {
        r += 0.05;
        animate(rotateX, Math.cos(r) * 25, instant); // 使用 animate() 而不是直接 setState() 避免重复渲染优化性能
        animate(rotateY, Math.sin(r) * 25, instant);
        animate(glareX, 55 + Math.sin(r) * 55, instant);
        animate(glareY, 55 + Math.cos(r) * 55, instant);
        animate(glareO, 0.8, instant);
        animate(bgX, 20 + Math.sin(r) * 20, instant);
        animate(bgY, 20 + Math.cos(r) * 20, instant);
      }, 20);
      showcaseEndTimerRef.current = setTimeout(() => {
        if (showcaseIntervalRef.current !== null)
          clearInterval(showcaseIntervalRef.current);
        showcaseIntervalRef.current = null;
        showcaseEndTimerRef.current = null;
        showcaseRunning.current = false;
        interactEnd(0);
      }, 4000); // 自动展示 4s 结束
      return () => {
        if (showcaseIntervalRef.current !== null)
          clearInterval(showcaseIntervalRef.current);
        if (showcaseEndTimerRef.current !== null)
          clearTimeout(showcaseEndTimerRef.current);
      };
    }, 2000);
    return () => {
      if (showcaseStartTimerRef.current !== null)
        clearTimeout(showcaseStartTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── foil/mask styles ──────────────────────────────────────────────────────
  const foilStyles: Record<string, string> = {};
  if (!loading) {
    if (boardMaskImg) {
      foilStyles["--board-mask"] = `url(${boardMaskImg})`;
    }
    if (charMaskImg) {
      foilStyles["--char-mask"] = `url(${charMaskImg})`;
    }
    if (mask) {
      foilStyles["--mask"] = `url(${mask})`;
    }
    if (foil) {
      foilStyles["--foil"] = `url(${foil})`;
    }
  }

  const staticStyles: React.CSSProperties = {
    ["--seedx" as string]: randomSeed.x,
    ["--seedy" as string]: randomSeed.y,
    ["--cosmosbg" as string]: `${cosmosPosition.x}px ${cosmosPosition.y}px`,
    ...(foilStyles as any),
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      ref={thisCard}
      className={[
        "card",
        processedTypes,
        "interactive",
        isActive ? "active" : "",
        interacting ? "interacting" : "",
        loading ? "loading" : "",
        mask ? "masked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-number={processedNumber}
      data-set={set}
      data-subtypes={processedSubtypes}
      data-supertype={processedSupertype}
      data-rarity={processedRarity}
      data-trainer-gallery={isTrainerGallery}
      style={
        {
          ...staticStyles,
          ["--pointer-x" as string]: cssPointerX,
          ["--pointer-y" as string]: cssPointerY,
          ["--pointer-from-center" as string]: cssPointerFromCenter,
          ["--pointer-from-top" as string]: cssPointerFromTop,
          ["--pointer-from-left" as string]: cssPointerFromLeft,
          ["--card-opacity" as string]: glareO,
          ["--rotate-x" as string]: cssRotateX,
          ["--rotate-y" as string]: cssRotateY,
          ["--background-x" as string]: cssBgX,
          ["--background-y" as string]: cssBgY,
          ["--card-scale" as string]: scale,
          ["--translate-x" as string]: cssTranslateX,
          ["--translate-y" as string]: cssTranslateY,
        } as React.CSSProperties
      }
    >
      <div className="card__translater">
        <button
          className="card__rotator"
          onClick={activate}
          onPointerMove={interact}
          onMouseLeave={() => interactEnd()}
          onBlur={() => {
            interactEnd();
            setActiveCard(null);
          }}
          aria-label={`Expand the Pokemon Card; ${name}.`}
          tabIndex={0}
        >
          {/* 背景图片 */}
          <img
            className="card__back"
            src={back}
            alt="The back of a Pokemon Card, a Pokeball in the center with Pokemon logo above and below"
            loading="lazy"
            width={519}
            height={750}
          />
          {/* 前景图片 */}
          <div className="card__front">
            {/* 背景 */}
            <motion.img
              className="card__bg-img"
              src={bgImg}
              alt={`Background of the ${name} Card`}
              loading="lazy"
              style={{ x: parallaxBgX, y: parallaxBgY }}
            />
            {/* 卡片边框 */}
            {/* <div className="card__board"></div> */}
            <img
              className="card__board"
              src={boardImg}
              alt="Color card border"
            />
            {/* 边框彩虹反光层 */}
            <div className="card__board-shine"></div>

            {/* 人物 + 文本阴影：外层容器持有 mask（与边框对齐），内层做视差偏移 */}
            <div className="card__character">
              <motion.div
                className="card__character-inner"
                style={{ x: parallaxCharX, y: parallaxCharY }}
              >
                <img
                  className="card__char-img"
                  src={charImg}
                  alt={`Character of the ${name} Card`}
                  loading="lazy"
                />
                {/* 文本描述阴影叠加在人物上方 */}
                <img
                  className="card__text-dark"
                  src={textDarkImg}
                  alt="Dark text shadow"
                />
              </motion.div>
            </div>
            {/* 装饰光晕层：必须是 card__character 的同级兄弟，才能对着背景+边框+角色做正确的 screen 混合 */}
            <motion.div
              className="card__art-canvas"
              style={{ x: parallaxArtX, y: parallaxArtY }}
            >
              <img src={artImg} className="art-piece art-piece--tl" alt="" />
              <img src={artImg} className="art-piece art-piece--tr" alt="" />
              <img src={artImg} className="art-piece art-piece--bl" alt="" />
              <img src={artImg} className="art-piece art-piece--br" alt="" />
            </motion.div>
            {/* 顶层文本描述及装饰 */}
            <div className="card__detail">
              <div className="card__skill-text">
                <span>攻击时：若选定的骰子包含2组2个相同点数，则本次攻击获得连击。如果自身满生命值，攻击值+5。</span>
                <div className="card__star-container">
                  <div className="card__star"></div>
                  <div className="card__star"></div>
                  <div className="card__star"></div>
                </div>
                <span>流萤</span>
              </div>
              <div className="card__char-hp">
                <img src={hpImg} alt="HP bar" />
                <span>28</span>
              </div>
              <div className="card__dice">
                <div>
                  <img src={dice4Img} alt="" />
                  <span>2</span>
                </div>
                <div>
                  <img src={dice2Img} alt="" />
                  <span>3</span>
                </div>
                <div>
                  <img src={dice1Img} alt="" />
                  <span>2</span>
                </div>
              </div>
              <div className="card__attack">
                <img src={atkImg} alt="Attack icon" />
                <span>4</span>
              </div>
              <div className="card__defend">
                <img src={defImg} alt="Defend icon" />
                <span>3</span>
              </div>
            </div>
            {/* <div className="card__shine" />
            <div className="card__glare" /> */}
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default Card;
