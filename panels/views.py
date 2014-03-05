from datetime import datetime
from django.conf import settings
from django.http import HttpResponse, Http404
from django.shortcuts import render_to_response, get_object_or_404, render
from django.template import RequestContext
from panels.models import Page, Note, Tag, TagType, StaticPage
import panels.config as config
import json, math

def index(request):
    return page(request, is_index = True)
    
def page(request, page_id = None, xml_string = None, is_index = False):
    if (xml_string == '-xml'):
        template = 'panels/page.xml'
        content_type = 'text/xml'
    else:
        template = 'panels/page.html'
        content_type = 'text/html'
    
    try:
        # Retrieve the first and last pages in the archives
        filtered_pages = Page.objects.filter(pub_date__lt = datetime.now)
    
        first_page = filtered_pages.order_by('list_date')[:1].get()
        latest_page = filtered_pages.order_by('-list_date')[:1].get()
        
        # Retrive the current page
        if (is_index):
            page = latest_page
        else:
            page = filtered_pages.get(slug__iexact = page_id)

    except:
        raise Http404

    # Retrieve next page, if there is one
    try:
        next = page.get_next_by_list_date(pub_date__lt = datetime.now)
    except Page.DoesNotExist:
        next = False
    
    # Retrieve previous page, if there is one
    try:
        prev = page.get_previous_by_list_date(pub_date__lt = datetime.now)
    except Page.DoesNotExist:
        prev = False
    
    # Retrieve list of static pages
    static_pages = StaticPage.objects.all()
    
    return render_to_response(
        template,
        {
            'comic_title' : config.comic_title,
            'comic_description' : config.comic_description,
            'page' : page,
            'first' : first_page,
            'prev' : prev,
            'next' : next,
            'latest' : latest_page,
            'is_index' : is_index,
            'media_url' : settings.MEDIA_URL,
            'root_url' : request.build_absolute_uri('/'),
            'display_social_buttons' : config.display_social_buttons,
            'static_pages' : static_pages,
        },
        mimetype = content_type,
    )
    
def page_comments(request, page_id):
    page = get_object_or_404(Page, pub_date__lt = datetime.now, slug__iexact = page_id)
    
    return render_to_response(
        'panels/page-comments.html',
        {
            'page' : page,
            'next' : '/page-comments/' + page.slug,
            'root_url' : request.build_absolute_uri('/'),
            'media_url' : settings.MEDIA_URL,
        },
        mimetype = 'text/html',
        context_instance = RequestContext(request),
    )
    
def archive(request, xml_string = None, selected_tag = False):
    if (xml_string == '-xml'):
        template = 'panels/archive.xml'
        content_type = 'text/xml'
        # Don't bother getting the static pages if we're just generating XML
        static_pages = None
    else:
        template = 'panels/archive.html'
        content_type = 'text/html'
        # Retrieve list of static pages
        static_pages = StaticPage.objects.all()

    got_page_list = False
    filtered_for_tag = False

    if (selected_tag):
        pages = Page.objects.filter(tags__name__exact = selected_tag).all()
        if (pages):
            got_page_list = True
            filtered_for_tag = True
    
    if (not got_page_list):
        pages = Page.objects.all()
        
    all_tags = get_tags()
    tag_types = TagType.objects.all()
        
    return render_to_response(
        template,
        {
            'filtered_for_tag' : filtered_for_tag,
            'selected_tag' : selected_tag,
            'pages' : pages,
            'all_tags' : all_tags,
            'tag_types' : tag_types,
            'static_pages' : static_pages,
            'media_url' : settings.MEDIA_URL,
            'comic_title' : config.comic_title,
            'comic_description' : config.comic_description,
            'display_tagtype_selector' : config.display_tagtype_selector,
            'root_url' : request.build_absolute_uri('/'),
        },
        mimetype = content_type
    )
    
def rss(request, tag = None):
    got_page_list = False
    feed_description = config.comic_description

    if (tag):
        pages = Page.objects.filter(tags__name__exact = tag).all()
        if (pages):
            got_page_list = True
            feed_description += ' - Tag: ' + tag
            
    if (not got_page_list):
        pages = Page.objects.all()
        
    return render_to_response(
        'panels/rss.xml',
        {
            'comic_title' : config.comic_title,
            'feed_description' : feed_description,
            'link' : request.build_absolute_uri('/'),
            'pages' : pages,
        },
        mimetype = 'text/xml'
    )
    
def static_page(request, page_id):
    page = get_object_or_404(StaticPage, slug__exact = page_id)
    
    # Retrieve list of static pages
    static_pages = StaticPage.objects.all()
    
    return render_to_response(
        'panels/static.html',
        {
            'page' : page,
            'static_pages' : static_pages,
            'comic_title' : config.comic_title,
            'comic_description' : config.comic_description,
            'media_url' : settings.MEDIA_URL,
            'root_url' : request.build_absolute_uri('/'),
        },
        mimetype = 'text/html'
    )
            
    
def get_tags():
    total_pages = Page.objects.count()
    tags = Tag.objects.all()
    tag_list = []
    most_frequent_tag = 0
    
    for tag in tags:
        tag_appearances = Page.objects.filter(tags__id__exact = tag.id).count()
        
        if (tag_appearances > 0):
            tag_list.append({'object' : tag, 'appearances' : tag_appearances,})
            if (tag_appearances > most_frequent_tag):
                most_frequent_tag = tag_appearances
        
    for i in xrange(len(tag_list)):
        tag_list[i]['magnitude'] = int(math.ceil(math.log(tag_list[i]['appearances']) / math.log(most_frequent_tag) * 10))
    
    return tag_list
