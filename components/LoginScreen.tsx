/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useState} from 'react';
import {InteractionData} from '../types';

interface LoginScreenProps {
  onLogin: (data: InteractionData) => void;
  onClose: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({onLogin, onClose}) => {
  const [email, setEmail] = useState('');

  const handleSignIn = () => {
    if (!email) {
      alert('Please enter an email or username to simulate sign-in.');
      return;
    }

    const interactionData: InteractionData = {
      id: 'google_signin_success',
      type: 'user_login',
      value: email,
      elementType: 'button',
      elementText: 'Sign In',
      appContext: 'account_app',
    };
    onLogin(interactionData);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div
      className="absolute inset-0 bg-gray-600/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}>
      <div
        className="bg-white rounded-lg border border-gray-300 p-8 m-4 w-full max-w-sm flex flex-col items-center text-center font-sans shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <svg
          className="w-12 h-auto mb-4"
          viewBox="0 0 533.5 544.3"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
            fill="#4285f4"
          />
          <path
            d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
            fill="#34a853"
          />
          <path
            d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
            fill="#fbbc04"
          />
          <path
            d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 340.5 0 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
            fill="#ea4335"
          />
        </svg>

        <h1 className="text-2xl font-medium text-gray-800 mb-2">Sign in</h1>
        <p className="text-gray-600 mb-6">to continue to DNA OS</p>

        <input
          id="signin_input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Email or phone"
          className="w-full llm-input mb-4"
          aria-label="Email or phone"
          autoFocus
        />

        <div className="w-full flex justify-between items-center text-sm mb-8">
          <a href="#" className="text-blue-600 font-medium hover:underline">
            Forgot email?
          </a>
        </div>

        <p className="text-xs text-gray-500 text-left w-full mb-8">
          This is a simulated sign-in. No data is sent to Google.
          <a
            href="#"
            className="text-blue-600 font-medium hover:underline ml-1">
            Learn more
          </a>
        </p>

        <div className="w-full flex justify-between items-center">
          <button className="text-blue-600 font-semibold py-2 px-4 rounded-md hover:bg-blue-50">
            Create account
          </button>
          <button
            onClick={handleSignIn}
            className="llm-button"
            aria-label="Sign In">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
