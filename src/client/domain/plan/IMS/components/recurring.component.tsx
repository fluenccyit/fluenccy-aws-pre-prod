import React from "react";
import styled from "styled-components";
import { Select, Input, FlagIcon } from "@client/common";
import getSymbolFromCurrency from "currency-symbol-map";

export const Recurring = ({ invoice, data = {}, onChange }) => {
  const { contactName, currencyCode } = invoice;
  const planTypes = [{ label: `All future invoices from ${contactName}`, value: 'company' }, { label: `All future ${currencyCode} invoices`, value: 'currency' }];
  const approvalMethods = [{ label: 'Notification only', value: 'Notification only' }, { label: 'Notification and approval', value: 'Notification and approval' }];

  return (
    <StyledContainer className="flex flex-col px-4">
      <StyledItem className="flex items-center">
        <div className="flex flex-col left w-2/5">
          <span>Recurring Plan Type</span>
        </div>
        <Select options={planTypes} onChange={(v) => onChange('type', v)} value={data.type} className="right" />
      </StyledItem>
      <StyledItem className="flex items-center">
        <div className="flex flex-col left w-2/5">
          <span>Plan End Date</span>
          <span className="sub-title">Leave blank for open-ended</span>
        </div>
        <Input onChange={(v) => onChange('endDate', v.target.value)} value={data.endDate} type="date" className="right" />
      </StyledItem>
      <StyledItem className="flex items-center">
        <div className="flex flex-col left w-2/5">
          <span>Plan Cap Volume</span>
          <span className="sub-title">Leave blank for open-ended</span>
        </div>
        <div className="right flex items-center pl-3 currency">
          <FlagIcon currency={currencyCode} style={{width: '30px', height: '30px'}} />
          <span className="ml-1">{getSymbolFromCurrency(currencyCode)}</span>
          <Input onChange={(v) => onChange('capVolume', v.target.value)} value={data.capVolume} type="number" />
        </div>
      </StyledItem>
      <StyledItem className="flex items-center">
        <div className="flex flex-col left w-2/5">
          <span>Approval Method</span>
          <span className="sub-title">For future plans</span>
        </div>
        <Select options={approvalMethods} onChange={(v) => onChange('approvalMethod', v)} value={data.approvalMethod} className="right" />
      </StyledItem>
    </StyledContainer>
  )
};

const StyledContainer = styled.div`
`;

const StyledItem = styled.div`
  margin: 9px 0;
  .left {
    width: 40%;
    color: #1C1336;
    font-weight: 500;
    font-size: 14px;
    span {
      padding: 2px 0;
    }
    .sub-title {
      color: #545565;
      font-size: 12px;
    }
  }
  .right {
    width: 60%;
    border: 1px solid #DEDFEA;
    box-sizing: border-box;
    border-radius: 3px;
  }
  .right.currency {
    input {
      padding-left: 0;
      box-shadow: none;
      outline: none;
      border: none;
    }
  }
`;