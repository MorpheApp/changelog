import path from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';
import {ensureFile, pathExists} from 'fs-extra/esm';
import resolveConfig from './resolve-config.js';

export default async function prepare(pluginConfig, context) {
  const {cwd, nextRelease, logger, options} = context;
  const {notes, version} = nextRelease;

  const {changelogFile, changelogTitle, releaseJson} = resolveConfig(pluginConfig);
  const changelogPath = path.resolve(cwd, changelogFile);

  if (notes) {
    await ensureFile(changelogPath);
    const changelog = await readFile(changelogPath, 'utf8');
    const currentFile = changelog.trim();

    if (currentFile) {
      logger.log('Update %s', changelogPath);
    } else {
      logger.log('Create %s', changelogPath);
    }

    const currentContent =
      changelogTitle && currentFile.startsWith(changelogTitle)
        ? currentFile.slice(changelogTitle.length).trim()
        : currentFile;
    const content = `${notes.trim()}\n${currentContent ? `\n${currentContent}\n` : ''}`;

    await writeFile(changelogPath, changelogTitle ? `${changelogTitle}\n\n${content}` : content);

    if (releaseJson.enabled) {
      const releaseJsonPath = path.resolve(cwd, releaseJson.path);

      const httpsMatch = options.repositoryUrl.match(/github\.com[\/:]([^\/]+)\/([^\/.]+)/v);

      const owner = httpsMatch[1];
      const repo = httpsMatch[2];

      const applyTemplate = (template) =>
        template.replaceAll('${version}', version).replaceAll('${owner}', owner).replaceAll('${repo}', repo);

      const releaseData = {
        created_at: new Date().toISOString().replace(/\.\d{3}Z$/v, ''),
        description: notes.trim(),
        download_url: applyTemplate(releaseJson.downloadUrlTemplate),
        signature_download_url: applyTemplate(releaseJson.signatureUrlTemplate),
        version,
      };

      // Patch sources publish the key their bundles are signed with, once they have one
      if (releaseJson.publicKeyPath) {
        const publicKeyPath = path.resolve(cwd, releaseJson.publicKeyPath);
        if (await pathExists(publicKeyPath)) {
          const publicKey = await readFile(publicKeyPath, 'utf8');
          releaseData.public_key = publicKey.trim();
        }
      }

      await ensureFile(releaseJsonPath);
      await writeFile(`${releaseJsonPath}`, `${JSON.stringify(releaseData, null, 2)}\n`);

      logger.log('Create %s', releaseJsonPath);
    }
  }
}
