// src/components/SearchBar/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import InputText from '../InputText/InputText';
import Button from '../Button';
import './SearchBar.scss';

const SearchBar = ({ 
  placeholder = "Search", 
  label = "Search", 
  initialValue = "", 
  onSearch,
  style = {}
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  
  // Update local state when initialValue changes (e.g. when cleared externally)
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);
  
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };
  
  const handleSearch = () => {
    onSearch(searchValue);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="search-bar-container" style={style}>
      <div className="input-wrapper">
        <InputText
          style={{ 
            width: '100%', 
            margin: 0
          }}
          placeholder={placeholder}
          label={label}
          hasError={false}
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </div>
      <Button
        type="secondary"
        onClick={handleSearch}
        className="search-button"
      >
        Search
      </Button>
    </div>
  );
};

export default SearchBar;