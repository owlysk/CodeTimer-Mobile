function testConnection(){
    var host = $('#host').val();
    var token = $('#token').val();

    if(host.indexOf('/api')!==-1) host = host.replace('/api','');

    var result = checkConnection(host,token);

    if(result!="")
    {
        //Neutralino.os.showMessageBox("Test connection", "Connection is ok\nVersion: " + result)
        navigator.notification.alert("Connection is ok\nVersion: " + result);
    }
    else 
    {
        //Neutralino.os.showMessageBox("Test connection","Connection is invalid\nError: " + result)
        navigator.notification.alert("Connection is invalid\nError: " + result);
    }

    return result;
}

function checkConnection(host, token){
    var api = new API();
    api.setCredentials(host,token);
    var result = api.testConnection();
    return result;
}

function renderSettings(){
    loadSettings().then(function(setting){
        $('#host').val(setting.host);
        $('#token').val(setting.token);

        if(typeof(setting.min_tray)!=="undefined")
        {
            if(setting.min_tray==1) $('#min_tray').prop('checked',true);
            else $('#min_tray').prop('checked',false);
        } 
        if(typeof(setting.always_top)!=="undefined")
        {
            if(setting.always_top==1) $('#always_top').prop('checked',true);
            else $('#always_top').prop('checked',false);
        }

    }).catch(function(error){
        if(debug) console.log('error',error)
    });

    $('.app-version').text('').hide();
    
}

//toto musime presunut do app.js
function saveSetting(){
    //openLoadingDialog();

    var host = $('#host').val();
    var token = $('#token').val();

    if(host.indexOf('/api')!==-1) host = host.replace('/api','');

    var min_tray = 0;
    if($('#min_tray').prop('checked')) min_tray=1;

    var always_top = 0;
    if($('#always_top').prop('checked')) always_top=1;
    
    api = new API()
    api.setCredentials(host,token)
    
    let data = JSON.stringify({
        host: host,
        token: token,
        min_tray: min_tray,
        always_top: always_top,
    });

    //console.log('window.localStorage',window.localStorage);
    window.localStorage.setItem('setting', data )
    
    setting.host = host;
    setting.token = token;
    setting.min_tray = min_tray;
    setting.always_top = always_top;
    refreshCache();

    //Neutralino.os.showMessageBox("Setting", "Settings saved!")
    navigator.notification.alert("Settings saved!");

    var checkResult = checkConnection(host,token);
    if(checkResult != "") window.location.href='index.html';
    
    //closeLoadingDialog();

    result = true;
    return result;
}

init().then(()=>{
    renderSettings();
});