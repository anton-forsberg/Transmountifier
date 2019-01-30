(function(angular){
    angular.module('transmountifier').service('firebaseService', firebaseService);
    angular.module('transmountifier').service('transmountifierService', transmountifierService);
    angular.module('transmountifier').service('filterService', filterService);
    
    firebaseService.$inject = ['$firebaseObject', '$firebaseArray', '$firebaseAuth'];
    transmountifierService.$inject = ['firebaseService', '$rootScope', '$mdDialog'];
    filterService.$inject = ['Webworker'];
    
    function firebaseService($firebaseObject, $firebaseArray, $firebaseAuth) {    
        this.GetObject = function (path) {
            var ref = firebase.database().ref(path);
            var obj = $firebaseObject(ref);
            return obj.$loaded()
        }
        
        this.GetObjects = function (path, filterChild, filterValue) {
            var ref = firebase.database().ref(path);
            var arr = $firebaseArray(ref);
            return arr.$loaded()
        }
        
        this.GetObjectByValue = function (path, key, value){
            var ref = firebase.database().ref(path);
            var obj = $firebaseObject(ref);
        }
        this.RemoveObject = function (obj) {
            return obj.$remove();
        }
        this.RemovePath = function (path) {
            var ref = new Firebase(path);
            var obj = $firebaseObject(ref);
            return obj.$remove();
        }
        
        this.AuthenticateWithPassword = function (email, password){
            var ref = firebase.auth();
            var obj = $firebaseAuth(ref);

            return obj.$signInWithEmailAndPassword(email, password);
        }
        
        this.Logout = function(){
            return firebase.auth().signOut();
        }
        
        this.GetCurrentUser = function(){
            var ref = firebase.auth();
            var obj = $firebaseAuth(ref);

            return obj.$getAuth();
        }
        
        this.AddObject = function(path, key, obj){
            var ref = firebase.database().ref(path);
            return ref.child(key).set(obj);
        }
        
        this.UpdateObject = function(path, obj){
            var ref = firebase.database().ref(path);
            return ref.set(obj);
        }
    }
    
    function transmountifierService(firebaseService, $rootScope, $mdDialog) {
        this.GetAllMounts = function(includeAlliance, includeHorde){
            var filterChild = undefined;            
            return firebaseService.GetObjects('mounts');
        }
        
        this.GetAllColors = function(){
            return firebaseService.GetObjects('colors');
        }
        
        this.AddColor = function(key, obj){
            return firebaseService.AddObject('colors', key, obj);
        }
        
        this.UpdateColor = function(obj){
            var color = {
                name: obj.name,
                value: obj.value,
                order: obj.order || -1,
                id: obj.id
            }
            return firebaseService.UpdateObject('colors/' + color.id, color);
        }
        
        this.AddColorToMount = function(mountId, key, obj){
            return firebaseService.AddObject('mounts/' + mountId + '/colors', key, obj);
        }
        
        this.UpdateMount = function(obj){
            var mount = {
                colors: obj.colors,
                creatureId: obj.creatureId,
                icon: obj.icon,
                imageurl: obj.imageurl,
                isAquatic: obj.isAquatic,
                isAvailableToAlliance: obj.isAvailableToAlliance || false,
                isAvailableToHorde: obj.isAvailableToHorde || false,
                isFlying: obj.isFlying || false,
                isGround: obj.isGround || false,
                isJumping: obj.isJumping || false,
                itemId: obj.itemId,
                name: obj.name,
                qualityId: obj.qualityId,
                spellId: obj.spellId
            }
            return firebaseService.UpdateObject('mounts/' + mount.spellId, mount);
        }
        
        
        this.GetCurrentUser = function(){
            return firebaseService.GetCurrentUser();
        }
        
        this.SetCurrentUser = function(user){
            $rootScope.$evalAsync(function(){
                $rootScope.CurrentUser = user;
                $rootScope.AdminMode = user != undefined;
            });
        }
        
        this.Login = function(email, password){
            return firebaseService.AuthenticateWithPassword(email, password);
        }
        
        this.Logout = function(){
            return firebaseService.Logout();
        }
        
    }
    
    function filterService(Webworker){
        function filterFunction(data){
            return filterMounts(JSON.parse(data));
            
            function filterMounts(data){
                if (!data.includeHorde && !data.includeAlliance)
                    return [];
                
                var filterFaction = !(data.includeHorde && data.includeAlliance);
                var filterColors = data.colors.length > 0;
                var filterText = data.searchText.length > 0;

                for (var i = data.mounts.length - 1; i >= 0; i--){
                    if (filterFaction){
                        if (data.includeHorde && !data.mounts[i].isAvailableToHorde){
                            data.mounts.splice(i, 1);
                            continue;
                        }
                        if (data.includeAlliance && !data.mounts[i].isAvailableToAlliance){
                            data.mounts.splice(i, 1);
                            continue;
                        }
                    }
                    if (filterColors){
                        if (data.mounts[i].colors){
                            if (!arrayContainsArray(Object.keys(data.mounts[i].colors), data.colorKeys)) {
                                data.mounts.splice(i, 1);
                                continue;
                            }
                        }
                        else {
                            data.mounts.splice(i, 1);
                            continue;
                        }
                    }
                    if (filterText){
                        if (data.mounts[i].name.toLowerCase().indexOf(data.searchText.toLowerCase()) == -1)
                            data.mounts.splice(i, 1);
                    }
                }
                
                return data.mounts;
            }
            
            function arrayContainsArray(arr1, arr2){
                for(var i = 0; i < arr2.length; i++){
                    if(arr1.indexOf(arr2[i]) === -1)
                       return false;
                }
                return true;
            }
        }
        
        this.FilterMounts = function (mounts){
            var filterWorker = Webworker.create(filterFunction)
            
            return filterWorker.run(JSON.stringify({
                mounts: mounts,
                colors: this.Colors,
                colorKeys: this.ColorKeys,
                searchText: this.SearchText,
                includeHorde: this.IncludeHorde,
                includeAlliance: this.IncludeAlliance
            }));
        }
        
        this.Colors = [];
        this.ColorKeys = [];
        this.SearchText = "";
        this.IncludeHorde = true;
        this.IncludeAlliance = true;
    }
})(window.angular);