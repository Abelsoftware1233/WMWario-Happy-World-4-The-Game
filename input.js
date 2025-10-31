/********************************************************************************
 * 1. INPUT LOGIC (Bestand: input.js)
 * Deze module is verantwoordelijk voor het vastleggen van toetsaanslagen.
 ********************************************************************************/
(function() {
    var pressedKeys = {};

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32: key = 'SPACE'; break;
        case 37: case 65: key = 'LEFT'; break;
        case 38: case 87: key = 'UP'; break;
        case 39: case 68: key = 'RIGHT'; break;
        case 40: case 83: key = 'DOWN'; break;
        case 88: case 17: key = 'JUMP'; break; // X of Ctrl
        case 90: case 16: key = 'RUN'; break; // Z of Shift
        default:
            key = String.fromCharCode(code);
        }
        pressedKeys[key] = status;
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        },
        reset: function() {
            // Reset alleen relevante toetsen om "ghost movement" te voorkomen
            ['RUN', 'LEFT', 'RIGHT', 'DOWN', 'JUMP'].forEach(k => pressedKeys[k] = false);
        }
    };
})();

