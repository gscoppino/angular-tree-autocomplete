angular.module('AngularAutocompleteDemo', ['ui.bootstrap', 'angularTreeAutocomplete'])

.filter('DemoSiblings', ['$q', '$filter', function($q, $filter) {
    return function(query, source) {
        var filterDeferred = $q.defer();

        var nameSearch = new RegExp(query.trim(), "gi");
        var idSearch = new RegExp('^' + query.trim());
        filterDeferred.resolve($filter('filter')(source, function(obj, index) {
            var name_match = nameSearch.test(obj.name);
            var id_match = idSearch.test(obj.id);
            return name_match || id_match;
        }, false));

        return filterDeferred.promise;
    }
}])

.filter('DemoChildren', ['$q', '$filter', function($q, $filter) {
    return function(query, source) {
        var filterDeferred = $q.defer();
        var filterSet = source.children.filter(function(child) {
            return child.type === 'BLK';
        });

        var nameSearch = new RegExp(query.trim(), "gi");
        var idSearch = new RegExp('^' + query.trim());
        filterDeferred.resolve($filter('filter')(filterSet, function(obj, index) {
            var name_match = nameSearch.test(obj.name);
            var id_match = idSearch.test(obj.id);
            return (name_match || id_match)

        }, false));

        return filterDeferred.promise;
    }
}])

.filter('DemoNamespaces', ['$q', '$filter', function($q, $filter) {
    return function(query, source) {
        var filterDeferred = $q.defer();
        var query = query.split('.');
        if (query.length === 1) {
            $filter('DemoSiblings')(query[0], source).then(function(results) {
                filterDeferred.resolve(results);
            });
        } else if (query.length > 1) {
            $filter('DemoSiblings')(query[0], source).then(function(results) {
                var childSet = results[0].children.filter(function(child) {
                    return child.type === 'ATTR';
                });

                var nameSearch = new RegExp(query[1].trim(), "gi");
                var idSearch = new RegExp('^' + query[1].trim());

                filterDeferred.resolve($filter('filter')(childSet, function(obj, index) {
                    var name_match = nameSearch.test(obj.name);
                    var id_match = idSearch.test(obj.id);
                    return (name_match || id_match);
                }, false));
            });
        }

        return filterDeferred.promise;
    }
}])

.controller('AutocompleteCtrl', function($scope) {
    $scope.query = '', $scope.query2 = '', $scope.query3 = '';
    $scope.treeDemo = [
    { 
        'name': 'Car',
        'children': [
            {
                'name': 'Engine',
                'id': "54f09acae138230a8f73ac21",
                'type': 'BLK'
            },
            {
                'name': 'Chassis',
                'id': "54f09acae138230a8f73ac22",
                'type': 'REQ'
            },
            {
                'name': 'MPG',
                'id': '54f09acae138230a8f73ac23',
                'type': 'ATTR'
            }
        ],
        'id': "54f09acae138230a8f73ac28",
        'type': 'BLK'
    }, 
    { 
        'name': 'Helicopter',
        'children': [
            {
                'name': 'Engine',
                'id': "54f09acae138230a8f73ac24",
                'type': 'BLK'
            },
            {
                'name': 'Rotor',
                'id': "54f09acae138230a8f73ac25",
                'type': 'BLK'
            },
            {
                'name': 'RotorMaxSpeed',
                'id': '54f09acae138230a8f73ac26',
                'type': 'ATTR'
            },
            {
                'name': 'RotorMinSpeed',
                'id': '54f09acae138230a8f73ac27',
                'type': 'ATTR'
            }
        ],
        'id': "54f09acae138230a8f73ac29",
        'type': 'BLK'
    }, 
    { 
        'name': 'Airplane',
        'children': [
            {
                'name': 'Engine',
                'id': "54f09acae138230a8f73ac30",
                'type': 'BLK'
            }
        ],
        'id': "54f09acae138230a8f73ac31",
        'type': 'BLK'
    }, 
    { 
        'name': 'Tank',
        'children': [
            {
                'name': 'Engine',
                'id': "54f09acae138230a8f73ac32",
                'type': 'BLK'
            }
        ],
        'id': "54f09acae138230a8f73ac33",
        'type': 'BLK'
    }
    ];
});
