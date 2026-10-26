import path from 'node:path';
import {readFile} from 'node:fs/promises';
import test from 'ava';
import {outputFile} from 'fs-extra/esm';
import {stub} from 'sinon';
import tempDirectory from './helpers/temp-directory.js';

// These tests are about the changelog file alone
const releaseJson = {enabled: false};

let imports = 0;

test.beforeEach(async (t) => {
  // A new instance of the plugin for each test, as it keeps whether it verified already
  imports++;
  t.context.m = await import(`../index.js?instance=${imports}`);
  // Stub the logger
  t.context.log = stub();
  t.context.logger = {log: t.context.log};
});

test.serial('Verify "changelogFile"', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogFile = 'docs/changelog.txt';

  await t.notThrowsAsync(t.context.m.verifyConditions({changelogFile}, {cwd, options: {}, nextRelease: {notes}}));
});

test.serial('Create new CHANGELOG.md', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogFile = 'docs/changelog.txt';
  const changelogPath = path.resolve(cwd, changelogFile);

  await t.context.m.prepare(
    {changelogFile, releaseJson},
    {cwd, options: {}, nextRelease: {notes}, logger: t.context.logger}
  );

  // Verify the content of the CHANGELOG.md
  t.is(await readFile(changelogPath, 'utf8'), `${notes}\n`);

  t.deepEqual(t.context.log.args[0], ['Create %s', changelogPath]);
});

test.serial('Skip changelog update if the release is empty', async (t) => {
  const cwd = tempDirectory();
  const changelogFile = 'CHANGELOG.txt';
  const changelogPath = path.resolve(cwd, changelogFile);
  await outputFile(changelogPath, 'Initial CHANGELOG');

  await t.context.m.prepare({}, {cwd, options: {}, nextRelease: {}, logger: t.context.logger});

  // Verify the content of the CHANGELOG.md
  t.is(await readFile(changelogPath, 'utf8'), 'Initial CHANGELOG');
});

test.serial('Verify only on the fist call', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogFile = 'docs/changelog.txt';
  const changelogPath = path.resolve(cwd, changelogFile);

  await t.context.m.verifyConditions(
    {changelogFile},
    {nextRelease: {notes}, options: {prepare: ['@semantic-release/git']}}
  );
  await t.context.m.prepare({changelogFile, releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  // Verify the content of the CHANGELOG.md
  t.is(await readFile(changelogPath, 'utf8'), `${notes}\n`);

  t.deepEqual(t.context.log.args[0], ['Create %s', changelogPath]);
});

test('Throw SemanticReleaseError if prepare "changelogFile" option is not a string', async (t) => {
  const cwd = tempDirectory();
  const changelogFile = 42;
  const {errors} = await t.throwsAsync(
    t.context.m.verifyConditions(
      {},
      {cwd, options: {prepare: ['@semantic-release/git', {path: '@semantic-release/changelog', changelogFile}]}}
    )
  );

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EINVALIDCHANGELOGFILE');
});
