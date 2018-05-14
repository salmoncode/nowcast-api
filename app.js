const Jimp = require("jimp")
const express = require("express")
const app = express()
const tileLength = 256
const mapLength = tileLength * 64

const map = (value, fromMin, fromMax, toMin, toMax) => {
    let result = 0;
    result = (value <= fromMin)
        ? toMin : (value >= fromMax)
            ? toMax : (() => {

                let ratio = (toMax - toMin) / (fromMax - fromMin);
                return (value - fromMin) * ratio + toMin;

            })();
    return result;
};

app.get("/:lng/:lat", (req, res) => {
    console.log(req.params);
    let lng = req.params.lng
    let lat = req.params.lat

    console.log(lng, lat)

    let i = Math.floor(map(lng, 100, 170, 0, 64))
    let j = Math.floor(map(lat, 7, 61, 64, 0))

    let x = Math.floor(map(lng, 100, 170, 0, mapLength) - (i * tileLength));
    let y = Math.floor(map(lat, 7, 61, mapLength, 0) - (j * tileLength));

    let url = "https://www.jma.go.jp/jp/highresorad/highresorad_tile/HRKSNC/201805141050/201805141050/zoom6/" + i + "_" + j + ".png";

    Jimp.read(url)
        .then(image => {
            let hexColor = image.getPixelColor(x, y)
            let rgbColor = Jimp.intToRGBA(hexColor);
            let result = {'min':"null"};

            if (rgbColor.r == 0 && rgbColor.g == 0 && rgbColor.b == 0) {
                result.min = 0
                result.max = 0
            }
            if (rgbColor.r == 242 && rgbColor.g == 242 && rgbColor.b == 255) {
                result.min = 0
                result.max = 1
            }
            if (rgbColor.r == 160 && rgbColor.g == 210 && rgbColor.b == 255) {
                result.min = 1
                result.max = 5
            }
            if (rgbColor.r == 33 && rgbColor.g == 140 && rgbColor.b == 255) {
                result.min = 5
                result.max = 10
            }
            if (rgbColor.r == 0 && rgbColor.g == 65 && rgbColor.b == 255) {
                result.min = 10
                result.max = 20
            }
            if (rgbColor.r == 255 && rgbColor.g == 245 && rgbColor.b == 0) {
                result.min = 20
                result.max = 30
            }
            if (rgbColor.r == 255 && rgbColor.g == 153 && rgbColor.b == 0) {
                result.min = 30
                result.max = 50
            }
            if (rgbColor.r == 255 && rgbColor.g == 32 && rgbColor.b == 0) {
                result.min = 50
                result.max = 80
            }
            if (rgbColor.r == 180 && rgbColor.g == 0 && rgbColor.b == 104) {
                result.min = 80
                result.max = 80
            }

            console.log(rgbColor)
            console.log("i:" + i, "j:" + j)
            console.log("x:" + x, "y" + y)
            console.log("result: " + result.min, result.max)            
            res.send("<img src='" + url + "'><p></p>")
            // res.send(result)
        });
})

app.listen(3000)