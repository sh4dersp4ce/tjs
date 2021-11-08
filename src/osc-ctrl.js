var MAX_PROTOCOL_MESSAGES = 50;
var osc;
var messageIndex = 0;
var sendIndex = 0;
var messageVals = [false, false, false, false, false, false, false, false, false, false];
var oscOnScreen = false;

var oscM = [null, null, null, null, null, null, null, null, null, null];

function initOSC() {

    osc = new OSC({
        discardLateMessages: true
    });
    console.log("OSC", osc);

    var address = "127.0.0.1";
    var port = 8000;

    osc.connect(address, port);
    
}

function enableOSCMessage(whom) 
{

    // var m = $("#inOSCtext" + whom).val();
    var m = '/ch/1';

    var listener = osc.on(m, function(cMessage) 
	{
        // console.log('message', cMessage); 
        oscin = cMessage.args[0];
        // console.log('oscint', oscint);
        if (cMessage.typesString == "ffff") {
            
            oscM[whom].args = [cMessage.args[0].toFixed(3), cMessage.args[1].toFixed(3),
            			  cMessage.args[2].toFixed(3), cMessage.args[3].toFixed(3)];
        }

    });

    
	oscM[whom] = {};
	oscM[whom].listener = listener;
	oscM[whom].args = [0.0,0.0,0.0,0.0];
	oscM[whom].uniName = 'oscin' + whom
    createOSCUniforms();
    // setShaderFromEditor();
}

function disableOSCMessage(whom) 
{
    $("#inOSCtext" + whom).prop('disabled', false);
    // $('#inOSCtext' + whom).css("background-color", "rgba(255,255,255,0.5)");
    $("#inOSCUniform" + whom).prop('disabled', false);
    // $('#inOSCUniform' + whom).css("background-color", "rgba(255,255,255,0.5)");
    $("#inOSCenable" + whom).button('enable');
    $("#inOSCdisable" + whom).button('disable');

    osc.off($("#inOSCtext" + whom).val(), oscM[whom].listener);
    oscM[whom] = null;
}


function createOSCUniforms() {
    mOSCStr = "";
    for (var i = 0; i < oscM.length; i++) {
        var inp = oscM[i];

        if (inp !== null) {
            // mOSCStr += "uniform vec4 " + $('#inOSCUniform'+i).val() + ";\n";
            // mOSCStr += "uniform vec4 " + oscM[i].uniName + ";\n";
            mOSCStr = "uniform vec4 analogInput;";
        }
    }
}
