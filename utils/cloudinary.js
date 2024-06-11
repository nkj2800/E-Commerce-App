const cloudinary= require('cloudinary');


// Configuring Cloudinary with environment variables for security
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API, 
  api_secret: process.env.CLOUD_SECRET,
  secure: true
});

// Function to upload an image to Cloudinary and return its secure URL
const uploadImgToCloudinary = async (imageFile) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(imageFile, {
      resource_type: 'auto', // Let Cloudinary automatically detect the resource type
    });
    return uploadResult.secure_url; // Return only the secure URL
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error); 
  }
};

module.exports= uploadImgToCloudinary;


// const uploadImgToCloudinary= async(imageFile)=> {
//   return new Promise(resolve=> {
//     cloudinary.uploader.upload(imageFile, (result)=> {
//       resolve({
//         url: result.secure_url,
//       },
//       {
//         resource_type: 'auto'
//       })
//     })
//   })
// };
