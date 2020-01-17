# Contributing

## Commit Message Format

The commits in this repo follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).

Commit messages should be composed like this:

`type(scope?): subject #scope can be omitted`

Here are some examples:

`feat: add click endpoint`

`fix: correct relative imports`

`chore: update jsdom version`

### Types

The following _types_ can be used:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
- **refactor**: A code change that neither fixes a bug or adds a feature
- **test**: Adding missing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation
- **perf**: A code change that improves performance
- **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- **revert**: Reverts a previous commit

**Note:** You may use `npm run commit` to create commits interactively in the command line. You may find this easier if you have not used this type of commit formatting in the past.
