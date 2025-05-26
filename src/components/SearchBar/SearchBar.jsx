// src/components/SearchBar/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import InputText from '../InputText/InputText';
import Button from '../Button';

const SearchBar = ({ 
  placeholder = "Search", 
  label = "Search", 
  initialValue = "", 
  onSearch,
  style = {}
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  
  // Update local state when initialValue changes
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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      width: '100%',
      ...style 
    }}>
      <InputText
        style={{ 
          width: '100%', 
          margin: 0, 
          marginRight: '10px' 
        }}
        placeholder={placeholder}
        label={label}
        hasError={false}
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
      <Button
        type="secondary"
        icon="Search"
        onClick={handleSearch}
        style={{ minHeight: '51px' }}
      >
        Search
      </Button>
    </div>
  );
};

export default SearchBar;