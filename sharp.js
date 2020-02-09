const sharp = require('sharp');
const fs = require('fs');
const directory = './img';

fs.readdirSync(directory).forEach(file => {
    // (min-width: 577px)
  sharp(`${directory}/${file}`)
    .resize(360, 270) // width, height
    .toFile(`${directory}/${file}-sm`);

    // (max-width: 576px)
    sharp(`${directory}/${file}`)
    .resize(552, 414) // width, height
    .toFile(`${directory}/${file}-xs`);
  });