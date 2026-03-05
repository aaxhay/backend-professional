export const getPublicIdFromUrl = (url) => {
  const fileName = url.split("/").pop();   // abcxyz123.png
  const publicId = fileName.split(".")[0]; // abcxyz123
  return publicId;
};
