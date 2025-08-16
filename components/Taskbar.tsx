/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useState} from 'react';
import {AppDefinition} from '../types';

interface TaskbarProps {
  onStartClick: () => void;
  onAppOpen: (app: AppDefinition) => void;
}

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-sm font-medium text-gray-800">
      {time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
    </div>
  );
};

export const Taskbar: React.FC<TaskbarProps> = ({onStartClick}) => {
  return (
    <div className="h-12 bg-gray-200/95 border-t border-gray-300 flex-shrink-0 flex items-center px-4 z-20 relative">
      {/* Left-aligned items */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-md hover:bg-gray-300/80 transition-colors"
          aria-label="Open Widgets"
          title="Widgets">
          <span className="text-lg" role="img" aria-label="Widgets">
            🧩
          </span>
        </button>
      </div>

      {/* Centered items */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <button
          onClick={onStartClick}
          className="p-2 rounded-md hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Open Start Menu">
          <span className="text-xl" role="img" aria-label="Start">
            🧬
          </span>
        </button>
      </div>

      {/* Right-aligned items */}
      <div className="ml-auto flex items-center">
        <Clock />
      </div>
    </div>
  );
};
