const {app} = require('electron')
const {getUserSetting, setUserSetting} = require('./userSetting')
var AutoLaunch = require('auto-launch');
var minecraftAutoLauncher = new AutoLaunch({
    name: 'Offduty Manager'
});

function checkAutoLaunch() {
  const userSetting = getUserSetting()
  if (userSetting.autoLaunch) {
    minecraftAutoLauncher.isEnabled()
    .then(function(isEnabled){
        if(isEnabled){
            return;
        }
        setAutoLaunch(true)
    })
    .catch(function(err){
        // handle error
    });
  }
}
function setAutoLaunch(auto) {
    if (auto) {
        setUserSetting('autoLaunch', true)
        minecraftAutoLauncher.enable();
    } else {
        minecraftAutoLauncher.disable();
        setUserSetting('autoLaunch', false)
    }
}

checkAutoLaunch()

module.exports = {
    setAutoLaunch
}