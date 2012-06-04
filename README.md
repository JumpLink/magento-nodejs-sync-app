magento-nodejs-sync-app
=======================

Experimental web applications to browse/sync magento and other products using Node.js

## Try it out on Linux

 clone the git repository
 
    $ git clone git@github.com:JumpLink/magento-nodejs-sync-app.git
    
 change in the new directory

    $ cd magento-nodejs-sync-app
    
 install node.js: http://nodejs.org/
 
 install npm: http://npmjs.org/
    
 rename and configure the files in /config

    $ mv ./config/magento_confs.js.example ./config/magento_confs.js
    $ mv ./config/sync_shops.js.example ./config/sync_shops.js
    
 install the dependencies locally

    $ npm install
    
 start the app
    
    $ node app.js
    
 start your browser: http://localhost:4242/
 