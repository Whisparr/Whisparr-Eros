// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fixupPluginRules } = require('@eslint/compat');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const globals = require('globals');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require('@typescript-eslint/parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsPlugin = require('@typescript-eslint/eslint-plugin');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const prettierPlugin = require('eslint-plugin-prettier');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const prettierConfig = require('eslint-config-prettier');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactPlugin = require('eslint-plugin-react');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactHooksPlugin = require('eslint-plugin-react-hooks');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const simpleImportSort = require('eslint-plugin-simple-import-sort');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const importPlugin = require('eslint-plugin-import');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const filenamesPlugin = require('eslint-plugin-filenames');

const frontendFolder = path.join(__dirname, 'frontend');

const dirs = fs
  .readdirSync(path.join(frontendFolder, 'src'), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .join('|');

const importSortGroups = [
  ['^@?\\w', `^(${dirs})(/.*|$)`, '^\\.', '^\\..*css$']
];

const sharedGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.commonjs,
  expect: 'readonly',
  chai: 'readonly',
  sinon: 'readonly',
  JSX: 'writable',
  globalThis: 'writable'
};

const baseRules = {
  'filenames/match-exported': ['error'],

  // ECMAScript 6

  'arrow-body-style': [0],
  'arrow-parens': ['error', 'always'],
  'arrow-spacing': ['error', { before: true, after: true }],
  'constructor-super': 'error',
  'generator-star-spacing': 'off',
  'no-class-assign': 'error',
  'no-confusing-arrow': 'error',
  'no-const-assign': 'error',
  'no-dupe-class-members': 'error',
  'no-duplicate-imports': 'error',
  'no-new-symbol': 'error',
  'no-this-before-super': 'error',
  'no-useless-escape': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-constructor': 'error',
  'no-var': 'warn',
  'object-shorthand': ['error', 'properties'],
  'prefer-arrow-callback': 'error',
  'prefer-const': 'warn',
  'prefer-rest-params': 'off',
  'prefer-spread': 'warn',
  'prefer-template': 'error',
  'require-yield': 'off',
  'template-curly-spacing': ['error', 'never'],
  'yield-star-spacing': 'off',

  // Possible Errors

  'comma-dangle': 'error',
  'no-cond-assign': 'error',
  'no-console': 'off',
  'no-constant-condition': 'warn',
  'no-control-regex': 'error',
  'no-debugger': 'off',
  'no-dupe-args': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'warn',
  'no-empty-character-class': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'error',
  'no-extra-parens': ['error', 'functions'],
  'no-extra-semi': 'error',
  'no-func-assign': 'error',
  'no-inner-declarations': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-obj-calls': 'error',
  'no-regex-spaces': 'error',
  'no-sparse-arrays': 'error',
  'no-unexpected-multiline': 'error',
  'no-unreachable': 'warn',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',

  // Best Practices

  'accessor-pairs': 'off',
  'array-callback-return': 'warn',
  'block-scoped-var': 'warn',
  'consistent-return': 'off',
  curly: 'error',
  'default-case': 'error',
  'dot-location': ['error', 'property'],
  'dot-notation': 'error',
  eqeqeq: ['error', 'smart'],
  'guard-for-in': 'error',
  'no-alert': 'warn',
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-div-regex': 'error',
  'no-else-return': 'error',
  'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
  'no-empty-pattern': 'error',
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-fallthrough': 'error',
  'no-floating-decimal': 'error',
  'no-implicit-coercion': ['error', {
    boolean: false,
    number: true,
    string: true,
    allow: []
  }],
  'no-implicit-globals': 'error',
  'no-implied-eval': 'error',
  'no-invalid-this': 'off',
  'no-iterator': 'error',
  'no-labels': 'error',
  'no-lone-blocks': 'error',
  'no-loop-func': 'error',
  'no-magic-numbers': ['off', { ignoreArrayIndexes: true, ignore: [0, 1] }],
  'no-multi-spaces': 'error',
  'no-multi-str': 'error',
  'no-global-assign': 'error',
  'no-new': 'off',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-octal': 'error',
  'no-octal-escape': 'error',
  'no-param-reassign': 'off',
  'no-proto': 'error',
  'no-redeclare': 'error',
  'no-return-assign': 'warn',
  'no-script-url': 'error',
  'no-self-assign': 'error',
  'no-self-compare': 'error',
  'no-sequences': 'error',
  'no-throw-literal': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unused-expressions': 'error',
  'no-unused-labels': 'error',
  'no-useless-call': 'error',
  'no-useless-concat': 'error',
  'no-void': 'error',
  'no-warning-comments': 'off',
  'no-with': 'error',
  // eslint 10 dropped the redundant-radix check; 'as-needed' is now a dead
  // option that the rule never reads, so it enforces plain 'always'.
  radix: 'error',
  'vars-on-top': 'off',
  'wrap-iife': ['error', 'inside'],
  yoda: 'error',

  // Strict Mode

  strict: ['error', 'never'],

  // Variables

  'init-declarations': ['error', 'always'],
  'no-delete-var': 'error',
  'no-label-var': 'error',
  'no-restricted-globals': 'off',
  'no-shadow': 'error',
  'no-shadow-restricted-names': 'error',
  'no-undef': 'error',
  'no-undef-init': 'off',
  'no-undefined': 'off',
  'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
  'no-use-before-define': 'error',

  // Stylistic Issues

  'array-bracket-spacing': ['error', 'never'],
  'block-spacing': ['error', 'always'],
  'brace-style': ['error', '1tbs', { allowSingleLine: false }],
  camelcase: 'off',
  'comma-spacing': ['error', { before: false, after: true }],
  'comma-style': ['error', 'last'],
  'computed-property-spacing': ['error', 'never'],
  'consistent-this': ['error', 'self'],
  'eol-last': 'error',
  'func-names': 'off',
  'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
  indent: ['error', 2, { SwitchCase: 1 }],
  'key-spacing': ['error', { beforeColon: false, afterColon: true }],
  'keyword-spacing': ['error', { before: true, after: true }],
  'lines-around-comment': ['error', { beforeBlockComment: true, afterBlockComment: false }],
  'max-depth': ['error', { maximum: 5 }],
  'max-nested-callbacks': ['error', 4],
  'max-statements': 'off',
  'max-statements-per-line': ['error', { max: 1 }],
  'new-cap': ['error', { capIsNewExceptions: ['$.Deferred', 'DragDropContext', 'DragLayer', 'DragSource', 'DropTarget'] }],
  'new-parens': 'error',
  'no-array-constructor': 'error',
  'no-bitwise': 'error',
  'no-continue': 'error',
  'no-inline-comments': 'off',
  'no-lonely-if': 'warn',
  'no-mixed-spaces-and-tabs': 'error',
  'no-multiple-empty-lines': ['error', { max: 1 }],
  'no-negated-condition': 'warn',
  'no-nested-ternary': 'error',
  'no-new-object': 'error',
  'no-plusplus': 'off',
  'no-restricted-syntax': 'off',
  'no-trailing-spaces': 'error',
  'no-underscore-dangle': ['error', { allowAfterThis: true }],
  'no-unneeded-ternary': 'error',
  'no-whitespace-before-property': 'error',
  'object-curly-spacing': ['error', 'always'],
  'one-var': ['error', 'never'],
  'one-var-declaration-per-line': ['error', 'always'],
  'operator-assignment': ['off', 'never'],
  'operator-linebreak': ['error', 'after'],
  'quote-props': ['error', 'as-needed'],
  quotes: ['error', 'single'],
  semi: 'error',
  'semi-spacing': ['error', { before: false, after: true }],
  'sort-vars': 'off',
  'space-before-blocks': ['error', 'always'],
  'space-before-function-paren': ['error', 'never'],
  'space-in-parens': 'off',
  'space-infix-ops': 'off',
  'space-unary-ops': 'off',
  'spaced-comment': 'error',
  'wrap-regex': 'error',

  // ImportSort

  'simple-import-sort/imports': 'error',
  'import/newline-after-import': 'error',

  // React

  'react/jsx-boolean-value': [2, 'always'],
  'react/jsx-uses-vars': 2,
  'react/jsx-closing-bracket-location': 2,
  'react/jsx-tag-spacing': ['error'],
  'react/jsx-curly-spacing': [2, 'never'],
  'react/jsx-equals-spacing': [2, 'never'],
  'react/jsx-indent-props': [2, 2],
  'react/jsx-indent': [2, 2, { indentLogicalExpressions: true }],
  'react/jsx-key': 2,
  'react/jsx-no-bind': [2, { allowArrowFunctions: true }],
  'react/jsx-no-duplicate-props': [2, { ignoreCase: true }],
  'react/jsx-max-props-per-line': [2, { maximum: 2 }],
  'react/jsx-handler-names': [2, { eventHandlerPrefix: '(on|dispatch)', eventHandlerPropPrefix: 'on' }],
  'react/jsx-no-undef': 2,
  'react/jsx-pascal-case': 2,
  'react/jsx-uses-react': 2,
  'react/no-did-mount-set-state': 0,
  'react/no-did-update-set-state': 0,
  'react/no-direct-mutation-state': 2,
  'react/no-multi-comp': [2, { ignoreStateless: true }],
  'react/no-unknown-property': 2,
  'react/prefer-es6-class': 2,
  'react/prop-types': 2,
  'react/react-in-jsx-scope': 2,
  'react/self-closing-comp': 2,
  'react/sort-comp': 2,
  'react/jsx-wrap-multilines': 2,
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error'
};

const tsRecommendedRules = tsPlugin.configs.recommended.rules;

const tsRules = {
  ...tsRecommendedRules,
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'after-used',
      argsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }
  ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  'no-shadow': 'off',
  'prettier/prettier': 'error',
  'simple-import-sort/imports': [
    'error',
    {
      groups: importSortGroups
    }
  ],

  // React Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error',

  // React
  'react/function-component-definition': 'error',
  'react/hook-use-state': 'error',
  'react/jsx-boolean-value': ['error', 'always'],
  'react/jsx-curly-brace-presence': [
    'error',
    { props: 'never', children: 'never' }
  ],
  'react/jsx-fragments': 'error',
  'react/jsx-handler-names': [
    'error',
    {
      eventHandlerPrefix: 'on',
      eventHandlerPropPrefix: 'on'
    }
  ],

  /* fires erroneously when using functions defined outside of the render scope */
  /* setting allowFunctions to true to disable that check */
  'react/jsx-no-bind': [
    'error',
    {
      ignoreRefs: true,
      allowArrowFunctions: false,
      allowFunctions: true,
      allowBind: false,
      ignoreDOMComponents: true
    }
  ],
  'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
  'react/jsx-sort-props': [
    'error',
    {
      callbacksLast: true,
      noSortAlphabetically: true,
      reservedFirst: true
    }
  ],
  'react/prop-types': 'off',
  'react/self-closing-comp': 'error'
};

module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: ['**/JsLibraries/**', '**/*.css.d.ts']
  },

  // Base config: shared plugins + settings + rules for all frontend files
  {
    files: ['frontend/**/*.js', 'frontend/**/*.ts', 'frontend/**/*.tsx'],
    plugins: {
      filenames: fixupPluginRules(filenamesPlugin),
      react: fixupPluginRules(reactPlugin),
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
      import: importPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: baseRules
  },

  // JS files — babel parser
  {
    files: ['frontend/**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          impliedStrict: true
        }
      },
      globals: sharedGlobals
    },
    rules: {
      ...prettierConfig.rules,
      'simple-import-sort/imports': [
        'error',
        {
          groups: importSortGroups
        }
      ]
    }
  },

  // TS/TSX files — TypeScript parser + prettier
  {
    files: ['frontend/**/*.ts', 'frontend/**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: path.join(frontendFolder, 'tsconfig.json')
      },
      globals: sharedGlobals
    },
    rules: {
      ...tsRules,
      ...prettierConfig.rules,

      // API paths must be built with Utilities/Fetch/getQueryPath, which is the
      // only place that applies the url base. Hardcoding the api root drops it
      // and breaks every install behind a reverse proxy.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/\\/api\\/v\\d/]',
          message:
            'Do not hardcode the api root. Build the path with getQueryPath from Utilities/Fetch/getQueryPath.'
        },
        {
          selector: 'TemplateElement[value.raw=/\\/api\\/v\\d/]',
          message:
            'Do not hardcode the api root. Build the path with getQueryPath from Utilities/Fetch/getQueryPath.'
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/Utilities/Fetch/fetchJson', 'Utilities/Fetch/fetchJson'],
              importNames: ['apiRoot', 'urlBase'],
              message:
                'fetchJson does not root paths. Use getQueryPath from Utilities/Fetch/getQueryPath instead of assembling one from parts.'
            }
          ]
        }
      ]
    }
  },

  // getQueryPath owns the api root, so the guards above cannot apply to it
  {
    files: ['frontend/src/Utilities/Fetch/getQueryPath.ts'],
    rules: {
      'no-restricted-syntax': 'off'
    }
  },

  // CSS .d.ts override
  {
    files: ['**/*.css.d.ts'],
    rules: {
      'filenames/match-exported': 'off',
      'init-declarations': 'off',
      'prettier/prettier': 'off'
    }
  }
];
