LOAD_MAP = 'map', 
ADD_MESSAGE = 'message'
CHANGE_SPRITE = 'sprite'
SET_ANIMATION = 'animation'
MOVE_ENTITY = 'move'
DELETE_ENTITY = 'delete'
CREATE_ENTITY = 'create'

import json
from game.models import EntityType, Actuator, Map, Wall
import settings

def insert(original, new, pos):
    '''Inserts new inside original at pos.'''
    return original[:pos] + new + original[pos:]

def createJSONResponse(message='',changeSprite= None, animation = '',
               move = None ,delete = '', create = None):
    text  = '{'
    text += '"' + ADD_MESSAGE + '":"' + message + '",'
    text += '"' + CHANGE_SPRITE + '":' + json.dumps(changeSprite) +','
    text += '"' + SET_ANIMATION + '":"' + animation + '",'
    text += '"' + MOVE_ENTITY + '":' + json.dumps(move) + ','
    text += '"' + DELETE_ENTITY + '":"' + delete + '",'
    text += '"' + CREATE_ENTITY + '":' + json.dumps(create)
    text += '}'
    return text

def convertEntityToJSON(entity, name):
    text = '"' + name + '":{'
    text += '"sprite":"/static/pj/' + entity.type.sprite + '",'
    actuators = entity.actuator_owner.all()
    text += '"actuators":{'
    i = False
    # TO SOLVE: If there are more than one actuator per trigger
    for e in actuators:
        if (i):
            text += ','
        text += '"' + e.trigger.name + '":' + str(e.id)
        i = True
    text += '},'
    text += '"posx":'+ str(entity.posx) + ', "posy":' + str(entity.posy)
    text += '}'
    return text

def convertWallToJSON(wall):
    text = '"' + str(wall.id) +'":{'
    text += '"origin":{"x":' + str(wall.originx) + ', "y":' + str(wall.originy) +'},'
    text += '"final":{"x":' + str(wall.finalx) + ', "y":' + str(wall.finaly) +'},'
    text += '"sprite":"/static/walls' + wall.sprite + '",'
    text += '"crossable":' + str(wall.crossable)
    text += '}'
    return text

def convertMapToJSON(mapName):
    text = '{"map":{"tiles":'
    map = Map.objects.get(name=mapName)
    text += map.tiles + ","
    
    text += '"tilemap":['
    tilemap = map.tilemap
    sizex = map.sizex
    sizey = map.sizey
    for i in range(sizey-1):
        tilemap = insert(tilemap, ']', 3*sizex*(i+1)+2*i-1)
        tilemap = insert(tilemap, '[', 3*sizex*(i+1)+2*i+2)
    tilemap = insert(tilemap, ']', len(tilemap))
    text += tilemap + ','
    
    text += '"walls":{'
    walls = Wall.objects.filter(map=map)
    i = False
    for e in walls:
        if(i):
            text += ','
        text += convertWallToJSON(e)
    text += '},'
    
    text += '"entities":{'
    entities = map.entityinstance_set.all()
    i = False
    for e in entities:
        if (i):
            text += ','
        text += convertEntityToJSON(e, str(e.id))
        i = True
    text += '}'
    text += "}}"
    f = open(settings.CRYSIL_PATH + 'JSONmaps/'+mapName+'.json', 'w')
    f.write(text)

def returnMap(mapname):
    return open('../JSONmaps/'+mapName+'.json', 'r').read()