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

function scanQRCodeSetting(){
    QRScanner.prepare(qrScanInitDone); // show the prompt
}

function qrScanInitDone(err, status){
  if (err) {

    if(confirm("Would you like to enable QR code scanning? You can allow camera access in your settings."))
    {
        QRScanner.openSettings();
    }
    // here we can handle errors and clean up any loose ends.
    console.error(err);
    return;
  }

  if(!status.authorized){
    if(status.canOpenSettings && confirm("Would you like to enable QR code scanning? You can allow camera access in your settings.")){
      QRScanner.openSettings();
    }
    return;
  }

  startQRScan();
}

function startQRScan(){
    // the native camera preview sits behind the WebView, so the page
    // must turn transparent for it to become visible
    document.body.classList.add('qr-scanning');
    $('#qrScanCancelWrap').removeClass('d-none');

    QRScanner.scan(function(err, qrtext){
        stopQRScan();
        if(err)
        {
            // an error occurred, or the scan was canceled (error code `6`)
        }
        else
        {
            // The scan completed, display the contents of the QR code:
            //expecting jsonText
            try{
                var jsonText = $.parseJSON(qrtext);
                if(jsonText.type=="kimai")
                {
                    if(jsonText.url!="" && jsonText.token!="")
                    {
                        $('#host').val(jsonText.url);
                        $('#token').val(jsonText.token);
                        saveSetting();

                        //alert('Kimai loaded!');
                    }
                    else alert('QR code is not complete!');
                }
            }
            catch(error){
                alert('QR code not recognized!');
            }
        }
    });

    QRScanner.show();
}

function stopQRScan(){
    QRScanner.hide();
    QRScanner.destroy();
    document.body.classList.remove('qr-scanning');
    $('#qrScanCancelWrap').addClass('d-none');
}

function cancelQRScan(){
    QRScanner.cancelScan(stopQRScan);
}

function toggleQRScanCamera(){
    QRScanner.getStatus(function(status){
        if(status.currentCamera === 0){
            QRScanner.useFrontCamera(function(err){ if(err) console.error(err); });
        }
        else{
            QRScanner.useBackCamera(function(err){ if(err) console.error(err); });
        }
    });
}

document.addEventListener('backbutton', function(e){
    if(document.body.classList.contains('qr-scanning')){
        e.preventDefault();
        cancelQRScan();
    }
}, false);

init().then(()=>{
    renderSettings();
});