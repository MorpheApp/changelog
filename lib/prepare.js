const path = require('path');
const {readFile, writeFile, ensureFile} = require('fs-extra');
const resolveConfig = require('./resolve-config.js');

module.exports = async (pluginConfig, context) => {
  const {cwd, nextRelease, logger, options} = context;
  const {notes, version} = nextRelease;

  const {changelogFile, changelogTitle, releaseJson} = resolveConfig(pluginConfig);
  const changelogPath = path.resolve(cwd, changelogFile);

  if (notes) {
    await ensureFile(changelogPath);
    const currentFile = (await readFile(changelogPath)).toString().trim();

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

      const httpsMatch = options.repositoryUrl.match(
        /github\.com[/:]([^/]+)\/([^/.]+)/
      );

      const owner = httpsMatch[1];
      const repo = httpsMatch[2];

      const applyTemplate = (template) =>
        template
          .replace(/\$\{version\}/g, version)
          .replace(/\$\{owner\}/g, owner)
          .replace(/\$\{repo\}/g, repo);

      const releaseData = {
        created_at: new Date().toISOString(),
        description: notes.trim(),
        download_url: applyTemplate(releaseJson.downloadUrlTemplate),
        signature_download_url: applyTemplate(releaseJson.signatureUrlTemplate),
        version,
      };

      await ensureFile(releaseJsonPath);
      await writeFile(`${releaseJsonPath}`,
        `${JSON.stringify(releaseData, null, 2)}\n`
      );

      logger.log('Create %s', releaseJsonPath);
    }
  }
};
