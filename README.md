# Minigames for FiveM 

A resource containing minigames that can be exported and used by FiveM servers. Each minigame comes with default settings found in `client.lua` in the `minigamesTable` variable. To set specific settings for different instances of a minigame, add a settings argument into the export. If settings are not specified, the default settings will apply.

#### Adding Settings Example
```lua
local settings = {gridSize = 15, lives = 2, timeLimit = 10000}
exports["glow_minigames"]:StartMinigame(function(success)
    if success then
        print("win")
    else
        print("lose")
    end
end, "path", settings)
```

# Installation
- Drag and drop into your resources file and ensure glow_minigames in your server.cfg

## Start/End Screen 
A start and end screen will display before and after the minigame.
![Screen](https://i.imgur.com/CtebxES.png)

To change the icon or message displayed on this screen go to `main.js` and edit the variable `startEndScreens`


## Path Minigame
![Path Minigame](https://i.imgur.com/vMS6B9x.png)
- Use arrow keys or WASD to move the green player square from the bottom to top of the board, following the path
- If player strays from the path, a life is lost
- Player loses if they lose too many lives or the timer runs out

#### Export
```lua
 exports["glow_minigames"]:StartMinigame(function(success)
        if success then
            print("win")
        else
            print("lose")
        end
    end, "path")
```

#### Available Settings 
```lua
local settings = {gridSize = 19, lives = 3, timeLimit = 10000}
-- Creates a grid (19x19) squares
-- Max gridsize is 31 and should be an odd number
```

## Spot Minigame
![Spot Minigame](https://i.imgur.com/BFJ8HJh.png)
- A target character appears above the board that the player must find and click on
- Characters other than the target character will fade in and out and randomly change to other characters
- Complete the number of required finds to win
- Player loses if they run out of time

#### Export
```lua
 exports["glow_minigames"]:StartMinigame(function(success)
        if success then
            print("win")
        else
            print("lose")
        end
    end, "spot")
```

#### Available Settings 
```lua
local settings = {gridSize = 6, timeLimit = 8000, charSet = "alphabet", required = 10}
-- Max gridsize is 10
-- Available charSet: numeric, alphabet, alphanumeric, greek, runes, braille
```

## Math Minigame
![Math Minigame](https://i.imgur.com/P86r5TM.png)
- Fill out the board with numbers 1-9 so that each column and row satisfies the answer in green 
- Each number should only be used once
- Multiplication takes precedence, and is calculated before adding and subtracting
- The player will lose if time runs out or they submit an incorrect board

#### Export
```lua
 exports["glow_minigames"]:StartMinigame(function(success)
        if success then
            print("win")
        else
            print("lose")
        end
    end, "math")
```

#### Available Settings 
```lua
local settings = {timeLimit = 300000}
```

## Testing Minigames
To test minigames, un-comment the following command in `client.lua`, and run it with the name of the minigame you'd like to test i.e. `/minitest path`

```lua
RegisterCommand("minitest", function(source, args)
    StartMinigame(function(success)
        print(success)
    end, args[1])
end, false)
```
