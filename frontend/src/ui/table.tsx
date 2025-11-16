import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="border-b bg-gray-50">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <th className={`h-12 px-4 text-left align-middle font-semibold text-gray-700 ${className}`}>
    {children}
  </th>
);

export const TableCell: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = '' }) => (
  <td className={`p-4 align-middle ${className}`}>
    {children}
  </td>
);