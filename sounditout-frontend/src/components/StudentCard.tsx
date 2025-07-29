import React from 'react';

interface Props {
    fullName: string;
    onClick: () => void;
}

const StudentCard: React.FC<Props> = ({ fullName, onClick }) => (
    <div
        onClick={onClick}
        className="cursor-pointer p-4 bg-blue-100 dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-lg shadow hover:shadow-md hover:bg-blue-200 dark:hover:bg-gray-600 transition"
    >
        <p className="text-lg font-semibold text-blue-800 dark:text-white">{fullName}</p>
    </div>
);

export default StudentCard;
