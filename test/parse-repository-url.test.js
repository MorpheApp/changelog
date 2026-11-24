import test from 'ava';
import parseRepositoryUrl from '../lib/parse-repository-url.js';

const parse = test.macro({
  exec(t, url, host, {owner = 'owner', repo = 'repo'} = {}) {
    t.deepEqual(parseRepositoryUrl(url), {host, owner, repo});
  },
  title: (_, url) => `Parse ${url}`,
});

test(parse, 'https://github.com/owner/repo.git', 'github.com');
test(parse, 'git@github.com:owner/repo.git', 'github.com');
test(parse, 'ssh://git@ssh.github.com:443/owner/repo.git', 'github.com');
test(parse, 'https://codeberg.org/owner/repo', 'codeberg.org');
test(parse, 'https://user:token@codeberg.org/owner/repo.git', 'codeberg.org');
test(parse, 'git@codeberg.org:owner/repo.git', 'codeberg.org');
test(parse, 'ssh://git@codeberg.org/owner/repo.git', 'codeberg.org');
test(parse, 'git+https://codeberg.org/owner/repo.git', 'codeberg.org');
test(parse, 'git+https://git.example.com:3000/owner/repo.git', 'git.example.com:3000');
test(parse, 'ssh://git@git.example.com:2222/owner/repo.git', 'git.example.com');
test(parse, 'https://git.example.com:3000/owner/repo.git/', 'git.example.com:3000');
test(parse, 'https://gitlab.com/group/subgroup/repo.git', 'gitlab.com', {owner: 'group/subgroup'});
test(parse, 'https://codeberg.org/owner/repo.name.git', 'codeberg.org', {repo: 'repo.name'});

const reject = test.macro({
  exec(t, url) {
    const {name, code} = t.throws(() => parseRepositoryUrl(url));
    t.is(name, 'SemanticReleaseError');
    t.is(code, 'EINVALIDREPOSITORYURL');
  },
  title: (_, url) => `Throw SemanticReleaseError for "${url}"`,
});

test(reject, '/local/path/repo.git');
test(reject, 'file:///local/repo.git');
test(reject, 'https://codeberg.org/repo');
test(reject, '');
