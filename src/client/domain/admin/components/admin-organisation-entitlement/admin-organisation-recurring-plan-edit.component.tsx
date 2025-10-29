import { useModal, Button, FlagIcon, useToast, useQueryLocalCommon } from '@client/common';
import styled from "styled-components";
import { Select, Input } from "@client/common";
import React, { useState } from 'react';

type Props = {
  onSave: Function;
  plan: object;
};
const approvalMethods = [{ label: 'Notification only', value: 'Notification only' }, { label: 'Notification and approval', value: 'Notification and approval' }];

export const RecurringPlanEditModal = ({ plan, onSave }: Props) => {
  const [recurrData, setRecurrData] = useState(plan);
  const { closeModal } = useModal();
  const { ui } = useQueryLocalCommon();

  const onRecurringChange = (field, v) => {
    setRecurrData(prev => ({ ...prev, [field]: v }));
  }

  const handleUpdate = () => {
    const payload = {
      logId: recurrData.id,
      approvalMethod: recurrData.approvalMethod,
      capVolume: recurrData.capVolume,
      endDate: recurrData.endDate || null
    };

    if (recurrData.endDate) {
      payload.endDate = recurrData.endDate;
    }
    onSave(payload);
  };

  return (
    <div className="flex">
      <div className="flex flex-col align-center w-full">
        <StyledHeader className="flex flex-col py-2 px-4 relative">
          <span className="header-title">Update Plan</span>
        </StyledHeader>
        <div className="w-full p-4">
          <StyledContainer className="flex flex-col px-4">
            <StyledItem className="flex items-center">
              <div className="flex flex-col left w-2/5">
                <span>Plan End Date</span>
                <span className="sub-title">Leave blank for open-ended</span>
              </div>
              <Input onChange={(v) => onRecurringChange('endDate', v.target.value)} value={recurrData.endDate} type="date" className="right" />
            </StyledItem>
            <StyledItem className="flex items-center">
              <div className="flex flex-col left w-2/5">
                <span>Plan Cap Volume</span>
                <span className="sub-title">Leave blank for open-ended</span>
              </div>
              <div className="right flex items-center pl-3 currency">
                <Input onChange={(v) => onRecurringChange('capVolume', v.target.value)} value={recurrData.capVolume} type="number" />
              </div>
            </StyledItem>
            <StyledItem className="flex items-center">
              <div className="flex flex-col left w-2/5">
                <span>Approval Method</span>
                <span className="sub-title">For future plans</span>
              </div>
              <Select options={approvalMethods} onChange={(v) => onRecurringChange('approvalMethod', v)} value={recurrData.approvalMethod} className="right" />
            </StyledItem>
          </StyledContainer>
        </div>
        <div className="flex mb-8 ml-4">
          <Button onClick={closeModal} variant="danger" state="filled" className="rounded-full font-bold mr-2" isDisabled={ui === 'saving'}>
            Cancel
            </Button>
          <Button onClick={handleUpdate} variant="success" className="rounded-full font-bold" isDisabled={ui === 'saving'}>
            Update
          </Button>
        </div>
      </div>
    </div>
  );
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

const StyledHeader = styled.div`
background: #1C1336;
color: #FFFFFF;
font-size: 12px;
.header-title {
  font-size: 16px;
  font-weight: bold;
}
`;
