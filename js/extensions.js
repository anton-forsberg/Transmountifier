Array.prototype.getItemByValue = function(key, value){
    var result = undefined;
    
    for(var i = 0; i < this.length; i++){
        if (this[i][key] == value){
            result = this[i];
            break;
        }
    }
    
    return result;
};

Array.prototype.containsArray = function(array){
    for(var i = 0; i < array.length; i++){
        if(this.indexOf(array[i]) === -1)
           return false;
    }
    return true;
}

Array.prototype.containsKeyWithValue = function(key, value){
    return this.getIndexByValue(key, value) > -1;
}

Array.prototype.contains = function(value){
    var result = false;
    
    for(var i = 0; i < this.length; i++){
        if (this[i] == value){
            result = true;
            break;
        }
    }
    
    return true;
}

Array.prototype.getItemsByValue = function(key, value){
    var result = [];
    
    for(var i = 0; i < this.length; i++){
        if (this[i][key] == value){
            result.push(this[i]);
        }
    }
    
    return result;
};

Array.prototype.getIndexByValue = function(key, value){
    var result = -1;
    
    for(var i = 0; i < this.length; i++){
        if (this[i][key] == value){
            result = i;
            break;
        }
    }
    
    return result;
};