angular.module('angularTreeAutocomplete', [])

.service('lookupService', ['$q', '$filter', function($q, $filter) {
    this.getResultById = function(id, filter, source, sourceProvider) {
        var resultDeferred = $q.defer();
        $filter(filter)(id, source, sourceProvider).then(function(results) {
            resultDeferred.resolve(results[0]);
        });
        return resultDeferred.promise;
    }

    this.getResults = function(query, filter, source, sourceProvider) {
        var resultsDeferred = $q.defer();

        $filter(filter)(query, source, sourceProvider).then(function(results) {
            resultsDeferred.resolve(results);
        });

        return resultsDeferred.promise;
    }

    this.wrapPromise = function(value) {
        var wrapper = $q.defer();
        wrapper.resolve(value);
        return wrapper.promise;
    }
}])

.directive('lookup', ['$compile', 'lookupService', function($compile, lookupService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            'lookup': '@',
            'sourceProvider': '=',
            'source': '=',
            'callback': '&'
        },
        link: function(scope, iElement, iAttrs, ngModelCtrl) {
            // Equal to scope.source if it is not a restangular source, otherwise it will equal the result
            // of a getList method.
            scope.resultCandidates = undefined;

            // Set the initial value of the input to the object name, for accessibility.
            var unregisterFn = scope.$watch(function() { return ngModelCtrl.$modelValue; }, initialize);
            function initialize(value) {
                // Ensure that ngModel has initialized modelValue.
                if (typeof(value) === 'string') {

                    // Use sourceProvider to get the name of the current option.
                    if (scope.sourceProvider !== undefined) {
                        if (scope.sourceProvider.hasOwnProperty('rest') && typeof(scope.sourceProvider.get) === 'function') { 
                            scope.sourceProvider.get(value).then(function(result) {
                                ngModelCtrl.$viewValue = result.name;
                                ngModelCtrl.$render();
                            });
                        } else {
                            lookupService.getResultById(value, scope.lookup, scope.source, scope.sourceProvider).then(function(result) {
                                ngModelCtrl.$viewValue = result.name;
                                ngModelCtrl.$render();
                            });
                        }
                    } else {
                        // Hmm...
                    }

                    // Get the list of result candidates to filter.
                    if (scope.source !== undefined) {
                        if (scope.source.hasOwnProperty('rest') && typeof(scope.source.getList) === 'function') {
                            scope.resultCandidates = scope.source.getList();
                        } else {
                            scope.resultCandidates = lookupService.wrapPromise(scope.source);
                        }
                    } else {
                        // Hmm...
                        scope.resultCandidates = null;
                    }

                    unregisterFn();
                }
            }

            scope.currentResults = [];
            scope.inputHasFocus = true;
            scope.selectOption = function(resultObj) {
                var result = resultObj.result;

                ngModelCtrl.$modelValue = result.id;
                ngModelCtrl.$viewValue = result.name;
                ngModelCtrl.$render();
                iElement[0].focus();

                if (scope.callback()) {
                    callback()(result);
                }
            }

            ngModelCtrl.$render = function() {
                iElement.val(ngModelCtrl.$viewValue);
            }

            ngModelCtrl.$parsers.unshift(function(input) {
                if (input.match(/^([0-9a-fA-F]{24})/) && scope.currentResults.length) {
                    // This is a match even if the user doesn't select it explicitly.
                    // Remove the autocomplete from the DOM and update the modelValue.

                    var $nextEl = iElement.next();
                    if ($nextEl.hasClass('autocomplete')) {
                        $nextEl.remove();
                        $nextEl = undefined;
                    }

                    return input;
                } else {
                    /** React to the user input by doing a lookup **/
                    scope.inputHasFocus = true;

                    scope.resultCandidates.then(function(result) {
                        lookupService.getResults(input, scope.lookup, scope.resultCandidates, scope.sourceProvider).then(function(results) {
                            if (angular.equals(results, scope.currentResults)) {
                                return;
                            }

                            scope.currentResults = results;
                            angular.element(document.querySelectorAll('.autocomplete')).remove();
                            iElement.after($compile('' +
                                '<div lookup-results ng-show="inputHasFocus" class="autocomplete" ' +
                                     'current-results="currentResults" ' +
                                     'option-select="selectOption">' +
                                '</div>')(scope));
                        });
                    });

                    // Leave the model undefined for now.
                    return undefined;
                }
            });

            iElement.on('keyup', function(event) {
                if (event.keyCode === 13) {
                    scope.selectOption({ 'result': scope.currentResults[0] });
                    angular.element(document.querySelectorAll('.autocomplete')).remove();
                }
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
