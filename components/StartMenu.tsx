/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React from 'react';
import {APP_DEFINITIONS_CONFIG} from '../constants';
import {AppDefinition, UserState} from '../types';

interface StartMenuProps {
  apps: AppDefinition[];
  onAppOpen: (app: AppDefinition) => void;
  onShutdown: () => void;
  user: UserState;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  apps,
  onAppOpen,
  onShutdown,
  user,
}) => {
  const accountApp = APP_DEFINITIONS_CONFIG.find(
    (app) => app.id === 'account_app',
  );

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-80 bg-gray-100/90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg z-40 animate-fade-in-up flex flex-col">
      <div className="p-2 flex-grow">
        <ul>
          {apps.map((app) => (
            <li key={app.id}>
              <button
                onClick={() => onAppOpen(app)}
                className="w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-blue-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-500 focus:text-white">
                <span className="text-2xl">{app.icon}</span>
                <span className="font-medium">{app.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-gray-300 p-2 flex justify-between items-center">
        {accountApp && (
          <button
            onClick={() => onAppOpen(accountApp)}
            className="flex items-center gap-3 p-2 text-left rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Open ${accountApp.name}`}>
            <span className="text-2xl">{accountApp.icon}</span>
            <span className="font-medium">{user.name}</span>
          </button>
        )}
        <button
          onClick={onShutdown}
          className="p-2 rounded-md hover:bg-red-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Shutdown">
          <span className="text-2xl" role="img" aria-label="Shutdown">
            🔌
          </span>
        </button>
      </div>
    </div>
  );
};