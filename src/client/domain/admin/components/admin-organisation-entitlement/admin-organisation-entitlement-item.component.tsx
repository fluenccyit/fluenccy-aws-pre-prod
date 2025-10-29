import React, { useState, useRef, useEffect } from 'react';
import { Icon, Toggle } from '@client/common';

type Props = {
  onChange: Function;
  value: string | boolean;
  data: {
    title: String;
    key: String;
    range?: {
      min: Number;
      max: Number;
    };
    postFix?: string;
    preFix?: string;
    type?: string;
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

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const EntitlementItem = ({ onChange, value = '', data, onSave, onCancel, id, onEdit }: Props) => {
  const inputRef = useRef();
  const timerRef = useRef();
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');
  const [updateVal, setUpdateVal] = useState(value);
  const [showError, setShowError] = useState(false);
  const { title, key, range, postFix, preFix, type = 'number', validate } = data;

  useEffect(() => {
    return () => {
      if (timerRef && timerRef.current) {
        const timerId = timerRef.current;
        clearTimeout(timerId);
      }
    };
  }, [timerRef]);

  useEffect(() => setUpdateVal(value), [value]);

  const handleCancel = () => {
    setError('');
    onCancel(key);
    setDisabled(true);
    setUpdateVal(value);
    setShowError(false);
  };

  const handleSave = (field) => {
    if (error) {
      setShowError(true);
      return;
    }
    onSave(field, null, () => {
      setDisabled(true);
      setError('');
      setShowError(false);
    });
  };

  const handleOnChange = (e) => {
    if (validate) {
      setUpdateVal(validate(e.target.value));
    } else {
      setUpdateVal(e.target.value);
    }
  };

  const handleOnBlur = (e) => {
    const { value } = e.target;
    if (range) {
      const { min, max } = range;
      if (Number(value) < Number(min)) {
        setError(`Value must be greater than or equal to ${min}`);
        setShowError(true);
        const timer = setTimeout(() => setShowError(false), 5000);
        timerRef.current = timer;
        return;
      }

      if (Number(value) > Number(max)) {
        setError(`Value must be less than or equal to ${max}`);
        setShowError(true);
        const timer = setTimeout(() => setShowError(false), 5000);
        timerRef.current = timer;
        return;
      }
      setShowError(false);
      setError('');
    } else if (type === 'email' && !validateEmail(value)) {
      setError(`Enter valid email format`);
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      timerRef.current = timer;
      return;
    }
    onChange(key, value);
  };

  const onClickEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
    setDisabled(false);
    inputRef.current.focus();
  };

  const onChangeSetOptimised = (value) => {
    if (error) {
      setShowError(true);
      return;
    }
    onChange(key, value);
    onSave(key, value.toString(), () => {
      setError('');
      setShowError(false);
    });
  };

  let props = {
    value: updateVal,
    disabled,
  };

  return (
    <div className="w-full flex py-2 border-b">
      <div className="w-1/3 flex items-center">
        <span className="inline-block text-sm font-bold antialiased text-gray-900">{title}</span>
      </div>
      <div className="w-2/3 flex">
        {type === 'SWITCH' ? (
          <Toggle className="ml-2" isChecked={value} onChange={onChangeSetOptimised} />
        ) : (
          <>
            <div className="relative">
              <input
                onChange={handleOnChange}
                onBlur={handleOnBlur}
                {...props}
                type={type}
                className="py-1 px-2 border"
                style={{ minWidth: '225px' }}
                ref={inputRef}
              />
              {postFix && <span className="px-2">{postFix}</span>}

              {showError && error && (
                <span className="absolute bg-red-500 text-xs text-white font-bold p-2 rounded flex shadow-lg z-10" style={{ zIndex: 1 }}>
                  {error}
                </span>
              )}
            </div>
            <div className="flex items-center">
              {disabled && <Icon icon="edit" onClick={onClickEdit} style={iconStyle} />}
              {!disabled && (
                <>
                  <Icon icon="tick-circle-filled" onClick={handleSave.bind(this, key)} style={{ ...iconStyle, color: 'green' }} />
                  <Icon icon="close" onClick={handleCancel} style={{ ...iconStyle, color: 'red' }} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
