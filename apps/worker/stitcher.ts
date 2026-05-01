// FFmpeg stitcher — STUB.
// Today: writes a manifest JSON describing what we *would* stitch.
// Future (task 12 second pass): drive ffmpeg to:
//   ffmpeg -f concat -safe 0 -i <list.txt> -c:v libx264 -pix_fmt yuv420p \
//     -movflags +faststart -vf "drawtext=...labels..." <outputPath>
// and produce both .mp4 and .webm with normalised loudness + colourspace.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface StitchManifest {
  outputPath: string;
  clips: string[];
  createdAt: string;
  // TODO(task-12-followup): replace with ffmpeg invocation + render report.
  stub: true;
}

export async function stitch(
  clips: string[],
  outputPath: string,
): Promise<StitchManifest> {
  const manifest: StitchManifest = {
    outputPath,
    clips,
    createdAt: new Date().toISOString(),
    stub: true,
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    `${outputPath}.manifest.json`,
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );
  return manifest;
}
