import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import fetchJson from 'Utilities/Fetch/fetchJson';
import getQueryPath from 'Utilities/Fetch/getQueryPath';

function getDimensions(width: number, height: number) {
  return {
    width,
    height,
    isExtraSmallScreen: width <= 480,
    isSmallScreen: width <= 768,
    isMediumScreen: width <= 992,
    isLargeScreen: width <= 1200,
  };
}

export interface Dimensions {
  width: number;
  height: number;
  isExtraSmallScreen: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

interface AppStoreState {
  dimensions: Dimensions;
  version: string;
  prevVersion?: string;
  isUpdated: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  isDisconnected: boolean;
  isRestarting: boolean;
  isSidebarVisible: boolean;
}

let abortPingServer: (() => void) | null = null;
let pingTimeout: ReturnType<typeof setTimeout> | null = null;

const useAppStore = create<AppStoreState>()(() => {
  const dimensions = getDimensions(window.innerWidth, window.innerHeight);

  return {
    dimensions,
    version: window.Whisparr.version,
    isUpdated: false,
    isConnected: true,
    isReconnecting: false,
    isDisconnected: false,
    isRestarting: false,
    isSidebarVisible: !dimensions.isSmallScreen,
  };
});

export const useAppValue = <K extends keyof AppStoreState>(key: K) => {
  return useAppStore((state) => state[key]);
};

export const useAppValues = <K extends keyof AppStoreState>(...keys: K[]) => {
  return useAppStore(
    useShallow((state) => {
      return keys.reduce(
        (acc, key) => {
          acc[key] = state[key];
          return acc;
        },
        {} as Pick<AppStoreState, K>
      );
    })
  );
};

export const useAppDimensions = () => {
  return useAppStore(useShallow((state) => state.dimensions));
};

// Subscribing to one breakpoint rather than the whole object, so a resize that
// does not cross it re-renders nothing.
export const useAppDimension = <K extends keyof Dimensions>(key: K) => {
  return useAppStore((state) => state.dimensions[key]);
};

export const getAppValue = <K extends keyof AppStoreState>(key: K) => {
  return useAppStore.getState()[key];
};

export const saveDimensions = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  useAppStore.setState({ dimensions: getDimensions(width, height) });
};

export const setVersion = ({ version }: { version: string }) => {
  useAppStore.setState((state) => {
    const newState: Partial<AppStoreState> = { version };

    if (state.version !== version) {
      if (!state.prevVersion) {
        newState.prevVersion = state.version;
      }

      newState.isUpdated = true;
    }

    return newState;
  });
};

export const setIsSidebarVisible = ({
  isSidebarVisible,
}: {
  isSidebarVisible: boolean;
}) => {
  useAppStore.setState({ isSidebarVisible });
};

export const setAppValue = (payload: Partial<AppStoreState>) => {
  useAppStore.setState(payload);
};

// Polls until the server answers again after a restart. The redux version
// leaned on `getState()` reading the whole store; here it reads its own.
function pingServerAfterTimeout() {
  if (abortPingServer) {
    abortPingServer();
    abortPingServer = null;
  }

  if (pingTimeout) {
    clearTimeout(pingTimeout);
    pingTimeout = null;
  }

  pingTimeout = setTimeout(async () => {
    if (!getAppValue('isRestarting') && getAppValue('isConnected')) {
      return;
    }

    const abortController = new AbortController();
    abortPingServer = () => abortController.abort();

    try {
      await fetchJson({
        path: getQueryPath('/system/status'),
        method: 'GET',
        signal: abortController.signal,
        headers: {
          'X-Api-Key': window.Whisparr.apiKey,
          'X-Whisparr-Client': 'Whisparr',
        },
      });

      abortPingServer = null;
      pingTimeout = null;

      setAppValue({ isRestarting: false });
    } catch (error) {
      abortPingServer = null;
      pingTimeout = null;

      // Unauthorized, but back online.
      if ((error as { status?: number }).status === 401) {
        setAppValue({ isRestarting: false });
      } else if (!abortController.signal.aborted) {
        pingServerAfterTimeout();
      }
    }
  }, 5000);
}

export const pingServer = () => {
  pingServerAfterTimeout();
};
