import PromisePool from "es6-promise-pool";
import compressjs from "compressjs";

const compressData = data => {
  const algorithm = compressjs.Lzp3;  
  const { length } = data;
  let unit_8_array = new Uint8Array(length*2);
  for(let i = 0; i < length; i+=2) {
    unit_8_array[i] = data[i] >> 8;
    unit_8_array[i+1] = data[i] & 255;
  }
  console.log(typeof(data));
  console.log("length:",data.length);
  const compressedData = algorithm.compressFile(unit_8_array);
  return compressedData;
}



export default async ({
  socket,
  action: { seriesUID, sliceLocation = 0, loadImages = true } = {},
  adapter
}) => {
  const {
    dicom: { getImages = () => {}, getImageData = () => {} } = {}
  } = adapter;

  const imageList = await getImages({
    seriesUID
  });

  // TODO If slice index then load first
  await new Promise((resolve, reject) => {
    socket.emit(
      "action",
      {
        type: "VOLUME_SET",
        volume: imageList
      },
      err => (err ? reject() : resolve())
    );
  });

  // Send selected image first
  const { [sliceLocation]: { instanceUID } = {} } = imageList;

  if (!loadImages) {
    // Bailout
    socket.emit("action", { type: "SPINNER_TOGGLE", toggle: false });
    socket.emit("action", { type: "VOLUME_LOADED" });
    return;
  }
  
  

  if (instanceUID) {
    const data = await getImageData({ instanceUID });

    await new Promise((resolve, reject) => {
      socket.emit(
        "action",
        {
          type: "VOLUME_SLICE_DATA",
          index: sliceLocation,
          data: compressData(data)
        },
        err => (err ? reject() : resolve())
      );
    });
  }

  socket.emit("action", {
    type: "SPINNER_TOGGLE",
    toggle: false
  });

  const concurrency = 3;
  const imageListEnhanced = imageList
    .map((v, i) => ({
      ...v,
      index: i
    }))
    .filter(({ index }) => index !== sliceLocation);

  // TODO Sort images from sliceLocation outward
  const pool = new PromisePool(() => {
    if (imageListEnhanced.length <= 0) {
      return null;
    }

    const { instanceUID, index } = imageListEnhanced.pop();
    return new Promise(async (resolve, reject) => {
      const data = await getImageData({ instanceUID });

      socket.emit(
        "action",
        {
          type: "VOLUME_SLICE_DATA",
          index,
          data: compressData(data)
        },
        err => (err ? reject() : resolve())
      );
    });
  }, concurrency);

  const poolPromise = pool.start();

  // Wait for the pool to settle.
  poolPromise.then(
    () => {
      console.log("All images loaded");
      socket.emit("action", { type: "VOLUME_LOADED" });
    },
    ({ message }) => {
      console.log(`Error ${message}`);
    }
  );
};
