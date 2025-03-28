class API{
    constructor(){
        this.loadCredentials()
    }

    loadCredentials(){
        this.host = "";
        this.token = "";

        if(setting)
        {
            this.host = setting.host;
            this.token = setting.token;
        }
        else 
        {

        }
    }
    
    setCredentials(host,token){
        this.host = host;
        this.token = token;
    }

    
    async makeAPICallAsync(type,method,data){
        if(this.host=="") return false;

        var result = {};
        var headers = {
            'Authorization': 'Bearer ' + this.token,
        };

        $.ajax({
            async: false,
            url: this.host+method,
            type: type.toUpperCase(),
            crossDomain: true,
            headers: headers,
            contentType: 'application/json; charset=utf-8;',
            data: JSON.stringify(data),
            success: function(resp){
                result = resp;
            },
            error: function(xhr, status, error){
                console.log(JSON.stringify(xhr),JSON.stringify(error));
            }
        }).then(function(){
            result = ''
        })
        return result;
    }
    
    makeAPICall(type,method,data){
        if(this.host=="") return false;

        var result = {};

        var headers = {
            'Authorization': 'Bearer ' + this.token,
        };

        $.ajax({
            async: false,
            url: this.host+method,
            type: type.toUpperCase(),
            crossDomain: true,
            headers: headers,
            contentType: 'application/json; charset=utf-8;',
            data: JSON.stringify(data),
            success: function(resp){
                result = resp;
            },
            error: function(xhr, status, error){
                console.log(JSON.stringify(xhr),JSON.stringify(error));
            }
        }).then(function(){
            result = ''
        })
        return result;
    }
    
    testConnection(){
        if(this.host=="") return false;
        
        var ret = '';
        var result = this.makeAPICall("get","/api/version")
        if(typeof(result.version)!=="undefined") ret = result.version;
        return ret;
    }

}