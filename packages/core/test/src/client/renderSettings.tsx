import { waitFor, screen } from '@testing-library/react';
import { GetAppComponentOptions } from '../web';
import userEvent from '@testing-library/user-event';
import { renderApp, renderReadPrettyApp } from './renderApp';
import { expectNoTsError } from './utils';

export async function showSettingsMenu(container: HTMLElement | Document = document) {
  await waitFor(() => {
    expectNoTsError(container.querySelector('[aria-label^="designer-schema-settings-"]')).toBeInTheDocument();
  });

  await userEvent.hover(container.querySelector('[aria-label^="designer-schema-settings-"]'));

  await waitFor(() => {
    expectNoTsError(screen.queryByTestId('schema-settings-menu')).toBeInTheDocument();
  });
}

export interface RenderSettingsOptions extends GetAppComponentOptions {
  container?: () => HTMLElement;
}
export const renderSettings = async (options: RenderSettingsOptions = {}) => {
  const { container = () => document, ...appOptions } = options;
  const result = await renderApp({ ...appOptions, designable: true });

  const containerElement = container();

  await showSettingsMenu(containerElement);

  return result;
};

export const renderReadPrettySettings = async (options: RenderSettingsOptions = {}) => {
  const { container = () => document, ...appOptions } = options;
  const result = await renderReadPrettyApp({ ...appOptions, designable: true });

  const containerElement = container();

  await showSettingsMenu(containerElement);

  return result;
};
