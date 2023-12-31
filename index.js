const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
app.use(express.json());

app.use(bodyParser.json());

const uploadedImages = {};

function generateRandomSingleDigit() {
  return Math.floor(Math.random() * 100);
}

app.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const receivedImageName = req.file.filename;
  const imageNumber = receivedImageName.split('_')[0];
  const uniqueImageId = generateRandomSingleDigit();

  uploadedImages[uniqueImageId] = {
    imageId: uniqueImageId,
    imageName: `Image_${uniqueImageId}.png`,
    fakeImageUrl: `https://picsum.photos/200`,
  };

  // Create the response object with dynamic information
  const response = {
    code: res.statusCode,
    text: `Image ${imageNumber} Received: ${receivedImageName}`,
    timing: new Date().toLocaleTimeString(),
    ...uploadedImages[uniqueImageId],
  };

  console.log(response);
  res.send(response);

  // Remove the uploaded file from the server after sending the response
  const filePath = `./uploads/${receivedImageName}`;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    } else {
      console.log('File deleted successfully:', filePath);
    }
  });

})


/*app.get('/api/list', (req, res) => {
  const imageDataList = Object.values(uploadedImages).map(({ imageId, imageName, fakeImageUrl }) => ({
    imageId,
    imageName,
    fakeImageUrl,
  }));

  const response = {
    code: res.statusCode,
    data: imageDataList,
    timing: new Date().toLocaleTimeString(),
  };

  console.log("list");
  res.send(response);
});*/
app.get('/api/list', (req, res) => {
  const imageDataList = Object.values(uploadedImages).map(({ imageId, imageName, fakeImageUrl }) => ({
    imageId,
    imageName,
    fakeImageUrl,
  }));
const response = {
  data: imageDataList
}
  res.json(response);
});


app.get('/api/details', (req, res) => {
  const imageId= req.query.id;

  if (!imageId) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  
  const itemDetails = uploadedImages[imageId];

  if (itemDetails) {
    const response = {
      code: res.statusCode,
      data: {
        imageId: itemDetails.imageId,
        imageName: itemDetails.imageName,
        fakeImageUrl: itemDetails.fakeImageUrl,
      },
      timing: new Date().toLocaleTimeString(),
    };
    console.log("details");
    res.json(response);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
