import { screen, checkSettings, renderSingleSettings, checkModalSetting } from '@nocobase/test/client';
import { ButtonEditor } from '../Action.Designer';

describe('Action.Designer', () => {
  test('ButtonEditor', async () => {
    const oldTitle = 'title';
    const newTitle = 'new title';
    const newIcon = 'alipay-circle';
    const newBackgroundColor = 'Danger red';

    const { container } = await renderSingleSettings({
      Component: ButtonEditor,
      schema: {
        title: oldTitle,
        'x-component': 'Action',
      },
    });

    await checkModalSetting({
      title: 'Edit button',
      modalChecker: {
        formItems: [
          {
            type: 'input',
            label: 'Button title',
            oldValue: oldTitle,
            newValue: newTitle,
          },
          {
            type: 'icon',
            label: 'Button icon',
            newValue: newIcon,
          },
          {
            type: 'radio',
            label: 'Button background color',
            oldValue: 'Default',
            newValue: newBackgroundColor,
          },
        ],
        afterSubmit: () => {
          const button = container.querySelector(`button[aria-label="action-Action-${newTitle}"]`);
          expect(button).toBeInTheDocument();
          expect(button).toHaveTextContent(newTitle);
          expect(button).toHaveClass('ant-btn-dangerous');
          expect(button.querySelector(`span[aria-label=${newIcon}]`)).toBeInTheDocument();
        },
      },
    });
  });
});
