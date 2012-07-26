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
var replace = 0
//with this categorie_id
var replacer = 0;
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
  console.log("--not_exists Try to resync category_ids written in not_exists.log");
  console.log("--sql: Try to resync category_ids written in sql.log");
}

function error_handler(error, function_name, category_id, category_data) {
  switch (function_name) {
    case "delete_categorie":
      console.log(function_name+" error with category: "+Number(category_id));
    case "create_category":
    case "update_category":
    case "move_category":
      console.log(function_name+" error with category: "+Number(category_id)+ " "+category_data.name);
    break;
  }
  if(error.toString().indexOf("Category not exists") != -1) {
    not_exists_log.write(category_id+"\n")
  } else if (error.toString().indexOf("Unexpected end") != -1) {
    unexpected_end_log.write(category_id+"\n");
  } else if (error.toString().indexOf("SQLSTATE") != -1) {
    sql_log.write(category_id+"\n");
  }
  console.log(error);
  console.log(category_data);
}

function delete_categorie(category_id) {
  update_magento.init(function(err) {
    update_magento.catalog_category.delete(Number(category_id), function(error, result) {
      if(error) {
        error_handler(error, "delete_categorie", category_id);
      }
      else {
        console.log("categorie deleted")
      }
    });
  });
}

function create_category(categoryData) {
  if(categoryData.default_sort_by == null) {
    categoryData.available_sort_by = ['name'];
    categoryData.default_sort_by = 'name';
  }
  var parent_id = Number(categoryData.parent_id);
  // delete categoryData.parent_id;
  update_magento.catalog_category.create(parent_id, categoryData, storeView, function(error, result) {
    if(error) {
      error_handler(error, "create_category", categoryData.category_id, categoryData);
    }
    else {console.log("categorie created "+categoryData.category_id+" "+categoryData.name)}
  });
}

function update_category(categoryData) {
  var category_id = Number(categoryData.category_id);
  // delete categoryData.category_id;
  update_magento.catalog_category.update(category_id, categoryData, storeView, function(error, result) {
    if(error) {
      error_handler(error, "update_category", category_id, categoryData);
    }
    else {console.log("categorie updated "+category_id+" "+categoryData.name +" "+result)}
  });
}

function move_category(categoryData) {
  var category_id = Number(categoryData.category_id);
  var new_parent_id = Number(categoryData.parent_id);
  // delete categoryData.category_id;
  // delete categoryData.parent_id;
  var afterId = null;
  update_magento.catalog_category.move(category_id, new_parent_id, afterId, function(error, result) {
    if(error) {
      error_handler(error, "move_category", category_id, categoryData);
    }
    else {console.log("categorie moved "+category_id+" "+categoryData.name +" "+result)}
  });
}

function update_or_move(basicCategoryData, currentUpdateCategoryData) {
  if (basicCategoryData.parent_id != currentUpdateCategoryData.parent_id)
    move_category(basicCategoryData);
  else
    update_category(basicCategoryData);
}


function customize_Attributes(categoryData, cb) {
  delete categoryData.all_children;
  delete categoryData.children;
  delete categoryData.children_count;
  delete categoryData.updated_at;
  delete categoryData.created_at;
  delete categoryData.custom_design;
  delete categoryData.custom_design_from;
  delete categoryData.custom_design_to;
  delete categoryData.custom_layout_update;
  delete categoryData.level;
  delete categoryData.path;

  categoryData.parent_id = categoryData.parent_id.toString();
  // var replacer_string = new RegExp("´","g");
  // categoryData.name = categoryData.name.replace(replacer_string,"");

  if(categoryData.default_sort_by == null) {
    categoryData.available_sort_by = 'name';
    categoryData.default_sort_by = 'name';
  }
  if(categoryData.category_id == replace)
    categoryData.category_id = replacer.toString();
  if(categoryData.parent_id == replace)
    categoryData.parent_id = replacer.toString();
  for (attr in categoryData) {
    if((typeof(categoryData[attr])=="undefined") || categoryData[attr] == "" || categoryData[attr] == null) {
      //console.log("delete attribute "+attr+": "+categoryData[attr]);
      delete categoryData[attr];
    } else {
      //categoryData[attr] = categoryData[attr].toString();
    }
  }
  //console.log(categoryData);
  if (typeof(categoryData.is_active)==="undefined") {
    categoryData.is_active = '0';
  }

  cb(categoryData);
}

function update_or_create_or_move(categoryData) {
  var categoryData = categoryData;
    update_magento.catalog_category.info(Number(categoryData.category_id), storeView, attributes, function(error, result) {
      if(error) {
        console.log("create");
        create_category(categoryData);
      }
      else {
        if(result && result.category_id != null && result.parent_id != null) {
          //console.log("update");
          //console.log(result);
          update_or_move(categoryData, result)
        }
        else {
          console.log("create");
          create_category(categoryData);
        }
      }
    });
}

function getCategory(category_id) {
  base_magento.catalog_category.info(Number(category_id), storeView, attributes, function(error, result) {
    if (error) {
      console.log("getCategory error with category_id: "+Number(category_id));
      console.log(error);
    }
    else {
      var children = result.children.split(',');
      customize_Attributes(result, function(result){
        //  console.log(result);
        update_or_create_or_move(result);
        for (var i = children.length - 1; i >= 0; i--) {
          //console.log(children[i]);
          if(children[i] != null && children[i] != "" &&  children[i] != " ")
            getCategory(Number(children[i]));
      }
      });
    }
  });
}

function getCategoryFromLog(log_filename) {
  saveFileToArray(log_path+"/"+log_filename, function(array) {
    for (var i = array.length - 1; i >= 0; i--) {
      base_magento.catalog_category.info(array[i], storeView, attributes, function(error, result) {
        if (error) {
          console.log("getCategory error with category_id: "+category_id);
          console.log(error);
        } 
        else {
          result = customize_Attributes(result);

          var children = result.children.split(',');
          //console.log(result);
          update_or_create_or_move(result);
        }
      });
    }
  });
}

function start(category_id) {
  base_magento.init(function(err) {
    update_magento.init(function(err) {
      if (argv.not_exists) {
        getCategoryFromLog("not_exists.log");
      } else if(argv.sql) {
        getCategoryFromLog("sql.log");
      }
       else {
        reset_logs();
        getCategory(Number(category_id));
      }
    });
  });
}
if(argv.h || argv.help) {
  print_help();
} else {
  start(start_categorie);
}
