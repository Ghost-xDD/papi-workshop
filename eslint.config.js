import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  rules: {
    'no-alert': 'off',
    'no-console': 'off',
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
  },
});
