$(document).ready(function() {
    $('#tagTypeList').change(function() {
        filterTags()
    });
    
    $('#tagList .tag a').click(function() {
        return filterArchives(this);
    });
});

function filterTags() {
    var tagType = $('#tagTypeList').val();
    
    if (tagType == '') {
        $('#tagList .tag').show();
    } else {
        $('#tagList .tag').hide();
        $('#tagList .tag.' + tagType).show();
    }
}


function filterArchives(tagLink) {
    var tagToFetch;
    
    if ($(tagLink).parent().hasClass('selected')) { // Unfilter; show all tags
        tagToFetch = '';
        $(tagLink).parent().removeClass('selected');
        $('#tagHeader').css('display', 'none');
    } else { // Filter by selected tag
        tagToFetch = $(tagLink).html();
        $('#tagList .tag').removeClass('selected');
        $(tagLink).parent().addClass('selected');
        $('#currentTag').html(tagToFetch);
        $('#tagHeader').css('display', 'inline');
    }

    $.ajax({
        url: '/archive-xml/' + tagToFetch,
        success: displayArchive,
        dataType: 'xml'
    });
    return false;
}

function displayArchive(xmlData) {
    $('#pageList ul li').remove();
    
    $('pages page', xmlData).each(function() {
        $('#pageList ul').append('<li><a href = "' + encodeURI($('url', this).text()) + '" title = "' + $('date', this).text() + '">' + $('title', this).text() + '</a></li>');
    });
}
