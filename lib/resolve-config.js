export default function resolveConfig({changelogFile, changelogTitle, releaseJson = {}}) {
  return {
    changelogFile: changelogFile ?? 'CHANGELOG.md',
    changelogTitle,

    releaseJson: {
      enabled: releaseJson.enabled !== false,

      path: releaseJson.path ?? 'release.json',

      downloadUrlTemplate: releaseJson.downloadUrlTemplate,

      signatureUrlTemplate: releaseJson.signatureUrlTemplate,

      publicKeyPath: releaseJson.publicKeyPath,
    },
  };
}
