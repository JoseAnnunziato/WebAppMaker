(function () {
    angular
        .module ("WebAppMakerApp")
        .controller ("PageRunController", pageRunController)
        .controller ("PageListController", pageListController)
        .controller ("NewPageController", newPageController)
        .controller ("EditPageController", editPageController);

    function pageRunController (DatabaseService, $routeParams, WebsiteService, WidgetService, PageService, $sce,
                                $location, $scope) {
        var vm = this;
        vm.username      = $routeParams.username;
        vm.websiteId = $routeParams.websiteId;
        vm.pageId        = $routeParams.pageId;

        vm.safeYouTubeUrl = safeYouTubeUrl;
        vm.getButtonClass = getButtonClass;
        vm.trustAsHtml    = trustAsHtml;
        vm.buttonClick    = buttonClick;
        vm.deleteRecord   = deleteRecord;

        function init() {
            PageService
                .findPage(vm.websiteId, vm.pageId)
                .then(
                    function(response) {
                        // need page for page name and widgets to render the page
                        vm.page    = response.data;
                        vm.widgets = vm.page.widgets;
                        // look for DATATABLE widgets and fetch their data from database
                        for(var w in vm.widgets) {
                            // now both the DATATABLE and the REPEATER widgets need data
                            if(vm.widgets[w].widgetType=="DATATABLE" || vm.widgets[w].widgetType=="REPEATER" ) {
                                var collectionName = vm.widgets[w].widgetType=="DATATABLE" ? vm.widgets[w].datatable.collectionName : vm.widgets[w].repeater.collectionName;
                                DatabaseService
                                    // had to rename 'collection' to 'collectionName' on the schema
                                    .select(collectionName)
                                    .then(
                                        function (response) {
                                            response.data.reverse();
                                            vm.data = response.data;
                                        },
                                        function (err) {
                                            vm.error = err;
                                        }
                                    );
                            }
                        }
                    }
                );
        }
        init();

        // handle delete button event
        function deleteRecord(widgetType, collectionName, recordId) {
            DatabaseService
                .delete(vm.websiteId, collectionName, recordId)
                .then(
                    function(){
                        DatabaseService
                            .select(collectionName)
                            .then(
                                function (response) {
                                    response.data.reverse();
                                    vm.data = response.data;
                                },
                                function (err) {
                                    vm.error = err;
                                }
                            );
                    }
                );
        }

        // button click event handler
        function buttonClick(widget) {

            // if button has db command, then use service to execute
            if(widget.button && widget.button.dbCommand) {
                console.log(vm.fields);
                DatabaseService
                    .executeCommand(widget.button.dbCommand, vm.page, vm.fields)
                    .then(
                        function(response){
                            // if button has navigate, then go there
                            if(widget.button && widget.button.navigate) {
                                $location.url("/developer/"+vm.username+"/website/"+vm.websiteId+"/page/"+widget.button.navigate+"/run");
                            }
                        },
                        function(err){
                            vm.errors = err;
                        }
                    );
            } else {
                // if button has navigate, then go there
                if(widget.button && widget.button.navigate) {
                    $location.url("/developer/"+vm.username+"/website/"+vm.websiteId+"/page/"+widget.button.navigate+"/run");
                }
            }
        }

        function trustAsHtml(html, fields) {
            if(fields) {
                for(var key in fields) {
                    if(fields.hasOwnProperty(key)) {
                        var value = fields[key];
                        key = "{{"+key+"}}";
                        html = html.replace(key, value);
                    }
                }
                return $sce.trustAsHtml(html);
            }
            return $sce.trustAsHtml(html);
        }

        function getButtonClass(style) {
            if(!style) {
                style = "default";
            }
            return "btn-"+style.toLowerCase();
        }

        function safeYouTubeUrl(widget) {
            if(widget && widget.youTube) {
                var urlParts = widget.youTube.url.split("/");
                var youTubeId = urlParts[urlParts.length-1];
                return $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+youTubeId);
            }
            return "";
        }
    }

    function editPageController ($routeParams, PageService, $location) {

        var vm = this;
        vm.username      = $routeParams.username;
        vm.websiteId = $routeParams.websiteId;
        vm.pageId        = $routeParams.pageId;

        vm.removePage    = removePage;
        vm.updatePage    = updatePage;

        function init() {
            PageService
                .findPage(vm.websiteId, vm.pageId)
                .then(
                    function (response) {
                        vm.page = response.data;
                    },
                    function (err) {
                        vm.error = err;
                    }
                )
        }
        init();

        function updatePage(page) {
            PageService
                .updatePage(vm.websiteId, page)
                .then(
                    function (response) {
                        $location.url("/developer/"+vm.username+"/website/"+vm.websiteId+"/page");
                    },
                    function (err) {
                        vm.error = err;
                    }
                )
        }

        function removePage(page) {
            PageService
                .removePage(vm.websiteId, vm.pageId)
                .then(
                    function (response) {
                        $location.url("/developer/"+vm.username+"/website/"+vm.websiteId+"/page");
                    },
                    function (err) {
                        vm.error = err;
                    }
                )
        }
    }

    function pageListController ($routeParams, PageService) {

        var vm = this;
        vm.username      = $routeParams.username;
        vm.websiteId = $routeParams.websiteId;

        vm.sortPage      = sortPage;

        function init() {
            PageService
                .findPagesForWebsite(vm.websiteId)
                .then(
                    function (response) {
                        vm.pages = response.data;
                    },
                    function (err) {
                        vm.error = err;
                    }
                );
        }
        init();

        function sortPage(start, end) {
            PageService
                .sortPage(vm.websiteId, start, end)
                .then(
                    function (response) {
                    },
                    function (err) {
                        vm.error = err;
                    }
                );
        }
    }

    function newPageController($routeParams, PageService, $location) {

        var vm = this;
        vm.websiteId = $routeParams.websiteId;
        vm.username      = $routeParams.username;
        vm.createPage = createPage;

        function createPage(page) {
            PageService
                .createPage(vm.websiteId, page)
                .then(
                    function(response) {
                        $location.url("/developer/"+vm.username+"/website/"+vm.websiteId+"/page");
                    }
                )
        }
    }

})();