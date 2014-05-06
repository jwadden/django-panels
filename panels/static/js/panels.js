var currentImage;
var nextImage;
var prevImage;

$(document).ready(function() {
    bindPageLinks();
    
    currentImage = $('#comicImage img').first();
    if (prevImageUrl) {
        prevImage = $('<img src = "' + prevImageUrl + '" alt = "" />');
    } else {
        prevImage = $('<img src = "" alt = "" />');
    }
    if (nextImageUrl) {
        nextImage = $('<img src = "' + nextImageUrl + '" alt = "" />');
    } else {
        nextImage = $('<img src = "" alt = "" />');
    }
});

function bindPageLinks() {
    var prevPageLink = $('#prevPage a')
    var nextPageLink = $('#nextPage a')
    prevPageLink.click(function () {
        return fetchPage(prevXmlUrl, false);
    });
    nextPageLink.click(function () {
        return fetchPage(nextXmlUrl, true);
    });
}

function fetchPage(url, is_next) {
    $('#comicLoading').css('display', 'block');

    $.ajax({
        url: url,
        success: function(xmlData) {
            displayPage(xmlData, is_next);
        },
        dataType: 'xml'
    });
    return false;
}

function displayPage(xmlData, is_next) {
    var comicTitle = $('title', xmlData).first().text();
    var currentUrl = $('current-url', xmlData).first().text();
    var listDate = $('list-date', xmlData).first();
    var dateString = listDate.text();
    var dateStamp = listDate.attr('datetime');
    var notes = [];
    var tags = [];
    var newTag;
    nextXmlUrl = $('next-xml-url', xmlData).first().text()
    prevXmlUrl = $('prev-xml-url', xmlData).first().text()
    var i;
    var imageContainer = $('#comicImage')
    var newNote;

    currentImageUrl = $('images current-image', xmlData).first().text();
    nextImageUrl = $('images next-image', xmlData).first().text();
    prevImageUrl = $('images prev-image', xmlData).first().text();

    $('notes note', xmlData).each(function() {
        notes.push($(this));
    });
    $('tags tag', xmlData).each(function() {
        newTag = [];
        newTag['name'] = $(this).text();
        newTag['type'] = $(this).attr('tagType');
        tags.push(newTag);
    });

    
    $('#comicData header h1').html(comicTitle);
    $('#comicData time').attr('datetime', dateStamp);
    $('#comicData time').html(dateString);
    $('#comicData #permalink').attr('href', currentUrl);
    
    // Update image
    currentImage.detach();
    
    if (is_next) { // Moving forward in the archives
        prevImage.remove();
        if (currentImage.attr('src') == prevImageUrl) {
            // Image URLs haven't changed since the image was prefetched
            prevImage = currentImage;
        } else {
            // Image URLs have changed, cannot use the prefetched element
            prevImage = $('<image src = "' + prevImageUrl + '" alt = "" />');
        }
        
        if (nextImage.attr('src') == currentImageUrl) {
            currentImage = nextImage;
        } else {
            currentImage = $('<image src = "' + currentImageUrl + '" alt = "" />');
        }
        
        nextImage = $('<image src = "' + nextImageUrl + '" alt = "" />');
    } else { // Moving backward in the archives
        if (currentImage.attr('src') == nextImageUrl) {
            nextImage = currentImage;
        } else {
            nextImage = $('<image src = "' + prevImageUrl + '" alt = "" />');
        }
        
        if (prevImage.attr('src') == currentImageUrl) {
            currentImage = prevImage;
        } else {
            currentImage = $('<image src = "' + currentImageUrl + '" alt = "" />');
        }
        
        prevImage = $('<image src = "' + nextImageUrl + '" alt = "" />');
    }
    
    currentImage.hide();
    imageContainer.append(currentImage);
    currentImage.fadeIn(500);
    
    // Update notes
    $('#comicNotes').empty();
    
    for (i = 0; i < notes.length; i++) {
        newNote = $('<section />');
        newNote.addClass('contentBox');
        newNote.append('<header><h1>' + (notes[i].attr('title') ? notes[i].attr('title') : 'Notes') + '</h1></header>');
        newNote.append('<article>' + notes[i].text() + '</article>');
        $('#comicNotes').append(newNote);
    }
    
    // Update tags
    $('#comicTags li').remove()
    
    for (i = 0; i < tags.length; i++) {
        $('#comicTags').append('<li class = "tag ' + tags[i]['type'] + '"><a href = "/archive/' + encodeURIComponent(tags[i]['name']) + '/">' + tags[i]['name'] + "</a></li>");
    }
    
    // Update paging links
    
    $('#comicLoading').css('display', 'none');
    
    if (nextXmlUrl) {
        nextUrl = $('next-url', xmlData).first().text()
        $('#nextPage .link').css('display', 'block');
        $('#nextPage .noLink').css('display', 'none');
        $('#nextPage a.link').attr('href', nextUrl);

        $('#latestPage .link').css('display', 'block');
        $('#latestPage .noLink').css('display', 'none');
    } else {
        nextUrl = null;
        $('#nextPage .link').css('display', 'none');
        $('#nextPage .noLink').css('display', 'block');
        
        $('#latestPage .link').css('display', 'none');
        $('#latestPage .noLink').css('display', 'block');
    }
    
    if (prevXmlUrl) {
        prevUrl = $('prev-url', xmlData).first().text()
        $('#prevPage .link').css('display', 'block');
        $('#prevPage .noLink').css('display', 'none');
        $('#prevPage a.link').attr('href', prevUrl);
        
        $('#firstPage .link').css('display', 'block');
        $('#firstPage .noLink').css('display', 'none');
    } else {
        prevUrl = null;
        $('#prevPage .link').css('display', 'none');
        $('#prevPage .noLink').css('display', 'block');
        
        $('#firstPage .link').css('display', 'none');
        $('#firstPage .noLink').css('display', 'block');
    }
    
    // Update URL
    if (history.replaceState) {
        history.replaceState(null, null, currentUrl);
    }
}
