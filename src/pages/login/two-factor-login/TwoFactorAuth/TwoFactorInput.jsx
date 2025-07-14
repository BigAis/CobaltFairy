import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../../components/Icon/Icon';
import './TwoFactorInput.scss';

const CELL_COUNT = 6;

const TwoFactorInput = ({ value, onChange, onIncompleteSubmit }) => {
  const ref = useRef(null);
  const [isError, setIsError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const codeDigitsArray = new Array(CELL_COUNT).fill(0);

  const toDigitInput = (_value, idx) => {
    const emptyInputChar = ' ';
    const digit = value?.[idx] || emptyInputChar;

    const isCurrentDigit = idx === value?.length;
    const isLastDigit = idx === CELL_COUNT - 1;
    const isCodeFull = value?.length === CELL_COUNT;

    // Only show the focus styling if the input actually has focus
    const cellIsFocused = isFocused && (isCurrentDigit || (isLastDigit && isCodeFull));
    
    const containerStyle = isError
      ? 'codeInputCellContainer error'
      : cellIsFocused
      ? 'codeInputCellContainer focused'
      : 'codeInputCellContainer';

    return (
      <div key={idx} className={containerStyle}>
        <span>{digit}</span>
      </div>
    );
  };

  const handleOnPress = () => {
    ref.current.focus();
  };

  const handleInputChange = (e) => {
    const input = e.target.value.replace(/[^0-9]/g, '');
    if (input.length <= CELL_COUNT) {
      onChange(input);
      setIsError(false); // Reset error state on input change
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (value.length < CELL_COUNT) {
        setIsError(true);
        if (onIncompleteSubmit) {
          onIncompleteSubmit(); // Trigger incomplete submission handling
        }
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    ref?.current?.focus();
  }, []);

  return (
    <div className="TwoFactorAuth">
      <div className="container" onClick={handleOnPress}>
        <div className="inputsContainer">{codeDigitsArray.map(toDigitInput)}</div>
        <input
          ref={ref}
          value={value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          type="text"
          maxLength={CELL_COUNT}
          className="hiddenCodeInput"
        />
      </div>
      {isError && (
        <div className="error-message-container">
          <Icon name="Attention" size={16} />
          <span>Please enter all 6 digits.</span>
        </div>
      )}
    </div>
  );
};

export default TwoFactorInput;