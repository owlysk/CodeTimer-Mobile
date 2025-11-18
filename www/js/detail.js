var urlParams = new URLSearchParams(window.location.search);
init().then(()=>{

    if(setting.host=="" || typeof(setting.host)==="undefined")
    {
        alert("You have to set API setting first!");
        window.location.href="setting.html";
        return false;
    }

    if(urlParams.has('timesheet'))
    {
        itemId = urlParams.get('timesheet');
        loadItem()

    }
    else
    {
        renderNewItem()
    }

});

$(document).ready(function(){});


function loadItem(){
    var api = new API();
    api.makeAPICallAsync("get","/api/timesheets/"+itemId).then((item)=>{
        if(debug) console.log('item', item);
        renderItem(item);

        if(urlParams.has('active'))
        {
            renderActive();
        }
    });

}

function renderItem(item){

    var timeFrom = formatTime(item.begin);
    $('#time_from').val(timeFrom)
    var timeTo = formatTime(item.end);
    $('#time_to').val(timeTo)

    var dateFrom = formatDate(item.begin)
    $('#date').val(dateFrom)

    var totalDuration = formatDuration(item.duration);
    $('#time_total').val(totalDuration);

    $('#desc').val(item.description || '');

    var projectId = (typeof item.project !== 'undefined' && item.project !== null) ? String(item.project) : '';
    var activityId = (typeof item.activity !== 'undefined' && item.activity !== null) ? String(item.activity) : '';

    var selectedCustomer = null;
    if (projectId && Array.isArray(cache.projects)) {
        var projectMatch = cache.projects.find(function(p){ return String(p.id) === String(projectId); });
        if (projectMatch && typeof projectMatch.customer !== 'undefined' && projectMatch.customer !== null) {
            selectedCustomer = String(projectMatch.customer);
        }
    }

    var tagValues = [];
    if (Array.isArray(item.tags) && item.tags.length) {
        tagValues = item.tags.map(function(t){
            if (typeof t === 'object' && t !== null) return (t.id || t.name || t.tag || String(t));
            return String(t);
        });
    } else if (typeof item.tag !== 'undefined' && item.tag !== null) {
        if (typeof item.tag === 'object' && item.tag !== null) {
            tagValues = [item.tag.id || item.tag.name || item.tag.tag || String(item.tag)];
        } else {
            tagValues = [String(item.tag)];
        }
    }

    renderItemCustomers(selectedCustomer);
    renderItemProjects(selectedCustomer, projectId);
    renderItemActivities(projectId, activityId);
    renderItemTags(tagValues);

    bindSelectChangeHandlers();
    renderCallbacksForSelects();
    renderUpdateProjectViaCustomer();
}

function renderUpdateActivitiesViaProject(){
    var selectedProject = $('#projectSelect').val() || '';
    var currentActivity = $('#activitySelect').val();

    renderItemActivities(selectedProject, currentActivity);

    var $activitySelect = $('#activitySelect');
    if (currentActivity && !$activitySelect.find(`option[value="${currentActivity}"]`).length) {
        const fallback = $activitySelect.find('option[value!=""]').first().val() || '';
        $activitySelect.val(fallback).trigger('change.select2');
    } else {
        $activitySelect.trigger('change.select2');
    }
}

function renderUpdateProjectViaCustomer(){
    var selectedCustomer = $('#customerSelect').val() || '';
    var currentProject = $('#projectSelect').val();

    renderItemProjects(selectedCustomer, currentProject);

    var $projectSelect = $('#projectSelect');
    if (currentProject && !$projectSelect.find(`option[value="${currentProject}"]`).length) {
        const fallback = $projectSelect.find('option[value!=""]').first().val() || '';
        $projectSelect.val(fallback).trigger('change');
    } else {
        $projectSelect.trigger('change');
    }
}

function renderActive(){
    $('#time_total').val('');
    $('#time_total').attr('readonly','readonly');
    $('#time_to').val('');
    $('#time_to').attr('readonly','readonly');
    $('.delete-item').remove();
}

function renderItemCustomers(selectedCustomer){
    const $select = $('#customerSelect');
    if (!$select.length) return;

    const valueToApply = (typeof selectedCustomer !== 'undefined' && selectedCustomer !== null) ? String(selectedCustomer) : ($select.val() || '');

    $select.empty();
    $select.append(new Option('Select Customer', '', false, false));

    const customers = Array.isArray(cache.customers) ? cache.customers : [];
    customers.forEach(function(customer){
        const label = customer.name || customer.title || customer.id;
        $select.append(new Option(label, customer.id, false, false));
    });

    if (valueToApply && $select.find(`option[value="${valueToApply}"]`).length) {
        $select.val(valueToApply);
    } else if (valueToApply) {
        $select.append(new Option(valueToApply, valueToApply, false, false));
        $select.val(valueToApply);
    } else {
        $select.val('');
    }

    $select.trigger('change.select2');
}

function renderItemProjects(filterCustomerId, selectedProject){
    const $select = $('#projectSelect');
    if (!$select.length) return;

    const valueToApply = (typeof selectedProject !== 'undefined' && selectedProject !== null) ? String(selectedProject) : ($select.val() || '');
    const normalizedCustomer = (filterCustomerId !== null && typeof filterCustomerId !== 'undefined' && filterCustomerId !== '') ? String(filterCustomerId) : '';

    $select.empty();
    $select.append(new Option('Select Project', '', false, false));

    const projects = Array.isArray(cache.projects) ? cache.projects : [];
    projects.forEach(function(project){
        const projectCustomer = (typeof project.customer !== 'undefined' && project.customer !== null) ? String(project.customer) : '';
        if (normalizedCustomer && projectCustomer && projectCustomer !== normalizedCustomer) return;
        const label = project.name || project.title || project.id;
        const option = new Option(label, project.id, false, false);
        option.dataset.customer = projectCustomer;
        $select.append(option);
    });

    if (valueToApply && $select.find(`option[value="${valueToApply}"]`).length) {
        $select.val(valueToApply);
    } else if (valueToApply) {
        $select.append(new Option(valueToApply, valueToApply, false, false));
        $select.val(valueToApply);
    } else {
        $select.val('');
    }

    $select.trigger('change.select2');
}

function renderItemActivities(filterProjectId, selectedActivity){
    const $select = $('#activitySelect');
    if (!$select.length) return;

    const valueToApply = (typeof selectedActivity !== 'undefined' && selectedActivity !== null) ? String(selectedActivity) : ($select.val() || '');
    const normalizedProject = (filterProjectId !== null && typeof filterProjectId !== 'undefined' && filterProjectId !== '') ? String(filterProjectId) : '';

    $select.empty();
    $select.append(new Option('Select Activity', '', false, false));

    const activities = Array.isArray(cache.activities) ? cache.activities : [];
    activities.forEach(function(activity){
        const activityProject = (typeof activity.project !== 'undefined' && activity.project !== null) ? String(activity.project) : '';
        if (normalizedProject && activityProject && activityProject !== normalizedProject) return;
        const label = activity.name || activity.title || activity.id;
        const option = new Option(label, activity.id, false, false);
        option.dataset.project = activityProject;
        $select.append(option);
    });

    if (valueToApply && $select.find(`option[value="${valueToApply}"]`).length) {
        $select.val(valueToApply);
    } else if (valueToApply) {
        $select.append(new Option(valueToApply, valueToApply, false, false));
        $select.val(valueToApply);
    } else {
        $select.val('');
    }

    $select.trigger('change.select2');
}

function renderItemTags(selectedTags){
    const $select = $('#tagSelect');
    if (!$select.length) return;

    const valuesToApply = Array.isArray(selectedTags) ? selectedTags.map(String) : ($select.val() || []);

    $select.empty();
    $select.append(new Option('', '', false, false));

    const tags = Array.isArray(cache.tags) ? cache.tags : [];
    tags.forEach(function(tagItem){
        let value, label;
        if (typeof tagItem === 'string') {
            value = label = tagItem;
        } else if (typeof tagItem === 'object' && tagItem !== null) {
            value = tagItem.id || tagItem.name || tagItem.tag || JSON.stringify(tagItem);
            label = tagItem.name || tagItem.tag || value;
        } else {
            value = label = String(tagItem);
        }
        $select.append(new Option(label, value, false, false));
    });

    if (valuesToApply && valuesToApply.length) {
        valuesToApply.forEach(function(value){
            if (!$select.find(`option[value="${value}"]`).length) {
                $select.append(new Option(value, value, false, false));
            }
        });
        $select.val(valuesToApply);
    } else {
        $select.val(null);
    }

    $select.trigger('change.select2');
}

function bindSelectChangeHandlers(){
    if (document._selectChangeBound) return;

    $('#customerSelect').on('change', function(){
        renderUpdateProjectViaCustomer();
    });

    $('#projectSelect').on('change', function(){
        renderUpdateActivitiesViaProject();
    });

    document._selectChangeBound = true;
}


// Custom dropdown functionality replaced by Select2-driven native selects.


// Legacy custom dropdown helpers removed.

function deleteItem(){

    openLoadingDialog();
    //var button = Neutralino.os.showMessageBox('Confirm','Are you sure you want to delete?','YES_NO_CANCEL', 'QUESTION')
    navigator.notification.confirm('Are you sure you want to delete?',
        function(buttonIndex){
            var state = false;
            if(buttonIndex==1) state = "YES";
            if(debug) console.log('button state',state)
            if(state=="YES")
            {
                var api = new API()
                var resp = api.makeAPICall('delete','/api/timesheets/'+itemId);
                window.location.href='index.html'
            }
            closeLoadingDialog();
        }
    ,'Confirm',['YES','NO']);
}


function saveItem(){

    //openLoadingDialog();

    var error=0;
    var data = {};

    // build payload
    if($('#date').val()!="")
    {
        var dateString = $('#date').val()+' '+$('#time_from').val();
        data.begin = moment(dateString, "DD.MM.YYYY HH:mm:ss").format()
    }

    if(!urlParams.has('active') && $('#time_to').val())
    {
        var dateString = $('#date').val()+' '+$('#time_to').val();
        data.end = moment(dateString, "DD.MM.YYYY HH:mm:ss").format()
    }

    if($('#desc').val() && $('#desc').val().trim()!=="") data.description = $('#desc').val();

    // read values from Select2 dropdowns (only include when set)
    var projectVal = $('#projectSelect').val();
    if(projectVal) data.project = isNaN(projectVal) ? projectVal : parseInt(projectVal);

    var activityVal = $('#activitySelect').val();
    if(activityVal) data.activity = isNaN(activityVal) ? activityVal : parseInt(activityVal);

    var tagVal = $('#tagSelect').val();
    if(Array.isArray(tagVal) && tagVal.length) {
        // Kimai expects tags as comma separated string — send as string
        data.tags = tagVal.join(',');
    }

    var api = new API();
    var resp;
    if(typeof(itemId)!=="undefined")
    {
        resp = api.makeAPICall("patch","/api/timesheets/"+itemId, data)
    }
    else
    {
        resp = api.makeAPICall("post","/api/timesheets", data)
    }

    if(typeof(resp) !== 'undefined' && typeof(resp.errors)!=="undefined") error = 1;
    if(debug) console.log('api Send',JSON.stringify(data))
    if(debug) console.log('api Response',JSON.stringify(resp))

    //closeLoadingDialog();

    if(error)
    {
        alert((resp && resp.message ? resp.message : 'Error') + "\n" + JSON.stringify(resp && resp.error ? resp.error : ''));
        setTimeout(function(){
            closeLoadingDialog();
        },250);
    }
    else 
    {
        openLoadingDialog();
        window.location.href='index.html';
    }

}

function renderNewItem(){
    var desc = '';
    if(urlParams.has('description')) desc = decodeURIComponent(urlParams.get('description'));

    $('#desc').val(desc);
    $('#desc').focus();
    $('#date').val(moment().format("DD.MM.YYYY"))
    $('#time_from').val(moment().format("HH:mm:ss"))
    $('#time_to,#time_total').val('');

    renderItemCustomers();
    renderItemProjects();
    renderItemActivities();
    renderItemTags();

    $('.delete-item').remove();
    $('.save-item .text').text('Start');

    bindSelectChangeHandlers();
    renderUpdateProjectViaCustomer();
    renderCallbacksForSelects();
}

function renderCallbacksForSelects(){
    if (document._select2FocusBound) return;
    if (!$('.select2-selection').length) {
        setTimeout(renderCallbacksForSelects, 50);
        return;
    }

    $('.select2-selection').on('focus',function(){
        //if($('.select2-search__field:visible').length) return false;

        $(this).closest('div').find('select').select2('open');
    });

    document._select2FocusBound = true;
}

//fix autofocus on open
$(document).on('select2:open', () => {
    let allFound = document.querySelectorAll('.select2-container--open .select2-search__field');
    allFound[allFound.length - 1].focus();
});
