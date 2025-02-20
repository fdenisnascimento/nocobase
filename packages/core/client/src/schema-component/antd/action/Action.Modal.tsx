import { css } from '@emotion/css';
import { observer, RecursionField, useField, useFieldSchema } from '@formily/react';
import { Modal, ModalProps } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { OpenSize, useActionContext } from '.';
import { useToken } from '../../../style';
import { useSetAriaLabelForModal } from './hooks/useSetAriaLabelForModal';
import { ComposedActionDrawer } from './types';

const openSizeWidthMap = new Map<OpenSize, string>([
  ['small', '40%'],
  ['middle', '60%'],
  ['large', '80%'],
]);
export const ActionModal: ComposedActionDrawer<ModalProps> = observer(
  (props) => {
    const { footerNodeName = 'Action.Modal.Footer', width, ...others } = props;
    const { visible, setVisible, openSize = 'middle', modalProps } = useActionContext();
    const actualWidth = width ?? openSizeWidthMap.get(openSize);
    const schema = useFieldSchema();
    const field = useField();
    const { token } = useToken();
    const footerSchema = schema.reduceProperties((buf, s) => {
      if (s['x-component'] === footerNodeName) {
        return s;
      }
      return buf;
    });
    const showFooter = !!footerSchema;
    if (process.env.__E2E__) {
      useSetAriaLabelForModal(visible);
    }

    return (
      <Modal
        width={actualWidth}
        title={field.title}
        {...(others as ModalProps)}
        {...modalProps}
        style={{
          ...modalProps?.style,
          ...others?.style,
        }}
        destroyOnClose
        open={visible}
        onCancel={() => setVisible(false, true)}
        className={classNames(
          others.className,
          modalProps?.className,
          css`
            &.nb-action-popup {
              .ant-modal-header {
                display: none;
              }

              .ant-modal-content {
                background: var(--nb-box-bg);
                border: 1px solid rgba(255, 255, 255, 0.1);
              }

              // 这里的样式是为了保证页面 tabs 标签下面的分割线和页面内容对齐（页面内边距可以通过主题编辑器调节）
              .ant-tabs-nav {
                padding-left: ${token.paddingLG - token.paddingPageHorizontal}px;
                padding-right: ${token.paddingLG - token.paddingPageHorizontal}px;
                margin-left: ${token.paddingPageHorizontal - token.paddingLG}px;
                margin-right: ${token.paddingPageHorizontal - token.paddingLG}px;
              }

              .ant-tabs-content-holder {
                padding: ${token.paddingPopupVertical}px ${token.paddingPopupHorizontal}px;
                margin: -${token.size}px -${token.paddingLG}px -${token.paddingLG}px;
              }

              .ant-modal-footer {
                display: ${showFooter ? 'block' : 'none'};
              }
            }
          `,
        )}
        footer={
          showFooter ? (
            <RecursionField
              basePath={field.address}
              schema={schema}
              onlyRenderProperties
              filterProperties={(s) => {
                return s['x-component'] === footerNodeName;
              }}
            />
          ) : (
            false
          )
        }
      >
        <RecursionField
          basePath={field.address}
          schema={schema}
          onlyRenderProperties
          filterProperties={(s) => {
            return s['x-component'] !== footerNodeName;
          }}
        />
      </Modal>
    );
  },
  { displayName: 'ActionModal' },
);

ActionModal.Footer = observer(
  () => {
    const field = useField();
    const schema = useFieldSchema();
    return <RecursionField basePath={field.address} schema={schema} onlyRenderProperties />;
  },
  { displayName: 'ActionModal.Footer' },
);

export default ActionModal;
