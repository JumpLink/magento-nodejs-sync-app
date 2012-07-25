// sublime: tab_size 2; translate_tabs_to_spaces true

/**
 * Dieses kleine Script speichert alle Product-Werte eines Shops - welches seine Daten im JSON-Format
 * übergibt - als eigene - vorher angelegte - Attribute in Magento ab.
 */

var url = require('../public/javascripts/url_funcs.js');
var magento_confs = require('../config/magento_confs.js');
var magento = require('../magento_funcs');
var util = require('util');
var argv = require('optimist').argv;
//var colors = require('colors');

var fs = require('fs');
var log_path = "log";

//create writestrems for logs
var unexpected_end_log = fs.createWriteStream(__dirname+"/../"+log_path+"/unexpected_end.log", { flags: "a", encoding: "encoding", mode: 0666});
var not_exists_log = fs.createWriteStream(__dirname+"/../"+log_path+"/not_exists.log", { flags: "a", encoding: "encoding", mode: 0666 });
var sql_log = fs.createWriteStream(__dirname+"/../"+log_path+"/sql.log", { flags: "a", encoding: "encoding", mode: 0666 });

var storeView = null;
var website = null;
var shop_index_base = 0;
var shop_index_update = 1;
var start_categorie = 1;
var attributes = null;
//replace categorie_id
var replace = 3
//with this categorie_id
var replacer = 2;
var loops = 10;
if (argv.base) {
    shop_index_base = argv.base;
}
if (argv.update) {
    shop_index_update = argv.update;
}
if (argv.start) {
    start_categorie = argv.start;
}
if (argv.replace) {
    replace = argv.replace;
}
if (argv.replacer) {
    replacer = argv.replacer;
}
if (argv.loops) {
    loops = argv.loops;
}
var base_magento = require('../magento')(magento_confs[shop_index_base]);
var update_magento = require('../magento')(magento_confs[shop_index_update]);

function pausecomp(ms) {
  ms += new Date().getTime();
  while (new Date() < ms){}
}

//remove content of file / create new file
function reset_logs() {
  fs.createWriteStream(__dirname+"/../"+log_path+"/unexpected_end.log", { flags: "w" }).write("");
  fs.createWriteStream(__dirname+"/../"+log_path+"/not_exists.log", { flags: "w" }).write("");
  fs.createWriteStream(__dirname+"/../"+log_path+"/sql.log", { flags: "w" }).write("");
}

function saveFileToArray(filename, cb) {
  var input = fs.createReadStream(filename);
  var array = [];
  //read file and save it into an array, source: http://stackoverflow.com/questions/6831918/node-js-read-a-text-file-into-an-array-each-line-an-item-in-the-array
  function readLines(input, func, cb) {
    var remaining = '';

    input.on('data', function(data) {
      remaining += data;
      var index = remaining.indexOf('\n');
      var last  = 0;
      while (index > -1) {
        var line = remaining.substring(last, index);
        last = index + 1;
        func(line);
        index = remaining.indexOf('\n', last);
      }
      //finish
      remaining = remaining.substring(last);
      cb(array);
    });

    input.on('end', function() {
      if (remaining.length > 0) {
        func(remaining);
      }
    });
  }
  function saveToArray(data) {
    array.push(data);
    //console.log('Line: ' + data);
  }
  readLines(input, saveToArray, cb);
}

function print_help(){
  console.log("-h and --help: This Message");
  console.log("--base [Number]");
  console.log("--update [Number]");
  console.log("--start [Number]");
  console.log("--replace [Number]");
  console.log("--replacer [Number]");
  console.log("--loops [Number]");
  console.log("--not_exists");
}

function error_handler(error, function_name, category_id_or_data) {
  switch (function_name) {
    case "delete_categorie":
      console.log(function_name+" error with category: "+category_id_or_data);
    break;
    case "create_categorie":
      console.log(function_name+" error with category: "+category_id_or_data.category_id+ " "+category_id_or_data.name);
      if(error.toString().indexOf("Category not exists") != -1) {
        not_exists_log.write(category_id_or_data.category_id+"\n")
      } else if (error.toString().indexOf("Unexpected end") != -1) {
        unexpected_end_log.write(category_id_or_data.category_id+"\n");
      } else if (error.toString().indexOf("SQLSTATE") != -1) {
        sql_log.write(error.toString()+"\n");
      }
    break;
    case "update_categorie":
      console.log(function_name+" error with category: "+category_id_or_data.category_id+ " "+category_id_or_data.name);
    break;
  }
  
}

function delete_categorie(category_id) {
  update_magento.init(function(err) {
    update_magento.catalog_category.delete(category_id, function(error, result) {
      if(error) {
        error_handler(error, "delete_categorie", category_id);
      }
      else {
        console.log("categorie deleted")
      }
    });
  });
}

function create_categorie(categoryData) {
  if(categoryData.default_sort_by == null) {
    categoryData.available_sort_by = ['name'];
    categoryData.default_sort_by = 'name';
  }
    update_magento.catalog_category.create(categoryData.parent_id, categoryData, storeView, function(error, result) {
      if(error) {
        error_handler(error, "create_categorie", categoryData);
      }
      else {console.log("categorie created "+categoryData.category_id+" "+categoryData.name)}
    });
}

function update_categorie(categoryData) {

    update_magento.catalog_category.update(categoryData.category_id, categoryData, storeView, function(error, result) {
      if(error) {
        error_handler(error, "update_categorie", categoryData);
      }
      else {console.log("categorie updated "+categoryData.category_id+" "+categoryData.name)}
    });
}

function update_or_create(categoryData) {
  var categoryData = categoryData;
  delete categoryData.all_children;
  delete categoryData.children;
  delete categoryData.children_count;
  delete categoryData.updated_at;
  delete categoryData.created_at;
  if(categoryData.default_sort_by == null) {
    categoryData.available_sort_by = ['name'];
    categoryData.default_sort_by = 'name';
  }
  if (categoryData.is_active == null) {
    categoryData.is_active = 0;
  }
    update_magento.catalog_category.info(categoryData.category_id, storeView, attributes, function(error, result) {
      if(error) {
        console.log("create");
        create_categorie(categoryData);
      }
      else {
        if(typeof(result)!== "undefined" && result != null) {
          console.log("update");
          //console.log(result);
          update_categorie(categoryData);
        }
        else {
          console.log("create");
          create_categorie(categoryData);
        }
      }
    });
}

function getCategory(category_id) {
  base_magento.catalog_category.info(category_id, storeView, attributes, function(error, result) {
    if (error) {
      console.log("getCategory error with category_id: "+category_id);
      console.log(error);
    }
    else {
      if(result.category_id == replace)
        result.category_id = replacer;
      if(result.parent_id == replace)
        result.parent_id = replacer;

      var children = result.children.split(',');
      //pausecomp(10000);
      //console.log(result);
      update_or_create(result);
      for (var i = children.length - 1; i >= 0; i--) {
        //console.log(children[i]);
        if(children[i] != null && children[i] != "" &&  children[i] != " ")
          getCategory(Number(children[i]));
      }
    }
  });
}

function getCategoryFromNotExistsLog() {
  saveFileToArray(log_path+"/not_exists.log", function(array) {
    for (var i = array.length - 1; i >= 0; i--) {
      base_magento.catalog_category.info(array[i], storeView, attributes, function(error, result) {
        if (error) {
          console.log("getCategory error with category_id: "+category_id);
          console.log(error);
        } 
        else {
          if(result.category_id == replace) {
            result.category_id = replacer;
            console.log("replaced CategoryID"+replace);
          }
            
          if(result.parent_id == replace) {
            result.parent_id = replacer;
            console.log("replaced parent_id "+replace);
          }

          var children = result.children.split(',');
          //pausecomp(10000);
          //console.log(result);
          update_or_create(result);
        }
      });
    }
  });
  // base_magento.catalog_category.info(category_id, storeView, attributes, function(error, result) {
  //   if (error) {
  //     console.log("getCategorie error with category_id: "+category_id);
  //     console.log(error);
  //   }
  //   else {
  //     if(result.category_id == replace)
  //       result.category_id = replacer;
  //     if(result.parent_id == replace)
  //       result.parent_id = replacer;

  //     var children = result.children.split(',');
  //     //pausecomp(10000);
  //     //console.log(result);
  //     update_or_create(result);
  //     for (var i = children.length - 1; i >= 0; i--) {
  //       //console.log(children[i]);
  //       if(children[i] != null && children[i] != "" &&  children[i] != " ")
  //         getCategorie(Number(children[i]));
  //     }
  //   }
  // });
}

function start(category_id) {
  base_magento.init(function(err) {
    update_magento.init(function(err) {
      for (var i = 0; i <= loops; i++) {
        if (argv.not_exists) {
          getCategoryFromNotExistsLog();
        } else {
          reset_logs();
          getCategory(category_id);
        }
      };
    });
  });
}
if(argv.h || argv.help) {
  print_help();
} else {
  start(start_categorie);
}
