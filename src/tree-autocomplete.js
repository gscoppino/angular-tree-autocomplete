angular.module('angularTreeAutocomplete', [])

.service('lookupService', ['$q', '$filter', function($q, $filter) {

    this.getResultById = function(id, filter, source) {
        var resultDeferred = $q.defer();
        $filter(filter)(id, source).then(function(results) {
            resultDeferred.resolve(results[0]);
        });
        return resultDeferred.promise;
    }

    this.getResults = function(query, filter, source) {
        var resultsDeferred = $q.defer();

        $filter(filter)(query, source).then(function(results) {
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

.directive('lookup', ['$compile', '$log', 'lookupService', function($compile, $log, lookupService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            'lookup': '@',
            'source': '=',
            'callback': '&'
        },
        link: function(scope, iElement, iAttrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                $log.error('angular-tree-autocomplete: ngModelCtrl not found.');
                return;
            }

            // Store the current selection for resetting the view if necessary.
            scope.currentSelection = undefined;

            // Equal to scope.source if it is not a restangular source, otherwise it will equal the result
            // of a getList method.
            scope.resultCandidates = undefined;

            // Set the initial value of the input to the object name, for accessibility.
            scope.$watch(function() { return ngModelCtrl.$modelValue; }, initialize);
            function initialize(value) {
                $log.debug('The value of $modelValue has changed! ' + 'New Value: ' + value);
                // Ensure that ngModel has initialized modelValue.
                if (typeof(value) === 'string') {

                    if (scope.source !== undefined) {
                        if (scope.source.hasOwnProperty('rest')) {
                            // Get the name representation for the id.
                            if (typeof(scope.source.get) === 'function') {
                                scope.source.get(value).then(function(result) {
                                    scope.currentSelection = ngModelCtrl.$viewValue = result.name;
                                    ngModelCtrl.$render();
                                });
                            } else {
                                lookupService.getResultById(value, scope.lookup, scope.source).then(function(result) {
                                    scope.currentSelection = ngModelCtrl.$viewValue = result.name;
                                    ngModelCtrl.$render();
                                });
                            }

                            // Get the list of result candidates to filter, once.
                            if (!scope.resultCandidates) {
                                if (typeof(scope.source.getList) === 'function') {
                                    scope.resultCandidates = scope.source.getList();
                                } else {
                                    scope.resultCandidates = lookupService.wrapPromise(scope.source);
                                }
                            }
                        } else {
                            lookupService.getResultById(value, scope.lookup, scope.source).then(function(result) {
                                scope.currentSelection = ngModelCtrl.$viewValue = result.name;
                                ngModelCtrl.$render();
                            });

                            scope.resultCandidates = lookupService.wrapPromise(scope.source);
                        }
                    } else {
                        scope.resultCandidates = undefined;
                    }
                }
            }

            scope.currentResults = [];
            scope.inputHasFocus = true;

            scope.resetOption = function() {
                ngModelCtrl.$viewValue = scope.currentSelection;
                ngModelCtrl.$render();
                angular.element(document.querySelectorAll('.autocomplete')).remove(); 
            }

            scope.selectOption = function(resultObj) {
                var result = resultObj.result;

                /** Place the ID into the view, causing $parsers to execute
                    and set the modelValue to the new ID. The watcher on $modelValue
                    will then execute and update the view with the name representation
                    of the ID **/
                ngModelCtrl.$setViewValue(result.id);

                // DOM Cleanup
                angular.element(document.querySelectorAll('.autocomplete')).remove();
                iElement[0].focus();

                // Execute callback function, if provided to the directive.
                if (scope.callback()) {
                    callback()(result);
                }
            }

            ngModelCtrl.$render = function() {
                iElement.val(ngModelCtrl.$viewValue);
            }

            ngModelCtrl.$parsers.unshift(function(input) {
                if (input.match(/^([0-9a-fA-F]{24})/) && scope.currentResults.length) {
                    $log.debug('ID Match! Sending to modelValue. ' + 'Input: ' + input);
                    // This is a match even if the user doesn't select it explicitly.
                    // Remove the autocomplete from the DOM and update the modelValue.

                    var $nextEl = iElement.next();
                    if ($nextEl.hasClass('autocomplete')) {
                        $nextEl.remove();
                        $nextEl = undefined;
                    }
                    iElement[0].focus();

                    return input;
                } else {
                    // React to the user input by doing a lookup
                    scope.inputHasFocus = true;

                    scope.resultCandidates.then(function(result) {
                        lookupService.getResults(input, scope.lookup, result).then(function(results) {
                            if (angular.equals(results, scope.currentResults)) {
                                return;
                            }

                            scope.currentResults = results;
                            angular.element(document.querySelectorAll('.autocomplete')).remove();
                            iElement.after($compile('' +
                                '<div lookup-results ng-show="inputHasFocus" class="autocomplete" ' +
                                     'current-results="currentResults" ' +
                                     'select-option="selectOption" ' +
                                     'reset-option="resetOption">' +
                                '</div>')(scope));
                        });
                    });

                    // Leave the model undefined for now.
                    return undefined;
                }
            });

            iElement.on('keyup', function(event) {
                if (event.keyCode === 13) { // Enter
                    scope.selectOption({ 'result': scope.currentResults[0] });
                } else if (event.keyCode === 27) { // Escape
                    scope.resetOption();
                }
            });
        }
    }
}])
.directive('lookupResults', ['$document', function($document) {
    return {
        restrict: 'A',
        scope: {
            'currentResults': '=',
            'selectOption': '&',
            'resetOption': '&'
        },
        template: '<div class="lookup-result" lookup-result ng-repeat="result in currentResults">' +
                       '<div>' + '{{ result.name }}' + '</div>' +
                  '</div>',
        link: function(scope, iElement, iAttrs) {
            $document.on('click', function(event) {
                event.stopImmediatePropagation();
                var target = event.target;

                if (target === iElement[0].previousSibling || 
                    target == iElement[0] || 
                    target.parentNode == iElement[0] || target.parentNode.parentNode == iElement[0]) { return; }

                scope.resetOption()();
                scope.$destroy();
            });

            scope.$on('$destroy', function() {
                $document.off('click');
            });
        }
    }
}])
.directive('lookupResult', function() {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            iElement.on('click', function() {
                scope.selectOption()({ 'result': scope.result });
                iElement.parent().remove();
            });
        }
    }
});
