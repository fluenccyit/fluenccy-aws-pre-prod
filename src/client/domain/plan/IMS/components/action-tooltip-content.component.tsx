import React, { useRef, useState, useEffect } from 'react';
import { usePopper } from 'react-popper';
import { Button, Icon, FlagIcon } from '@client/common';
import styled from 'styled-components';
import getSymbolFromCurrency from 'currency-symbol-map';
import { format } from '@client/utils/number';
import { findDOMNode } from 'react-dom';

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
    &:after {
      content: ' ';
      background-color: white;
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: -6px;
      left: 0;
      transform: rotate(45deg);
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

const StyledIndicator = styled.div`
  background: ${({ color }) => color || '#59D2FE'};
  width: 6px;
  height: 6px;
  border-radius: 50%;
`;

const StyledButton = styled.button`
  background: ${({ bgColor }) => bgColor || '#59D2FE'};
  border-radius: 20px;
  width: 116px;
  padding: 8px 10px;
  color: white;
  font-weight: bold;
  margin-left: 20px;
`;

const StyledName = styled.span`
  width: 80px;
  font-weight: normal;
`;

const StyledInfo = styled.span`
  color: #747474;
  font-size: 13px;
  font-style: italic;
  font-weight: 700;
  margin-bottom: 20px;
  .price {
    color: #10bc6a;
  }
`;

export const ActionTooltipContent = ({ data, onSelect, currency, options = [], width, renderContent, icon, iconContainerClass, isDisabled }) => {
  const [showPopper, setShowPopper] = useState(false);
  const buttonRef = useRef(null);
  const popperRef = useRef(null);
  const containerRef = useRef(null);
  const [arrowRef, setArrowRef] = useState(null);
  const { styles, attributes } = usePopper(buttonRef.current, popperRef.current, {
    modifiers: [
      {
        name: 'arrow',
        options: {
          element: arrowRef,
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  useEffect(() => {
    if ('ontouchend' in window) {
      document.addEventListener('touchend', handleOutsideClick);
    } else {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('touchend', handleOutsideClick);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (event) => {
    const node = (containerRef && containerRef.current) || findDOMNode(this)!;
    if (node && !node.contains(event.target as Node)) {
      setShowPopper(false);
    }
  };

  const { currentCost, targetCost, contactName, invoiceNumber, saving, optimisedRate } = data || {};

  return (
    <div ref={containerRef}>
      <div ref={buttonRef} onClick={() => setShowPopper(!showPopper)} className={iconContainerClass || `flex justify-center`}>
        <Icon icon={icon || 'fluenccy-logo'} style={{ cursor: 'pointer', opacity: isDisabled ? 0.4 : 1 }} />
      </div>

      {showPopper && !isDisabled ? (
        <PopperContainer ref={popperRef} style={{ ...styles.popper, zIndex: 1000 }} {...attributes.popper} width={width}>
          <div ref={setArrowRef} style={styles.arrow} id="arrow" />
          {renderContent ? (
            renderContent(setShowPopper)
          ) : (
            <div className="flex flex-col">
              {options.length === 0 ? (
                <>
                  <div
                    className="flex items-center justify-between p-3 font-700"
                    style={{ borderBottom: '1px solid #F0F1F8', fontSize: '13px', fontWeight: 700 }}
                  >
                    <span>Plan for</span>
                    <span style={{ fontWeight: 'normal' }}>
                      <StyledName>{contactName.substr(0, contactName.length - 3)}...</StyledName>
                      {invoiceNumber}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center py-3">
                      <StyledIndicator className="mx-2" />
                      <span className="mx-2 font-bold" style={{ color: '#7D7E8D', minWidth: '85px' }}>
                        Current Cost
                      </span>
                      <div className="mx-2 flex items-center font-bold" style={{ color: '#1C1336' }}>
                        <FlagIcon currency={currency} />
                        <span style={{ marginLeft: '10px' }}>{format(currentCost, 2, 3)}</span>
                      </div>
                      <StyledButton bgColor="#1C1336" onClick={() => onSelect('Forward')}>
                        Buy Now
                      </StyledButton>
                    </div>
                    <div className="flex items-center py-3" style={optimisedRate === 0 || isNaN(optimisedRate) ? { display: 'none' } : {}}>
                      <StyledIndicator className="mx-2" color="#10BC6A" />
                      <span className="mx-2 font-bold" style={{ color: '#7D7E8D', minWidth: '85px' }}>
                        Target Cost
                      </span>
                      <div className="mx-2 flex items-center font-bold" style={{ color: '#1C1336' }}>
                        <FlagIcon currency={currency} />
                        <span style={{ marginLeft: '10px' }}>{format(targetCost, 2, 3)}</span>
                      </div>
                      <StyledButton bgColor="#10BC6A" onClick={() => onSelect('Plan')}>
                        Plan
                      </StyledButton>
                    </div>
                    <div className="flex w-full">
                      <StyledInfo className="w-full font-700 items-center justify-center">
                        Potential Saving of{' '}
                        <span className="price">
                          {getSymbolFromCurrency(currency)}
                          {format(saving, 2, 3) || 0.0}
                        </span>{' '}
                        with a Plan
                      </StyledInfo>
                    </div>
                  </div>
                </>
              ) : (
                options.map((option) => (
                  <div key={option.value} className="cursor-pointer font-700 px-12 py-2" onClick={() => onSelect(option.value)}>
                    {option.label}
                  </div>
                ))
              )}
            </div>
          )}
        </PopperContainer>
      ) : null}
    </div>
  );
};
