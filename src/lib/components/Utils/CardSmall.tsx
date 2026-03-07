import React from 'react';
import { withBase } from '../../helpers/assets';

interface CardSmallProps {
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 楠板瓙鎴樻枟 - 灏忓瀷鍗＄墝涓嶈鍒欓伄缃╄竟妗?
 * * 鍖呭惈涓や釜鏍稿績鍔熻兘锛?
 * 1. 娓叉煋鍑轰竴涓甫涓嶈鍒欓晜绌虹殑瀹炰綋杈规
 * 2. 鎻愪緵浜嗕竴涓?id 涓?`card-inner-cutout` 鐨勮鍓矾寰勶紝鐢ㄤ簬瑁佸壀鍗＄墝鍐呴儴鐢讳綔
 */
const CardSmall: React.FC<CardSmallProps> = ({
  width = 200,
  height = 260,
  fill = "#f4f6fc", // 淇濈暀鍏煎锛氫綔涓哄簳灞傚厹搴曞簳鑹?
  stroke = "#dbe0ea", // 淇濈暀鍏煎锛氫綔涓哄簳灞傚厹搴曟弿杈?
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
        {/* 鏍稿績榄旀硶 1锛氳鍓矾寰?(Clip Path) 
          濡傛灉浣犳湁鍗＄墝瑙掕壊鍥剧墖锛屽姞涓?clipPath="url(#card-inner-cutout)" 鍗冲彲瀹岀編濂戝悎杩欎釜妗嗙殑褰㈢姸
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

      {/* 涓昏竟妗嗭細鏇挎崲涓?boardSmall.svg */}
      <image
        href={withBase("/img/boardSmall.svg")}
        x="0"
        y="0"
        width="200"
        height="260"
        preserveAspectRatio="none"
      />

      {/* 宸︿笂瑙掕婊村浘鏍?*/}
      <image
        href={withBase("/img/blood.svg")}
        x="6"
        y="6"
        width="42"
        height="50"
        preserveAspectRatio="xMinYMin meet"
      />
    </svg>
  );
};

export default CardSmall;
