import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';

const createOption = (label) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ''),
});

const DestinationSelector = ({ title, defaultOptions, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [value, setValue] = useState(null);

  useEffect(() => {
    setOptions(defaultOptions);
  }, [defaultOptions]);

  const handleCreate = (inputValue) => {
    setIsLoading(true);
    setTimeout(() => {
      const newOption = createOption(inputValue);
      setIsLoading(false);
      setOptions((prev) => [...prev, newOption]);
      setValue(newOption);
      onSelect(newOption);
    }, 1000);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: '#1f2937',
      borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (base) => ({
      ...base,
      background: '#1f2937',
      border: '1px solid #4b5563'
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected 
        ? '#3b82f6' 
        : isFocused 
          ? '#374151' 
          : '#1f2937',
      color: isSelected ? 'white' : '#f3f4f6',
      '&:active': {
        backgroundColor: '#3b82f6'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: '#f3f4f6'
    }),
    input: (base) => ({
      ...base,
      color: '#f3f4f6'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af'
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: '#3b82f6'
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#9ca3af',
      '&:hover': {
        color: '#f3f4f6'
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#9ca3af',
      '&:hover': {
        color: '#f3f4f6'
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#3b82f6',
      padding: '2px'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white',
      padding: '2px 6px'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'white',
      '&:hover': {
        backgroundColor: '#2563eb',
        color: 'white'
      }
    })
  };

  return (
    <div className="w-full">
      <h2 className="text-sm font-medium mb-1 text-gray-300">
        {title}
      </h2>
      <CreatableSelect
        isClearable
        isDisabled={isLoading}
        isLoading={isLoading}
        onChange={(newValue) => {
          setValue(newValue);
          onSelect(newValue);
        }}
        onCreateOption={handleCreate}
        options={options}
        value={value}
        styles={customStyles}
        classNames={{
          control: () => 'py-1'
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#3b82f6',
            primary75: '#60a5fa',
            primary50: '#93c5fd',
            primary25: '#bfdbfe',
            danger: '#ef4444',
            dangerLight: '#fecaca'
          }
        })}
      />
    </div>
  );
};

export default React.memo(DestinationSelector);