import React from 'react';

const TableScroll = ({ data, columns }) => {
    return (
        <div className="overflow-auto max-h-[calc(100vh-4rem)]">  {/* Agregar scroll */}
            <table className="w-full">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="p-2 text-left">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {columns.map((col) => (
                                <td key={col} className="p-2">{row[col]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableScroll;


