//var prettyjson = require('prettyjson');
var fs = require('fs');

function save(filename, write_string) {
    //write_string = prettyjson.render(write_string);
    write_string = JSON.stringify(write_string, null, 2)
    console.log(write_string);

    fs.writeFile(filename, write_string, function(err) {
        if(err) {
            console.log(err);
            process.exit(1);
        } else {
            console.log("The file was saved!");
        }
    });
}

function open(filename, cb) {
    fs.readFile(filename, function(err,data) {
        if(err) {
            console.log(err);
            process.exit(1);
        } else {
            console.log("The file was readed!");
            cb(data);
        }
    });
}

function openSync(filename) {
    try {
      var data = JSON.parse(fs.readFileSync(filename, 'ascii'));
      //console.log(data);
      //console.log(data[0]);
    }
    catch (err) {
      console.error("There was an error opening the file:");
      console.log(err);
      data = err;
    }
    return data;
}


module.exports.save = save;
module.exports.open = openSync;