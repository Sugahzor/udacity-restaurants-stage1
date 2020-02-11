const sharp = require('sharp');
const fs = require('fs');
const directory = './img';

fs.readdirSync(directory).forEach(file => {
    //extract the filename up to the extension
    let fileName = file.slice(0, file.indexOf("."));
    //extract the extension
    let fileExtension = file.slice(file.indexOf(".")+1, file.length);

  //   // (min-width: 577px)
  // sharp(`${directory}/${file}`)
  //   .resize(360, 270) // width, height
  //   .toFile(`${directory}/${fileName}-xs.${fileExtension}`);

    // (min-width: 577px)
  sharp(`${directory}/${file}`)
  .resize(270, 202) // width, height
  .toFile(`${directory}/${fileName}-xs.${fileExtension}`);

    // (min-width: 450px and max-width: 576px)
    sharp(`${directory}/${file}`)
    .resize(552, 414) // width, height
    .toFile(`${directory}/${fileName}-sm.${fileExtension}`);
  });