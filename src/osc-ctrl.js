let MAX_PROTOCOL_MESSAGES = 50;
let osc;
let messageIndex = 0;
let sendIndex = 0;
let messageVals = [false, false, false, false, false, false, false, false, false, false];
let oscOnScreen = false;


function initOSC() {

    osc = new OSC({
        discardLateMessages: true
    });
    console.log("OSC", osc);

    let address = "127.0.0.1";
    let port = 8000;

    osc.connect(address, port);
    
}

function enableOSCMessage(whom) 
{

    osc.on('/angle/1', function(cMessage) {angle_goal = cMessage.args[0];
        emit = 1;
});


    osc.on('/ch/1', function(cMessage) {osc1 = [cMessage.args[0], cMessage.args[1], cMessage.args[2], cMessage.args[3]];});
    osc.on('/ch/2', function(cMessage) {osc2 = [cMessage.args[0], cMessage.args[1], cMessage.args[2], cMessage.args[3]];});
    osc.on('/ch/3', function(cMessage) {osc3 = [cMessage.args[0], cMessage.args[1], cMessage.args[2], cMessage.args[3]];});
    osc.on('/ch/4', function(cMessage) {osc4 = [cMessage.args[0], cMessage.args[1], cMessage.args[2], cMessage.args[3]];});

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

initOSC();
enableOSCMessage();
