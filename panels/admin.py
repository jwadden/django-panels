from panels.models import Page, Note, Tag, TagType, StaticPage
from django.contrib import admin
from django.conf import settings

class NoteInline(admin.StackedInline):
    model = Note
    extra = 1
    class Media:
        js = (
            settings.MEDIA_URL + 'general/js/tiny_mce/tiny_mce.js',
            settings.MEDIA_URL + 'panels/js/admin/textareas.js',
        )	
	
class PageAdmin(admin.ModelAdmin):
    filter_horizontal = ('tags',)
    fieldsets = [
        (None, {'fields': ['title', 'image']}),
        ('Date Information', {'fields': ['pub_date', 'list_date']}),
        ('Extra Information', {'fields': ['tags']}),
    ]
    inlines = [NoteInline,]
    ordering = ('-list_date',)
    prepopulated_fields = {"slug": ("title",)}
    
class StaticPageAdmin(admin.ModelAdmin):
    fields = ('title', 'content')
    class Media:
        js = (
            settings.MEDIA_URL + 'general/js/tiny_mce/tiny_mce.js',
            settings.MEDIA_URL + 'panels/js/admin/textareas.js',
        )	
    prepopulated_fields = {"slug": ("title",)}
	
admin.site.register(Page, PageAdmin)
admin.site.register(Tag)
admin.site.register(TagType)
admin.site.register(StaticPage, StaticPageAdmin)

