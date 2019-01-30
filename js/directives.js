(function(angular){
    angular.module('transmountifier').directive('stopPropagation', stopPropagation);
    angular.module('transmountifier').directive('transmountifierMenu', transmountifierMenuDirective);
    angular.module('transmountifier').directive('transmountifierAdminToolbar', transmountifierAdminToolbarDirective);
    angular.module('transmountifier').directive('scrollToBottom', scrollToBottom);
    angular.module('transmountifier').directive('fadeInLoad', fadeInLoad);

    function stopPropagation() {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        }
    }
    
    function transmountifierMenuDirective(){    
        return {
            restrict: 'E',
            templateUrl: '/views/menu.html',
            controller: transmountifierMenuDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };
        
        transmountifierMenuDirectiveController.$inject = ['$rootScope', '$location'];
        
        function transmountifierMenuDirectiveController($rootScope, $location){
            var vm = this;
            
            $rootScope.$on('$routeChangeSuccess', function(event, current) {
                 vm.CurrentNavItem = $location.path();
            });
        }
    }
    
    function transmountifierAdminToolbarDirective(){            
        return {
            restrict: 'E',
            templateUrl: '/views/admintoolbar.html',
            controller: transmountifierAdminToolbarDirectiveController,
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                save: '&?',
                add: '&?'
            }
        };
        
        transmountifierAdminToolbarDirectiveController.$inject = ['$rootScope'];
        
        function transmountifierAdminToolbarDirectiveController($rootScope){
            var vm = this;
            
            vm.Add = Add;
            vm.Save = Save;
            
            function Add(){
                return vm.add();
            }
            
            function Save(){
                return vm.save();
            }
        }
    }
    
    function scrollToBottom(){
        return {
            restrict: 'A',
            link: linkFunction
        };
        
        function linkFunction(scope, element, attrs){
            var callback = scope.$eval(attrs.scrollToBottom);
            
            element.on('scroll', function(e){
                if (e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 100){
                    scope.$apply(callback);
                }
            })
        }
    }
    
    function fadeInLoad(){
        return {
            restrict: 'A',
            link: linkFunction
        };
        
        function linkFunction(scope, element, attrs){
            element.addClass('fade');
            
            element.on('load', function() {
                element.addClass('in');
            });
        }
    }
})(window.angular);