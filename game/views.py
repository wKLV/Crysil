# Create your views here.
from django.http import HttpResponse
from django.template import Context, loader
import models
import imp
import settings
#import entityCode.lamp
#m = entityCode.lamp

def importCode(code, name, add_to_sys_modules=False):
    # code can be any object containing code: a string, a file object, or
    # a compiled code object.  Returns a new module object initialized
    # by dynamically importing the given code, and optionally adds it
    # to sys.modules under the given name.
    #
    module = new.module(name)
    if add_to_sys_modules:
        import sys
        sys.modules[name] = module
    exec code in module.__dict__
    return module

def game(request):
    t = loader.get_template('game/game.html')
    c = Context({})
    return HttpResponse(t.render(c))

def response(request, entity, trigger):
    acts = models.Actuator.objects.filter(owner__pk=entity).filter(trigger__name=trigger)
    state = models.PCConcreteState.objects.get(pk=1)
    messages = "{"
    i = False
    for e in acts:
        if(i):
            messages += ','
        m = imp.load_module('entityCode.' + e.target.type.name, 
            open(settings.CRYSIL_PATH + 'entityCode/'+e.target.type.name+'.py', 'r'),
            settings.CRYSIL_PATH + 'entityCode/'+e.target.type.name+'.py',
            ('0','r', 1))
        messages += '"m' + e.behaviour.name + '":' +  getattr(m, e.behaviour.name)(e.target, state)
        i = True
    messages += "}"
    return HttpResponse(messages, mimetype='application/json')

def editor(request):
    return HttpResponse(loader.get_template('edit/map.html').render(Context({})))
    