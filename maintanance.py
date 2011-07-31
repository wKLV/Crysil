from game.models import Tile, EntityType, Map
from entityCode import jsonMessages
import settings

def parseEntity(entity):
    text  = '"' + entity.name +'":{'
    text += '"sprite":' + '"/static/pj/' + entity.sprite +'",'
    text += '"triggers":['
    i = False
    for e in entity.triggers.all():
        if i:
            text +=','
        text += '"' + e.name + '"'
        i = True
    text += '],'
    text += '"behaviours":['
    i = False
    for e in entity.behaviours.all():
        if i:
            text +=','
        text += '"' + e.name + '"'
        i = True
    text += ']}'
    return text

def tiles():
    tiles = Tile.objects.filter(walkable=False)
    text = '['
    i = False
    for e in tiles:
        if(i):
            text += ','
        text += str(e.id)
        i = True
    text += ']'
    file = open(settings.CRYSIL_PATH + 'media/tiles/walkable.json', 'w')
    file.write(text)

def entities():
    entities = EntityType.objects.all()
    text ='{'
    i = False
    for e in entities:
        if i:
            text += ','
        text += parseEntity(e)
        i = True
    text += '}'
    file = open(settings.CRYSIL_PATH + 'media/pj/entities.json', 'w')
    file.write(text)

def parseMaps():
    for e in Map.objects.all():
        jsonMessages.convertMapToJSON(e.name)
        
if __name__=='__main__':
    tiles()
    entities()
    parseMaps()
