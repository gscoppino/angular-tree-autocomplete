angular.module('AngularAutocompleteDemo', ['ui.bootstrap', 'angularTreeAutocomplete'])

.controller('AutocompleteCtrl', function($scope) {
    console.log('Loaded AutocompleteCtrl');
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
