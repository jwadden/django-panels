from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('panels.views',
    url(r'^$', 'index', name='index'),
    url(r'^page(?P<xml_string>["-xml"]*)/(?P<page_id>[\w\d\-]+)/$', 'page'),
    url(r'^archive(?P<xml_string>["-xml"]*)/(?P<selected_tag>[\w\d\s]+)/$', 'archive'),
    url(r'^archive(?P<xml_string>["-xml"]*)/$', 'archive'),
    url(r'^rss/(?P<tag>[\w\d\s]+)/$', 'rss'),
    url(r'^rss/$', 'rss'),
    url(r'^(?P<page_id>[\w\d\-]+)/$', 'static_page'),
)
