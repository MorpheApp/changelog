import getError from './get-error.js';

const splitHostAndPath = (repositoryUrl) => {
  if (URL.canParse(repositoryUrl)) {
    const {protocol, host, hostname, pathname} = new URL(repositoryUrl);
    // An SSH port is not the port of the website
    return [/^(?:git\+)?https?:$/v.test(protocol) ? host : hostname, pathname];
  }

  // SCP style, such as git@codeberg.org:owner/repo.git
  return /^(?:[^\/@]+@)?([^\/:@]+):(.+)$/v.exec(repositoryUrl)?.slice(1) ?? ['', ''];
};

/**
 * Parse the host, owner and name of a repository on any Git host.
 * The owner of a repository in GitLab subgroups contains slashes.
 * Never includes the credentials semantic-release adds to the URL.
 */
export default function parseRepositoryUrl(repositoryUrl) {
  const [host, pathname] = splitHostAndPath(repositoryUrl);
  const segments = pathname
    .replace(/\/+$/v, '')
    .replace(/\.git$/v, '')
    .split('/')
    .filter(Boolean);
  const repo = segments.pop();
  const owner = segments.join('/');

  if (!host || !owner || !repo) {
    throw getError('EINVALIDREPOSITORYURL');
  }

  // GitHub and GitLab use other host names for SSH over the HTTPS port
  return {host: host.replace(/^(?:ssh\.(?=github\.com$)|altssh\.(?=gitlab\.com$))/v, ''), owner, repo};
}
