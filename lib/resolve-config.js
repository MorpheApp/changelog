const {isNil} = require('lodash');

module.exports = ({changelogFile, changelogTitle, releaseJson = {}}) => ({
  changelogFile: isNil(changelogFile) ? 'CHANGELOG.md' : changelogFile,
  changelogTitle,

  releaseJson: {
    enabled:
      !Object.prototype.hasOwnProperty.call(releaseJson, 'enabled') ||
      releaseJson.enabled !== false,

    path: isNil(releaseJson.path) ? 'release.json' : releaseJson.path,

    downloadUrlTemplate:
      isNil(releaseJson.downloadUrlTemplate)
        ? 'https://github.com/${owner}/${repo}/releases/download/v${version}/app-release-${version}.apk'
        : releaseJson.downloadUrlTemplate,

    signatureUrlTemplate:
      isNil(releaseJson.signatureUrlTemplate)
        ? 'https://github.com/${owner}/${repo}/releases/download/v${version}/app-release-${version}.apk.asc'
        : releaseJson.signatureUrlTemplate,
  },
});
