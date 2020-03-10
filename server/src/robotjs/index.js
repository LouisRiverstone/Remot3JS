const robot = require("robotjs");
const Jimp = require('jimp');


module.exports = {
    screenSize: robot.getScreenSize(),
    getScreenRealtime: (resolution, quality) => {
        this.fimose = true
        return new Promise((resolve, reject) => {
            try {
                var picture = robot.screen.capture();
                var image = new Jimp(picture.width, picture.height, function (err, img) {
                    img.bitmap.data = picture.image;
                    img.resize(resolution[0], resolution[1])
                    image.quality(quality)
                    img.getBuffer(Jimp.MIME_PNG, (err, png) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(png)
                    });
                });
            } catch (e) {
                console.error(e);
                reject(e);
            }
        })
    }
}




