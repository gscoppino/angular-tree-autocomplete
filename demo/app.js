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
                'id': "1e3dge35r382324324",
                'type': 'BLK'
            },
            {
                'name': 'Chassis',
                'id': "34g4tjki356dgdsv",
                'type': 'REQ'
            },
            {
                'name': 'MPG',
                'id': '6ge9hdjsdb313e45',
                'type': 'ATTR'
            }
        ],
        'id': "454jh4545n3k23434",
        'type': 'BLK'
    }, 
    { 
        'name': 'Helicopter',
        'children': [
            {
                'name': 'Engine',
                'id': "43kuf35r382324874",
                'type': 'BLK'
            },
            {
                'name': 'Rotor',
                'id': "ad232f2jf2r4jf",
                'type': 'BLK'
            },
            {
                'name': 'RotorMaxSpeed',
                'id': 'd34598fd772fn',
                'type': 'ATTR'
            },
            {
                'name': 'RotorMinSpeed',
                'id': '76yhd8fg42fd0',
                'type': 'ATTR'
            }
        ],
        'id': "324234gbj324bj33443",
        'type': 'BLK'
    }, 
    { 
        'name': 'Airplane',
        'children': [
            {
                'name': 'Engine',
                'id': "7jdfd35r38548fg",
                'type': 'BLK'
            }
        ],
        'id': "9879kh67t432mnho",
        'type': 'BLK'
    }, 
    { 
        'name': 'Tank',
        'children': [
            {
                'name': 'Engine',
                'id': "5h9fn345rgfhg55",
                'type': 'BLK'
            }
        ],
        'id': "d4t43ktng3t858t663jhfn3",
        'type': 'BLK'
    }
    ];
});
