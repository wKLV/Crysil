from django.db import models
import settings
from  django.core.exceptions import ObjectDoesNotExist

#
# HOW THE GAME IS
#

class Tile (models.Model):
    """A piece in the floor of the map  """
    name = models.CharField(max_length=75)
    walkable = models.BooleanField()   
    def __unicode__(self):
        return self.name
    
class Map (models.Model):
    """A place where the player, which contains other elements, like Entities
    
    The floor consists of tiles
    """
    sizex = models.IntegerField()
    sizey = models.IntegerField()
    name = models.CharField(max_length=80)
    tiles = models.CommaSeparatedIntegerField(max_length=10000)
    tilemap = models.CommaSeparatedIntegerField(max_length=1000000)
    def __unicode__(self):
        return self.name
    
class Entrance(models.Model):
    """A entrance to a map. 
    
    For example, in a corridor, the two doors.
    """
    map = models.ForeignKey(Map)
    posx = models.IntegerField()
    posy = models.IntegerField()
    name = models.CharField(max_length=25)

class Wall(models.Model):
    """A continuous vertical brick or stone structure that encloses or divides an area of land 
    
    The width must be multiple of 32, so it doesnt block half tile. The height has no restriction """
    sprite = models.FilePathField(settings.CRYSIL_PATH + 'media/walls')
    crossable = models.BooleanField()
    originx = models.IntegerField()
    originy = models.IntegerField()
    finalx = models.IntegerField()
    finaly = models.IntegerField()
    map = models.ForeignKey(Map)

class Behaviour(models.Model):
    """Something that can happen to the entity, like opening, begining a battle
    
    It points to python code that will be executed
    """
    name = models.CharField(max_length=25)
    def __unicode__(self):
        return self.name
  
class Trigger(models.Model):
    """All the ways of interact with an entity
    
    For example: Main action, Mouse over, a puzzle power...
    """
    name = models.CharField(max_length=25)
    def __unicode__(self):
        return self.name
  
class EntityType(models.Model):
    """Generalization of an entity, which contains its logic
    
    It contains its sprite, the file where his behaviours are contained,
    and has states (how may the entity be), behaviours (what can happen 
    to the entity), and actuatorsType (what can the user do with the entity)
    """
    name = models.CharField(max_length=35)
    sprite = models.FilePathField(settings.CRYSIL_PATH + "media/pj")
    behaviours = models.ManyToManyField(Behaviour)
    triggers = models.ManyToManyField(Trigger)
    def __unicode__(self):
        return self.name
  
class EntityInstance (models.Model):
    """A concrete element in the map which the player can interact with
    
    This class only contains the position, the other stuff is in
    EntityType """
    type = models.ForeignKey(EntityType)
    posx = models.IntegerField()
    posy = models.IntegerField()
    map = models.ForeignKey(Map)
    def __unicode__(self):
        return self.type.name + "at" + str(self.posx) + str(self.posy)

class Actuator(models.Model):
    """Something that will happen when the user interacts with an entity
    
    It specifies the behaviour that will happen when it is used.    
    """
    trigger = models.ForeignKey(Trigger)
    owner = models.ForeignKey(EntityInstance, related_name='actuator_owner')
    target = models.ForeignKey(EntityInstance, related_name='actuator_target')
    behaviour = models.ForeignKey(Behaviour)
    def __unicode__(self):
        return unicode(self.owner)+' if is '+ unicode(self.trigger)+' invokes '+unicode(self.behaviour)+' of '+unicode(self.target)

class Episode(models.Model):
    """A game or a part of one divided by its release. It consists of chapters
    """
    name = models.CharField(max_length=30)
    description = models.CharField(max_length=500)
    previous = models.ForeignKey("self")

class Chapter(models.Model):
    """A part of the game composed of missions
    
    The chapters are arranged, and you cannot come back from the next"""
    name = models.CharField(max_length=30)
    episode = models.ForeignKey(Episode)
    description = models.CharField(max_length=500)
    previous = models.ForeignKey("self")

class Mission(models.Model):
    """A division of the game, mostly independent from the rest
    
    It is usually a task that needs to be done by the player
    """
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=300)

class State(models.Model):
    """A posibility of how could a entity or a mission be
    
    """
    name = models.CharField(max_length=35)
    description = models.TextField()
    
class EntityStateType(models.Model):
    """A property of an entity which may have a value
    
    """
    entity = models.ForeignKey(EntityType)
    name = models.CharField(max_length=25)
    posibilities = models.ManyToManyField(State)

class MissionStateType(models.Model):
    """Property of a mission which may have a value
    """
    mission = models.ForeignKey(Mission)
    name = models.CharField(max_length=25)
    posibilites = models.ManyToManyField(State)

#
# HOW THE GAME IS SAVED
#

class Game(models.Model):
    """A game fully independent which a player plays
    
    For example, User A creates a game to play Episode E with a
    sorcerer, and User B creates one to play with a warrior.
    They keep the game in the followinfg episodes, but one day
    A creates a new game to play with a warrior
    """
    name = models.CharField(max_length=30)
    startEpisode = models.ForeignKey(Episode)
    
class PCGenericState(models.Model):
    """A general save of the state of the game.
    
    It saves the state of the missions and the general 
    location of the character
    """
    chapter = models.ForeignKey(Chapter, blank=True, null=True)
    game = models.ForeignKey(Game, blank=True, null=True)
    entrance = models.ForeignKey(Entrance, blank=True, null=True)
    
class PCConcreteState(models.Model):
    """A concrete save of the state of the game.
    
    It saves the general state plus the state of the map
    in the moment of saving
    """
    genericState = models.ForeignKey(PCGenericState)
    pcposx = models.IntegerField()
    pcposy = models.IntegerField()
    
class EntityStateInstance(models.Model):
    """A concrete state of a concrete instance in saved game
    """
    type = models.ForeignKey(EntityStateType)
    entity = models.ForeignKey(EntityInstance)
    saved = models.ForeignKey(PCConcreteState)
    state = models.ForeignKey(State)

class MissionStateInstance(models.Model):
    """A concrete state of a mission in a saved game
    """
    type = models.ForeignKey(MissionStateType)
    save = models.ForeignKey(PCGenericState)
    state = models.ForeignKey(State)

    save = models.ForeignKey(PCGenericState)
    
def saveMap(map):
    # SAVE THE MAP OBJECT
    tmap = map.get('tilemap')
    tiles = []
    tilemap = []
    for e in tmap:
        for i in e:
            tilemap.append(i)
            if not i in tiles:
                tiles.append(i)
    tiles = sorted(tiles)
    mapName = map.get('name')
    try:
        Map.objects.get(name=mapName).delete()
    except ObjectDoesNotExist:
        pass

    nMap = Map(name=mapName, tiles=tiles, tilemap=tilemap, sizex=len(tmap[0]), sizey=len(tmap))
    nMap.save()
    
    # SAVE THE ENTITYINSTANCE OBJECTS
    entis = map.get('entities').items()
    entities = {}
    for e in entis:
        e = e[1]
        ent = EntityInstance(type=EntityType.objects.get(name=e.get('type')), map=nMap, posx=e.get('x'), posy=e.get('y'))
        ent.save()
        entities[e.get('name')] = ent
    # SAVE THE ACTUATORS        ak = a[0]
   
    acts = map.get('actuators').items()
    for own in acts:
        for trig in own[1]:
            actus = own[1][trig]
            for a in actus:
                actuator = Actuator(trigger=Trigger.objects.get(name=trig), owner=entities[own[0]], target=entities[a.get('target')], behaviour=Behaviour.objects.get(name=a.get('behaviour')))
                actuator.save()