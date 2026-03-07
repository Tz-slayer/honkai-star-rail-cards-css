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
import { withBase } from "../helpers/assets";
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
          img.onerror = () => resolve(); // 婵犮垺鍎肩划鍓ф喆閿旂晫鈻曢柣鏃囨閺嗩剟鏌嶉妷锔剧煀闁伙綆鍓熼獮瀣箛閵娿垹浜?
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
// Spring configs 闂?tuned to approximate the Svelte spring feel
// ---------------------------------------------------------------------------
// useSpring config闂佹寧绋戦悧鍛箔婢舵劕瑙?type 闁诲孩绋掗〃鍡涱敊瀹€鍕櫖閻忕偠鍋愭潻?useSpring() 婵炶揪缍€濞夋洟寮妶澶嬫櫖?
// 闁?= damping / (2 * sqrt(stiffness)) = 25/(2*20) 闂?0.625闂佹寧绋戦惌浣圭閵堝拋鍤楁い鏃傛櫕閹崇偤姊婚崘顓у殭闁告垵缍婇弫宥囦沪閹屾澒闂佽澹嗛崰鎾村閹烘绀夐柕濞垮€楃粙濠氭煛閸愵亜啸闁绘稑锕畷?
const USE_SPRING_INTERACT = { stiffness: 400, damping: 25 } as const;
const SPRING_INTERACT = {
  type: "spring",
  stiffness: 400,
  damping: 25,
} as const;
const SPRING_POPOVER = { type: "spring", stiffness: 200, damping: 30 } as const;
const SPRING_SNAP = { type: "spring", stiffness: 30, damping: 8 } as const;

// ---------------------------------------------------------------------------
// Helper 闂?fire an animation and return the controls
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
  supertype = "pok闁肩厧宕籵n",
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

  // 婵犮垼鍩栭懝鍓ф閸洖绀堢€广儱妫欓悵顖炴煕閵夈儱鈷斿褎鐗犲Λ渚€鍩€椤掑倹鍟哄ù锝囶焾椤綁寮?
  const [loading, setLoading] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [firstPop, setFirstPop] = useState(true);
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined"
      ? document.visibilityState === "visible"
      : true,
  );

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?statics 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜?
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
  // 闂佸憡鎸哥粔闈涒枍濞嗘挸鐐婇柛鎾楀喚鏆梺鐑╂櫇椤牓宕?
  const bgImg =
    "https://cdn2.dicloud.work/static/apps/hkstarrail/dicecombat/ui3davatarcard/DiceCombatAvatarCardFigure_1310_Bg.png";
  const boardImg =
    "https://cdn2.dicloud.work/static/apps/hkstarrail/dicecombat/avatarcard/frame/DiceCombatCardItemBig_Color_Dice3.png";
  const effGradientImg = withBase("/img/Eff_Gradient_Dcie.png");
  // const effNoiseImg = withBase("/img/Eff_Nosie_Dice_Color.png");
  const effNoiseImg = withBase("/img/Eff_Noise_Dice.png");
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
  const artImg = withBase("/img/Eff_Aura_05.png");

  const boardMaskImg = withBase("/img/DiceCombatCardItemBig_ColorMask_Dice3.png");
  // 闂佸憡鐟禍锝夈€呴敃鍌氱濠电姴娲︽禒姗€鎮烽弴姘冲厡闁烩剝鍨甸銉╁川椤栨稓鏆?URL 闂佺绻堥崝鎴﹀磿閹绢喖绀嗘俊銈傚亾闁搞値鍙冨鍫曞Ψ閵夈儳銈梺?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?processed data 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?motion values 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
  // Raw targets闂佹寧绋掗顣攖eract 闂佸搫鍟晶搴∶洪崸妤€绠?.set()闂佹寧绋戦張顒€螞?animate() 闂佺懓鐏氶幐濠氬蓟閸パ屽殨闁逞屽墴閺屻劑鍩€?
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateDX = useMotionValue(0); // delta from popover spin
  const rotateDY = useMotionValue(0);
  const glareXRaw = useMotionValue(50);
  const glareYRaw = useMotionValue(50);
  const glareORaw = useMotionValue(0);
  const bgXRaw = useMotionValue(50);
  const bgYRaw = useMotionValue(50);

  // Spring 濡ょ姷鍋犲▍鏇犲垝閿旇姤缍囬柟鎯у暱濮ｅ鏌ㄥ☉娆戞應ownstream 闂?transform / CSS 闂佸憡鐟﹂敃銏ゅ闯濞差亜绀傞柕濞炬櫅閸斻儲绻涢幋婵堝ⅲ闁搞劌鍊瑰璇测枎鎼达綆浼囬柣?
  // useSpring 闂佸綊鏅查懗鍫曟偨閼姐倖宕夐柣鏂款煼閸?Raw 闂佺锕﹂妴瀣濠靛洨鈻旂€广儱瀚粣妤呮煕?animate() 闁荤偞鍑归崑鍛櫠閿曞倸妫樻い鎾閸嬫挾浠︽總鍝ュ礈闂佹眹鍨婚崰鏍焵椤掑倸鏋庨悗鐟扮－缁絾鎷呯粙璺ㄧМ
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?CSS variable transforms 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?
  // --rotate-x = clamp(rotateX) + rotateDX  (matches Svelte: springRotate.x + springRotateDelta.x)
  // --rotate-y = clamp(rotateY) + rotateDY  (matches Svelte: springRotate.y + springRotateDelta.y)
  // The clamp is only applied to the interaction component to prevent showing the card back;
  // rotateDX is intentionally unclamped so the first-click 360闁?spin can play through.
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?Parallax MotionValues闂佹寧绋戦悧蹇撁洪崸妤€绠抽柕澶嗘杹閺€鎶芥煕?transform闂佹寧绋戞總鏃傜箔婢跺瞼纾?CSS calc闂佹寧绋戦張顒€煤閹稿海鈻旀繝闈涙川閹枫劑鏌?
  const parallaxBgX = useTransform(glareX, (v) => (v / 100 - 0.5) * -14);
  const parallaxBgY = useTransform(glareY, (v) => (v / 100 - 0.5) * -14);
  const parallaxCharX = useTransform(glareX, (v) => (v / 100 - 0.5) * 22);
  const parallaxCharY = useTransform(glareY, (v) => (v / 100 - 0.5) * 22);
  // 闁诲氦顫夐惌顔剧不閻斿摜鈻旈柍褜鍓氱粙澶愵敂閸℃浠剧紓浣规煥椤戝洤鈻撻幋鐘冲枂闁糕剝顨嗛埢鏇㈡煕鐎ｎ亞绠虫禍娑㈡煥濞戞澧涢柣锔诲枟缁傚秹鎼归悷鎵虫寘缂備礁顑呯粔瀛樼閺囷紕鐤€妞ゆ劧绱曢閬嶆煟閹邦剚璐￠柛瀣剁秮閺?
  const parallaxArtX = useTransform(glareX, (v) => (v / 100 - 0.5) * 28);
  const parallaxArtY = useTransform(glareY, (v) => (v / 100 - 0.5) * 28);
  const cssBgX = useTransform(bgX, (v) => `${v}%`);
  const cssBgY = useTransform(bgY, (v) => `${v}%`);
  const cssTranslateX = useTransform(translateX, (v) => `${v}px`);
  const cssTranslateY = useTransform(translateY, (v) => `${v}px`);

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?helpers 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?
  const updateSprings = useCallback(
    (
      bg: { x: number; y: number },
      rotate: { x: number; y: number },
      glare: { x: number; y: number; o: number },
    ) => {
      // 闂佺儵鏅涢悺銊ф暜?.set() Raw 闂佺锕﹂妴瀣濠曠eSpring 闂侀潻璐熼崝瀣箔閸涱喚鈻旈柍褜鍓涢弫顔款槻闂佽В鏅涢…銊╁箣閿濆浂鈧偓闂傚浜舵禍椋庢濠靛绫嶉柣妯诲絻琚熼梺姹囧灮缁垱鏅堕敃鍌氭?
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
        // 闂?SPRING_SNAP 缂傚倸鍊归幐濠氬矗閸愵亙鐒?Raw 闂佺儵鏅╅崰妤呮偉閿濆牄浜归柟鐑橆殕缁佲晠鏌ㄥ☉妯兼seSpring 闁诲繒鍋涢崐椋庢娴煎宓侀柧蹇ｅ亞閹枫劑鎮归搹鐟版灈婵?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?setCenter 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?pointer interaction 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸?
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
  ); // 闁诲繒鍋炲ú婊堝Φ濮樿京纾奸柟鎯х摠鐏忓棝鏌涘▎宥呭姕闁?
  const showcaseStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  ); // 閻庣偣鍊栭崕鑲╂崲濠婂懍娌柡鍥╁О娴犳稓鈧鍠掗崑鎾斥攽椤旂⒈鍎忕憸鎵仱瀵?
  const showcaseRunning = useRef(showcase);

  // 缂傚倷鐒﹂幐璇差焽椤愩倓娌柡鍥╁О娴犳盯鏌涢弬璇插闁轰線绠栭弫宥囦沪閼恒儱鈧亶鏌￠崘顓熺【鐟滄澘娲ら埥澶愬醇濠靛洤鍓婚梺?timer
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?activate / deactivate 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
  const activate = useCallback(() => {
    if (activeCard === thisCard.current) {
      setActiveCard(null);
    } else {
      setActiveCard(thisCard.current);
      resetBaseOrientation();
    }
  }, [activeCard, setActiveCard, resetBaseOrientation]);

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?popover / retreat 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?react to active state 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?device orientation 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?visibility change 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?scroll reposition 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?showcase animation 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕
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
        animate(rotateX, Math.cos(r) * 25, instant); // 婵炶揪缍€濞夋洟寮?animate() 闂佸吋婢樻總鏃傜箔婢舵劕鍙婃い鏍ㄧ矋缁绢垶鏌?setState() 闂備緡鍓欓悘婵嬪储閵堝鐓傜€广儱鎷嬪Σ缁樼箾閹惧啿绾ч柣鎾愁儐鐎电厧螣閸濆嫷鍤欓梺璇″劯閸℃骞?
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
      }, 4000); // 闂佺厧顨庢禍婊勬叏閳哄啩娌柡鍥╁О娴?4s 缂傚倷鐒﹂幐璇差焽?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?foil/mask styles 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜?
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

  // 闂佸啿鍘滈崑鎾绘煃閸忓浜?render 闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕闂佸啿鍘滈崑鎾绘煃閸忓浜鹃梺鍐插帨閸嬫捇鏌嶉崗澶婁壕
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
          {/* 闂佺厧鍟块張顒€鈻嶅▎鎾崇倞闁告挆鍐炬毈 */}
          <img
            className="card__back"
            src={back}
            alt="The back of a Pokemon Card, a Pokeball in the center with Pokemon logo above and below"
            loading="lazy"
            width={519}
            height={750}
          />
          {/* 闂佸憡鎸哥粔闈涒枍濞嗘挸鐐婇柛鎾楀喚鏆?*/}
          <div className="card__front">
            {/* 闂佺厧鍟块張顒€鈻?*/}
            <motion.img
              className="card__bg-img"
              src={bgImg}
              alt={`Background of the ${name} Card`}
              loading="lazy"
              style={{ x: parallaxBgX, y: parallaxBgY }}
            />
            {/* 闂佸憡顨愮槐鏇熸櫠閺嶃劍缍囬悷娆忓閺€?*/}
            {/* <div className="card__board"></div> */}
            <img
              className="card__board"
              src={boardImg}
              alt="Color card border"
            />
            {/* 闁哄鐗愰～澶愩€佺€ｎ厹浜归柍鍝勫椤忕娀鏌涘▎蹇曅㈤柛妯荤矌娴?*/}
            <div className="card__board-shine"></div>

            {/* 婵炲瓨绮忓▍锝嗘櫠?+ 闂佸搫鍊稿ú锕€锕㈡导瀛樷挀闁哄鍨甸〃娑㈡煥濞戞瑨澹樻い锕佸吹娴狅箓宕掑鐓庢櫍闂侀潻绲婚崝宥団偓鍨瀵?mask闂佹寧绋戦悧鍛箔鐏炵偓缍囬悷娆忓閺€閬嶆倵闂堟稓绉虹紓宥呯墦閺佸秵寰勫☉姘鳖槷闂佸憡鍔曢幊搴ㄦ儑娴兼潙纾绘慨妯诲墯濞兼帞鈧懓澹婇崰鏍ㄧ閸濄儳鐭?*/}
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
                {/* 闂佸搫鍊稿ú锕€锕㈡导鏉戠闊洦鑹鹃悧姘舵⒒閸愨晜缍戝┑鍌涚墵瀹曪綁鎮╅幓鎺濇奖闂侀潻璐熼崝瀣ф径鎰亱闁宠　鍋撶紒妤€鍊垮?*/}
                <img
                  className="card__text-dark"
                  src={textDarkImg}
                  alt="Dark text shadow"
                />
              </motion.div>
            </div>
            {/* 闁荤喍绀侀幊姗€濡舵导鏉戠濠㈣泛顑嗛鐐烘倶閻愭彃浜扮紒杈ㄥ缁犳盯宕ㄥǎ顑藉亾韫囨稑鍙?card__character 闂佹眹鍔岀€氼剟骞冮幘鍓佹／鐟滃秹宕㈤弬娆惧殨闁绘洖鍊荤粈澶愭煙闂堟稓啸闁稿繑顭囬埀顒勬涧濠€鍗烆焽閸愵喗鍤勯悘鐐靛亾閻?闁哄鐗愰～澶愩€?闁荤喐鐟︾敮鐔哥珶婵犲洤纾绘慨姗嗗弾閸斺偓缂佺虎鍙庨崰姘枔?screen 濠电儑绲介崲鏌ュ箖?*/}
            <motion.div
              className="card__art-canvas"
              style={{ x: parallaxArtX, y: parallaxArtY }}
            >
              <img src={artImg} className="art-piece art-piece--tl" alt="" />
              <img src={artImg} className="art-piece art-piece--tr" alt="" />
              <img src={artImg} className="art-piece art-piece--bl" alt="" />
              <img src={artImg} className="art-piece art-piece--br" alt="" />
            </motion.div>
            {/* 婵＄偑鍊涘▔娑㈡儑娴兼潙妫橀柛銉ｅ妽閹烽亶鏌熺拠鑼闁割偒浜畷锝嗙節閸滀焦顥婃俊?*/}
            <div className="card__detail">
              <div className="card__skill-text">
                <span>Deal 5 damage to the target.</span>
                <div className="card__star-container">
                  <div className="card__star"></div>
                  <div className="card__star"></div>
                  <div className="card__star"></div>
                </div>
                <span>The Hunt</span>
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
