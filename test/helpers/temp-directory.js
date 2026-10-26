import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

export default function temporaryDirectory() {
  return mkdtempSync(path.join(tmpdir(), 'changelog-'));
}
