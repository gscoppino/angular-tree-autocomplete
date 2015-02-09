angular.module('angularTreeAutocomplete', [])

.filter('DemoSiblings', ['$q', '$filter', function($q, $filter) {
    return function(query, source) {
        var filterDeferred = $q.defer();
        filterDeferred.resolve($filter('filter')(source, function(value, index) {
            var value_name_match = value.name.substring(0, query.length).toLowerCase();
            var value_id_match = value.id.substring(0, query.length).toLowerCase();

            if (value_name_match === query.toLowerCase() || value_id_match === query.toLowerCase()) {
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
        filterDeferred.resolve($filter('filter')(childBlocks, function(value, index) {
            var value_name_match = value.name.substring(0, query.length).toLowerCase();
            var value_id_match = value.id.substring(0, query.length).toLowerCase();

            if (value_name_match === query.toLowerCase() || value_id_match === query.toLowerCase()) {
                return true;
            } else {
                return false;
            }
        }, false));
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
            scope.selectOption = function(resultObj) {
                var result = resultObj.result;
                console.log(result, ngModelCtrl);

                ngModelCtrl.$modelValue = result.id;
                ngModelCtrl.$viewValue = result.name;
                ngModelCtrl.$render();

                console.log(ngModelCtrl.$viewValue, ngModelCtrl.$modelValue);
                if (scope.callback()) {
                    callback()(result);
                }
            }
            scope.inputEl = iElement[0];

            ngModelCtrl.$parsers.unshift(function(input) {
                lookupService.findResults(input, scope.lookup, scope.source).then(function(results) {
                    scope.currentResults = results;        
                    angular.element(document.querySelectorAll('.autocomplete')).remove();
                    iElement.after($compile('' +
                        '<div lookup-results class="autocomplete" ' +
                            'current-results="currentResults" ' +
                            'option-select="selectOption"' +
                            'focus-target="inputEl">' +
                        '</div>')(scope));
                });
            });

           iElement.on('focus', function() {
               var $autocompleteEl = iElement.next();
               if ($autocompleteEl.hasClass('autocomplete')) {
                   $autocompleteEl.prop('display', 'block');
               }
           });

           iElement.on('blur', function(event) {
               var $autocompleteEl = iElement.next(); 
               if (iElement.hasClass('autocomplete')) {
                   if (event.target === $autocompleteEl) {
                       return;
                   } else {
                       $autocompleteEl.prop('display', 'none');
                   }
                }
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
            'focusTarget': '='
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
                scope.$parent.focusTarget.focus();
                iElement.parent().remove();
            });
        }
    }
});
