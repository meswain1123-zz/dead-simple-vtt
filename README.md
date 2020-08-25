
### Dead Simple VTT 

This is a Virtual Table Top I'm making for my friends
and I to use for D&D.

It will have two pages.  The DM page and the player page.
There will be a canvas with zoom and pan capabilities.  
The canvas will have three layers.  The bottom layer is the 
map.  The middle layer is the token layer, and it will have 
tokens representing anything which can be interacted with.
The top layer is the fog layer, and it will contain the 
fog of war as well as magical darkness.

The canvas will make an X * Y grid, and the map layer 
will fill the grid.  Each token will have a numerical 
size representing the diameter of the object.  Small
and Medium creatures will have a size of 1.  Large
creatures will have a size of 2.  Etc.  If tokens are 
added to represent other objects with other shape types
(ladders, ropes, etc), then for now they can be represented
using multiple tokens.

The fog of war will cover everything except for what the 
DM chooses to reveal.  It will be done by placing a 1x1 image
over each square of the map that is covered by the fog of war.
On the DM page these images will have 30% opacity.

The player page will show whatever the DM page shows, except 
with opaque fog of war and no controls.  
(Later I might make it so the DM can set what the player page
sees independantly of what they see.)

The DM page will have these abilities:
Create a map (takes an image and X and Y values).
Open a map.
Pan/Zoom.
Add/Remove tokens.
Move tokens.
Add/Remove fog of war.

Known bugs:

Clicking on the map doesn't always get the spot
you clicked quite right.  This is because I'm trying to translate
the actual pixels you're clicking on to the location on the grid,
and then back again for rendering.  The math is mostly right, but 
things get funky with all the zooms and pans that need to be taken
into account.  I'll fix it later.

I'm also still working on getting the UI for the Fog Of War controls 
sorted out on the DM page.
              
            

"# dead-simple-vtt" 
