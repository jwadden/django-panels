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
        return fetchPage(prevSlug, false);
    });
    nextPageLink.click(function () {
        return fetchPage(nextSlug, true);
    });
}

function fetchPage(slugUrl, is_next) {
    $('#comicPaging .loading').css('display', 'block');

    $.ajax({
        url: '/page-xml/' + slugUrl,
        success: function(xmlData) {
            displayPage(xmlData, is_next);
        },
        dataType: 'xml'
    });
    return false;
}

function displayPage(xmlData, is_next) {
    var comicTitle = $('title', xmlData).first().text();
    var slug = $('slug', xmlData).first().text();
    var listDate = $('list-date', xmlData).first();
    var dateString = listDate.text();
    var dateStamp = listDate.attr('datetime');
    var notes = [];
    var tags = [];
    var newTag;
    var nextSlugXml = $('next-slug', xmlData).first()
    var prevSlugXml = $('prev-slug', xmlData).first()
    var commentCount = parseInt($('comment-count', xmlData).first().text())
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
    $('#comicData #permalink').attr('href', '/page/' + slug);
    
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
    
    $('#comicPaging .loading').css('display', 'none');
    
    if (nextSlugXml.text()) {
        nextSlug = nextSlugXml.text();
        $('#nextPage .link').css('display', 'block');
        $('#nextPage .noLink').css('display', 'none');
        $('#nextPage a.link').attr('href', '/page/' + nextSlug);

        $('#latestPage .link').css('display', 'block');
        $('#latestPage .noLink').css('display', 'none');
    } else {
        nextSlug = null;
        $('#nextPage .link').css('display', 'none');
        $('#nextPage .noLink').css('display', 'block');
        
        $('#latestPage .link').css('display', 'none');
        $('#latestPage .noLink').css('display', 'block');
    }
    
    if (prevSlugXml.text()) {
        prevSlug = prevSlugXml.text();
        $('#prevPage .link').css('display', 'block');
        $('#prevPage .noLink').css('display', 'none');
        $('#prevPage a.link').attr('href', '/page/' + prevSlug);
        
        $('#firstPage .link').css('display', 'block');
        $('#firstPage .noLink').css('display', 'none');
    } else {
        prevSlug = null;
        $('#prevPage .link').css('display', 'none');
        $('#prevPage .noLink').css('display', 'block');
        
        $('#firstPage .link').css('display', 'none');
        $('#firstPage .noLink').css('display', 'block');
    }
    
    // Update comments
    if (commentCount < 1) {
        $('#comments .noComments').show();
        $('#comments .oneComment').hide();
        $('#comments .someComments').hide();
    } else if (commentCount == 1) {
        $('#comments .oneComment').show();
        $('#comments .noComments').hide();
        $('#comments .someComments').hide();
    } else {
        $('#comments .someComments .commentCount').html(commentCount);
        $('#comments .someComments').show();
        $('#comments .noComments').hide();
        $('#comments .oneComment').hide();
    }
    
    $('#commentLink').attr('href', '/page-comments/' + slug);
    
    // Update URL
    if (history.replaceState) {
        history.replaceState(null, null, '/page/' + slug + '/');
    }
    
    if (displaySocialButtons) { // Update Lockerz Share buttons
        $('#lockerzLink').attr('href', 'http://www.addtoany.com/share_save?linkurl=' + encodeURIComponent(rootUrl + 'page/' + slug) + '&linkname=' + encodeURIComponent(comicTitle));
    }
}
