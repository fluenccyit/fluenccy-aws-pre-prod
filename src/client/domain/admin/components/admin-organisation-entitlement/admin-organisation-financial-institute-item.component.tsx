import React, { useState, useRef } from 'react';
import { Icon } from '@client/common';

type Props = {
  onChange: Function;
  value: string;
  data: {
    title: String;
    key: String;
  };
  onSave: Function;
  onCancel: Function;
};

const iconStyle = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  marginLeft: '10px',
};

export const OrgFinancialInstituteItem = ({ onChange, value = '', data, onSave, onCancel }: Props) => {
  const [disabled, setDisabled] = useState(true);
  const { title, key, postFix } = data;

  const handleCancel = () => {
    onCancel(key);
    setDisabled(true);
  };

  const handleSave = (field) => {
    onSave(field, () => setDisabled(true));
  };

  let props = {
    value: value || '',
    disabled,
  };

  return (
    <div className="w-full flex py-2 border-b">
      <div className="w-1/3 flex items-center">
        <span className="inline-block text-sm font-bold antialiased text-gray-900">{title}</span>
      </div>
      <div className="w-2/3 flex">
        <div>
          <input
            placeholder={data.placeholder}
            onChange={(v) => onChange(key, v.target.value)}
            {...props}
            className="py-1 px-2 border"
            style={{ minWidth: '225px' }}
          />
          {postFix && <span className="px-2">{postFix}</span>}
        </div>
        <div className="flex items-center">
          {disabled && <Icon icon="edit" onClick={() => setDisabled(false)} style={iconStyle} />}
          {!disabled && (
            <>
              <Icon icon="tick-circle-filled" onClick={handleSave.bind(this, key)} style={{ ...iconStyle, color: 'green' }} />
              <Icon icon="close" onClick={handleCancel} style={{ ...iconStyle, color: 'red' }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
