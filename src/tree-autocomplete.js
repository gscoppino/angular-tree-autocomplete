angular.module('angularTreeAutocomplete', [])

.filter('DemoSiblings', ['$q', '$filter', function($q, $filter) {
    return function(query, source) {
        var filterDeferred = $q.defer();

        var nameSearch = new RegExp(query.trim(), "gi");
        var idSearch = new RegExp('^' + query.trim());
        filterDeferred.resolve($filter('filter')(source, function(obj, index) {
            var name_match = nameSearch.test(obj.name);
            var id_match = idSearch.test(obj.id);

            if (name_match || id_match) {
                return true;
            } else {
                return false;
            }
        }, false));

        return filterDeferred.promise;
    }
}])
.filter('siblings', ['$q', '$filter', function($q, $filter) {
    return function(query, source) {
        var filterDeferred = $q.defer();
        var childBlocks = source.children.filter(function(child) {
            return child._cls === 'Node.Block';
        });

        var nameSearch = new RegExp(query.trim(), "gi"); // global case insensitive.
        var idSearch = new RegExp('^' + query.trim()); // match from beginning of string.
        filterDeferred.resolve($filter('filter')(childBlocks, function(obj, index) {
            var name_match = nameSearch.test(obj.name);
            var id_match = idSearch.test(obj.id);

            if (name_match || id_match) {
                return true;
            } else {
                return false;
            }
        }, false));

        // TODO can also return the matches from the regex for highlighting of results
        return filterDeferred.promise;
    }
}])

.service('lookupService', ['$q', '$filter', function($q, $filter) {
    this.findResults = function(query, filter, source) {
        var resultsDeferred = $q.defer();

        $filter(filter)(query, source).then(function(results) {
            resultsDeferred.resolve(results);
        });

        return resultsDeferred.promise;
    }
}])

.directive('lookup', ['$compile', 'lookupService', function($compile, lookupService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            'lookup': '@',
            'source': '=',
            'callback': '&'
        },
        link: function(scope, iElement, iAttrs, ngModelCtrl) {
            console.log("Loaded Lookup");
            scope.currentResults = [];
            scope.inputHasFocus = true;
            scope.selectOption = function(resultObj) {
                var result = resultObj.result;
                console.log(result, ngModelCtrl);

                ngModelCtrl.$modelValue = result.id;
                ngModelCtrl.$viewValue = result.name;
                ngModelCtrl.$render();
                iElement[0].focus();

                console.log(ngModelCtrl.$viewValue, ngModelCtrl.$modelValue);
                if (scope.callback()) {
                    callback()(result);
                }
            }

            ngModelCtrl.$parsers.unshift(function(input) {
                console.log(ngModelCtrl.$viewValue, ngModelCtrl.$modelValue);
                scope.inputHasFocus = true;

                lookupService.findResults(input, scope.lookup, scope.source).then(function(results) {
                    scope.currentResults = results;        
                    angular.element(document.querySelectorAll('.autocomplete')).remove();
                    iElement.after($compile('' +
                        '<div lookup-results ng-show="inputHasFocus" class="autocomplete" ' +
                             'current-results="currentResults" ' +
                             'option-select="selectOption">' +
                        '</div>')(scope));
                });

                return input;
            });

           iElement.on('blur', function(event) {
                // if a user clicks on/in the autocomplete inputHasFocus should remain true
           });
        }
    }
}])
.directive('lookupResults', function() {
    return {
        restrict: 'A',
        scope: {
            'currentResults': '=',
            'optionSelect': '&',
        },
        template: '<div lookup-result ng-repeat="result in currentResults">' +
                       '<div>' + '{{ result.name }}' + '</div>' +
                  '</div>'
    }
})
.directive('lookupResult', function() {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            iElement.on('click', function() {
                scope.optionSelect()({ 'result': scope.result });
                iElement.parent().remove();
            });
        }
    }
});
