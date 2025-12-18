# @MorpheApp/changelog

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to create or update a changelog file.

> [!WARNING]
> Please consider whether committing release notes to a file is worth the [added complexity](https://semantic-release.gitbook.io/semantic-release/support/faq#should-release-notes-be-committed-to-a-changelog.md-in-my-repository-during-a-release) compared to other available options for capturing release notes.

| Step               | Description                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify the `changelogFile` and `changelogTitle` options configuration.                                                                                                                                |
| `prepare`          | Create or update a changelog file in the local project directory with the changelog content created in the [generate notes step](https://github.com/semantic-release/semantic-release#release-steps). |

## Install

```bash
$ npm install --save-dev git+https://github.com/MorpheApp/changelog.git#bundle
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@MorpheApp/changelog",
      {
        "changelogFile": "docs/CHANGELOG.md",
        "releaseJson": {
          "enabled": true,
          "path": "docs/release.json",
          "downloadUrlTemplate": "https://github.com/${owner}/${repo}/releases/download/v${version}/app-release-${version}.apk",
          "signatureUrlTemplate": "https://github.com/${owner}/${repo}/releases/download/v${version}/app-release-${version}.apk.asc"
        }
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": [
          "docs/CHANGELOG.md",
          "docs/release.json"
        ]
      }
    ]
  ]
}
```

With this configuration:

- `docs/CHANGELOG.md` will be created or updated on each release.

- `docs/release.json` will be generated alongside the changelog.

- Download URLs inside `docs/release.json` will be generated from templates.

- Both files will be committed as part of the release.

## Configuration

### Options

#### Changelog options

| Options          | Description                                           | Default        |
| ---------------- | ----------------------------------------------------- | -------------- |
| `changelogFile`  | File path of the changelog.                           | `CHANGELOG.md` |
| `changelogTitle` | Title of the changelog file (first line of the file). | -              |

#### `releaseJson` options

| Option                             | Description                                                                            | Default             |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ------------------- |
| `releaseJson.enabled`              | Enable or disable `release.json` generation.                                           | `true`              |
| `releaseJson.path`                 | Output path for `release.json`.                                                        | `release.json`      |
| `releaseJson.downloadUrlTemplate`  | Template for the primary download URL. Supports `${version}`, `${owner}`, `${repo}`.   | GitHub releases URL |
| `releaseJson.signatureUrlTemplate` | Template for the signature download URL. Supports `${version}`, `${owner}`, `${repo}`. | GitHub releases URL |

#### Template variables

The following variables are available in URL templates:

| Variable     | Description                                  |
| ------------ | -------------------------------------------- |
| `${version}` | The released version (`nextRelease.version`) |
| `${owner}`   | GitHub repository owner                      |
| `${repo}`    | GitHub repository name                       |

### Examples

When used with the [@semantic-release/git](https://github.com/semantic-release/git) or [@semantic-release/npm](https://github.com/semantic-release/npm) plugins the `@MorpheApp/changelog` plugin must be called before those plugins in order to update the changelog file so the [@semantic-release/git](https://github.com/semantic-release/git) and [@semantic-release/npm](https://github.com/semantic-release/npm) plugins can include it in the release.

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@MorpheApp/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```
