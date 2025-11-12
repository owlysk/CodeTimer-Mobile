var activeItemId = 0;
init().then(()=>{
    api = new API();
    if(debug) console.log('starting load elements')
})
.then(()=>{
    refreshHomepage();
})



async function loadItems(){
    api.makeAPICallAsync("get","/api/timesheets?active=0").then((items)=>{
        if(debug) console.log('items',items)
        renderTimesheet(items)
    });
    
}

async function refreshHomepage(){
    loadItems();
    loadActive();
}

async function loadActive(){

    api.makeAPICallAsync("get", "/api/timesheets/active").then((activeItemArr)=>{
        if(debug) console.log('active',activeItemArr)
        if(activeItemArr.length) 
        {
            activeItemId = activeItemArr[0].id;
            renderActive(activeItemArr[0]);
        }
        else 
        {
            activeItemId=0;
            renderInactive();
        }
    });
    
}

var timerDuration;
async function renderActive(item){
    $('#desc').val(item.description);
    $('.start-btn').addClass('d-none');
    $('.stop-btn').removeClass('d-none');
    $('#desc').attr('readonly','readonly');
    $('#desc').attr('onclick',`window.location.href='/detail.html?timesheet=${item.id}&active=1'`);
    $('#desc').addClass('active');

    var totalSec = (moment().format('X') - moment(item.begin).format('X'));
    timerDuration = setInterval(function(){
        totalSec+=1
        stringDuration = formatDuration(totalSec)
        $('.stop-time').text(stringDuration);
    },1000);
}

async function stopItem(){
    if(activeItemId > 0)
    {
        await api.makeAPICallAsync("patch","/api/timesheets/"+activeItemId+"/stop")
        .then(function(resp){
            if(typeof(resp.id)==="undefined")
            {
                if(debug) console.log('api stop', JSON.stringify(resp))
                if(debug_alert) alert('DEBUG' + '\n' + JSON.stringify(resp));
            }
        });
        renderInactive();
        clearInterval(timerDuration);
        await loadItems()
    }
}

function repeatItem(itemId){
    api = new API();
    var data = {};
    data.copy="all";
    var item = api.makeAPICall("patch","/api/timesheets/"+itemId+"/restart", data)
    if(item.id) 
    {
        if(debug) console.log('repeatItem', item);
        activeItemId = item.id
        renderActive(item);
        window.scroll({top:0});
    }
    else
    {
        if(debug) console.log('repeat Item response', JSON.stringify(item));
        if(debug_alert) alert('DEBUG' + '\n' + JSON.stringify(item));
    }

}

function renderInactive(){
    $('#desc').val('');
    if(typeof($('#desc').attr('readonly'))!=="undefined") $('#desc').removeAttr('readonly');
    $('.start-btn').removeClass('d-none');
    $('.stop-btn').addClass('d-none');
    $('.stop-time').text('00:00:00');
    if(typeof($('#desc').attr('onclick'))!=="undefined") $('#desc').removeAttr('onclick');
    if(typeof($('#desc').attr('ontouchstart'))!=="undefined") $('#desc').removeAttr('ontouchstart');
    $('#desc').removeClass('active');
}


function renderTimesheet(data){

        var items = data;
        var list = {};
        if(items.length)
        {
            items.forEach(function(item,key){
                var date = new Date(item.end)
                var d = date.getDate();
                var m = date.getMonth() + 1;
                var y = date.getFullYear();

                var itemData = item;
                var dateFormatted = d+'.'+m+'.'+y;
                if(typeof(list[dateFormatted])==="undefined") list[dateFormatted] = [];
                list[dateFormatted].push(itemData);
                
            });

            var htmlData = ``;
            for(item of Object.entries(list)){
                
                var htmlDataItems='';
                var totalDayTime=0;

                if(item.length)
                {
                    item[1].forEach(function(listItem,listItemKey){
                        desc = listItem.description;
                        if(desc == null) desc='<span class="text-secondary fst-italic"></span>';
                        desc = desc.replace("/\n/g","<br/>");
                        desc = desc.replace("/\r/g\n","<br/>");

                        totalDayTime+=listItem.duration;

                        var durationTime = formatDuration(listItem.duration)
                        
                        // Get project and activity info for better display
                        var projectName = (typeof(cache._parseProjects[listItem.project])!="undefined") ? cache._parseProjects[listItem.project].name : '---';
                        var projectColor = (typeof(cache._parseProjects[listItem.project])!="undefined") ? cache._parseProjects[listItem.project].color : '#64748b';
                        var activityName = (typeof(cache._parseActivities[listItem.activity])!="undefined") ? cache._parseActivities[listItem.activity].name : '---';
                        var activityColor = (typeof(cache._parseActivities[listItem.activity])!="undefined") ? cache._parseActivities[listItem.activity].color : '#64748b';
                        var customerName = (typeof(cache._parseProjects[listItem.project])!="undefined") ? cache._parseProjects[listItem.project].parentTitle : '---';
                        
                        // Get user information
                        var userName = (typeof(cache._parseUsers[listItem.user])!="undefined") ? cache._parseUsers[listItem.user].alias : '---';
                        // Get tags information
                        var tags = [];
                        if (typeof(listItem.tags) !== "undefined" && listItem.tags && Array.isArray(listItem.tags)) {
                            tags = listItem.tags;
                        } else if (typeof(listItem.tags) !== "undefined" && listItem.tags) {
                            tags = [listItem.tags];
                        }
                        var tagsText = tags.length > 0 ? tags.join(', ') : '';
                        
                        // Format time for better display
                        var startTime = moment(listItem.begin).format('HH:mm');
                        var endTime = moment(listItem.end).format('HH:mm');
                        
                        htmlDataItems+=`
    <div class="timesheet-card" role="listitem" onclick="window.location.href='/detail.html?timesheet=${listItem.id}'" role="button" tabindex="0" aria-label="View details" onkeydown="if(event.key==='Enter'||event.key===' '){window.location.href='/detail.html?timesheet=${listItem.id}'}">
        <div class="timesheet-card-header" style="border-left: 4px solid ${projectColor};">
            <div class="timesheet-time-info">
                <div class="timesheet-time-range">
                    <span class="time-start">${startTime}</span>
                    <span class="time-separator">→</span>
                    <span class="time-end">${endTime}</span>
                </div>
            </div>
            
            <div class="card-title-section">
                <h3 class="card-title" style="color: ${projectColor};">
                    <i class="fas fa-folder" aria-hidden="true"></i>
                    ${projectName}
                </h3>
                <div class="card-subtitle">
                    <span class="customer-info" style="color: ${projectColor}CC;">
                        <i class="fas fa-building" aria-hidden="true"></i>
                        ${customerName}
                    </span>
                    <span class="user-info" style="color: ${projectColor}CC;">
                        <i class="fas fa-user" aria-hidden="true"></i>
                        ${userName}
                    </span>
                </div>
            </div>
            
            <div class="timesheet-actions">
                <!-- moved duration badge here so it's on the right -->
                <div class="timesheet-duration-badge header-duration">
                    <i class="fas fa-clock" aria-hidden="true"></i>
                    <span class="duration-text">${durationTime}</span>
                </div>

                <a href="#" class="btn btn-sm btn-outline-primary repeat-btn" onclick="repeatItem(${listItem.id}); return false;" title="Repeat this task" aria-label="Repeat this task">
                    <i class="fas fa-repeat" aria-hidden="true"></i>
                </a>
            </div>
        </div>
        
        <div class="timesheet-card-body" onclick="window.location.href='/detail.html?timesheet=${listItem.id}'" role="button" tabindex="0" aria-label="View details" onkeydown="if(event.key==='Enter'||event.key===' '){window.location.href='/detail.html?timesheet=${listItem.id}'}">
            <div class="card-description">
                <div class="activity-info" style="background-color: ${activityColor}20; border-left: 3px solid ${activityColor};">
                    <span class="activity-name" style="color: ${activityColor};">
                        <i class="fas fa-tasks" aria-hidden="true"></i>
                        ${activityName}
                    </span>
                    ${ (tagsText) ? `
                        <span class="tags-list">
                            <i class="fas fa-tags" aria-hidden="true"></i>
                            ${tagsText}
                        </span>
                    ` : ''}
                </div>
                <p class="description-text">${desc}</p>
            </div>
        </div>
    </div>`;
                    });
                }
                
                htmlData+= `
                <div class="col-12 date-section mb-4">
                    <div class="date-header">
                        <div class="date-info">
                            <div class="date-badge">
                                <i class="fas fa-calendar-day" aria-hidden="true"></i>
                                <span class="date-text">${item[0]}</span>
                            </div>
                            <div class="date-total">
                                <i class="fas fa-clock" aria-hidden="true"></i>
                                <span class="total-text">Total: ${formatDuration(totalDayTime)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="timesheet-entries">
                        ${htmlDataItems}
                    </div>
                </div>`;
               
            }
            $('.list-data').html(htmlData)
        }
        else
        {
            $('.list-data').html('')
        }
}
