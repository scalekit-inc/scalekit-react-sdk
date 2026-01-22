import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ScalekitAuthProvider } from '../../src/ScalekitAuthProvider';
import { ScalekitAuthProviderProps } from '../../src/types';

const defaultConfig: Omit<ScalekitAuthProviderProps, 'children'> = {
  environmentUrl: 'https://test.scalekit.cloud',
  clientId: 'test-client-id',
  redirectUri: 'http://localhost:5173/callback',
};

interface WrapperProps {
  children: ReactNode;
}

export function createWrapper(
  configOverrides: Partial<ScalekitAuthProviderProps> = {}
): React.FC<WrapperProps> {
  return function Wrapper({ children }: WrapperProps) {
    return (
      <ScalekitAuthProvider {...defaultConfig} {...configOverrides}>
        {children}
      </ScalekitAuthProvider>
    );
  };
}

export function renderWithProvider(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    providerProps?: Partial<ScalekitAuthProviderProps>;
  }
) {
  const { providerProps, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper(providerProps),
    ...renderOptions,
  });
}

export { render };
