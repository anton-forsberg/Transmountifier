(function(angular){
    angular.module('transmountifier', ['ngRoute', 'ngMaterial', 'ngMessages', 'ngCookies', 'firebase', 'ngWebworker', 'ngclipboard']);
    angular.module('transmountifier').config(configFunction);
    angular.module('transmountifier').run(runFunction);
    
    runFunction.$inject = ['transmountifierService', '$rootScope'];
    
    function configFunction($routeProvider) {
         $routeProvider.when('/mounts', {
                templateUrl: '/views/main.html',
                controller: 'mainController',
                controllerAs: 'vm'
            }).when('/colors', {
                templateUrl: '/views/colors.html',
                controller: 'colorController',
                controllerAs: 'vm'
            }).when('/login', {
                templateUrl: '/views/login.html',
                controller: 'loginController',
                controllerAs: 'vm'
            }).when('/about', {
                templateUrl: '/views/about.html',
                controller: 'aboutController',
                controllerAs: 'vm'
            }).otherwise({
                redirectTo: '/mounts'
            });
    }
    
    function runFunction(transmountifierService, $rootScope){
        var config = {
            apiKey: "AIzaSyCJntlzNh_U2SEDgy0PaKXjWblhGKyfDuA",
            authDomain: "transmountifier.firebaseapp.com",
            databaseURL: "https://transmountifier.firebaseio.com",
            storageBucket: "transmountifier.appspot.com",
            messagingSenderId: "1034841628871"
        };
        firebase.initializeApp(config);
        
        firebase.auth().onAuthStateChanged(function(user) {
            transmountifierService.SetCurrentUser(user);
        });
    }
})(window.angular);