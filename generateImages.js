import sharp from "sharp";
import path from "path";

const assets = {
  body: ["body_0.png", "body_1.png", "body_2.png"],
  arms: [
    "arms_0.png",
    "arms_1.png",
    "arms_2.png",
    "arms_3.png",
    "arms_4.png",
    "arms_5.png",
    "arms_6.png",
    "arms_7.png",
    "arms_8.png",
  ],
  head: [
    "head_0.png",
    "head_1.png",
    "head_2.png",
    "head_3.png",
    "head_4.png",
    "head_5.png",
    "head_6.png",
    "head_7.png",
    "head_8.png",
  ],
  accessories: [
    "accessories_0.png",
    "accessories_1.png",
    "accessories_2.png",
    "accessories_3.png",
    "accessories_4.png",
    "accessories_5.png",
  ],
};

const createSnowman = async (images, outputName) => {
  try {
    const buffers = await Promise.all(
      images.map((img) => sharp(img).toBuffer())
    );

    const image = sharp(buffers[0]).composite(
      buffers.slice(1).map((buffer, i) => ({ input: buffer }))
    );

    await image.toFile(
      path.join("./client/public/assets/snowman/output", `${outputName}.png`)
    );

    await image.toFile(
      path.join("./client/src/assets/snowman/output", `${outputName}.png`)
    );

    console.log(`Created ${outputName}.png in both directories`);
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  for (let body of assets.body) {
    for (let arms of assets.arms) {
      for (let head of assets.head) {
        for (let accessories of assets.accessories) {
          const imagesToMerge = [
            "./client/public/assets/snowman/snowman.png",
            `./client/public/assets/snowman/${body}`,
            `./client/public/assets/snowman/${arms}`,
            `./client/public/assets/snowman/${head}`,
            `./client/public/assets/snowman/${accessories}`,
          ];
          const outputName = `${body}_${arms}_${head}_${accessories}`.replace(
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
