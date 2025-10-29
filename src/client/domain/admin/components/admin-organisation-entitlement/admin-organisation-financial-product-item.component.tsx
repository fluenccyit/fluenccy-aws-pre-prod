import React, { useState, useRef } from "react";
import { Icon, RadioButton } from "@client/common";

type Props = {
  onChange: Function;
  value: string;
  data: {
    title: String;
    key: String;
    range?: {
      min: Number;
      max: Number;
    };
    postFix?: string;
    preFix?: string;
  },
  onSave: Function;
  onCancel: Function;
};

const iconStyle = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  marginLeft: '10px'
};

export const FinancialProductsItem = ({ onChange, value = "", data = {}, onSave, onCancel, isNew = false }: Props) => {
  const inputRef = useRef();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableValue, setEditableValue] = useState(value);

  const toggleShowNew = () => setIsEditMode(!isEditMode);

  const handleCancel = () => {
    setEditableValue(value);
    setIsEditMode(false);
  }

  const handleSave = () => {
    onSave({
      id: data?.id,
      title: editableValue
    }, () => {
      setEditableValue("");
      setIsEditMode(false);
    });
  }

  return (
    <div className="flex items-center my-2">
      {isNew && !isEditMode && <Icon icon="add-circle-filled" onClick={toggleShowNew} style={{color: "green", cursor: "pointer", width: "22px", height: "22px"}} />}
      {!isNew && !isEditMode && <div className="flex items-center p-2 rounded border mx-2">
        <input type="radio" id={data.created_at} />
        <label for={data.created_at} className="inline-block text-sm antialiased text-gray-900 mx-1 cursor-pointer">{value}</label>
      </div>}
      {isEditMode && <div className="w-2/3 flex">
        <input onChange={v => setEditableValue(v.target.value)} placeholder="Enter new" className="py-1 px-2 border" ref={inputRef} />
        <div className="flex items-center">
          {isEditMode && (
            <>
              <Icon icon="tick-circle-filled" onClick={handleSave} style={{ ...iconStyle, color: 'green' }} />
              <Icon icon="close" onClick={handleCancel} style={{ ...iconStyle, color: 'red' }} />
            </>
          )}
        </div>
      </div>}
    </div>
  )
}