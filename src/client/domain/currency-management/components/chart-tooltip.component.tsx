import React, { memo, useRef, useState } from 'react';
import { useQueryLocalOrganisation } from '@client/organisation';
import { Card, CardContent, Text } from '@client/common';
import getSymbolFromCurrency from "currency-symbol-map";
import { format } from "@client/utils/number";
import { usePopper } from 'react-popper';
import styled from "styled-components";

const POPPER_MIN_WIDTH = 250;

export const InvoiceChartTooltip = memo(({ props = {}, y, currency, datas }: Props) => {
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

  const { organisation } = useQueryLocalOrganisation();

  const data = { ...props };
  const item = datas[y.index];
  const currencySymbol = getSymbolFromCurrency(item.currency || organisation?.currency);
  const popperStyles = {
    top: `${data.screenY - data.clientY + 128}px`,
    left: `${data.clientX + 18}px`
  };
  const windowWidth = window.innerWidth;
  const arrowPos = (windowWidth - data.clientX) < POPPER_MIN_WIDTH * 2 ? "right" : 'left';
  if (arrowPos === 'right') {
    popperStyles.left = `${data.clientX - POPPER_MIN_WIDTH - 18}px`
  }

  return (
    <PopperContainer
      ref={popperRef}
      style={{ ...styles.popper, minWidth: `${POPPER_MIN_WIDTH}px`, ...popperStyles }}
      {...attributes.popper}
      arrowPos={arrowPos}
    >
      <div ref={setArrowRef} style={styles.arrow} id="arrow" />
      <Card>
        <CardContent className="px-3 py-2 flex items-center whitespace-nowrap w-full justify-start" hasSeparator>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#10BC6A', borderRadius: '50%' }} className="mr-4" />
          <div className="text-sm mr-6 flex" style={{ minWidth: '120px' }} variant="gray">
            Reserved
          </div>

          <Text className="text-sm font-medium" isBlock>
            {currencySymbol}{format(Number(item['Forward']), 2, 3)}
          </Text>
        </CardContent>
        <CardContent className="px-3 py-2 flex items-center whitespace-nowrap w-full justify-start" hasSeparator>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#DEDFEA', borderRadius: '50%' }} className="mr-4" />
          <div className="text-sm mr-6 flex" style={{ minWidth: '120px' }} variant="gray">
            No Plan
          </div>
          <Text className="text-sm font-medium" isBlock>
            {currencySymbol}{format(Number(item['Unmanaged']), 2, 3)}
          </Text>
        </CardContent>
        <CardContent className="px-3 py-2 flex items-center whitespace-nowrap w-full justify-start" hasSeparator>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '50%' }} className="mr-4" />
          <div className="text-sm mr-6 flex font-medium" style={{ minWidth: '120px' }} variant="gray">
            Total
          </div>
          <Text className="text-sm font-bold" isBlock>
            {currencySymbol}{format(Number(item['Unmanaged']) + Number(item['Forward']), 2, 3)}
          </Text>
        </CardContent>
      </Card>
    </PopperContainer>
  );
});

const PopperContainer = styled.div`
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  background-color: white;
  text-align: center;
  width: ${({ width }) => width || 'auto'};
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