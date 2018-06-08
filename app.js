const Jimp = require("jimp")
const express = require("express")
const moment = require('moment-timezone')

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

const colors = [
    {r:0,g:0,b:0,min:0,max:0},
    {r:255,g:255,b:255,min:0,max:0},
    {r:242,g:242,b:255,min:0,max:1},
    {r:160,g:210,b:255,min:1,max:5},
    {r:33,g:140,b:255,min:5,max:10},
    {r:0,g:65,b:255,min:10,max:20},
    {r:255,g:245,b:0,min:20,max:30},
    {r:255,g:153,b:0,min:30,max:50},
    {r:255,g:32,b:0,min:50,max:80},
    {r:180,g:0,b:104,min:80,max:100}
]

const getTimeStamps = (diff = 0) => {    
    const now = moment().tz('Etc/GMT')

    const offset = 5 // ぴったりの時間だとまだ画像がない場合がある
    const rem = Number(now.format('mm'))%10
    if (rem > 5) now.add( - (rem - 5) - offset , 'minutes')
    else         now.add( - rem - offset , 'minutes')

    let stamp1 = now.format('YYYYMMDDHHmm')
    let stamp2 = now.add(diff, 'minutes').format('YYYYMMDDHHmm')
    if(diff < 0 ) stamp1 = stamp2

    return [stamp1, stamp2]
}

app.get("/:diff/:lng/:lat", (req, res) => {
    console.log(req.params);
    let lng = req.params.lng
    let lat = req.params.lat

    let i = Math.floor(map(lng, 100, 170, 0, 64))
    let j = Math.floor(map(lat, 7, 61, 64, 0))

    let x = Math.floor(map(lng, 100, 170, 0, mapLength) - (i * tileLength))
    let y = Math.floor(map(lat, 7, 61, mapLength, 0) - (j * tileLength))

    let ts = getTimeStamps(req.params.diff)
    let url = "https://www.jma.go.jp/jp/highresorad/highresorad_tile/HRKSNC/" + ts[0] + "/" + ts[1] + "/zoom6/" + i + "_" + j + ".png"
    let mapUrl = "https://www.jma.go.jp/jp/commonmesh/map_tile/MAP_COLOR/none/anal/zoom6/" + i + "_" + j + ".png"

    Jimp.read(url)
        .then(image => {
            let hexColor = image.getPixelColor(x, y)
            let rgbColor = Jimp.intToRGBA(hexColor);
            let result = {'min':"null"};

            for (let color of colors) {
                if (rgbColor.r == color.r && rgbColor.g == color.g && rgbColor.b == color.b) {
                    result.min = color.min
                    result.max = color.max
                  break
                }
            }

            result.r = rgbColor.r
            result.g = rgbColor.g
            result.b = rgbColor.b     
            result.imageUrl = url
            result.mapUrl = mapUrl
            res.send(result)
        });
})

app.listen(3000)
