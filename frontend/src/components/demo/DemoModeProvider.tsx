"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

/**
 * Demo ModeとしてFrontend全体で共有する状態。
 *
 * isDemo:
 *   現在のLogin Userが公開Demo Accountか。
 *
 * isReadOnly:
 *   書き込み操作を無効化するか。
 */
type DemoModeContextValue = {
  isDemo: boolean;
  isReadOnly: boolean;
};

const DemoModeContext =
  createContext<
    DemoModeContextValue | undefined
  >(undefined);

type DemoModeProviderProps = {
  children: ReactNode;
  isDemo: boolean;
  isReadOnly: boolean;
};

/**
 * Login後Application全体へ
 * Demo状態を共有するProvider。
 */
export default function DemoModeProvider({
  children,
  isDemo,
  isReadOnly,
}: DemoModeProviderProps) {
  return (
    <DemoModeContext.Provider
      value={{
        isDemo,
        isReadOnly,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

/**
 * Client Componentから
 * Demo Mode状態を取得する。
 */
export function useDemoMode(): DemoModeContextValue {
  const context =
    useContext(
      DemoModeContext,
    );

  if (context === undefined) {
    throw new Error(
      "useDemoMode must be used within DemoModeProvider.",
    );
  }

  return context;
}
