import os from "os";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { FileWriter, Reader } from "wav";

import { format } from "./saveAudio"; // TODO Clean up maybe make a audio functional piece?

const fps = 30;

const readWav = ({ filePath }) =>
  new Promise((resolve, reject) => {
    const file = fs.createReadStream(filePath);
    const reader = new Reader();

    const buffers = [];
    reader.on("data", chunk => {
      buffers.push(chunk);
    });

    reader.on("end", () => {
      const buffer = Buffer.concat(buffers);
      resolve(buffer);
    });

    file.pipe(reader);
  });

export default async ({ root = os.tmpdir(), session, numberImages = 0 }) => {
  // TODO Use numberFrames var name instead of numberImages
  const videoPath = `${root}/${session}/video.mp4`;
  const audioPath = `${root}/${session}/audio.wav`;
  const audioDir = `${root}/${session}/audio`;

  // TODO Handle error check on fs sync call
  const files = fs.readdirSync(audioDir);

  const frames = files.map(fileName => {
    const frame = parseInt(fileName.substr(0, fileName.indexOf(".")));
    return { frame, fileName };
  });

  const writer = new FileWriter(audioPath, format);

  let buffers = [];
  // TODO For loop works will if you need to have await and sync
  // Is there a better way to do this functionally?
  for (const audio of frames) {
    const { frame, fileName } = audio;
    const data = await readWav({
      filePath: `${audioDir}/${fileName}`
    });
    const length = buffers.reduce((a, v) => a + v.length, 0);
    const { byteRate } = format;
    const diff = parseInt((frame / fps) * byteRate) - length;

    if (diff > 0) {
      buffers.push(new Buffer(diff % 2 === 0 ? diff : diff + 1)); // Align to even bytes
    }

    buffers.push(data);
  }

  const data = Buffer.concat(buffers);

  console.log("Writing audio file size=", data.length);

  writer.write(new Buffer(data));
  writer.end();

  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .addInput(`${root}/${session}/frames/%04d.jpg`) // TODO Will break if more than 9999 frames
      .inputFPS(fps)
      .addInput(audioPath)
      .outputOptions([
        "-vprofile main",
        "-pix_fmt yuv420p",
        "-codec:a libmp3lame",
        "-b:a 128k"
      ])
      .fps(fps)
      .on("end", () => {
        resolve();
      })
      .on("error", err => {
        console.log("error" + err.message);
        reject(err);
      })
      .save(videoPath);
  });
};
