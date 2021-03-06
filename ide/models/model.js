module.exports = function() {

    var mongoose = require("mongoose");
    var mongojs  = require('mongojs');

    var connectionString = 'mongodb://127.0.0.1:27017/web-app-maker';
    var dbName = process.env.OPENSHIFT_APP_NAME || 'web-app-maker';

    if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
    }

    mongoose.connect(connectionString);
    var mongo = mongojs(connectionString);

    var websiteModel = require("./website/website.model.server")();
    var shareModel       = require("./website/share.model.server")(websiteModel);
    var pageModel        = require("./page/page.model.server")(websiteModel);
    var widgetModel      = require("./widget/widget.model.server")(websiteModel);
    var developerModel   = require("./developer/developer.model.server")();
    var scriptModel      = require("./script/script.model.server")(websiteModel);

    var model = {
        websiteModel : websiteModel,
        shareModel       : shareModel,
        pageModel        : pageModel,
        widgetMode       : widgetModel,
        developerModel   : developerModel,
        scriptModel      : scriptModel,
        mongo            : mongo
    };
    return model;
}