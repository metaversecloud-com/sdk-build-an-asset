import sharp from "sharp";
import path from "path";

const assets = {
  lockerBase: ["lockerBase_0.png", "lockerBase_1.png", "lockerBase_2.png"],
  topRight: ["topRight_0.png", "topRight_1.png", "topRight_2.png"],
  bottomRight: ["bottomRight_0.png", "bottomRight_1.png", "bottomRight_2.png"],
  left: ["left_0.png", "left_1.png", "left_2.png"],
};

const createLocker = async (images, outputName) => {
  try {
    const buffers = await Promise.all(
      images.map((img) => sharp(img).toBuffer())
    );

    const image = sharp(buffers[0]).composite(
      buffers.slice(1).map((buffer, i) => ({ input: buffer }))
    );

    await image.toFile(
      path.join("./client/public/assets/locker/output", `${outputName}.png`)
    );

    await image.toFile(
      path.join("./client/src/assets/locker/output", `${outputName}.png`)
    );

    console.log(`Created ${outputName}.png in both directories`);
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  for (let lockerBase of assets.lockerBase) {
    for (let topRight of assets.topRight) {
      for (let bottomRight of assets.bottomRight) {
        for (let left of assets.left) {
          const imagesToMerge = [
            `./client/public/assets/locker/${lockerBase}`,
            `./client/public/assets/locker/${topRight}`,
            `./client/public/assets/locker/${bottomRight}`,
            `./client/public/assets/locker/${left}`,
          ];
          const outputName =
            `${lockerBase}_${topRight}_${bottomRight}_${left}`.replace(
              /\.png/g,
              ""
            );
          await createLocker(imagesToMerge, outputName);
        }
      }
    }
  }
};

main();
