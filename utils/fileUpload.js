const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.imageUpload = async (file) => {
  const uuid = uuidv4();
  const fileName = `images/${uuid}`;
  let photoUrl = null;

  const fileBuffer = await sharp(file.filepath).toBuffer();

  // Resize and compress the image
  const resizedImageBuffer = await sharp(fileBuffer)
    .resize({
      width: 1024,
      height: 1024,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: resizedImageBuffer,
    ContentType: "image/jpeg",
  };

  // Upload the image
  const upload = new Upload({
    client: s3,
    params,
  });

  const uploadResult = await upload.done();
  photoUrl = uploadResult.Location;

  return photoUrl;
};
