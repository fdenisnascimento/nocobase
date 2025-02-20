import { renderApp, screen, userEvent, waitFor, renderReadPrettyApp } from '@nocobase/test/client';
import { DataSourceSelect } from '../CollectionSelect';

describe('DataSourceSelect', () => {
  test('single', async () => {
    await renderApp({
      Component: DataSourceSelect,
    });

    await userEvent.click(document.querySelector('.ant-select-selector'));
    await waitFor(() => {
      expect(screen.queryByText('Main')).toBeInTheDocument();
    });
  });

  test('multiple', async () => {
    await renderApp({
      enableMultipleDataSource: true,
      schema: {
        type: 'string',
        'x-component': DataSourceSelect,
      },
    });

    await userEvent.click(document.querySelector('.ant-select-selector'));
    await waitFor(() => {
      expect(screen.queryByText('Main')).toBeInTheDocument();
      expect(screen.queryByText('Data Source 2')).toBeInTheDocument();
    });
  });

  test('change', async () => {
    await renderApp({
      enableMultipleDataSource: true,
      schema: {
        type: 'string',
        'x-component': DataSourceSelect,
      },
    });

    await userEvent.click(document.querySelector('.ant-select-selector'));
    await waitFor(() => {
      expect(screen.queryByText('Main')).toBeInTheDocument();
    });
  });

  test('filter', async () => {
    await renderApp({
      enableMultipleDataSource: true,
      schema: {
        type: 'string',
        'x-component': DataSourceSelect,
        'x-component-props': {
          filter(item: any) {
            return item.key === 'main';
          },
        },
      },
    });

    await userEvent.click(document.querySelector('.ant-select-selector'));
    await waitFor(() => {
      expect(screen.queryByText('Main')).toBeInTheDocument();
      expect(screen.queryByText('Data Source 2')).not.toBeInTheDocument();
    });
  });

  // 组件并没有实现这个功能，所以 skip
  test.skip('read pretty', async () => {
    await renderReadPrettyApp({
      value: 'dataSource2',
      enableMultipleDataSource: true,
      schema: {
        type: 'string',
        'x-component': DataSourceSelect,
      },
    });

    expect(screen.queryByText('Data Source 2')).toBeInTheDocument();
  });
});
