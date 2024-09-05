export type WorldDataObject = {
  [themeName: string]: {
    [profileId: string]: {
      droppedAssetId: string;
      s3Url: string;
    };
  };
};

// {
//   "desk": {
//     "rBpxZW236I5LRqTc6o7G": {
//       "s3Url": "https://sdk-locker.s3.amazonaws.com/rBpxZW236I5LRqTc6o7G-1724352939323.png",
//       "droppedAssetId": "3ae628c2f00a41c78144ee9d75521cc6"
//     }
//   },
//   "snowman": {
//     "rBpxZW236I5LRqTc6o7G": {
//       "s3Url": "https://sdk-locker.s3.amazonaws.com/rBpxZW236I5LRqTc6o7G-1724353245615.png",
//       "droppedAssetId": "-O4vRvDZU1cA5j3uY3Uq"
//     }
//   }
// }
