import React from 'react';

interface Props {
    value: string;
    onChange: (val: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search students..."
        className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white dark:border-blue-600"
    />
);

export default SearchBar;
