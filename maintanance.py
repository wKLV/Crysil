from game.models import Tile
import settings

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