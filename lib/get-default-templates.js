export default function getDefaultTemplates(host) {
  // GitHub, Gitea and Forgejo (Codeberg) use the same release URLs, only GitLab differs
  const releaseUrl = host.split(/[.:]/v).includes('gitlab')
    ? 'https://${host}/${owner}/${repo}/-/releases/v${version}/downloads'
    : 'https://${host}/${owner}/${repo}/releases/download/v${version}';
  const downloadUrlTemplate = `${releaseUrl}/app-release-\${version}.apk`;

  return {downloadUrlTemplate, signatureUrlTemplate: `${downloadUrlTemplate}.asc`};
}
