import path from 'node:path';
import {readFile} from 'node:fs/promises';
import test from 'ava';
import {outputFile} from 'fs-extra/esm';
import {stub} from 'sinon';
import prepare from '../lib/prepare.js';
import tempDirectory from './helpers/temp-directory.js';

// Most tests are about the changelog file alone
const releaseJson = {enabled: false};

test.beforeEach((t) => {
  // Stub the logger
  t.context.log = stub();
  t.context.logger = {log: t.context.log};
});

test('Create new CHANGELOG.md', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogFile = 'CHANGELOG.md';
  const changelogPath = path.resolve(cwd, changelogFile);

  await prepare({releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  // Verify the content of the CHANGELOG.md
  t.is(await readFile(changelogPath, 'utf8'), `${notes}\n`);

  t.deepEqual(t.context.log.args[0], ['Create %s', changelogPath]);
});

test('Create new changelog with custom path', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogFile = 'docs/changelog.txt';
  const changelogPath = path.resolve(cwd, 'docs/changelog.txt');

  await prepare({changelogFile, releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  // Verify the content of the CHANGELOG.md
  t.is(await readFile(changelogPath, 'utf8'), `${notes}\n`);

  t.deepEqual(t.context.log.args[0], ['Create %s', changelogPath]);
});

test('Prepend the CHANGELOG.md if there is an existing one', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogFile = 'CHANGELOG.md';
  const changelogPath = path.resolve(cwd, changelogFile);
  await outputFile(changelogPath, 'Initial CHANGELOG');

  await prepare({releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  // Verify the content of the CHANGELOG.md
  t.is(await readFile(changelogPath, 'utf8'), `${notes}\n\nInitial CHANGELOG\n`);
  t.deepEqual(t.context.log.args[0], ['Update %s', changelogPath]);
});

test('Prepend title in the CHANGELOG.md if there is none', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogTitle = '# My Changelog Title';
  const changelogFile = 'CHANGELOG.md';
  const changelogPath = path.resolve(cwd, changelogFile);
  await outputFile(changelogPath, 'Initial CHANGELOG');

  await prepare({changelogTitle, releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  t.is(await readFile(changelogPath, 'utf8'), `${changelogTitle}\n\n${notes}\n\nInitial CHANGELOG\n`);
});

test('Keep the title at the top of the CHANGELOG.md', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogTitle = '# My Changelog Title';
  const changelogFile = 'CHANGELOG.md';
  const changelogPath = path.resolve(cwd, changelogFile);
  await outputFile(changelogPath, `${changelogTitle}\n\nInitial CHANGELOG`);

  await prepare({changelogTitle, releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  t.is(await readFile(changelogPath, 'utf8'), `${changelogTitle}\n\n${notes}\n\nInitial CHANGELOG\n`);
});

test.serial('Create new changelog with title if specified', async (t) => {
  const cwd = tempDirectory();
  const notes = 'Test release note';
  const changelogTitle = '# My Changelog Title';
  const changelogFile = 'HISTORY.md';
  const changelogPath = path.resolve(cwd, changelogFile);

  await prepare({changelogTitle, changelogFile, releaseJson}, {cwd, nextRelease: {notes}, logger: t.context.logger});

  t.is(await readFile(changelogPath, 'utf8'), `${changelogTitle}\n\n${notes}\n`);
});

test('Publish the public key in the release JSON if the key file exists', async (t) => {
  const cwd = tempDirectory();
  const context = {
    cwd,
    nextRelease: {notes: 'Test release note', version: '1.0.0'},
    logger: t.context.logger,
    options: {repositoryUrl: 'https://github.com/owner/repo.git'},
  };
  const publishingConfig = {releaseJson: {path: 'patches-bundle.json', publicKeyPath: 'morphe-signing.pub'}};
  const readReleaseJson = async () => JSON.parse(await readFile(path.resolve(cwd, 'patches-bundle.json'), 'utf8'));

  await prepare(publishingConfig, context);
  const unsigned = await readReleaseJson();
  t.false('public_key' in unsigned);

  await outputFile(path.resolve(cwd, 'morphe-signing.pub'), 'A6EHv/POEL4dcN0Y50vAmWfk1jCbpQ1fHdyGZBJVMbg=\n');
  await prepare(publishingConfig, context);
  const signed = await readReleaseJson();
  t.is(signed.public_key, 'A6EHv/POEL4dcN0Y50vAmWfk1jCbpQ1fHdyGZBJVMbg=');
});
