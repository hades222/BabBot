'use strict';

var urlExists = require('url-exists'),
    config = require('../config/config.js'),
    fs = require("fs"),
    path = require("path"),
    uuid = require('node-uuid'),
    download = require('download-file'),
    isUrl = require('is-url');


var saveAndSendImage = function(imageUrl, platform, state){
    console.log(imageUrl);
    var newFileName = uuid.v1() + path.extname(imageUrl);
    console.log(newFileName);
    //Download the file to tmp folder, rename to unique id
    download(imageUrl, {
        directory: "/tmp",
        filename: newFileName
    }, function(err){
        if (err) 
        {
            console.log(err)
            if(err == "404")
            {
                platform.message("formatta bi yanlışlık var gibi " + state.message.from.first_name + ' ¯\\_(ツ)_/¯',state);

            }
        } else {
            //Download complete
            console.log("trying to send " + "/tmp/" + newFileName);
            platform.image("/tmp/" + newFileName,state);
        }
    });
}



var captionModule = {
    commands: [
        'cap',
        'captags'
    ],

    onCommand: function (command, query, platform, state) {
        //Disable this module
        return;
        platform.typing(state);
        if(query !== undefined){
            if(command === "cap"){
                var buildResultText = function(firstLine, secondLine, image){
                    if(secondLine === "")
                    {
                        return "http://memegen.link/custom/" + encodeURIComponent(firstLine) +".jpg?alt=" + image;
                    } else 
                        {
                            return "http://memegen.link/custom/"+ encodeURIComponent(firstLine) +"/"+ encodeURIComponent(secondLine) +".jpg?alt=" + image;
                        }
                }

                var tokens = query.split("|");
                var secondLine = "";
                if(tokens[1] !== undefined)
                {
                    secondLine = tokens[1];
                    secondLine = secondLine.replace(/ /g, "-");
                }
                tokens = tokens[0].split(" ");
                console.log(tokens);
                var image = tokens[0];
                tokens.splice(0,1);
                var firstLine = tokens.join("-");

                if(isUrl(firstLine) || isUrl(secondLine)){
                    platform.message("URL gömmeye çalışmayın arlaksızlar v__v",state);
                } else {
                    urlExists(image, function(err, exists) {
                        console.log(exists);
                      if(exists)
                      {
                        //platform.message(buildResultText(firstLine, secondLine, image), state);
                        saveAndSendImage(buildResultText(firstLine, secondLine, image), platform, state);
                      } else 
                        {
                            if(image.indexOf(".") === -1){
                                //tag entered instead of URL, send predefined image
                                image = config.imagehost.url + image + ".jpg";
                                //platform.message(buildResultText(firstLine, secondLine, image), state);
                                
                                saveAndSendImage(buildResultText(firstLine, secondLine, image), platform, state);
                            } else {
                                platform.message("Bu verdiğin adresten resme ulaşamadım", state);
                            }
                        }
                    });
                }


            }
        } else if (command === "captags"){
            fs.readdir(config.imagehost.imagePath, function (err, files) {
            if (err) {
                platform.error(err,state);
            }
            var tags = "";
            files.map(function (file) {
                return path.join(config.imagehost.imagePath, file);
            }).filter(function (file) {
                return fs.statSync(file).isFile();
            }).forEach(function (file) {
                tags +=  path.basename(file,".jpg") + "\n";
            });
            platform.message(tags,state);    
        });
        }      
    }
};

module.exports = captionModule;
