from django.db import models
from datetime import datetime

class TagType(models.Model):
    name = models.CharField('type name', max_length = 15)
    def __unicode__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField('tag name', max_length = 30)
    tag_type = models.ForeignKey(TagType)
    def __unicode__(self):
        return self.name

class Page(models.Model):
    slug = models.SlugField(max_length=40)
    title = models.CharField('title', max_length=30, blank = True)
    pub_date = models.DateTimeField('publication date', help_text = 'The date on which this page will become visible.', default = datetime.now)
    list_date = models.DateTimeField('list date', help_text = 'The date that will be shown for this page in the archives. The publication date will be used if this field is left blank', blank = True)
    create_date = models.DateTimeField('date created', auto_now_add = True)
    modify_date = models.DateTimeField('date modified', auto_now = True)
    tags = models.ManyToManyField(Tag, blank = True, default = None)
    image = models.FileField('comic image file', upload_to = 'panels/page_images') #TODO: Make this an ImageField when support for that field is available in Python 3
    
    def get_absolute_url(self, is_xml = False):
        if (is_xml):
            return "/page-xml/%d/%s/" % (self.id, self.slug,)
        else:
            return "/page/%d/%s/" % (self.id, self.slug,)
            
    def get_xml_url(self):
        return self.get_absolute_url(True)
            
    def save(self, *args, **kwargs):
        # Populate the list date field
        if (self.list_date is None):
            self.list_date = self.pub_date
            
        # Populate the title
        if (not self.title):
            self.title = 'Comic for ' + self.list_date.strftime("%Y-%m-%d")
        
        super(Page, self).save(*args, **kwargs)
    def __unicode__(self):
        return self.title
        
    def __str__(self):
        return self.__unicode__()
        # TODO: See if there's a better way to make this work in Python 2 and 3.
	
class Note(models.Model):
    page = models.ForeignKey(Page)
    title = models.CharField('title', max_length = 30, blank = True, null = True)
    text = models.TextField('page notes')
    
class StaticPage(models.Model):
    slug = models.SlugField(max_length = 40)
    title = models.CharField('title', max_length=30, blank = False)
    content = models.TextField('content')
    
    def get_absolute_url(self):
        return "/%s-%d/" % self.slug, self.id
        
    def __unicode__(self):
        return self.title
