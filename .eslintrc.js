'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
const config = {
  root: true,
  extends: '@cherryblossom/eslint-config/node',
  reportUnusedDisableDirectives: true,
  parserOptions: {
    project: [
      'src/tsconfig.json',
      'tests/tsconfig.json',
      'types/tsconfig.json'
    ],
    tsconfigRootDir: __dirname,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
    warnOnUnsupportedTypeScriptVersion: false
  },
  overrides: [
    {
      files: ['*.config*.js', '**/*.eslintrc.js'],
      parserOptions: {
        project: './tsconfig.config.json',
        tsconfigRootDir: __dirname
      },
      settings: {
        jsdoc: {
          mode: 'typescript'
        }
      },
      rules: {
        camelcase: 0,
        'id-length': 0,
        'node/no-unpublished-require': 0
      }
    }
  ],
  rules: {
    // Allow URls to the Discord docs
    'jsdoc/require-description-complete-sentence': 0,
    'jsdoc/match-description': [
      1,
      {
        matchDescription:
          '^([A-Z`\\d_{][\\s\\S]*[.?!]|https://discord.com/developers/docs/[\\s\\S]+)$'
      }
    ]
  }
}
module.exports = config