async function loadCache(){
    dataJSON = window.localStorage.getItem('cache');
    cache = JSON.parse(dataJSON)
    if(typeof(cache)==="null" || !cache)
    {
        cache = {
            projects: {},
            customers: {},
            activities: {},
            users: {},
            tags: {},
            timestamp: 0,
        };
    }
    return cache;
}

async function saveCache(data){
    if(debug) console.log('saving cache');
    window.localStorage.setItem('cache', JSON.stringify(data));
}

async function refreshCache(){
    var api = new API();
    var projects = api.makeAPICall("get","/api/projects");
    var customers = api.makeAPICall("get","/api/customers");
    var activities = api.makeAPICall("get","/api/activities");
    var users = api.makeAPICall("get","/api/users");
    var tags = api.makeAPICall("get","/api/tags");
    var timestamp = Date.now()/1000;

    cache = {
        projects: projects,
        customers: customers,
        activities: activities,
        users: users,
        tags: tags,
        timestamp: timestamp,
    };

    if(debug) console.log('refreshing cache',(cache));
    saveCache(cache)
    processCache();
}

function reloadCache(){
    refreshCache().then(()=>{
        //Neutralino.os.showMessageBox("Setting", "Cache refreshed!")
        navigator.notification.alert("Cache refreshed!");
    }).catch(()=>{
        //Neutralino.os.showMessageBox("Setting", "Cache refresh failed!")
        navigator.notification.alert("Cache refresh failed!");
    });
}

async function initCache(){

   resp = await loadCache().then(()=>{
        checkCache()
   })
   .catch(()=>{
    if(debug) console.log('initCache error',err)
        refreshCache();
   });
   return resp;
}

async function checkCache(){
    if((cache.timestamp + (1*60*60)) < (Date.now()/1000) || typeof(cache) ==="undefined" || typeof(cache) == "null")
    {
        if(debug) console.log('refreshCache now',cache.timestamp, Date.now())
        if(debug) console.log( (cache.timestamp + (1*60*60)) < Date.now())
        refreshCache();
    }
    else
    {
        if(debug) console.log('cache is valid')
        processCache();
    }
}

async function processCache(){
    cache._parseProjects = [];
    if((cache.projects).length>0)
    {
        cache.projects.forEach(function(item,key){
            cache._parseProjects[item.id]=item;
        });
    }
    
    cache._parseCustomers = [];
    if((cache.customers).length>0)
    {
        cache.customers.forEach(function(item,key){ 
            cache._parseCustomers[item.id]=item;
        });
    }

    cache._parseActivities = [];
    if((cache.activities).length>0)
    {
        cache.activities.forEach(function(item,key){
            cache._parseActivities[item.id]=item;
        });
    }

    cache._parseUsers = [];
    if((cache.users).length>0)
    {
        cache.users.forEach(function(item,key){
            cache._parseUsers[item.id]=item;
        });
    }
    
    cache._parseTags = [];
    if((cache.tags).length>0)
    {
        cache.tags.forEach(function(item,key){
            cache._parseTags[item.id]=item;
        });
    }
}