//NPM Packages
const Pageres = require("pageres");
const moment = require("moment");

//NodeJS Framework
const fs = require("fs"); // file system
const crypto = require("crypto"); 
const util = require("util");

// TODO:
// Keep a backup image of last successful grab, and use it when errors occur
// to make sure we always have a good photo to play.

var timer = null;

//disable debugging
//console.log = function() {}

const urlToCapture = "https://avada.theme-fusion.com/creative/about/";

// const dirToPlaceImg = "\\\\lddftp\\ftproot\\liveposter\\";
// const dirToPlaceLogs = "\\\\lddftp\\ftproot\\liveposter\\logs\\";

//testing vars
// const dirToPlaceImg = "\\\\lddftp\\ftproot\\liveposter\\testing_area\\";
// const dirToPlaceLogs = "\\\\lddftp\\ftproot\\liveposter\\testing_area\\logs\\";
// const urlToCapture = "http://localhost:8081/"
const dirToPlaceImg = __dirname;
const dirToPlaceLogs = __dirname + "\\logs\\";

const fileName = "home";
const testFileName = "about";
const fileFormat = "jpg";

const intervalSeconds = 70.4;

/*** logging 
var logger = fs.createWriteStream(
    dirToPlaceLogs +
        "log_" +
        moment().format("MMM-DD") +
        "_" +
        crypto.randomBytes(4).toString("hex") +
        ".txt",
    // 'a' flag means append to file
    { flags: "a", encoding: "utf8" }
);
***/

var log = {
    action: txt => {
        console.log("Logging: " + txt);
        //logger.write(txt + "\r\n");
    }
};

var screenshot = {
    options: {
        crop: false,
        delay: 7,
        timeout: 25,
        filename: testFileName,
        format: fileFormat,
        css: "#style-selector{display:none;}"
    },
    run: function() {
        timer = null;
        new Pageres(screenshot.options)
            .src(urlToCapture, ['1280x1024', '1920x1080'])
            .dest(dirToPlaceImg)
            .on("warning", w => {
                log.action(
                    "WARNING EVENT at: " +
                        moment().format("ddd, MMM Do, h:mm:ss a") +
                        " Reason: " +
                        w
                );
            })
            .on("error", e => {
                log.action(
                    "ERROR EVENT at: " +
                        moment().format("ddd, MMM Do, h:mm:ss a") +
                        " Reason: " +
                        e
                );
            })
            .run()
            .then(() => {
                log.action(
                    "Successful grab at: " +
                        moment().format("ddd, MMM Do, h:mm:ss a")
                );
            })
            .catch((e) => {
                log.action(
                    "CAUGHT ERROR at: " +
                        moment().format("ddd, MMM Do, h:mm:ss a") +
                        " Reason: " +
                        e
                );
            });
    },
    interval: intervalSeconds
};

var program = {
    start: () => {
        log.action('Starting Once');
        setImmediate(screenshot.run)
    },
    checkJpg: () => {
        try {
            console.log("checking jpg")
            var fileToCheck = util.format("%s.%s", testFileName, fileFormat);
            var stats = fs.statSync(dirToPlaceImg + fileToCheck)
            var fileSizeInBytes = stats["size"];
            console.log("FILE SIZE: " + fileSizeInBytes);
            if (fileSizeInBytes >= 44000) {
                return true;
            } else throw new Error("Filesize is under 44k, unable to send to panel.")
        }
        catch (e) {
            log.action(
                "FILESIZE ERROR at: " +
                    moment().format("ddd, MMM Do, h:mm:ss a") +
                    " Reason: " +
                    e
            );
            return false;
        }
    },
    finalizeJpg: () => {
        try {
            console.log("Finalize jpg called")
            var sourceName = util.format("%s.%s", testFileName, fileFormat);
            var destName = util.format("%s.%s", fileName, fileFormat);
            fs.rename(dirToPlaceImg + sourceName, dirToPlaceImg + destName, function(err) {
                if (err) throw err;
                // TODO: Try to see what happens when error is thrown here.
                console.log("jpg renamed")
            });
            return true;
        }
        catch (e) {
            log.action(
                "CAUGHT RENAME ERROR at: " +
                    moment().format("ddd, MMM Do, h:mm:ss a") +
                    " Reason: " +
                    e
            );
            return false;
        }
    }
};

setImmediate(() => {
    log.action(
        "STARTING NEW PROCESS: " + moment().format("ddd, MMM Do, h:mm:ss a")
    );
});

program.start();