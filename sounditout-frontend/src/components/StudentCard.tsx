import React from 'react';

interface Props {
    fullName: string;
    onClick: () => void;
}

const StudentCard: React.FC<Props> = ({ fullName, onClick }) => (
    <div
        onClick={onClick}
        className="
      cursor-pointer
      p-5
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-xl
      shadow-sm
      hover:shadow-lg
      hover:-translate-y-1
      transform
      transition-all
      duration-200
    "
    >
        <p className="text-xl font-medium text-gray-900 dark:text-white tracking-wide">
            {fullName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Student
        </p>
    </div>
);

export default StudentCard;
