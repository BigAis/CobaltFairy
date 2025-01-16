import React, { useEffect, useRef } from 'react';
import './TwoFactorInput.scss';

const CELL_COUNT = 6;

const TwoFactorInput = ({ value, onChange }) => {
  const ref = useRef(null);

  const codeDigitsArray = new Array(CELL_COUNT).fill(0);

  const toDigitInput = (_value, idx) => {
    const emptyInputChar = ' ';
    const digit = value?.[idx] || emptyInputChar;

    const isCurrentDigit = idx === value?.length;
    const isLastDigit = idx === CELL_COUNT - 1;
    const isCodeFull = value?.length === CELL_COUNT;

    const isFocused = isCurrentDigit || (isLastDigit && isCodeFull);
    const containerStyle = isFocused
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
    }
  };

  useEffect(() => {
    ref.current.focus(); 
  }, []);

  return (
    <div className="TwoFactorAuth">
      <div className="container" onClick={handleOnPress}>
        <div className="inputsContainer">{codeDigitsArray.map(toDigitInput)}</div>
        <input
          ref={ref}
          value={value}
          onChange={handleInputChange}
          type="text"
          maxLength={CELL_COUNT}
          className="hiddenCodeInput"
        />
      </div>
    </div>
  );
};

export default TwoFactorInput;
