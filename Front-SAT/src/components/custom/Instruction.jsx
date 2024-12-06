import React, { useState } from 'react';
import { Info } from 'lucide-react';

const Instructions = ({ instructions }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative inline-block z-50">
            <button
                className="bg-sky-900 text-white p-0 rounded-full focus:outline-none"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Info className="text-white w-full h-full" />
            </button>

            {/* Instructions Tooltip */}
            {isHovered && (
                <div className="absolute bg-gray-50 border-2 border-gray-400 space-y-4 text-gray-700 p-4 rounded-lg mt-2 w-96 z-50">
                    <strong><u>Informacion</u></strong>
                    <ul className="list-inside">
                        {instructions.map((instruction, index) => (
                            <li key={index}>
                                <strong>{instruction.action}:</strong> {instruction.description}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Instructions;
