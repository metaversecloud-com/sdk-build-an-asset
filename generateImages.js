import sharp from "sharp";
import path from "path";

const accessories = {
  scarf: ["scarf_0.png", "scarf_1.png", "scarf_2.png"],
  arms: ["arms_0.png", "arms_1.png", "arms_2.png"],
  hat: ["hat_0.png", "hat_1.png", "hat_2.png"],
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
  for (let scarf of accessories.scarf) {
    for (let arms of accessories.arms) {
      for (let hat of accessories.hat) {
        const imagesToMerge = [
          "./client/public/assets/snowman/snowman.png",
          `./client/public/assets/snowman/${scarf}`,
          `./client/public/assets/snowman/${arms}`,
          `./client/public/assets/snowman/${hat}`,
        ];
        const outputName = `${scarf}_${arms}_${hat}`.replace(/\.png/g, "");
        await createSnowman(imagesToMerge, outputName);
      }
    }
  }
};

main();
