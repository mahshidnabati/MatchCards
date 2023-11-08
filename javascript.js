
 // basic functions
 

function O(query) {
    return document.querySelectorAll(query)[0];
}

function shuffleArray(array) {
    for (var i = 0; i < array.length; i++) {
        var rand = Math.floor(Math.random() * array.length);
        var temp = array[i];
        var random = array[rand];
        array[i] = random;
        array[rand] = temp;
    }
    return array;
}

function explainTime(seconds) {
    var H = Math.floor(seconds / 3600);
    var S = seconds % 60;
    var M = Math.floor(seconds / 60) - H * 60;
    return {s: S, m: M, h: H};
}

//dom related functions

function updateScore() {
    O('#currect').innerHTML = app.rights;
    O('#mis').innerHTML = app.wrongs;
}

function updateTime() {
    var explained = explainTime(app.time);
    explained.s = explained.s < 10 ? '0' + explained.s : explained.s;
    explained.m = explained.m < 10 ? '0' + explained.m : explained.m;
    explained.h = explained.h < 10 ? '0' + explained.h : explained.h;
    O('#timer').innerHTML = explained.s + ' : ' + explained.m + " : " + explained.h;
}

function setup() {

    O('#items').innerHTML = '';
    O('#items').className = 'D' + app.diff;

    for (var i = 0; i < app.fields.length; i++) {

        var li = document.createElement('li');
        var flipper = document.createElement('div');
        var front = document.createElement('div');
        var back = document.createElement('div');
        back.className = 'back';
        back.style.backgroundImage = 'url(' + app.fields[i].src + ')';
        front.className = 'front';
        if (app.fields[i].show) flipper.className = 'show';
        flipper.appendChild(front);
        flipper.appendChild(back);
        li.appendChild(flipper);
        O('#items').appendChild(li);
        flipper.dataset.src = app.fields[i].src;
        flipper.dataset.i = i;

        flipper.onclick = clickHandle;

    }


}


 // event handlers

function clickHandle(ev) {
    var that = this;
    if (!app.perm) return false;
    if (that.className == 'show') return false;
    that.className = 'show';
    app.fields[that.getAttribute('data-i')].show = true;

    if (app.chosen == false) {
        app.chosen = that;
    } else {
        app.perm = false;
        if (app.chosen.getAttribute('data-src') == this.getAttribute('data-src')) {
            app.perm = true;
            app.chosen = false;
            app.rights++;
            updateScore();
            if (app.rights == Math.pow(app.diff, 2) / 2) {//win???
                O('#background').className = '';
                O('#end').className = '';
                app.running = false;
                O('#endtime').innerHTML = O('#timer').innerHTML;
                window.localStorage.clear();
            }
        } else {
            window.setTimeout(function () {
                that.className = '';
                app.fields[that.getAttribute('data-i')].show = false;
                app.fields[app.chosen.getAttribute('data-i')].show = false;
                app.wrongs++;
                app.chosen.className = '';
                app.perm = true;
                app.chosen = false;
                updateScore();
            }, 1000);
        }
    }
    return false;

}

function start(diff) {
    if (app.diff == 'false') return false;
    app.diff = diff;


    O('#items').innerHTML = '';

    var len = Math.pow(diff, 2) / 2;
    for (var i = 0; i < len; i++) {
        app.fields[i] = {
            src: 'images/' + (i + 1) + '.jpg',
            show: true,
        };
        app.fields[i + len] = {
            src: 'images/' + (i + 1) + '.jpg',
            show: true,
        };
    }
    app.fields = shuffleArray(app.fields);

    setup();
    O('#start').className = 'hide';
    O('#end').className = 'hide';
    window.setTimeout(function () {
        app.started = true;
        pauseToggle();
        var visibles = document.querySelectorAll('#items li .show');
        for (var i = 0; i < visibles.length; i++) {
            visibles[i].className = '';
            app.fields[i].show = false;
        }
    }, 5000);
    return false;
}

function restart(){
    window.localStorage.clear();
    app = {
        perm: true,
        diff: false,
        time: 0,
        paused: true,
        fields: [],
        chosen: false,
        rights: 0,
        wrongs: 0,
        running: false,
    };
    updateScore();
    updateTime();
    O('#items').innerHTML = '';
    O('#background').className = '';
    O('#start').className = '';
}

function save() {
    window.localStorage.diff = app.diff;
    window.localStorage.time = app.time;
    window.localStorage.fields = JSON.stringify(app.fields);
    window.localStorage.rights = app.rights;
    window.localStorage.wrongs = app.wrongs;
}

function pauseToggle() {
    if (!app.started) return false;
    if (app.running) {
        app.running = false;
        O('#background').className = '';
        O('#paused').className = '';
    }
    else {
        app.running = true;
        O('#background').className = 'hide';
        O('#paused').className = 'hide';
    }
}


//initialization ...

var app = {
    perm: true,
    diff: false,
    time: 0,
    fields: [],
    chosen: false,
    rights: 0,
    wrongs: 0,
    running: false,
    started: false,
};
window.onload = function () {


    //timer
    window.setInterval(function () {
        if (!app.running) return false;
        app.time++;
        updateTime();

    }, 1000);


    // load if save exist's ...
    if (window.localStorage.hasOwnProperty('time')) {
        app.started = true;
        O('#start').className = 'hide';
        app.diff = window.localStorage.diff;
        app.time = window.localStorage.time;
        app.fields = JSON.parse(window.localStorage.fields);
        app.rights = window.localStorage.rights;
        app.wrongs = window.localStorage.wrongs;

        setup();
        updateScore();
        O('#background').className = '';
        O('#paused').className = '';
        pauseToggle();
    }


    // event listeners
    O('#gamestart').onclick = function (ev) {
        var diff = O('#difficulty').value;
        if (diff == 'false') return false;
        diff = Number(diff);
        start(diff);
    };

    O('#gamereset').onclick = function (ev) {
        var diff = O('#difficulty2').value;
        if (diff == 'false') return false;
        app.diff = diff;
        diff = Number(diff);
        start(diff);
    };

    O('#gameresume').onclick = pauseToggle;
    O('#pause').onclick = pauseToggle;
    O('#restart').onclick = restart;
    O('#save').onclick = save;


    window.onkeydown = function (ev) {
        var key = ev.keyCode;
        if(key == 80){ // p
            pauseToggle();
            return false;
        } else if( key == 82){ // r
            restart();
            return false;
        } else if(key == 83){ // s
            save();
            return false;
        }
    };

};