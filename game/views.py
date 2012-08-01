# Create your views here.
from django.http import HttpResponse, HttpResponseNotAllowed
from django.template import Context, loader
import models
import imp
import settings as set
from crysil.entityCode import jsonMessages
from django.core.context_processors import csrf
from modelschemas.views import SchemaView
import models
from django.shortcuts import render
from django.forms.formsets import formset_factory
from django.forms.models import model_to_dict
from django.utils.functional import curry

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
        m = imp.load_module('crysil.entityCode.' + e.target.type.name, 
            open(set.CRYSIL_PATH + 'entityCode/'+e.target.type.name+'.py', 'r'),
            set.CRYSIL_PATH + 'entityCode/'+e.target.type.name+'.py',
            ('0','r', 1))
        messages += '"m' + e.behaviour.name + '":' +  getattr(m, e.behaviour.name)(e.target, state)
        i = True
    messages += "}"
    return HttpResponse(messages, mimetype='application/json')

def editor(request):
    c = Context({})
    c.update(csrf(request))
    return HttpResponse(loader.get_template('edit/map.html').render(c))
 
def savemap(request):
    post = request.POST
    map = jsonMessages.parseMap(post.get('map'))
    models.saveMap(map)
    return HttpResponse() 


def aptitudes(request, what): 
    what = int(what)
    ApTypeFormSet = formset_factory(models.AptitudeTypeForm, can_delete=True)
    PrimAptFormSet = formset_factory(models.PrimaryAptitudeForm, can_delete=True) 
    DerAptFormSet = formset_factory(models.DerivativeAptitudeForm, can_delete=True)
    if request.method == 'GET':
        aptypedata = models.AptitudeType.objects.all().values()
        primaptdata = models.PrimaryAptitude.objects.all().values()
        for i in primaptdata:
            i['type'] = i['type_id']
        deraptdata = models.DerivativeAptitude.objects.all().values()
        for i in deraptdata:
            i.dependences = models.DerivativeAptitude.objects.filter(parent=i.pk)
        return render(request, 'edit/combat/aptitudes.html',
             {'aptypes':ApTypeFormSet(initial=aptypedata),
              'primapts':PrimAptFormSet(initial=primaptdata),
              'derapts':DerAptFormSet(initial=deraptdata)})
    elif request.method == 'POST':
        if what == 1:
            print 'TYPE'
            formset = ApTypeFormSet(request.POST, request.FILES)
            if formset.is_valid():  
                models.AptitudeType.objects.all().delete()
                for form in formset.cleaned_data:
                    if form:
                        if not form['DELETE']:
                            del(form['DELETE'])
                            models.AptitudeType(**form).save()
                primaptdata = models.PrimaryAptitude.objects.all().values()
                for i in primaptdata:
                    i['type'] = i['type_id']
            return render(request, 'edit/combat/aptitudes.html',
                          {'aptypes':formset, 'primapts':PrimAptFormSet(primaptdata)})
        elif what == 2:
            print 'PRIMARY'
            aptypedata = models.AptitudeType.objects.all().values()
            formset = PrimAptFormSet(request.POST, request.FILES)
            if formset.is_valid():  
                models.PrimaryAptitude.objects.all().delete()
                for form in formset.cleaned_data:
                    if form:
                        if not form['DELETE']:
                            del(form['DELETE'])
                            models.PrimaryAptitude(**form).save()
            return render(request, 'edit/combat/aptitudes.html',
                            {'aptypes':ApTypeFormSet(initial=aptypedata),
                            'primapts':formset})
        elif what == 3:
            print 'DERIVATIVE'
            aptypedata = models.AptitudeType.objects.all().values()
            apts = models.Aptitude.objects.all().values()
            formset = DerAptFormSet(request.POST, request.FILES)
            print formset
            if formset.is_valid():
                models.DerivativeAptitude.objects.all().delete()
                print formset
                for form in formset.cleaned_data:
                    print form
                    if form:
                        if not form['DELETE']:
                            del(form['DELETE'])
                            models.DerivativeAptitude(**form).save()      
                primapdata = models.PrimaryAptitude.objects.all().values()    
                for i in primapdata:
                    i['type'] = i['type_id']
                return render(request, 'edit/combat/aptitudes.html',
                              {'aptypes':ApTypeFormSet(initial=aptypedata),
                              'primapts':PrimAptFormSet(initial=primapdata),
                          'derapdata': formset})
        return HttpResponseNotAllowed()
        