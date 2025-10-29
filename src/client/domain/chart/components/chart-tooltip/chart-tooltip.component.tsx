import React, { ReactNode, CSSProperties, memo, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { CHART_STYLE } from '@client/chart';
import { usePopper } from 'react-popper';
import styled from "styled-components";

type Props = {
  children: ReactNode;
  className?: string;
  caratClassName?: string;
  yOffset?: number;
  isOnLeft: boolean;
};

const TOOLTIP_CARAT_SIZE = 15;
const TOOLTIP_X_OFFSET = TOOLTIP_CARAT_SIZE + 5;
const BASE_CLASSES = ['flex'];
const BASE_CARAT_CLASSES = ['absolute', 'bg-white', 'border-solid', 'transform', 'rotate-45', '-z-1'];

export const ChartTooltip = memo(({ children, className, caratClassName, yOffset = 0, isOnLeft, top, left, position = "left" }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipDimensions, setTooltipDimensions] = useState({ height: 0, width: 0 });
  const buttonRef = useRef(null);
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState(null);
  const { styles, attributes } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      modifiers: [
        {
          name: "arrow",
          options: {
            element: arrowRef
          }
        },
        {
          name: "offset",
          enabled: true,
          options: {
            offset: [0, 10]
          }
        }
      ]
    }
  );

  useEffect(() => {
    const { height = 0, width = 0 } = tooltipRef.current?.getBoundingClientRect() || {};

    setTooltipDimensions({ height: height + yOffset, width });
  }, [yOffset]);

  const getTooltipStyle = () => {
    const top = `-${tooltipDimensions.height / 2}px`;

    if (isOnLeft) {
      return { top, right: TOOLTIP_X_OFFSET };
    } else {
      return { top, left: TOOLTIP_X_OFFSET };
    }
  };

  const popperStyles = {
    top,
    left
  };

  const renderCarat = () => {
    const classes = cn(caratClassName, BASE_CARAT_CLASSES, {
      'border-t border-r border-b-0 border-l-0': isOnLeft,
      'border-b border-l border-t-0 border-r-0': !isOnLeft,
    });

    const style: CSSProperties = {
      top: tooltipDimensions.height / 2 - TOOLTIP_CARAT_SIZE / 2 + CHART_STYLE.borderWidth,
      width: TOOLTIP_CARAT_SIZE,
      height: TOOLTIP_CARAT_SIZE,
    };

    if (isOnLeft) {
      style.right = `-${TOOLTIP_CARAT_SIZE / 2}px`;
    } else {
      style.left = `-${TOOLTIP_CARAT_SIZE / 2}px`;
    }

    return <div className={classes} style={style} />;
  };

  return (
    <PopperContainer
      ref={popperRef}
      style={{ ...styles.popper, width: `${CHART_STYLE.tooltipWidth}px`, ...popperStyles }}
      {...attributes.popper}
      arrowPos={position === 'left' ? 'right' : 'left'}
    >
      <div ref={setArrowRef} style={styles.arrow} id="arrow" />
      {children}
    </PopperContainer>
  );
});

const PopperContainer = styled.div`
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  background-color: white;
  text-align: center;
  width: ${({ width }) => width || 'auto'};
  z-index: 1000000;
  #arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    ${({arrowPos}) => arrowPos === 'left' ? `left:0px` : 'right: 0'};
    &:after {
      content: " ";
      background-color: white;
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 45px;
      ${({arrowPos}) => `${arrowPos}:-5px`};
      transform: rotate(${({arrowPos}) => arrowPos === 'left' ? '-45deg' : '135deg'});
      width: 10px;
      height: 10px;
    }
  }

  &[data-popper-placement^='top'] > #arrow {
    bottom: -30px;
    :after {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
    }
  }
`;
