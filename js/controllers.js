(function(angular){
    angular.module('transmountifier').controller('mainController', mainController);
    angular.module('transmountifier').controller('colorController', colorController);
    angular.module('transmountifier').controller('loginController', loginController);
    angular.module('transmountifier').controller('aboutController', aboutController);
    
    mainController.$inject = ['transmountifierService', 'filterService', '$mdDialog'];
    colorController.$inject = ['transmountifierService', 'filterService', '$mdDialog'];
    loginController.$inject = ['transmountifierService', '$mdDialog', '$rootScope'];
    aboutController.$inject = ['transmountifierService'];
    
    function mainController(transmountifierService, filterService, $mdDialog) {
        var vm = this;
        vm.Mounts = [];
        vm.Colors = [];
        vm.DataLoaded = false;
        vm.MountLimit = 60;
        vm.ScrollMountIncrease = 40;
        vm.SearchText = filterService.SearchText || "";
        vm.FilterColors = filterService.Colors || [];
        vm.FilterColorKeys = filterService.ColorKeys || [];
        vm.IncludeHorde = filterService.IncludeHorde;
        vm.IncludeAlliance = filterService.IncludeAlliance;
        
        vm.GetAllMounts = GetAllMounts;
        vm.GetAllColors = GetAllColors;
        vm.GetIcon = GetIcon;
        vm.FormatIcon = FormatIcon;
        vm.GetImage = GetImage;
        vm.UpdateMount = UpdateMount;
        vm.SearchMounts = SearchMounts;
        vm.ShowImage = ShowImage;
        vm.MountFilter = MountFilter;
        vm.RemoveFilter = RemoveFilter;
        vm.FilterMounts = FilterMounts;
        vm.BottomScroll = BottomScroll;
        vm.GetMountImage = GetMountImage;
        
        function SearchMounts(){
            return vm.TempMounts.filter(function(mount){
                return mount.name.toLowerCase().indexOf(vm.SearchText.toLowerCase()) > -1
            });
        }
        
        function GetMountImage(mount){
            if (mount.imageurl)
                return mount.imageurl;
            else
                return vm.GetIcon(mount.icon);
        }
        
        function BottomScroll(){
            if (vm.MountLimit < vm.Mounts.length)
                vm.MountLimit = vm.MountLimit + vm.ScrollMountIncrease;
        }
        
        function RemoveFilter(index){
            vm.FilterColors.splice(index, 1);
            vm.FilterColorKeys.splice(index, 1);
            vm.FilterMounts();
        }
        
        function MountFilter(mount){
            return !vm.SearchText || mount.name.toLowerCase().indexOf(vm.SearchText.toLowerCase()) > -1;
        }
        
        function ShowImage(mount){
            var imageurl = mount.imageurl ? mount.imageurl : vm.GetIcon(mount.icon);
            
            transmountifierService.ShowImageDialog(imageurl);
        }
        
        function GetIcon(icon){
            return '//wow.zamimg.com/images/wow/icons/large/' + icon + '.jpg';
        }
        
        function FormatIcon(icon){
            return 'url(' + vm.GetIcon(icon) + ')';
        }
        
        function GetImage(imageurl){
            return 'url(' + imageurl + ')';
        }
        
        function GetAllMounts(){
            if (vm.Mounts.length)
                return;
            
            transmountifierService.GetAllMounts(vm.IncludeAlliance, vm.IncludeHorde).then(GetAllMountsCallback);
            
            function GetAllMountsCallback(response){
                vm.Mounts = response;
                vm.AllMounts = angular.copy(vm.Mounts);
                vm.TempMounts = angular.copy(vm.Mounts);
                vm.DataLoaded = true;
                if (vm.FilterColors.length)
                    vm.FilterMounts();
            }
        }
        
        function FilterMounts(){
            vm.DataLoaded = false;
            vm.TempMounts = angular.copy(vm.Mounts);
            vm.Mounts = [];
            filterService.Colors = vm.FilterColors;
            filterService.ColorKeys = vm.FilterColorKeys;
            filterService.SearchText = vm.SearchText;
            filterService.IncludeAlliance = vm.IncludeAlliance;
            filterService.IncludeHorde = vm.IncludeHorde;
            filterService.FilterMounts(vm.AllMounts).then(FilterMountsCallback);

            function FilterMountsCallback(response){
                vm.Mounts = response;
                vm.TempMounts = angular.copy(vm.Mounts);
                vm.DataLoaded = true;
            }
        }
        
        function GetAllColors(){
            if (vm.Colors.length)
                return;
            
            transmountifierService.GetAllColors().then(GetAllColorsCallback);
            
            function GetAllColorsCallback(response){
                vm.Colors = response;
            }
        }
        
        function UpdateMount(mount, event, edit){
            event.stopPropagation();
            $mdDialog.show({
                templateUrl: 'mount-dialog.tmpl.html',
                controller: updateMountController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: true,
                escapeToClose: true,
                locals: {
                    colors: vm.Colors,
                    mounts: vm.Mounts,
                    mount: mount,
                    edit: edit
                }
            });
            
            function updateMountController(){
                var vm = this;
                vm.SelectedColor = null;
                vm.SearchText = null;

                vm.Add = Add;
                vm.Cancel = Cancel;
                vm.Delete = Delete;
                vm.FormatIcon = FormatIcon;
                vm.GetIcon = GetIcon;
                vm.GetImage = GetImage;
                vm.ConvertToArray = ConvertToArray;
                vm.SetSelectedColors = SetSelectedColors;

                function SetSelectedColors(mount){
                    if (!mount || !mount.colors){
                        vm.SelectedColors = []
                    }
                    else{
                        vm.SelectedColors = vm.ConvertToArray(mount.colors)
                    }
                }
                
                function ConvertToArray(obj){
                    var arr = [];
                    for(var prop in obj ) {
                        if (obj.hasOwnProperty(prop)){
                            obj[prop].$id = prop;
                            arr.push(obj[prop]);
                        }
                    }
                    return arr;
                }
                
                function Add(){
                    vm.mount.colors = {};
                    for(let i = 0; i < vm.SelectedColors.length; i++){
                        var color = vm.SelectedColors[i];
                        vm.mount.colors[color.id] = {
                            id: color.id,
                            name: color.name,
                            value: color.value
                        };
                    }
                    if (vm.mount.$id){
                        transmountifierService.UpdateMount(vm.mount);
                    }
                    vm.Cancel();
                }
                
                function Cancel(){
                    $mdDialog.hide();
                }
                
                function Delete(){
                    vm.mounts.$remove(vm.mount);
                    vm.Cancel();
                }
                
                vm.SetSelectedColors(vm.mount);
             }
        }
        
        vm.GetAllMounts();
        vm.GetAllColors();
    }
    
    function colorController(transmountifierService, filterService, $mdDialog) {
        var vm = this;
        vm.Colors = [];
        vm.SelectedColors = angular.copy(filterService.Colors) || [];
        vm.SelectedColorKeys = angular.copy(filterService.ColorKeys) || [];

        vm.GetAllColors = GetAllColors;
        vm.SelectColor = SelectColor;
        vm.SaveColors = SaveColors;
        vm.UpdateColor = UpdateColor;
        vm.ApplyFilter = ApplyFilter;
        
        function GetAllColors(){
            transmountifierService.GetAllColors().then(GetAllColorsCallback);
            
            function GetAllColorsCallback(response){
                vm.Colors = response;
            }
        }
        
        function SaveColors(){
            vm.Colors.$save();
        }
        
        function SelectColor(color){
            var currentIndex = vm.SelectedColors.getIndexByValue('$id', color.$id);
            
            if (currentIndex == -1){
                vm.SelectedColors.push(color);
                vm.SelectedColorKeys.push(color.$id);
            }
            else{
                vm.SelectedColors.splice(currentIndex, 1);
                vm.SelectedColorKeys.splice(currentIndex, 1);
            }
        }
        
        function ApplyFilter(){        
            filterService.Colors = vm.SelectedColors;
            filterService.ColorKeys = vm.SelectedColorKeys;
            window.location.href = "#/mounts"
        }
        
        function UpdateColor(color, event){
            if (event)
                event.stopPropagation();
            
            $mdDialog.show({
                templateUrl: 'color-dialog.tmpl.html',
                controller: addColorController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: true,
                escapeToClose: true,
                locals: {
                    colors: vm.Colors,
                    color: color
                }
            });
            
             function addColorController(){
                var vm = this;

                vm.Color = vm.color || { name: '', value: '', id: '', order: -1}
                vm.Add = Add;
                vm.Cancel = Cancel;
                vm.Delete = Delete;
                 
                function Add(){
                    if (vm.Color.id){
                        transmountifierService.UpdateColor(vm.Color);
                    }
                    else{
                        vm.Color.id = vm.Color.name.toLowerCase();
                        transmountifierService.AddColor(vm.Color.id, vm.Color);
                    }

                    vm.Cancel();
                }
                
                function Cancel(){
                    $mdDialog.hide();
                }
                
                function Delete(){
                    vm.colors.$remove(vm.Color);
                    vm.Cancel();
                }
             }
        }
        
        vm.GetAllColors();
    }
    
    function loginController(transmountifierService, $mdDialog, $rootScope) {
        var vm = this;
        
        vm.ShowLogin = ShowLogin;
        vm.Logout = Logout;
        
        function Logout(){
            transmountifierService.Logout();
        }
        
        function ShowLogin(){
            $mdDialog.show({
                templateUrl: 'login-dialog.tmpl.html',
                controller: loginController,
                controllerAs: 'vm',
                bindToController: true,
                clickOutsideToClose: true,
                escapeToClose: true
            });
            
            function loginController(){
                var vm = this;
                
                vm.Email = '';
                vm.Password = '';
                vm.Login = Login;
                vm.Cancel = Cancel;
                
                function Login(){
                    transmountifierService.Login(vm.Email, vm.Password).then(LoginCallback);

                    function LoginCallback(response){
                        transmountifierService.SetCurrentUser(response);
                        $mdDialog.hide();
                    }
                }
                
                function Cancel(){
                    $mdDialog.hide();
                }
            }
        
        }
    }

    function aboutController(transmountifierService){
        var vm = this;
    }
})(window.angular);