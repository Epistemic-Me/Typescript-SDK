module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:import/typescript'
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts']
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  ignorePatterns: [
    'src/generated/**/*',
    'dist/**/*',
    'node_modules/**/*',
    '*.js',
    '.eslintrc.cjs'
  ],
  rules: {
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index']
      ],
      'pathGroups': [
        { pattern: '@/**', group: 'internal' }
      ],
      'newlines-between': 'always'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/valid-title': 'error',
    'import/no-unresolved': ['error', {
      ignore: [
        '^@connectrpc/',
        '^@bufbuild/',
        '^@jest/',
        '^uuid$',
        '\\.pb$',
        '\\.connect$',
        '^../src/generated/'
      ]
    }],
    'import/namespace': 'off',
    'import/extensions': ['error', 'ignorePackages', {
      'js': 'never',
      'jsx': 'never',
      'ts': 'never',
      'tsx': 'never'
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }]
  },
  env: {
    node: true,
    jest: true,
    es2020: true
  },
  overrides: [{
    files: ['tests/**/*.ts'],
    rules: {
      'import/no-unresolved': ['error', {
        ignore: [
          '^@connectrpc/',
          '^@bufbuild/',
          '^@jest/',
          '^uuid$',
          '\\.pb$',
          '\\.connect$',
          '^../src/generated/'
        ]
      }]
    }
  }]
};