import sharp from "sharp";
import path from "path";

const accessories = {
  body: ["body_0.png", "body_1.png"],
  arms: [
    "arms_0.png",
    "arms_1.png",
    "arms_2.png",
    "arms_3.png",
    "arms_4.png",
    "arms_5.png",
    "arms_6.png",
  ],
  head: [
    "head_0.png",
    "head_1.png",
    "head_2.png",
    "head_3.png",
    "head_4.png",
    "head_5.png",
    "head_6.png",
  ],
  neck: [
    "neck_0.png",
    "neck_1.png",
    "neck_2.png",
    "neck_3.png",
    "neck_4.png",
    "neck_5.png",
    "neck_6.png",
  ],
};

const createSnowman = async (images, outputName) => {
  try {
    const buffers = await Promise.all(
      images.map((img) => sharp(img).toBuffer())
    );

    sharp(buffers[0])
      .composite(buffers.slice(1).map((buffer, i) => ({ input: buffer })))
      .toFile(path.join("./client/public/assets/output", `${outputName}.png`));

    console.log(`Created ${outputName}.png`);
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  for (let body of accessories.body) {
    for (let arms of accessories.arms) {
      for (let head of accessories.head) {
        for (let neck of accessories.neck) {
          const imagesToMerge = [
            "./client/public/assets/snowman/snowman.png",
            `./client/public/assets/snowman/${body}`,
            `./client/public/assets/snowman/${arms}`,
            `./client/public/assets/snowman/${head}`,
            `./client/public/assets/snowman/${neck}`,
          ];
          const outputName = `${body}_${arms}_${head}_${neck}`.replace(
            /\.png/g,
            ""
          );
          await createSnowman(imagesToMerge, outputName);
        }
      }
    }
  }
};

main();
