from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'crysil.views.home', name='home'),
    # url(r'^crysil/', include('crysil.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    (r'^index/$', 'crysil.views.index'),
    (r'^accounts/', include('registration.urls')),
	(r'^game/$', 'game.views.game'),
    (r'^game/entity=(?P<entity>\w+)/trigger=(?P<trigger>\w+)', 'game.views.response'),
    (r'^editor/$', 'game.views.editor'),
    (r'^editor/savemap/$', 'game.views.savemap')
)
