/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useCallback, useEffect, useState} from 'react';
import {GeneratedContent} from './components/GeneratedContent';
import {Icon} from './components/Icon';
import {LoginScreen} from './components/LoginScreen';
import {ParametersPanel} from './components/ParametersPanel';
import {StartMenu} from './components/StartMenu';
import {Taskbar} from './components/Taskbar';
import {Window} from './components/Window';
import {
  DESKTOP_APPS,
  INITIAL_MAX_HISTORY_LENGTH,
  START_MENU_APPS,
} from './constants';
import {streamAppContent} from './services/geminiService';
import {AppDefinition, InteractionData, UserState} from './types';

const DesktopView: React.FC<{onAppOpen: (app: AppDefinition) => void}> = ({
  onAppOpen,
}) => (
  <div className="flex flex-wrap content-start p-4">
    {DESKTOP_APPS.map((app) => (
      <Icon key={app.id} app={app} onInteract={() => onAppOpen(app)} />
    ))}
  </div>
);

type ShutdownState = 'running' | 'shutting_down' | 'off';

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppDefinition | null>(null);
  const [previousActiveApp, setPreviousActiveApp] =
    useState<AppDefinition | null>(null);
  const [llmContent, setLlmContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interactionHistory, setInteractionHistory] = useState<
    InteractionData[]
  >([]);
  const [isParametersOpen, setIsParametersOpen] = useState<boolean>(false);
  const [currentMaxHistoryLength, setCurrentMaxHistoryLength] =
    useState<number>(INITIAL_MAX_HISTORY_LENGTH);

  // State for new UI features
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);
  const [shutdownState, setShutdownState] = useState<ShutdownState>('running');
  const [user, setUser] = useState<UserState>({
    isSignedIn: false,
    name: 'Guest',
  });
  const [isLoginScreenVisible, setIsLoginScreenVisible] =
    useState<boolean>(false);

  // Statefulness feature state
  const [isStatefulnessEnabled, setIsStatefulnessEnabled] =
    useState<boolean>(false);
  const [appContentCache, setAppContentCache] = useState<
    Record<string, string>
  >({});
  const [currentAppPath, setCurrentAppPath] = useState<string[]>([]); // For UI graph statefulness

  const internalHandleLlmRequest = useCallback(
    async (
      historyForLlm: InteractionData[],
      maxHistoryLength: number,
      currentUser: UserState,
    ) => {
      if (historyForLlm.length === 0) {
        setError('No interaction data to process.');
        return;
      }

      setIsLoading(true);
      setError(null);

      let accumulatedContent = '';
      setLlmContent('');

      try {
        const stream = streamAppContent(
          historyForLlm,
          maxHistoryLength,
          currentUser,
        );
        for await (const chunk of stream) {
          accumulatedContent += chunk;
          setLlmContent((prev) => prev + chunk);
        }
      } catch (e: any) {
        setError('Failed to stream content from the API.');
        console.error(e);
        accumulatedContent = `<div class="p-4 text-red-600 bg-red-100 rounded-md">Error loading content.</div>`;
        setLlmContent(accumulatedContent);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      !isLoading &&
      currentAppPath.length > 0 &&
      isStatefulnessEnabled &&
      llmContent
    ) {
      const cacheKey = currentAppPath.join('__');
      if (appContentCache[cacheKey] !== llmContent) {
        setAppContentCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: llmContent,
        }));
      }
    }
  }, [
    llmContent,
    isLoading,
    currentAppPath,
    isStatefulnessEnabled,
    appContentCache,
  ]);

  const handleInteraction = useCallback(
    async (interactionData: InteractionData) => {
      if (interactionData.id === 'app_close_button') {
        handleCloseAppView();
        return;
      }

      if (interactionData.id === 'initiate_google_signin') {
        setIsLoginScreenVisible(true);
        return;
      }

      let nextUser = user;
      if (interactionData.id === 'google_signin_success') {
        const email = interactionData.value || '';
        const name =
          email.split('@')[0].charAt(0).toUpperCase() +
          email.split('@')[0].slice(1);
        nextUser = {isSignedIn: true, name: name || 'User'};
        setUser(nextUser);
        setIsLoginScreenVisible(false);
      } else if (interactionData.id === 'sign_out_button') {
        nextUser = {isSignedIn: false, name: 'Guest'};
        setUser(nextUser);
      }

      const newHistory = [
        interactionData,
        ...interactionHistory.slice(0, currentMaxHistoryLength - 1),
      ];
      setInteractionHistory(newHistory);

      const newPath = activeApp
        ? [...currentAppPath, interactionData.id]
        : [interactionData.id];
      setCurrentAppPath(newPath);
      const cacheKey = newPath.join('__');

      setLlmContent('');
      setError(null);

      const isAuthAction =
        interactionData.id === 'google_signin_success' ||
        interactionData.id === 'sign_out_button';

      if (isStatefulnessEnabled && appContentCache[cacheKey] && !isAuthAction) {
        setLlmContent(appContentCache[cacheKey]);
        setIsLoading(false);
      } else {
        internalHandleLlmRequest(newHistory, currentMaxHistoryLength, nextUser);
      }
    },
    [
      interactionHistory,
      internalHandleLlmRequest,
      activeApp,
      currentMaxHistoryLength,
      currentAppPath,
      isStatefulnessEnabled,
      appContentCache,
      user,
    ],
  );

  const handleAppOpen = (app: AppDefinition) => {
    if (isStartMenuOpen) {
      setIsStartMenuOpen(false);
    }

    const initialInteraction: InteractionData = {
      id: app.id,
      type: 'app_open',
      elementText: app.name,
      elementType: 'icon',
      appContext: app.id,
    };

    const newHistory = [initialInteraction];
    setInteractionHistory(newHistory);

    const appPath = [app.id];
    setCurrentAppPath(appPath);
    const cacheKey = appPath.join('__');

    if (isParametersOpen) {
      setIsParametersOpen(false);
    }
    setActiveApp(app);
    setLlmContent('');
    setError(null);

    if (isStatefulnessEnabled && appContentCache[cacheKey]) {
      setLlmContent(appContentCache[cacheKey]);
      setIsLoading(false);
    } else {
      internalHandleLlmRequest(newHistory, currentMaxHistoryLength, user);
    }
  };

  const handleCloseAppView = () => {
    setActiveApp(null);
    setLlmContent('');
    setError(null);
    setInteractionHistory([]);
    setCurrentAppPath([]);
    setIsStartMenuOpen(false);
  };

  const handleToggleParametersPanel = () => {
    setIsParametersOpen((prevIsOpen) => {
      const nowOpeningParameters = !prevIsOpen;
      if (nowOpeningParameters) {
        setPreviousActiveApp(activeApp);
        setActiveApp(null);
        setLlmContent('');
        setError(null);
        setIsStartMenuOpen(false);
      } else {
        setPreviousActiveApp(null);
        setActiveApp(null);
        setLlmContent('');
        setError(null);
        setInteractionHistory([]);
        setCurrentAppPath([]);
      }
      return nowOpeningParameters;
    });
  };

  const handleUpdateHistoryLength = (newLength: number) => {
    setCurrentMaxHistoryLength(newLength);
    setInteractionHistory((prev) => prev.slice(0, newLength));
  };

  const handleSetStatefulness = (enabled: boolean) => {
    setIsStatefulnessEnabled(enabled);
    if (!enabled) {
      setAppContentCache({});
    }
  };

  const handleMasterClose = () => {
    if (isParametersOpen) {
      handleToggleParametersPanel();
    } else if (activeApp) {
      handleCloseAppView();
    }
  };

  const handleToggleStartMenu = () => {
    setIsStartMenuOpen((prev) => !prev);
  };

  const handleShutdown = () => {
    setIsStartMenuOpen(false);
    setShutdownState('shutting_down');
    setTimeout(() => {
      setShutdownState('off');
    }, 2500);
  };

  const handleReboot = () => {
    window.location.reload();
  };

  const windowTitle = isParametersOpen
    ? 'DNA OS'
    : activeApp
      ? activeApp.name
      : 'DNA OS';
  const contentBgColor = '#ffffff';

  if (shutdownState === 'shutting_down') {
    return (
      <div className="w-full h-screen bg-blue-800 text-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-6"></div>
        <h1 className="text-4xl font-light">Shutting down...</h1>
      </div>
    );
  }

  if (shutdownState === 'off') {
    return (
      <div className="w-full h-screen bg-black text-gray-400 flex flex-col items-center justify-center font-sans p-4 text-center">
        <p className="text-2xl mb-8">
          The session has ended. You may now close this window.
        </p>
        <button
          onClick={handleReboot}
          className="llm-button"
          aria-label="Restart the application">
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen flex items-center justify-center p-4">
      <Window
        title={windowTitle}
        onClose={handleMasterClose}
        isAppOpen={!!activeApp && !isParametersOpen}
        appId={activeApp?.id}
        onToggleParameters={handleToggleParametersPanel}
        onExitToDesktop={handleCloseAppView}
        isParametersPanelOpen={isParametersOpen}>
        <div
          className="w-full h-full flex flex-col"
          style={{backgroundColor: contentBgColor}}>
          <div className="flex-grow overflow-y-auto relative">
            {isLoginScreenVisible && (
              <LoginScreen
                onLogin={handleInteraction}
                onClose={() => setIsLoginScreenVisible(false)}
              />
            )}
            {isStartMenuOpen && (
              <>
                <div
                  className="absolute inset-0 z-30"
                  onClick={() => setIsStartMenuOpen(false)}
                />
                <StartMenu
                  apps={START_MENU_APPS}
                  onAppOpen={handleAppOpen}
                  onShutdown={handleShutdown}
                  user={user}
                />
              </>
            )}

            {isParametersOpen ? (
              <ParametersPanel
                currentLength={currentMaxHistoryLength}
                onUpdateHistoryLength={handleUpdateHistoryLength}
                onClosePanel={handleToggleParametersPanel}
                isStatefulnessEnabled={isStatefulnessEnabled}
                onSetStatefulness={handleSetStatefulness}
              />
            ) : !activeApp ? (
              <DesktopView onAppOpen={handleAppOpen} />
            ) : (
              <>
                {isLoading && llmContent.length === 0 && (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {error && (
                  <div className="p-4 text-red-600 bg-red-100 rounded-md">
                    {error}
                  </div>
                )}
                {(!isLoading || llmContent) && (
                  <GeneratedContent
                    htmlContent={llmContent}
                    onInteract={handleInteraction}
                    appContext={activeApp.id}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
          </div>
          {!isParametersOpen && (
            <Taskbar
              onStartClick={handleToggleStartMenu}
              onAppOpen={handleAppOpen}
            />
          )}
        </div>
      </Window>
    </div>
  );
};

export default App;
