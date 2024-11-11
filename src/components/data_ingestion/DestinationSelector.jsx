import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';

// Helper function to create an option object
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
      onSelect(newOption); // Notify parent about the selected option
    }, 1000);
  };

  return (
    <div className="max-w-lg p-4 mx-auto">
      <h2 className="mt-1 font-medium tracking-wide text-gray-700 dark:text-gray-200">
        {title}
      </h2>
      <CreatableSelect
        isClearable
        isDisabled={isLoading}
        isLoading={isLoading}
        onChange={(newValue) => {
          setValue(newValue);
          onSelect(newValue); // Notify parent about the selected option
        }}
        onCreateOption={handleCreate}
        options={options}
        value={value}
      />
    </div>
  );
};

export default React.memo(DestinationSelector);