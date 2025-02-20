import React, { ComponentType } from 'react';
import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { set, get, pick } from 'lodash';
import { useFieldSchema, observer } from '@formily/react';

import {
  AntdSchemaComponentPlugin,
  Application,
  ApplicationOptions,
  CollectionPlugin,
  DataBlockProvider,
  LocalDataSource,
  SchemaComponent,
  SchemaSettings,
  SchemaSettingsPlugin,
  // @ts-ignore
} from '@nocobase/client';

import dataSourceMainCollections from './dataSourceMainCollections.json';
import dataSource2 from './dataSource2.json';
import dataSourceMainData from './dataSourceMainData.json';
import _ from 'lodash';

const defaultApis = {
  'uiSchemas:patch': { data: { result: 'ok' } },
  'uiSchemas:saveAsTemplate': { data: { result: 'ok' } },
  ...dataSourceMainData,
};

export * from './utils';

type URL = string;
type ResponseData = any;

type MockApis = Record<URL, ResponseData>;
type AppOrOptions = Application | ApplicationOptions;

function getProcessMockData(apis: Record<string, any>, key: string) {
  return (config: AxiosRequestConfig) => {
    if (!apis[key]) return [404, { data: { message: 'mock data not found' } }];
    if (config?.params?.pageSize || config?.params?.page) {
      const { data, meta } = apis[key];

      const pageSize = config.params.pageSize || meta?.pageSize;
      const page = config.params.page || meta?.page;
      return [200, { data: data.slice(pageSize * (page - 1), pageSize), meta: { ...meta, page, pageSize } }];
    }
    return [200, apis[key]];
  };
}

export const mockApi = (axiosInstance: AxiosInstance, apis: MockApis = {}) => {
  const mock = new MockAdapter(axiosInstance);
  Object.keys(apis).forEach((key) => {
    mock.onAny(key).reply(getProcessMockData(apis, key));
  });

  return (apis: MockApis = {}) => {
    Object.keys(apis).forEach((key) => {
      mock.onAny(key).reply(getProcessMockData(apis, key));
    });
  };
};

export const mockAppApi = (app: Application, apis: MockApis = {}) => {
  const mock = mockApi(app.apiClient.axios, apis);
  return mock;
};

export interface GetAppOptions {
  appOptions?: AppOrOptions;
  providers?: (ComponentType | [ComponentType, any])[];
  apis?: MockApis;
  designable?: boolean;
  schemaSettings?: SchemaSettings;
  disableAcl?: boolean;
  enableMultipleDataSource?: boolean;
}

export const getApp = (options: GetAppOptions) => {
  const {
    appOptions = {},
    schemaSettings,
    providers,
    disableAcl = true,
    apis: optionsApis = {},
    enableMultipleDataSource,
    designable,
  } = options;
  const app =
    appOptions instanceof Application
      ? appOptions
      : new Application({
          ...appOptions,
          disableAcl: appOptions.disableAcl || disableAcl,
          designable: appOptions.designable || designable,
        });
  if (providers) {
    app.addProviders(providers);
  }

  if (schemaSettings) {
    app.schemaSettingsManager.add(schemaSettings);
  }

  app.addComponents({ CommonSchemaComponent });

  app.pluginManager.add(AntdSchemaComponentPlugin);
  app.pluginManager.add(SchemaSettingsPlugin);
  app.pluginManager.add(CollectionPlugin, { config: { enableRemoteDataSource: false } });

  const apis = Object.assign({}, defaultApis, optionsApis);

  app.getCollectionManager().addCollections(dataSourceMainCollections as any);

  if (enableMultipleDataSource) {
    app.dataSourceManager.addDataSource(LocalDataSource, dataSource2 as any);
  }

  mockAppApi(app, apis);

  const App = app.getRootComponent();

  return {
    App,
    app,
  };
};

export interface GetAppComponentOptions<V = any, Props = {}> extends GetAppOptions {
  schema?: any;
  Component?: ComponentType<Props>;
  value?: V;
  props?: Props;
  noWrapperSchema?: boolean;
  enableUserListDataBlock?: boolean;
  onChange?: (value: V) => void;
}

export const getAppComponent = (options: GetAppComponentOptions) => {
  const {
    schema: optionsSchema = {},
    Component,
    value,
    props,
    onChange,
    noWrapperSchema,
    enableUserListDataBlock,
    ...otherOptions
  } = options;

  if (noWrapperSchema) {
    const { App } = getApp(options);
    return App;
  }

  const schema = {
    type: 'object',
    name: 'test',
    default: value,
    'x-component': Component,
    'x-component-props': {
      onChange,
      ...props,
    },
    ...optionsSchema,
  };

  if (!schema.name) {
    schema.name = 'test';
  }

  if (!schema['x-uid']) {
    schema['x-uid'] = 'test';
  }

  if (!schema.type) {
    schema.type = 'void';
  }

  const TestDemo = () => {
    if (!enableUserListDataBlock) {
      return <SchemaComponent schema={schema} />;
    }
    return (
      <DataBlockProvider collection={'users'} action="list">
        <SchemaComponent schema={schema} />
      </DataBlockProvider>
    );
  };

  const { App } = getApp({
    ...otherOptions,
    providers: [TestDemo],
  });

  return App;
};

export function addXReadPrettyToEachLayer(obj: Record<string, any> = {}) {
  // 为当前层添加 'x-read-pretty' 属性
  obj['x-read-pretty'] = true;

  // 递归遍历对象的每个属性
  _.forOwn(obj, (value, key) => {
    if (_.isObject(value)) {
      addXReadPrettyToEachLayer(value);
    }
  });

  return obj;
}

export const getReadPrettyAppComponent = (options: GetAppComponentOptions) => {
  return getAppComponent({ ...options, schema: addXReadPrettyToEachLayer(options.schema) });
};

interface GetAppComponentWithSchemaSettingsOptions extends GetAppComponentOptions {
  settingPath?: string;
}

export function setSchemaWithSettings(options: GetAppComponentWithSchemaSettingsOptions) {
  const { Component, settingPath } = options;
  const SINGLE_SETTINGS_NAME = 'testSettings';
  const testSettings = new SchemaSettings({
    name: SINGLE_SETTINGS_NAME,
    items: [
      {
        name: 'test',
        Component,
      },
    ],
  });

  if (!options.schema) {
    options.schema = {};
  }

  if (settingPath) {
    const schema = get(options.schema, settingPath);
    schema['x-settings'] = SINGLE_SETTINGS_NAME;
  } else {
    options.schema['x-settings'] = SINGLE_SETTINGS_NAME;
  }

  if (!options.appOptions) {
    options.appOptions = {};
  }

  if (options.appOptions instanceof Application) {
    options.appOptions.schemaSettingsManager.add(testSettings);
  } else {
    if (!options.appOptions.schemaSettings) {
      options.appOptions.schemaSettings = [];
    }
    options.appOptions.schemaSettings.push(testSettings);
  }
}

export const getAppComponentWithSchemaSettings = (options: GetAppComponentWithSchemaSettingsOptions) => {
  setSchemaWithSettings(options);
  const App = getAppComponent(options);
  return App;
};

export const getReadPrettyAppComponentWithSchemaSettings = (options: GetAppComponentWithSchemaSettingsOptions) => {
  setSchemaWithSettings(options);

  set(options.schema, 'x-read-pretty', true);

  const App = getAppComponent(options);
  return App;
};

export function withSchema(Component: ComponentType, name?: string) {
  const ComponentValue = observer((props) => {
    const schema = useFieldSchema();
    const schemaValue = pick(schema.toJSON(), [
      'title',
      'description',
      'enum',
      'x-component-props',
      'x-decorator-props',
      'x-linkage-rules',
    ]);
    return (
      <>
        <pre data-testid={name ? `test-schema-${name}` : `test-schema`}>
          {JSON.stringify(schemaValue, undefined, 2)}
        </pre>
        <Component {...props} />
      </>
    );
  });

  ComponentValue.displayName = `withSchema(${Component.displayName || Component.name})`;

  return ComponentValue;
}

export const CommonSchemaComponent = withSchema(function CommonSchemaComponent(props: any) {
  return <>{props.children}</>;
});
