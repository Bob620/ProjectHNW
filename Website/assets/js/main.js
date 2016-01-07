/* @name: Project HNW
 * @author: Bob620
 */

"use strict"

$(document).ready(function() {
    var os = new OS();
});

var programId = 0;
var programs = {};

function OS() {
    this.user = new User();
    this.desktop = new Desktop();
    this.bottomBar = new BottomBar();
    
    var self = this;
    
    self.desktop.changeBackgroundByURL(self.user.background);
    
    var bottomBarIcons = self.user.icons.bottomBar;
    var programsList = self.user.programs;
    for (var i = 0; i < bottomBarIcons.length; i++) {
        var program = programsList[bottomBarIcons[i]];
        new ProgramIcon(program.title, program.location).appendTo('#bottomBar');
    }
    $('.tooltipped').tooltip();
    
}

function clearScreen() {
    $('#screen').empty();
    console.log('cleared screen');
}

function User() {
    this.settings = {};
    this.icons = {
        "bottomBar": ['0'],
        "desktop": {}
    };
    this.programs = {'0': {'title': 'Text', 'location': '/personal/programs/text'}};
    this.background = 'http://dn-danknestpublic.qbox.me/res/Cirno.full.977947.jpg';
}

function ProgramIcon(name, location) {
    return $('<div></div>', {'class': 'os-icon hoverable tooltipped waves-effect waves-light', 'data-position': 'top', 'data-delay': '500', 'data-tooltip': name}).append(
        $('<img></img>', {'src': location+'/icon.png'})
    ).on('click', function() {new RunProgram(name, location)});
}

function OSIcon(name, location) {
    return $('<div></div>', {'class': 'os-icon hoverable tooltipped waves-effect waves-light', 'data-position': 'top', 'data-delay': '500', 'data-tooltip': name}).append(
        $('<img></img>', {'src': location+'/icon.png'})
    ).on('click', function() {new RunOSProgram(name, location)});
}

function RunProgram(name, location) {
    var Id = programId++;
    programs[Id] = new Program(Id);

    var thisProgram = programs[Id];

    var jsonSettings = $.getJSON(location+'/settings.json', function() {
        jsonSettings = jsonSettings.responseJSON;

        var testSettings = thisProgram.setProgramSettings();

        if (!testSettings) {
            $('#program-'+Id+' > .program-body').replaceWith($('<iframe></iframe>', {'class': 'program-body', 'sandbox': 'allow-forms allow-scripts', 'allowFullscreen': true, 'frameborder': 0, 'src': '/OS/pages/errorPage.html?err='+testSettings}));
        } else {
            $('#program-'+Id+' > .program-body').replaceWith($('<iframe></iframe>', {'class': 'program-body', 'sandbox': 'allow-forms allow-scripts', 'allowFullscreen': true, 'frameborder': 0, 'src': location+'/'+jsonSettings.home}));
        }
    });

    thisProgram.container = $('<div></div>', {'class': 'program-window', 'id': 'program-'+Id})
        .draggable({
            start: function(event, ui) {
                console.log(event);
                sendToBack();$(this).css('z-index', 100);
                if (thisProgram.settings.max == true) {
                    restoreDownProgramAroundPoint(Id, $('#desktop').width()+event.screenX);
                }
                console.log(thisProgram.container.css('left'));
            },
            stop: function(event, ui) {
                console.log(thisProgram.container.css('left'));
                thisProgram.settings.left = thisProgram.container.css('left');
                thisProgram.settings.top = thisProgram.container.css('top');
            }, containment: "parent",
            handle: '.program-title',
        })
        .position({
            my: 'center',
            at: 'top',
            of: '#desktop',
            collision: 'fit',
        })
        .append($('<div></div>', {'class': 'program-title', 'text': name})
            .append($('<i></i>', {'class': 'material-icons select-button close', 'text': 'close', 'title': 'Close'}).on('click', function() {
                closeProgram(Id);
            }))
            .append($('<i></i>', {'class': 'material-icons select-button max', 'text': 'check_box_outline_blank', 'title': 'Maximize'}).on('click', function() {
                maxProgram(Id);
            }))
            .append($('<i></i>', {'class': 'material-icons select-button min', 'style': 'display: none', 'text': 'check_box_outline_blank', 'title': 'Restore Down'}).on('click', function() {
                restoreDownProgram(Id);
            }))
            .append($('<i></i>', {'class': 'material-icons select-button tray', 'text': 'indeterminate_check_box', 'title': 'Minimize'}).on('click', function() {
                minProgram(Id);
            }))
        )
        .append($('<div></div>', {'class': 'program-w ui-resizable-handle ui-resizable-w'}))
        .append($('<iframe></iframe>', {'class': 'program-body', 'sandbox': 'allow-forms allow-scripts', 'allowFullscreen': true, 'frameborder': 0, 'src': '/OS/pages/loadingPage.html'}))
        .append($('<div></div>', {'class': 'program-e ui-resizable-handle ui-resizable-e'}))
        .append($('<div></div>', {'class': 'program-sw ui-resizable-handle ui-resizable-sw'}))
        .append($('<div></div>', {'class': 'program-s ui-resizable-handle ui-resizable-s'}))
        .append($('<div></div>', {'class': 'program-se ui-resizable-handle ui-resizable-se'}))
        .resizable({
            start: function(event, ui) {
                $('#program-'+Id+' > .program-title').css('width', $('#program-'+Id+' > .program-body').css('width'));
            }, stop: function(event, ui) {
                $('#program-'+Id+' > .program-title').css('width', $('#program-'+Id+' > .program-body').css('width'));
                thisProgram.settings.width = thisProgram.container.width();
                thisProgram.settings.height = thisProgram.container.height();
            }, handles: {
                's': '.program-s',
                'e': '.program-e',
                'w': '.program-w',
                'sw': '.program-sw',
                'se': '.program-se'
            }, alsoResize: '#program-'+Id+' > .program-body, #program-'+Id+' > .program-s, #program-'+Id+' > .program-e, #program-'+Id+' > .program-w, #program-'+Id+' > .program-title',
            minHeight: 330,
            minWidth: 300
        })
        .on('click', function() {
            sendToBack();
            $(this).css('z-index', 100);
        });
    $('#desktop').append(thisProgram.container);
    sendToBack();
    thisProgram.container.css('z-index', 100);
}

function RunOSProgram(name, location) {
    var Id = programId++;
    programs[Id] = new Program(Id);

    var thisProgram = programs[Id];

    thisProgram.container = $('<div></div>', {'class': 'program-window', 'id': 'program-'+Id})
        .append($('<div></div>', {'class': 'program-body'}))
    $('#desktop').append(thisProgram.container);
    sendToBack();
    thisProgram.container.css('z-index', 100);
}

function sendToBack() {
    var programIds = Object.keys(programs);
    for (var i = 0; i < programIds.length; i++) {
        programs[programIds[i]].container.css('z-index', 3);
    }
}

function closeProgram(Id) {
    try {
        $('#program-'+Id).trigger('close');

        delete programs[Id];
        $('#program-'+Id).remove();
    } catch(err) {
    }
}

function maxProgram(Id) {
    var thisProgram = programs[Id];

    thisProgram.settings.max = true;
    sendToBack();
    thisProgram.container.css('z-index', 100);
    
    thisProgram.container.css('top', 0);
    thisProgram.container.css('left', -4);
    
    thisProgram.container.css('width', $('#desktop').width()+8);
    thisProgram.container.css('height', $('#desktop').height()-94);
    
    $("#program-"+Id+' > .program-body').css('height', $('#desktop').height()-90);
    $("#program-"+Id+' > .program-body').css('width', $('#desktop').width());
    
    $("#program-"+Id+' > .program-title').css('width', $('#desktop').width());

    $("#program-"+Id+' > .program-title > .max').css('display', 'none');
    $("#program-"+Id+' > .program-title > .min').css('display', 'inline-block');
    
    $("#program-"+Id+' > .program-e').css('height', $('#desktop').height()-94);
    $("#program-"+Id+' > .program-s').css('width', $('#desktop').width());
    $("#program-"+Id+' > .program-w').css('height', $('#desktop').height()-94);

    thisProgram.container.resizable('disable');
}

function restoreDownProgram(Id) {
    var thisProgram = programs[Id]

    thisProgram.settings.max = false;
    sendToBack();
    thisProgram.container.css('z-index', 100);

    thisProgram.container.css('width', thisProgram.settings.width);
    thisProgram.container.css('height', thisProgram.settings.height);
    
    $("#program-"+Id+' > .program-body').css('height', thisProgram.settings.height-34);
    $("#program-"+Id+' > .program-body').css('width', thisProgram.settings.width-8);
    
    $("#program-"+Id+' > .program-title').css('width', thisProgram.settings.width-8);

    $("#program-"+Id+' > .program-title > .max').css('display', 'inline-block');
    $("#program-"+Id+' > .program-title > .min').css('display', 'none');
    
    $("#program-"+Id+' > .program-e').css('height', thisProgram.settings.height-34);
    $("#program-"+Id+' > .program-s').css('width', thisProgram.settings.width);
    $("#program-"+Id+' > .program-w').css('height', thisProgram.settings.height-34);

    thisProgram.container.css('top', thisProgram.settings.top);
    thisProgram.container.css('left', thisProgram.settings.left);

    thisProgram.container.resizable('enable');
}

function restoreDownProgramAroundPoint(Id, x) {
    var thisProgram = programs[Id];

    thisProgram.settings.max = false;
    sendToBack();
    thisProgram.container.css('z-index', 100);
    
    thisProgram.container.css('width', thisProgram.settings.width);
    thisProgram.container.css('height', thisProgram.settings.height);
    
    $("#program-"+Id+' > .program-body').css('height', thisProgram.settings.height-34);
    $("#program-"+Id+' > .program-body').css('width', thisProgram.settings.width-8);
    
    $("#program-"+Id+' > .program-title').css('width', thisProgram.settings.width-8);

    $("#program-"+Id+' > .program-title > .max').css('display', 'inline-block');
    $("#program-"+Id+' > .program-title > .min').css('display', 'none');
    
    $("#program-"+Id+' > .program-e').css('height', thisProgram.settings.height-34);
    $("#program-"+Id+' > .program-s').css('width', thisProgram.settings.width);
    $("#program-"+Id+' > .program-w').css('height', thisProgram.settings.height-34);

    thisProgram.container.css('left', (x-(thisProgram.settings.width/2)));
    console.log(thisProgram.container.css('left'));

    thisProgram.container.resizable('enable');
}

function minProgram(Id) {
}

function forceMoveProgramWindow(Id) {
    var thisProgram = programs[Id];

    thisProgram.container.css('top', thisProgram.settings.top);
    thisProgram.container.css('left', thisProgram.settings.left);
}

function Program(Id) {
    this.Id = Id;
    this.container;
    this.settings = {
        width: 308,
        height: 334,
        left: 640,
        top: 100,
        max: false,
    }
    this.programSettings = {};

    var self = this;

    this.setProgramSettings = function(settings) {
        return true;
    }

}

//-------------------------------------------------------------------------------------------------\\

function Desktop() {
    this.desktop = $('<section></section>', {'id': 'desktop'});
    
    var self = this;
    
    clearScreen();
    $('#screen').append(self.desktop);
    
    this.changeBackgroundByURL = function(backgroundURL) {
        self.desktop.css('background', 'url('+backgroundURL+')');
    }    
}

function BottomBar() {
    var bar = $('<section></section>', {'id': 'bottomBar'}).append(
        new OSIcon('Menu', '/OS/menu')
    );
    
    $('#desktop').append(bar);
}