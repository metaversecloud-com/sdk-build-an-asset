import sharp from "sharp";
import path from "path";

const accessories = {
  body: ["body_0.png", "body_1.png", "body_2.png"],
  arms: ["arms_0.png", "arms_1.png", "arms_2.png"],
  head: ["head_0.png", "head_1.png", "head_2.png"],
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
        const imagesToMerge = [
          "./client/public/assets/snowman/snowman.png",
          `./client/public/assets/snowman/${body}`,
          `./client/public/assets/snowman/${arms}`,
          `./client/public/assets/snowman/${head}`,
        ];
        const outputName = `${body}_${arms}_${head}`.replace(/\.png/g, "");
        await createSnowman(imagesToMerge, outputName);
      }
    }
  }
};

main();
